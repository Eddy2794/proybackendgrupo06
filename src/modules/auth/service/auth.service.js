import jwt from 'jsonwebtoken';
import { pbkdf2Sync, createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import * as userRepo from '../../user/repository/user.repository.js';
import * as personaService from '../../persona/service/persona.service.js';
import config from '../../../config/index.js';
import TokenBlacklist from '../model/tokenBlacklist.model.js';

// Clave para cifrado AES (en producción debe estar en variables de entorno)
const AES_KEY = process.env.AES_ENCRYPTION_KEY || 'mi-clave-super-secreta-32-chars!!';

export const register = async ({ personaData, username, password }) => {
  const existingUser = await userRepo.findByUsername(username);
  if (existingUser) throw new Error('El nombre de usuario ya existe');
  const persona = await personaService.createPersona(personaData);
  const existingUserByPersona = await userRepo.findByPersonaId(persona._id);
  if (existingUserByPersona) throw new Error('Ya existe un usuario asociado a esta persona');
  const userData = {
    persona: persona._id,
    username: username.toLowerCase(),
    password,
    estado: process.env.NODE_ENV === 'test' ? 'ACTIVO' : 'PENDIENTE_VERIFICACION',
    emailVerificado: process.env.NODE_ENV === 'test' ? true : false
  };
  const user = await userRepo.create(userData);
  await user.populate('persona');
  return {
    user,
    persona,
    message: 'Usuario registrado exitosamente. Verifica tu email para activar la cuenta.'
  };
};

/**
 * Descifrar contraseña usando AES-256-CBC (compatible con CryptoJS del frontend)
 * @param {string} encryptedData - Datos cifrados en formato base64
 * @returns {string} - Contraseña descifrada
 */
const decryptPassword = (encryptedData) => {
  try {
    // CryptoJS genera un formato específico: "Salted__" + salt + ciphertext
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Verificar que tiene el prefijo "Salted__"
    if (buffer.subarray(0, 8).toString() !== 'Salted__') {
      throw new Error('Formato de datos cifrados inválido');
    }
    
    // Extraer el salt (8 bytes después de "Salted__")
    const salt = buffer.subarray(8, 16);
    const ciphertext = buffer.subarray(16);
    
    // Derivar clave e IV usando el mismo método que CryptoJS
    const keyIv = deriveKeyAndIV(AES_KEY, salt);
    
    // Descifrar
    const decipher = createDecipheriv('aes-256-cbc', keyIv.key, keyIv.iv);
    let decrypted = decipher.update(ciphertext, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error descifrando contraseña:', error);
    throw new Error('Error descifrando contraseña');
  }
};

/**
 * Derivar clave e IV compatible con CryptoJS
 * @param {string} password - Contraseña/clave
 * @param {Buffer} salt - Salt
 * @returns {Object} - {key: Buffer, iv: Buffer}
 */
const deriveKeyAndIV = (password, salt) => {
  const keySize = 32; // 256 bits
  const ivSize = 16;  // 128 bits
  const iterations = 1; // CryptoJS usa 1 iteración por defecto
  
  let derived = Buffer.alloc(0);
  let lastHash = Buffer.alloc(0);
  
  while (derived.length < keySize + ivSize) {
    const hash = createHash('md5');
    hash.update(lastHash);
    hash.update(password);
    hash.update(salt);
    lastHash = hash.digest();
    derived = Buffer.concat([derived, lastHash]);
  }
  
  return {
    key: derived.subarray(0, keySize),
    iv: derived.subarray(keySize, keySize + ivSize)
  };
};

export const login = async (loginData) => {
  const { username, passwordHash, salt, encryptedPassword } = loginData;
  
  if (!username) {
    throw new Error('Username es requerido');
  }
  
  // Verificar que tenemos los datos de seguridad necesarios
  if (!passwordHash || !salt) {
    throw new Error('Se requiere hash de contraseña y salt para autenticación segura');
  }
  
  if (!encryptedPassword) {
    throw new Error('Se requiere contraseña cifrada para autenticación');
  }
  
  const user = await userRepo.findByUsername(username);
  if (!user) throw new Error('Credenciales inválidas');
  
  if (user.isBlocked()) {
    const minutosRestantes = Math.ceil((user.bloqueadoHasta - new Date()) / 60000);
    throw new Error(`Usuario bloqueado. Intenta de nuevo en ${minutosRestantes} minutos.`);
  }
  
  try {
    // Descifrar la contraseña para usar con bcrypt
    const decryptedPassword = decryptPassword(encryptedPassword);
    
    // Verificar que el hash enviado coincide con la contraseña descifrada
    const expectedHash = pbkdf2Sync(decryptedPassword, salt, 10000, 32, 'sha256').toString('hex');
    if (passwordHash !== expectedHash) {
      await user.incrementLoginAttempts();
      throw new Error('Credenciales inválidas - hash inconsistente');
    }
    
    // Usar bcrypt para verificar contra la BD
    const isValidPassword = await user.comparePassword(decryptedPassword);
    if (!isValidPassword) {
      await user.incrementLoginAttempts();
      throw new Error('Credenciales inválidas');
    }
    
    if (user.estado !== 'ACTIVO') throw new Error('Usuario inactivo o no verificado');
    
    await user.resetLoginAttempts();
    
    // Actualizar último login
    user.ultimoLogin = new Date();
    await user.save();
    
    const token = jwt.sign({ userId: user._id, rol: user.rol }, config.jwtSecret, { expiresIn: '8h' });
    return {
      message: 'Login exitoso',
      token,
      user: {
        _id: user._id,
        username: user.username,
        rol: user.rol,
        estado: user.estado,
        ultimoLogin: user.ultimoLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        persona: user.persona
      }
    };
  } catch (error) {
    if (error.message.includes('Credenciales inválidas')) {
      throw error;
    }
    throw new Error('Error en el proceso de autenticación');
  }
};

export const changePassword = async (userId, passwordData) => {
  const { 
    currentPasswordHash, 
    newPasswordHash, 
    encryptedCurrentPassword, 
    encryptedNewPassword,
    currentSalt,
    newSalt
  } = passwordData;
  
  if (!encryptedCurrentPassword || !encryptedNewPassword || !currentPasswordHash || !newPasswordHash) {
    throw new Error('Se requieren datos de seguridad completos para cambiar contraseña');
  }
  
  const user = await userRepo.findById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  
  try {
    // Descifrar contraseñas para usar con bcrypt
    const decryptedCurrentPassword = decryptPassword(encryptedCurrentPassword);
    const decryptedNewPassword = decryptPassword(encryptedNewPassword);
    
    // Verificar integridad del hash actual
    const expectedCurrentHash = pbkdf2Sync(decryptedCurrentPassword, currentSalt, 10000, 32, 'sha256').toString('hex');
    if (currentPasswordHash !== expectedCurrentHash) {
      throw new Error('Hash de contraseña actual inconsistente');
    }
    
    // Verificar integridad del hash nueva
    const expectedNewHash = pbkdf2Sync(decryptedNewPassword, newSalt, 10000, 32, 'sha256').toString('hex');
    if (newPasswordHash !== expectedNewHash) {
      throw new Error('Hash de contraseña nueva inconsistente');
    }
    
    // Verificar contraseña actual con bcrypt
    const isValid = await user.comparePassword(decryptedCurrentPassword);
    if (!isValid) throw new Error('Contraseña actual incorrecta');
    
    // Cambiar a la nueva contraseña
    user.password = decryptedNewPassword;
    await user.save();
    
  } catch (error) {
    if (error.message.includes('incorrecta') || error.message.includes('inconsistente')) {
      throw error;
    }
    throw new Error('Error en el proceso de cambio de contraseña');
  }
};

export const logout = async (token) => {
  try {
    // Decodificar el token para obtener información
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Crear fecha de expiración basada en el token
    const expiresAt = new Date(decoded.exp * 1000);
    
    // Agregar token a la lista negra
    await TokenBlacklist.create({
      token,
      expiresAt,
      userId: decoded.userId
    });
    
    return { message: 'Logout exitoso' };
  } catch (error) {
    // Si el token ya está expirado o es inválido, no necesitamos hacer nada
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return { message: 'Logout exitoso' };
    }
    throw error;
  }
};

export const isTokenBlacklisted = async (token) => {
  const blacklistedToken = await TokenBlacklist.findOne({ token });
  return !!blacklistedToken;
};

import jwt from 'jsonwebtoken';
import { pbkdf2Sync, createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import mongoose from 'mongoose';
import * as userRepo from '../../user/repository/user.repository.js';
import * as personaService from '../../persona/service/persona.service.js';
import config from '../../../config/index.js';
import TokenBlacklist from '../model/tokenBlacklist.model.js';

// Clave para cifrado AES (en producción debe estar en variables de entorno)
const AES_KEY = process.env.AES_ENCRYPTION_KEY || 'mi-clave-super-secreta-32-chars!!';

export const register = async ({ personaData, username, password, emailVerificadoGoogle }) => {
  // Verificar que el usuario no exista antes de crear nada
  const existingUser = await userRepo.findByUsername(username);
  if (existingUser) {
    throw new Error('El nombre de usuario ya existe');
  }
  // Verificar si MongoDB soporta transacciones
  const supportsTransactions = mongoose.connection.db && 
    mongoose.connection.db.serverConfig && 
    mongoose.connection.db.serverConfig.ismaster && 
    mongoose.connection.db.serverConfig.ismaster.setName;

  if (supportsTransactions) {
    // Usar transacciones si está disponible (MongoDB Atlas o ReplicaSet)
    const session = await mongoose.startSession();
    
    try {
      return await session.withTransaction(async () => {
        const persona = await personaService.createPersonaWithSession(personaData, session);
        
        const existingUserByPersona = await userRepo.findByPersonaIdWithSession(persona._id, session);
        if (existingUserByPersona) {
          throw new Error('Ya existe un usuario asociado a esta persona');
        }
        
        const userData = {
          persona: persona._id,
          username: username.toLowerCase(),
          password,
          estado: process.env.NODE_ENV === 'test' ? 'ACTIVO' : 'ACTIVO',
          emailVerificado: emailVerificadoGoogle || false
        };

        const user = await userRepo.createWithSession(userData, session);
        await user.populate('persona');
        
        return {
          user,
          persona,
          message: 'Usuario registrado exitosamente. Verifica tu email para activar la cuenta.'
        };
      });
    } catch (error) {
      if (error.name === 'ValidationError' || 
          error.message.includes('ya existe') ||
          error.message.includes('requerido') ||
          error.message.includes('inválido') ||
          error.message.includes('debe tener') ||
          error.message.includes('formato') ||
          error.message.includes('mayor de')) {
        throw error;
      }
      
      console.error('Error en transacción de registro:', error);
      throw new Error(`Error en el proceso de registro: ${error.message}`);
    } finally {
      await session.endSession();
    }
  } else {
    // Fallback para MongoDB standalone (sin transacciones)
    console.log('🔄 MongoDB standalone detectado - usando operaciones secuenciales');
    
    let createdPersona = null;
    
    try {
      // 1. Crear persona primero
      createdPersona = await personaService.createPersona(personaData);
      
      // 2. Verificar que no exista un usuario con esta persona
      const existingUserByPersona = await userRepo.findByPersonaId(createdPersona._id);
      if (existingUserByPersona) {
        // Limpiar persona creada
        await personaService.deletePersona(createdPersona._id);
        throw new Error('Ya existe un usuario asociado a esta persona');
      }
      
      // 3. Crear datos del usuario
      const userData = {
        persona: createdPersona._id,
        username: username.toLowerCase(),
        password,
        estado: process.env.NODE_ENV === 'test' ? 'ACTIVO' : 'ACTIVO',
        emailVerificado: emailVerificadoGoogle || false
      };

      // 4. Crear usuario
      const user = await userRepo.create(userData);
      await user.populate('persona');
      
      return {
        user,
        persona: createdPersona,
        message: 'Usuario registrado exitosamente. Verifica tu email para activar la cuenta.'
      };
    } catch (error) {
      // Limpiar persona si se creó pero falló el usuario
      if (createdPersona) {
        try {
          await personaService.deletePersona(createdPersona._id);
          console.log('🧹 Persona limpiada debido a error en creación de usuario');
        } catch (cleanupError) {
          console.error('Error limpiando persona:', cleanupError);
        }
      }
      
      // Preservar errores de validación específicos
      if (error.name === 'ValidationError' || 
          error.message.includes('ya existe') ||
          error.message.includes('requerido') ||
          error.message.includes('inválido') ||
          error.message.includes('debe tener') ||
          error.message.includes('formato') ||
          error.message.includes('mayor de')) {
        throw error;
      }
      
      throw new Error(`Error en el proceso de registro: ${error.message}`);
    }
  }
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
    
    // Registrar en historial de autenticación si existe
    if (!user.historialAuth) {
      user.historialAuth = [];
    }
    
    user.historialAuth.push({
      fechaLogin: new Date(),
      exitoso: true,
      metodo: 'credentials',
      userAgent: loginData.userAgent || 'Unknown',
      ip: loginData.ip || '0.0.0.0'
    });
    
    // Mantener solo los últimos 10 registros
    if (user.historialAuth.length > 10) {
      user.historialAuth = user.historialAuth.slice(-10);
    }
    
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
        emailVerificado: user.emailVerificado,
        imagenPerfil: user.imagenPerfil,
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

/**
 * MÉTODOS ESPECÍFICOS PARA ENTORNO DE DESARROLLO
 * Utilizan contraseñas en texto plano y sin validaciones de seguridad avanzada
 */

export const registerDev = async ({ personaData, username, password }) => {
  console.log('🚧 [DEV SERVICE] Registro con contraseña en texto plano');
  
  // Verificar que estamos en desarrollo
  if (config.env !== 'development') {
    throw new Error('Este método solo está disponible en entorno de desarrollo');
  }
  
  // Verificar que el usuario no exista antes de crear nada
  const existingUser = await userRepo.findByUsername(username);
  if (existingUser) {
    throw new Error('El nombre de usuario ya existe');
  }

  // Verificar si MongoDB soporta transacciones
  const supportsTransactions = mongoose.connection.db && 
    mongoose.connection.db.serverConfig && 
    mongoose.connection.db.serverConfig.ismaster && 
    mongoose.connection.db.serverConfig.ismaster.setName;

  if (supportsTransactions) {
    // Usar transacciones si está disponible (MongoDB Atlas o ReplicaSet)
    const session = await mongoose.startSession();
    
    try {
      return await session.withTransaction(async () => {
        let persona;
        if (personaData && Object.keys(personaData).length > 0) {
          persona = await personaService.createPersonaWithSession(personaData, session);
        } else {
          const defaultPersonaData = {
            nombres: 'Usuario',
            apellidos: 'Desarrollo',
            tipoDocumento: 'DNI',
            numeroDocumento: `DEV${Date.now()}`,
            fechaNacimiento: new Date('1990-01-01'),
            genero: 'No especificado'
          };
          persona = await personaService.createPersonaWithSession(defaultPersonaData, session);
        }
        
        const existingUserByPersona = await userRepo.findByPersonaIdWithSession(persona._id, session);
        if (existingUserByPersona) {
          throw new Error('Ya existe un usuario asociado a esta persona');
        }
          const userData = {
          persona: persona._id,
          username: username.toLowerCase(),
          password,
          estado: 'ACTIVO',
          emailVerificado: true,
          rol: 'USER' // Usar 'USER' que es el valor correcto del enum
        };
        
        const user = await userRepo.createWithSession(userData, session);
        await user.populate('persona');
        
        const token = jwt.sign(
          { userId: user._id, rol: user.rol }, 
          config.jwtSecret, 
          { expiresIn: config.jwtExpires }
        );
        
        return {
          token,
          user: {
            id: user._id,
            username: user.username,
            rol: user.rol,
            estado: user.estado,
            persona: user.persona
          }
        };
      });
    } catch (error) {
      if (error.name === 'ValidationError' || 
          error.message.includes('ya existe') ||
          error.message.includes('requerido') ||
          error.message.includes('inválido') ||
          error.message.includes('debe tener') ||
          error.message.includes('formato') ||
          error.message.includes('mayor de') ||
          error.message.includes('alfanumérico') ||
          error.message.includes('caracteres')) {
        throw error;
      }
      
      console.error('Error en transacción de registro (dev):', error);
      throw new Error(`Error en el proceso de registro: ${error.message}`);
    } finally {
      await session.endSession();
    }
  } else {
    // Fallback para MongoDB standalone (sin transacciones)
    console.log('🔄 MongoDB standalone detectado - usando operaciones secuenciales');
    
    let createdPersona = null;
    
    try {
      // 1. Crear persona
      if (personaData && Object.keys(personaData).length > 0) {
        createdPersona = await personaService.createPersona(personaData);
      } else {
        const defaultPersonaData = {
          nombres: 'Usuario',
          apellidos: 'Desarrollo',
          tipoDocumento: 'DNI',
          numeroDocumento: `DEV${Date.now()}`,
          fechaNacimiento: new Date('1990-01-01'),
          genero: 'No especificado'
        };
        createdPersona = await personaService.createPersona(defaultPersonaData);
      }
      
      // 2. Verificar que no exista un usuario con esta persona
      const existingUserByPersona = await userRepo.findByPersonaId(createdPersona._id);
      if (existingUserByPersona) {
        // Limpiar persona creada
        await personaService.deletePersona(createdPersona._id);
        throw new Error('Ya existe un usuario asociado a esta persona');
      }
        // 3. Crear usuario
      const userData = {
        persona: createdPersona._id,
        username: username.toLowerCase(),
        password,
        estado: 'ACTIVO',
        emailVerificado: true,
        rol: 'USER' // Usar 'USER' que es el valor correcto del enum
      };
      
      const user = await userRepo.create(userData);
      await user.populate('persona');
      
      // 4. Generar token JWT
      const token = jwt.sign(
        { userId: user._id, rol: user.rol }, 
        config.jwtSecret, 
        { expiresIn: config.jwtExpires }
      );
      
      return {
        token,
        user: {
          id: user._id,
          username: user.username,
          rol: user.rol,
          estado: user.estado,
          persona: user.persona
        }
      };
    } catch (error) {
      // Limpiar persona si se creó pero falló el usuario
      if (createdPersona) {
        try {
          await personaService.deletePersona(createdPersona._id);
          console.log('🧹 Persona limpiada debido a error en creación de usuario');
        } catch (cleanupError) {
          console.error('Error limpiando persona:', cleanupError);
        }
      }
      
      // Preservar errores de validación específicos
      if (error.name === 'ValidationError' || 
          error.message.includes('ya existe') ||
          error.message.includes('requerido') ||
          error.message.includes('inválido') ||
          error.message.includes('debe tener') ||
          error.message.includes('formato') ||
          error.message.includes('mayor de') ||
          error.message.includes('alfanumérico') ||
          error.message.includes('caracteres')) {
        throw error;
      }
      
      throw new Error(`Error en el proceso de registro: ${error.message}`);
    }
  }
};

export const loginDev = async ({ username, password }, req = null) => {
  console.log('🚧 [DEV SERVICE] Login con contraseña en texto plano');
  
  // Verificar que estamos en desarrollo
  if (config.env !== 'development') {
    throw new Error('Este método solo está disponible en entorno de desarrollo');
  }
  
  if (!username || !password) {
    throw new Error('Username y password son requeridos');
  }
  
  // Buscar usuario
  const user = await userRepo.findByUsername(username);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }
  
  // Verificar estado del usuario
  if (user.isBlocked()) {
    const minutosRestantes = Math.ceil((user.bloqueadoHasta - new Date()) / 60000);
    throw new Error(`Usuario bloqueado. Intenta de nuevo en ${minutosRestantes} minutos.`);
  }
  
  // Verificar contraseña usando bcrypt
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    await user.incrementLoginAttempts();
    throw new Error('Credenciales inválidas');
  }
  
  if (user.estado !== 'ACTIVO') {
    throw new Error('Usuario inactivo o no verificado');
  }
  
  // Reset intentos de login y actualizar último login
  await user.resetLoginAttempts();
  user.ultimoLogin = new Date();
  
  // Registrar en historial de autenticación si existe (solo en desarrollo)
  if (!user.historialAuth) {
    user.historialAuth = [];
  }
  
  user.historialAuth.push({
    fechaLogin: new Date(),
    exitoso: true,
    metodo: 'dev-credentials',
    userAgent: 'Development Login',
    ip: req?.ip || req?.connection?.remoteAddress || 'localhost'
  });
  
  // Mantener solo los últimos 10 registros
  if (user.historialAuth.length > 10) {
    user.historialAuth = user.historialAuth.slice(-10);
  }
  
  await user.save();
  
  // Generar token JWT
  const token = jwt.sign(
    { userId: user._id, rol: user.rol }, 
    config.jwtSecret, 
    { expiresIn: config.jwtExpires }
  );
  
  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      rol: user.rol,
      estado: user.estado,
      ultimoLogin: user.ultimoLogin,
      persona: user.persona
    }
  };
};

export const changePasswordDev = async (userId, { currentPassword, newPassword }) => {
  console.log('🚧 [DEV SERVICE] Cambio de contraseña con texto plano');
  
  // Verificar que estamos en desarrollo
  if (config.env !== 'development') {
    throw new Error('Este método solo está disponible en entorno de desarrollo');
  }
  
  if (!currentPassword || !newPassword) {
    throw new Error('Contraseña actual y nueva contraseña son requeridas');
  }
  
  if (newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  }
  
  // Buscar usuario
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  // Verificar contraseña actual
  const isValidCurrentPassword = await user.comparePassword(currentPassword);
  if (!isValidCurrentPassword) {
    throw new Error('Contraseña actual incorrecta');
  }
  
  // Actualizar contraseña (el modelo se encarga del hash con bcrypt)
  user.password = newPassword;
  await user.save();
  
  return { message: 'Contraseña actualizada correctamente' };
};

/**
 * Obtener perfil completo del usuario
 */
export const getUserProfile = async (userId) => {
  try {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Asegurar que la persona esté poblada
    await user.populate('persona');

    return {
      _id: user._id,
      username: user.username,
      rol: user.rol,
      estado: user.estado,
      ultimoLogin: user.ultimoLogin,
      emailVerificado: user.emailVerificado,
      imagenPerfil: user.imagenPerfil,
      fechaRegistro: user.createdAt,
      configuraciones: user.configuraciones,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      persona: user.persona
    };
  } catch (error) {
    console.error('Error obteniendo perfil del usuario:', error);
    throw new Error('Error obteniendo perfil del usuario');
  }
};

/**
 * Actualizar perfil del usuario
 */
export const updateUserProfile = async (userId, updateData) => {
  try {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Actualizar configuraciones del usuario si se proporcionan
    if (updateData.configuraciones) {
      user.configuraciones = {
        ...user.configuraciones,
        ...updateData.configuraciones
      };
    }

    // Actualizar imagen de perfil si se proporciona
    if (updateData.imagenPerfil !== undefined) {
      user.imagenPerfil = updateData.imagenPerfil;
    }

    // Si hay datos de persona, actualizarlos
    if (updateData.persona && user.persona) {
      await user.populate('persona');
      
      // Actualizar los campos de persona
      const personaId = user.persona._id || user.persona;
      const updatedPersona = await personaService.updatePersona(personaId, updateData.persona);
      
      if (!updatedPersona) {
        throw new Error('Error actualizando datos de persona');
      }
    }

    // Guardar cambios del usuario
    await user.save();

    // Retornar perfil actualizado
    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    if (error.message.includes('no encontrado') || error.message.includes('actualizando')) {
      throw error;
    }
    throw new Error('Error actualizando perfil del usuario');
  }
};

/**
 * Actualizar imagen de perfil del usuario
 */
export const updateProfileImage = async (userId, imagenPerfil) => {
  try {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Actualizar imagen de perfil
    user.imagenPerfil = imagenPerfil;
    await user.save();

    // Retornar perfil actualizado
    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error actualizando imagen de perfil:', error);
    if (error.message.includes('no encontrado')) {
      throw error;
    }
    throw new Error('Error actualizando imagen de perfil');
  }
};

/**
 * Eliminar imagen de perfil del usuario
 */
export const removeProfileImage = async (userId) => {
  try {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Eliminar imagen de perfil
    user.imagenPerfil = null;
    await user.save();

    // Retornar perfil actualizado
    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error eliminando imagen de perfil:', error);
    if (error.message.includes('no encontrado')) {
      throw error;
    }
    throw new Error('Error eliminando imagen de perfil');
  }
};

/**
 * Reset password por administrador
 */
export const resetUserPassword = async (targetUserId, adminUserId, newPassword) => {
  try {
    // Verificar que el administrador existe y tiene permisos
    const adminUser = await userRepo.findById(adminUserId);
    if (!adminUser) {
      throw new Error('Administrador no encontrado');
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(adminUser.rol)) {
      throw new Error('No tienes permisos para resetear contraseñas');
    }

    // Buscar el usuario objetivo
    const targetUser = await userRepo.findById(targetUserId);
    if (!targetUser) {
      throw new Error('Usuario no encontrado');
    }

    // Validar la nueva contraseña
    if (!newPassword || newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    // Actualizar contraseña (el modelo se encarga del hash con bcrypt)
    targetUser.password = newPassword;
    
    // Resetear intentos de login si los tiene
    targetUser.intentosLogin = 0;
    targetUser.bloqueadoHasta = undefined;
    
    await targetUser.save();

    return { 
      message: `Contraseña reseteada correctamente para el usuario ${targetUser.username}`,
      temporaryPassword: newPassword // Solo para que el admin se la pueda dar al usuario
    };
  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    if (error.message.includes('no encontrado') || 
        error.message.includes('permisos') || 
        error.message.includes('caracteres')) {
      throw error;
    }
    throw new Error('Error reseteando contraseña del usuario');
  }
};

/**
 * Reset password por administrador (versión desarrollo)
 */
export const resetUserPasswordDev = async (targetUserId, adminUserId, newPassword = null) => {
  console.log('🚧 [DEV SERVICE] Reset password por administrador');
  
  // Verificar que estamos en desarrollo
  if (config.env !== 'development') {
    throw new Error('Este método solo está disponible en entorno de desarrollo');
  }

  try {
    // Verificar que el administrador existe y tiene permisos
    const adminUser = await userRepo.findById(adminUserId);
    if (!adminUser) {
      throw new Error('Administrador no encontrado');
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(adminUser.rol)) {
      throw new Error('No tienes permisos para resetear contraseñas');
    }

    // Buscar el usuario objetivo
    const targetUser = await userRepo.findById(targetUserId);
    if (!targetUser) {
      throw new Error('Usuario no encontrado');
    }

    // Generar contraseña temporal si no se proporciona
    const temporaryPassword = newPassword || Math.random().toString(36).slice(-8);

    // Validar la nueva contraseña
    if (temporaryPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    // Actualizar contraseña (el modelo se encarga del hash con bcrypt)
    targetUser.password = temporaryPassword;
    
    // Resetear intentos de login si los tiene
    targetUser.intentosLogin = 0;
    targetUser.bloqueadoHasta = undefined;
    
    await targetUser.save();

    return { 
      message: `Contraseña reseteada correctamente para el usuario ${targetUser.username}`,
      temporaryPassword: temporaryPassword,
      username: targetUser.username
    };
  } catch (error) {
    console.error('Error reseteando contraseña (dev):', error);
    if (error.message.includes('no encontrado') || 
        error.message.includes('permisos') || 
        error.message.includes('caracteres')) {
      throw error;
    }
    throw new Error('Error reseteando contraseña del usuario');
  }
};

export const forgotPassword = async (email) => {
  try {
    // Buscar usuario por email a través de la persona
    const user = await userRepo.findByPersonaEmail(email);
    
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return { 
        success: true, 
        message: 'Si el email existe en nuestro sistema, recibirás un código de verificación.' 
      };
    }

    // Generar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar el código con expiración de 15 minutos
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    await user.save();

    // En un entorno real, aquí enviarías el email
    // Por ahora, log para desarrollo
    console.log(`Código de reset para ${email}: ${resetCode}`);
    
    return {
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un código de verificación.',
      // Solo en desarrollo
      ...(process.env.NODE_ENV === 'development' && { resetCode })
    };
  } catch (error) {
    console.error('Error en forgot password:', error);
    throw new Error('Error procesando solicitud de reset de contraseña');
  }
};

export const resetPasswordWithCode = async ({ email, resetCode, newPassword }) => {
  try {
    // Buscar usuario por email
    const user = await userRepo.findByPersonaEmail(email);
    
    if (!user) {
      throw new Error('Email no encontrado');
    }

    // Verificar código y expiración
    if (!user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new Error('No hay solicitud de reset activa para este email');
    }

    if (user.resetPasswordCode !== resetCode) {
      throw new Error('Código de verificación inválido');
    }

    if (new Date() > user.resetPasswordExpires) {
      throw new Error('El código de verificación ha expirado');
    }

    // Actualizar contraseña
    user.password = newPassword;
    
    // Limpiar código de reset
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    
    // Resetear intentos de login
    user.intentosLogin = 0;
    user.bloqueadoHasta = undefined;
    
    await user.save();

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
      username: user.username
    };
  } catch (error) {
    console.error('Error reseteando contraseña con código:', error);
    if (error.message.includes('Email') || 
        error.message.includes('Código') || 
        error.message.includes('expirado') ||
        error.message.includes('solicitud')) {
      throw error;
    }
    throw new Error('Error reseteando contraseña');
  }
};

export const resetPasswordSimple = async ({ email, newPassword }) => {
  try {
    // Buscar usuario por email
    const user = await userRepo.findByPersonaEmail(email);
    
    if (!user) {
      throw new Error('Email no encontrado');
    }

    // Actualizar contraseña directamente
    user.password = newPassword;
    
    // Limpiar código de reset si existe
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    
    // Resetear intentos de login
    user.intentosLogin = 0;
    user.bloqueadoHasta = undefined;
    
    await user.save();

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
      username: user.username
    };
  } catch (error) {
    console.error('Error reseteando contraseña simple:', error);
    if (error.message.includes('Email')) {
      throw error;
    }
    throw new Error('Error reseteando contraseña');
  }
};

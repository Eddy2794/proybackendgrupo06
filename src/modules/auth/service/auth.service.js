import jwt from 'jsonwebtoken';
import * as userRepo from '../../user/repository/user.repository.js';
import * as personaService from '../../persona/service/persona.service.js';
import config from '../../../config/index.js';
import TokenBlacklist from '../model/tokenBlacklist.model.js';

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

export const login = async ({ username, password }) => {
  const user = await userRepo.findByUsername(username);
  if (!user) throw new Error('Credenciales inválidas');
  if (user.isBlocked()) {
    const minutosRestantes = Math.ceil((user.bloqueadoHasta - new Date()) / 60000);
    throw new Error(`Usuario bloqueado. Intenta de nuevo en ${minutosRestantes} minutos.`);
  }
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    await user.incrementLoginAttempts();
    throw new Error('Credenciales inválidas');
  }
  if (user.estado !== 'ACTIVO') throw new Error('Usuario inactivo o no verificado');  await user.resetLoginAttempts();
  
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
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) throw new Error('Contraseña actual incorrecta');
  user.password = newPassword;
  await user.save();
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

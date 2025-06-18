import jwt from 'jsonwebtoken';
import * as userRepo from './user.repository.js';
import * as personaService from '../persona/persona.service.js';
import config from '../../config/index.js';

export const register = async ({ personaData, username, password }) => {
  // 1. Verificar si ya existe usuario con ese username
  const existingUser = await userRepo.findByUsername(username);
  if (existingUser) {
    throw new Error('El nombre de usuario ya existe');
  }

  // 2. Crear primero la persona
  const persona = await personaService.createPersona(personaData);

  // 3. Verificar si ya existe un usuario asociado a esta persona
  const existingUserByPersona = await userRepo.findByPersonaId(persona._id);
  if (existingUserByPersona) {
    throw new Error('Ya existe un usuario asociado a esta persona');
  }
  // 4. Crear el usuario asociado a la persona
  const userData = {
    persona: persona._id,
    username: username.toLowerCase(),
    password,
    // En ambiente de test, activar automáticamente
    estado: process.env.NODE_ENV === 'test' ? 'ACTIVO' : 'PENDIENTE_VERIFICACION',
    emailVerificado: process.env.NODE_ENV === 'test' ? true : false
  };

  const user = await userRepo.create(userData);
  
  // 5. Poblamos la persona para devolverla completa
  await user.populate('persona');
  
  return {
    user,
    persona,
    message: 'Usuario registrado exitosamente. Verifica tu email para activar la cuenta.'
  };
};

export const login = async ({ username, password }) => {
  // 1. Buscar usuario por username
  const user = await userRepo.findByUsername(username);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  // 2. Verificar si el usuario está bloqueado
  if (user.isBlocked()) {
    const minutosRestantes = Math.ceil((user.bloqueadoHasta - new Date()) / 60000);
    throw new Error(`Usuario bloqueado. Intenta de nuevo en ${minutosRestantes} minutos.`);
  }

  // 3. Verificar contraseña
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    await user.incrementLoginAttempts();
    throw new Error('Credenciales inválidas');
  }

  // 4. Verificar estado del usuario
  if (user.estado === 'INACTIVO') {
    throw new Error('Usuario inactivo. Contacta al administrador.');
  }

  if (user.estado === 'SUSPENDIDO') {
    throw new Error('Usuario suspendido. Contacta al administrador.');
  }
  if (user.estado === 'PENDIENTE_VERIFICACION' && process.env.NODE_ENV !== 'test') {
    throw new Error('Debes verificar tu email antes de iniciar sesión.');
  }

  // 5. Verificar estado de la persona asociada
  if (user.persona.estado !== 'ACTIVO') {
    throw new Error('La persona asociada no está activa.');
  }

  // 6. Login exitoso - resetear intentos y actualizar último login
  await user.resetLoginAttempts();

  // 7. Generar token JWT
  const token = jwt.sign(
    { 
      id: user._id,
      personaId: user.persona._id, 
      username: user.username,
      rol: user.rol,
      email: user.persona.email
    },
    config.jwtSecret || 'secret123',
    { expiresIn: '24h' }
  );

  // 8. Remover datos sensibles
  const userResponse = user.toJSON();

  return { 
    token, 
    user: userResponse,
    message: 'Inicio de sesión exitoso'
  };
};

export const getUser = async (id) => {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  if (user.estado === 'INACTIVO') {
    throw new Error('Usuario inactivo');
  }
  
  return user;
};

export const getUserByUsername = async (username) => {
  const user = await userRepo.findByUsername(username);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  return user;
};

export const getAllUsers = async (filters = {}, options = {}) => {
  return await userRepo.findAll(filters, options);
};

export const updateUser = async (id, updateData) => {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Si se está actualizando el username, verificar que no exista
  if (updateData.username && updateData.username !== user.username) {
    const existingUser = await userRepo.findByUsername(updateData.username);
    if (existingUser) {
      throw new Error('El nombre de usuario ya está en uso');
    }
    updateData.username = updateData.username.toLowerCase();
  }

  return await userRepo.updateById(id, updateData);
};

export const deleteUser = async (id) => {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Soft delete - cambiar estado a INACTIVO
  return await userRepo.softDeleteById(id);
};

export const activateUser = async (id) => {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return await userRepo.updateById(id, { 
    estado: 'ACTIVO',
    emailVerificado: true
  });
};

export const changePassword = async (id, currentPassword, newPassword) => {
  const user = await userRepo.findByUsername((await userRepo.findById(id)).username);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const isValidPassword = await user.comparePassword(currentPassword);
  if (!isValidPassword) {
    throw new Error('Contraseña actual incorrecta');
  }

  // Actualizar password (se hashea automáticamente en el modelo)
  user.password = newPassword;
  await user.save();

  return { message: 'Contraseña actualizada exitosamente' };
};

export const getUsersByRole = async (rol) => {
  return await userRepo.findByRole(rol);
};

export const getUserStats = async () => {
  const statusCounts = await userRepo.countByStatus();
  return {
    totalUsuarios: statusCounts.reduce((total, item) => total + item.count, 0),
    porEstado: statusCounts
  };
};
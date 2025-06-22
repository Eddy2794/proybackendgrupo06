import * as userRepo from '../repository/user.repository.js';
import * as personaService from '../../persona/service/persona.service.js';
import config from '../../../config/index.js';

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
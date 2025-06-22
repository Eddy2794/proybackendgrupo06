import * as service from '../service/user.service.js';
import { validationResult } from 'express-validator';

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await service.getUser(req.params.id);
    if (!user) {
      return res.error('Usuario no encontrado', 404);
    }
    return res.success('Perfil de usuario obtenido exitosamente', user);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await service.getUser(req.user.id);
    if (!user) {
      return res.error('Usuario no encontrado', 404);
    }
    return res.success('Perfil actual obtenido exitosamente', user);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, estado, rol } = req.query;
    const filters = {};
    if (estado) filters.estado = estado;
    if (rol) filters.rol = rol;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };
    const result = await service.getAllUsers(filters, options);
    return res.paginated(
      'Lista de usuarios obtenida exitosamente',
      result.users,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.validation('Errores de validación', errors.array());
    }
    const user = await service.updateUser(req.params.id, req.body);
    if (!user) {
      return res.error('Usuario no encontrado', 404);
    }
    return res.success('Usuario actualizado exitosamente', user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deleted = await service.deleteUser(req.params.id);
    if (!deleted) {
      return res.error('Usuario no encontrado', 404);
    }
    return res.success('Usuario desactivado exitosamente');
  } catch (error) {
    next(error);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const user = await service.activateUser(req.params.id);
    if (!user) {
      return res.error('Usuario no encontrado', 404);
    }
    return res.success('Usuario activado exitosamente', user);
  } catch (error) {
    next(error);
  }
};

export const getUsersByRole = async (req, res, next) => {
  try {
    const { rol } = req.params;
    const users = await service.getUsersByRole(rol);
    return res.success('Usuarios por rol obtenidos exitosamente', users);
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const stats = await service.getUserStats();
    return res.success('Estadísticas de usuario obtenidas exitosamente', stats);
  } catch (error) {
    next(error);
  }
};
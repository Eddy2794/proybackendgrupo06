import * as service from './user.service.js';
import { validationResult } from 'express-validator';

export const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Errores de validación',
        errors: errors.array() 
      });
    }

    // Separar datos de persona y usuario
    const { username, password, ...personaData } = req.body;
    
    const result = await service.register({
      personaData,
      username,
      password
    });
    
    res.status(201).json({
      message: result.message,
      userId: result.user._id,
      personaId: result.persona._id,
      username: result.user.username,
      nombreCompleto: result.persona.nombreCompleto
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Errores de validación',
        errors: errors.array() 
      });
    }

    const result = await service.login(req.body);
    
    res.json({
      message: result.message,
      token: result.token,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await service.getUser(req.params.id);
    res.json(user);
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    // El ID viene del token JWT decodificado en el middleware de auth
    const user = await service.getUser(req.user.id);
    res.json(user);
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
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Errores de validación',
        errors: errors.array() 
      });
    }

    const user = await service.updateUser(req.params.id, req.body);
    
    res.json({
      message: 'Usuario actualizado exitosamente',
      user
    });
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await service.deleteUser(req.params.id);
    
    res.json({
      message: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const user = await service.activateUser(req.params.id);
    
    res.json({
      message: 'Usuario activado exitosamente',
      user
    });
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Errores de validación',
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Del token JWT
    
    const result = await service.changePassword(userId, currentPassword, newPassword);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUsersByRole = async (req, res, next) => {
  try {
    const { rol } = req.params;
    const users = await service.getUsersByRole(rol);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const stats = await service.getUserStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
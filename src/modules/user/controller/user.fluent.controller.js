/**
 * Controlador de usuarios con documentación automática
 */

import * as userService from '../service/user.service.js';

export class UserController {
  
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, estado, rol } = req.query;
      const filters = {};
      if (search) filters.search = search;
      if (estado) filters.estado = estado;
      if (rol) filters.rol = rol;
      
      const options = { page: parseInt(page), limit: parseInt(limit) };
      const result = await userService.getAllUsers(filters, options);
      return res.success('Usuarios obtenidos exitosamente', result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUser(id);
      return res.success('Usuario obtenido exitosamente', user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const userData = req.body;
      const user = await userService.createUser(userData);
      return res.success('Usuario creado exitosamente', user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = await userService.updateUser(id, updateData);
      return res.success('Usuario actualizado exitosamente', user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      return res.success('Usuario eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async getUserProfile(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUser(id);
      return res.success('Perfil obtenido exitosamente', user);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const { userId } = req.user;
      const user = await userService.getUser(userId);
      return res.success('Usuario actual obtenido', user);
    } catch (error) {
      next(error);
    }
  }

  async activateUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.activateUser(id);
      return res.success('Usuario activado exitosamente', user);
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req, res, next) {
    try {
      const stats = await userService.getUserStats();
      return res.success('Estadísticas obtenidas exitosamente', stats);
    } catch (error) {
      next(error);
    }
  }

  async getUsersByRole(req, res, next) {
    try {
      const { role } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const filters = { rol: role };
      const options = { page: parseInt(page), limit: parseInt(limit) };
      const users = await userService.getAllUsers(filters, options);
      return res.success('Usuarios por rol obtenidos exitosamente', users);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();

/**
 * Controlador de autenticación con documentación automática
 */

import * as service from '../service/auth.service.js';

export class AuthController {
  async register(req, res, next) {
    try {
      const { username, password, ...personaData } = req.body;
      const result = await service.register({ personaData, username, password });
      return res.success('Registro exitoso', {
        token: result.token,
        user: result.user
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await service.login(req.body);
      return res.success(result.message, {
        token: result.token,
        user: result.user
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { userId } = req.user;
      await service.changePassword(userId, req.body);
      return res.success('Contraseña actualizada correctamente');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await service.logout(token);
      }
      return res.success('Logout exitoso');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const { userId } = req.user;
      const user = await service.getUserProfile(userId);
      return res.success('Perfil obtenido exitosamente', user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

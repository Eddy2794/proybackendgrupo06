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
      // Obtener información del request para el historial de autenticación
      const ip = req.ip || 
                 req.connection?.remoteAddress || 
                 req.socket?.remoteAddress ||
                 req.headers['x-forwarded-for']?.split(',')[0] ||
                 '0.0.0.0';
      
      const userAgent = req.headers['user-agent'] || 'Unknown';
      
      // Agregar información de request a los datos de login
      const loginData = {
        ...req.body,
        ip,
        userAgent
      };
      
      const result = await service.login(loginData);
      return res.success(result.message, {
        token: result.token,
        user: result.user
      });
    } catch (error) {
      next(error);
    }
  }

  // Métodos específicos para desarrollo
  async registerDev(req, res, next) {
    try {
      const { username, password, ...personaData } = req.body;
      const result = await service.registerDev({ personaData, username, password });
      return res.success('Registro de desarrollo exitoso', {
        token: result.token,
        user: result.user
      });
    } catch (error) {
      next(error);
    }
  }

  async loginDev(req, res, next) {
    try {
      const result = await service.loginDev(req.body);
      return res.success('Login de desarrollo exitoso', {
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

  async changePasswordDev(req, res, next) {
    try {
      const { userId } = req.user;
      await service.changePasswordDev(userId, req.body);
      return res.success('Contraseña actualizada correctamente (desarrollo)');
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

  async updateProfile(req, res, next) {
    try {
      const { userId } = req.user;
      const result = await service.updateUserProfile(userId, req.body);
      return res.success('Perfil actualizado exitosamente', result);
    } catch (error) {
      next(error);
    }
  }

  async updateProfileImage(req, res, next) {
    try {
      const { userId } = req.user;
      const { imagenPerfil } = req.body;
      
      if (!imagenPerfil) {
        return res.error('La imagen es requerida', 400);
      }

      // Validar formato base64 de imagen
      const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
      if (!base64Regex.test(imagenPerfil)) {
        return res.error('Formato de imagen inválido. Solo se permiten JPEG, PNG, GIF, WEBP en base64', 400);
      }

      // Validar tamaño (máximo 5MB)
      const sizeInBytes = (imagenPerfil.length * 3) / 4;
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (sizeInBytes > maxSize) {
        return res.error('La imagen es demasiado grande. Máximo 5MB', 400);
      }

      const result = await service.updateProfileImage(userId, imagenPerfil);
      return res.success('Imagen de perfil actualizada exitosamente', result);
    } catch (error) {
      next(error);
    }
  }

  async removeProfileImage(req, res, next) {
    try {
      const { userId } = req.user;
      const result = await service.removeProfileImage(userId);
      return res.success('Imagen de perfil eliminada exitosamente', result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

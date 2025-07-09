/**
 * Rutas de autenticación con máxima automatización
 */

import { Router } from 'express';
import { authController } from '../controller/auth.fluent.controller.js';
import { validateSchema } from '../../../middlewares/validation.js';
import * as authValidators from '../validator/auth.validators.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { 
  authRateLimit, 
  validateTimestamp, 
  validateClientToken,
  validatePasswordHash 
} from '../../../middlewares/advancedSecurity.js';
import { autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';

const router = Router();

// Middlewares
const registerMiddlewares = [
  authRateLimit,
  validateTimestamp,
  validateClientToken,
  validateSchema(authValidators.registerSchema)
];

const loginMiddlewares = [
  authRateLimit,
  validateTimestamp,
  validateClientToken,
  validatePasswordHash,
  validateSchema(authValidators.loginSchema)
];

const changePasswordMiddlewares = [
  authMiddleware,
  validateSchema(authValidators.changePasswordSchema)
];

const authRequiredMiddlewares = [authMiddleware];

const resetPasswordMiddlewares = [
  authMiddleware,
  validateSchema(authValidators.resetPasswordSchema)
];

// Rutas
router.post('/register', ...registerMiddlewares, authController.register);
router.post('/login', ...loginMiddlewares, authController.login);
router.post('/change-password', ...changePasswordMiddlewares, authController.changePassword);
router.post('/reset-password/:userId', ...resetPasswordMiddlewares, authController.resetUserPassword);
router.post('/logout', ...authRequiredMiddlewares, authController.logout);
router.get('/profile', ...authRequiredMiddlewares, authController.getProfile);
router.put('/profile', ...authRequiredMiddlewares, authController.updateProfile);
router.put('/profile/image', ...authRequiredMiddlewares, authController.updateProfileImage);
router.delete('/profile/image', ...authRequiredMiddlewares, authController.removeProfileImage);

// Documentación automática con mapeo de validadores
const authRouteConfigs = [
  routeConfig('POST', '/register', 'registerSchema', 'Registrar nuevo usuario', {
    description: 'Registra un nuevo usuario en el sistema'
  }),
  routeConfig('POST', '/login', 'loginSchema', 'Iniciar sesión', {
    description: 'Autentica al usuario y devuelve los tokens de acceso'
  }),
  routeConfig('POST', '/change-password', 'changePasswordSchema', 'Cambiar contraseña', {
    description: 'Cambia la contraseña del usuario autenticado',
    auth: true
  }),
  routeConfig('POST', '/reset-password/:userId', 'resetPasswordSchema', 'Resetear contraseña de usuario', {
    description: 'Permite a un administrador resetear la contraseña de otro usuario',
    auth: true
  }),
  routeConfig('POST', '/logout', null, 'Cerrar sesión', {
    description: 'Cierra la sesión del usuario y invalida el token',
    auth: true
  }),
  routeConfig('GET', '/profile', null, 'Obtener perfil de usuario', {
    description: 'Obtiene el perfil del usuario autenticado',
    auth: true
  }),
  routeConfig('PUT', '/profile', null, 'Actualizar perfil de usuario', {
    description: 'Actualiza el perfil del usuario autenticado',
    auth: true
  }),
  routeConfig('PUT', '/profile/image', null, 'Actualizar imagen de perfil', {
    description: 'Actualiza la imagen de perfil del usuario autenticado (base64)',
    auth: true
  }),
  routeConfig('DELETE', '/profile/image', null, 'Eliminar imagen de perfil', {
    description: 'Elimina la imagen de perfil del usuario autenticado',
    auth: true
  })
];

export const authSwaggerDocs = autoMapValidators(authValidators, authRouteConfigs, '/api/auth', 'Auth');

export default router;

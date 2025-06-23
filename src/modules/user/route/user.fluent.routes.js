/**
 * Rutas de usuarios con máxima automatización
 */

import { Router } from 'express';
import { userController } from '../controller/user.fluent.controller.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { validateSchema, validateObjectId } from '../../../middlewares/validation.js';
import * as userValidators from '../validator/user.validators.js';
import { autoCrudDocumentation, autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';

const router = Router();

// Aplicar validaciones automáticamente
const applyValidation = (schemaName, location = 'body') => {
  const schema = userValidators[schemaName];
  return schema ? [validateSchema(schema, location)] : [];
};

// Rutas con validaciones automáticas
router.get('/me', authMiddleware, userController.getCurrentUser);
router.get('/stats', authMiddleware, userController.getUserStats);
router.get('/', authMiddleware, ...applyValidation('userQuerySchema', 'query'), userController.getAllUsers);
router.get('/:id/profile', authMiddleware, validateObjectId('id'), userController.getUserProfile);
router.get('/:id', authMiddleware, validateObjectId('id'), userController.getUserById);
router.post('/', authMiddleware, ...applyValidation('createUserSchema'), userController.createUser);
router.put('/:id', authMiddleware, validateObjectId('id'), ...applyValidation('updateUserSchema'), userController.updateUser);
router.delete('/:id', authMiddleware, validateObjectId('id'), userController.deleteUser);
router.patch('/:id/activate', authMiddleware, validateObjectId('id'), userController.activateUser);
router.get('/role/:role', authMiddleware, userController.getUsersByRole);

// Documentación automática personalizada para rutas específicas
const userRouteConfigs = [
  routeConfig('GET', '/me', null, 'Obtener perfil del usuario actual', {
    description: 'Obtiene el perfil del usuario autenticado actualmente',
    auth: true
  }),
  routeConfig('GET', '/stats', null, 'Obtener estadísticas de usuarios', {
    description: 'Obtiene estadísticas generales de usuarios (solo admin)',
    auth: true
  }),
  routeConfig('GET', '/', 'userQuerySchema', 'Obtener todos los usuarios', {
    description: 'Obtiene lista paginada de usuarios del sistema',
    auth: true
  }),
  routeConfig('GET', '/:id/profile', null, 'Obtener perfil de usuario por ID', {
    description: 'Obtiene el perfil completo de un usuario específico',
    auth: true
  }),
  routeConfig('GET', '/:id', null, 'Obtener usuario por ID', {
    description: 'Obtiene información básica de un usuario por su ID',
    auth: true
  }),
  routeConfig('POST', '/', 'createUserSchema', 'Crear nuevo usuario', {
    description: 'Crea un nuevo usuario en el sistema',
    auth: true
  }),
  routeConfig('PUT', '/:id', 'updateUserSchema', 'Actualizar usuario', {
    description: 'Actualiza información de un usuario existente',
    auth: true
  }),
  routeConfig('DELETE', '/:id', null, 'Eliminar usuario', {
    description: 'Elimina un usuario del sistema',
    auth: true
  }),
  routeConfig('PATCH', '/:id/activate', null, 'Activar usuario', {
    description: 'Activa un usuario desactivado',
    auth: true
  }),
  routeConfig('GET', '/role/:role', null, 'Obtener usuarios por rol', {
    description: 'Obtiene usuarios filtrados por rol específico',
    auth: true
  })
];

export const userSwaggerDocs = autoMapValidators(userValidators, userRouteConfigs, '/api/users', 'Users');

export default router;

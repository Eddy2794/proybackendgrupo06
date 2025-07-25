/**
 * Rutas de personas con máxima automatización
 */

import { Router } from 'express';
import { personaController } from '../controller/persona.fluent.controller.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { validateSchema, validateObjectId } from '../../../middlewares/validation.js';
import * as personaValidators from '../validator/persona.validators.js';
import { autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';

const router = Router();

// Aplicar validaciones automáticamente
const applyValidation = (schemaName, location = 'body') => {
  const schema = personaValidators[schemaName];
  return schema ? [validateSchema(schema, location)] : [];
};

// Rutas con validaciones automáticas
router.get('/search', authMiddleware, personaController.searchPersonas);
router.get('/stats', authMiddleware, personaController.getPersonaStats);
router.get('/', authMiddleware, ...applyValidation('personaQuerySchema', 'query'), personaController.getAllPersonas);
router.get('/:id', authMiddleware, validateObjectId(), personaController.getPersonaById);
router.post('/', authMiddleware, ...applyValidation('createPersonaSchema'), personaController.createPersona);
router.put('/:id', authMiddleware, validateObjectId(), ...applyValidation('updatePersonaSchema'), personaController.updatePersona);
router.delete('/:id', authMiddleware, validateObjectId(), personaController.deletePersona);

// Rutas de Soft Delete
router.post('/:id/restore', authMiddleware, validateObjectId(), personaController.restorePersona);
router.get('/deleted/list', authMiddleware, ...applyValidation('personaQuerySchema', 'query'), personaController.getDeletedPersonas);
router.get('/all/including-deleted', authMiddleware, ...applyValidation('personaQuerySchema', 'query'), personaController.getAllPersonasIncludingDeleted);

// Documentación automática personalizada
const personaRouteConfigs = [
  routeConfig('GET', '/search', null, 'Buscar personas', {
    description: 'Realiza búsqueda de personas por diferentes criterios',
    auth: true
  }),
  routeConfig('GET', '/stats', null, 'Obtener estadísticas de personas', {
    description: 'Obtiene estadísticas generales de personas registradas',
    auth: true
  }),
  routeConfig('GET', '/', 'personaQuerySchema', 'Obtener todas las personas', {
    description: 'Obtiene lista paginada de personas registradas',
    auth: true
  }),
  routeConfig('GET', '/:id', null, 'Obtener persona por ID', {
    description: 'Obtiene información completa de una persona por su ID',
    auth: true
  }),
  routeConfig('POST', '/', 'createPersonaSchema', 'Crear nueva persona', {
    description: 'Registra una nueva persona en el sistema',
    auth: true
  }),
  routeConfig('PUT', '/:id', 'updatePersonaSchema', 'Actualizar persona', {
    description: 'Actualiza información de una persona existente',
    auth: true
  }),  routeConfig('DELETE', '/:id', null, 'Eliminar persona', {
    description: 'Elimina una persona del sistema (soft delete)',
    auth: true
  }),
  routeConfig('PATCH', '/:id/activate', null, 'Activar persona', {
    description: 'Activa una persona desactivada',
    auth: true
  }),
  // Rutas de Soft Delete
  routeConfig('POST', '/:id/restore', null, 'Restaurar persona eliminada', {
    description: 'Restaura una persona que fue eliminada con soft delete',
    auth: true
  }),
  routeConfig('DELETE', '/:id/hard', null, 'Eliminar persona permanentemente', {
    description: 'Elimina una persona de forma permanente (no reversible)',
    auth: true
  }),
  routeConfig('GET', '/deleted/list', 'personaQuerySchema', 'Obtener personas eliminadas', {
    description: 'Obtiene lista de personas eliminadas con soft delete',
    auth: true
  }),  routeConfig('GET', '/all/including-deleted', 'personaQuerySchema', 'Obtener todas las personas incluyendo eliminadas', {
    description: 'Obtiene todas las personas del sistema, incluyendo las eliminadas',
    auth: true
  })
];

export const personaSwaggerDocs = autoMapValidators(personaValidators, personaRouteConfigs, '/api/personas', 'Personas');

export default router;
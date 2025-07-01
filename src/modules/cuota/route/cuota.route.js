import { Router } from 'express';
import { cuotaController } from '../controller/cuota.controller.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { validateSchema, validateObjectId } from '../../../middlewares/validation.js';
import * as cuotaValidators from '../validator/cuota.validation.js';
import { autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';

const router = Router();

const applyValidation = (schemaName, location = 'body') => {
  const schema = cuotaValidators[schemaName];
  return schema ? [validateSchema(schema, location)] : [];
};

router.post('/', authMiddleware, ...applyValidation('createCuotaSchema'), cuotaController.create);
router.get('/:id', authMiddleware, validateObjectId('id'), cuotaController.getById);
router.get('/alumno-categoria/:alumnoCategoriaId', authMiddleware, validateObjectId('alumnoCategoriaId'), cuotaController.getByAlumnoCategoria);
router.put('/:id', authMiddleware, validateObjectId('id'), ...applyValidation('updateCuotaSchema'), cuotaController.update);
router.delete('/:id', authMiddleware, validateObjectId('id'), cuotaController.delete);
router.patch('/:id/soft-delete', authMiddleware, validateObjectId('id'), cuotaController.softDelete);
router.patch('/:id/restore', authMiddleware, validateObjectId('id'), cuotaController.restore);
router.get('/', authMiddleware, cuotaController.getByEstado); // ?estado=... (puede combinarse con paginación)
router.get('/periodo/buscar', authMiddleware, cuotaController.getByPeriodo); // ?anio=...&mes=...
router.patch('/:id/pagar', authMiddleware, validateObjectId('id'), cuotaController.marcarComoPagada);
router.get('/vencidas/buscar', authMiddleware, cuotaController.getVencidas);

// Documentación para Swagger
const cuotaRouteConfigs = [
  routeConfig('POST', '/', 'createCuotaSchema', 'Crear cuota', {
    description: 'Crea una nueva cuota para un alumno en una categoría',
    auth: true
  }),
  routeConfig('GET', '/:id', null, 'Obtener cuota por ID', {
    description: 'Obtiene los datos de una cuota específica',
    auth: true
  }),
  routeConfig('GET', '/alumno-categoria/:alumnoCategoriaId', null, 'Cuotas por alumno-categoría', {
    description: 'Obtiene todas las cuotas asociadas a una relación alumno-categoría',
    auth: true
  }),
  routeConfig('PUT', '/:id', 'updateCuotaSchema', 'Actualizar cuota', {
    description: 'Actualiza los datos de una cuota existente',
    auth: true
  }),
  routeConfig('DELETE', '/:id', null, 'Eliminar cuota físicamente', {
    description: 'Elimina una cuota de forma permanente',
    auth: true
  }),
  routeConfig('PATCH', '/:id/soft-delete', null, 'Eliminar cuota lógicamente', {
    description: 'Marca una cuota como eliminada lógicamente (soft delete)',
    auth: true
  }),
  routeConfig('PATCH', '/:id/restore', null, 'Restaurar cuota', {
    description: 'Restaura una cuota previamente eliminada lógicamente',
    auth: true
  }),
  routeConfig('GET', '/', null, 'Filtrar cuotas por estado', {
    description: 'Obtiene cuotas filtradas por estado (PENDIENTE, PAGA, VENCIDA)',
    auth: true
  }),
  routeConfig('GET', '/periodo/buscar', null, 'Filtrar cuotas por periodo', {
    description: 'Obtiene cuotas filtradas por año y mes',
    auth: true
  }),
  routeConfig('PATCH', '/:id/pagar', null, 'Marcar cuota como pagada', {
    description: 'Marca una cuota como pagada (por admin o integración de pago)',
    auth: true
  }),
  routeConfig('GET', '/vencidas/buscar', null, 'Obtener cuotas vencidas', {
    description: 'Obtiene todas las cuotas vencidas (pendientes y con fecha de vencimiento pasada)',
    auth: true
  })
];

export const cuotaSwaggerDocs = autoMapValidators(
  cuotaValidators,
  cuotaRouteConfigs,
  '/api/cuotas',
  'Cuotas'
);

export default router; 
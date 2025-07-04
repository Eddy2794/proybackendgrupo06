/**
 * Rutas para el módulo de categorías
 */

import { Router } from 'express';
import { categoriaController } from '../controller/categoria.fluent.controller.js';
import { validateSchema, validateObjectId } from '../../../middlewares/validation.js';
import { 
  createCategoriaSchema, 
  updateCategoriaSchema, 
  categoriaIdSchema,
  categoriaQuerySchema 
} from '../validator/categoria.validators.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { extractUserForAudit } from '../../../middlewares/auditMiddleware.js';
// Middleware removido - ya no es necesario
import { autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';
import * as categoriaValidators from '../validator/categoria.validators.js';

const router = Router();

// Rutas públicas (solo lectura) - con authMiddleware individual
router.get('/', 
  authMiddleware,
  validateSchema(categoriaQuerySchema, 'query'),
  categoriaController.getAllCategorias.bind(categoriaController)
);

router.get('/activas', 
  authMiddleware,
  categoriaController.getCategoriasActivas.bind(categoriaController)
);

router.get('/search', 
  authMiddleware,
  categoriaController.searchCategorias.bind(categoriaController)
);

router.get('/nivel/:nivel', 
  authMiddleware,
  categoriaController.getCategoriasByNivel.bind(categoriaController)
);

router.get('/rango-edad', 
  authMiddleware,
  categoriaController.getCategoriasByRangoEdad.bind(categoriaController)
);

router.get('/horario/:dia', 
  authMiddleware,
  categoriaController.getCategoriasByHorario.bind(categoriaController)
);

router.get('/stats', 
  authMiddleware,
  categoriaController.getCategoriaStats.bind(categoriaController)
);

router.get('/deleted', 
  authMiddleware,
  categoriaController.getDeletedCategorias.bind(categoriaController)
);

router.get('/all-including-deleted', 
  authMiddleware,
  categoriaController.getAllCategoriasIncludingDeleted.bind(categoriaController)
);

router.get('/:id', 
  authMiddleware,
  validateObjectId('id'),
  categoriaController.getCategoriaById.bind(categoriaController)
);

// Rutas de escritura (requieren auditoría) - con authMiddleware individual
router.post('/', 
  authMiddleware,
  extractUserForAudit,
  validateSchema(createCategoriaSchema, 'body'),
  categoriaController.createCategoria.bind(categoriaController)
);

router.put('/:id', 
  authMiddleware,
  extractUserForAudit,
  validateObjectId('id'),
  validateSchema(updateCategoriaSchema, 'body'),
  categoriaController.updateCategoria.bind(categoriaController)
);

router.delete('/:id', 
  authMiddleware,
  extractUserForAudit,
  validateObjectId('id'),
  categoriaController.deleteCategoria.bind(categoriaController)
);

router.patch('/:id/restore', 
  authMiddleware,
  extractUserForAudit,
  validateObjectId('id'),
  categoriaController.restoreCategoria.bind(categoriaController)
);

router.patch('/:id/activate', 
  authMiddleware,
  extractUserForAudit,
  validateObjectId('id'),
  categoriaController.activateCategoria.bind(categoriaController)
);

router.patch('/:id/deactivate', 
  authMiddleware,
  extractUserForAudit,
  validateObjectId('id'),
  categoriaController.deactivateCategoria.bind(categoriaController)
);

// Configuración de rutas para documentación automática
const categoriaRouteConfigs = [
  routeConfig('GET', '/', 'categoriaQuerySchema', 'Listar categorías', {
    description: 'Obtiene una lista paginada de categorías con filtros opcionales',
    auth: true
  }),
  routeConfig('GET', '/activas', null, 'Listar categorías activas', {
    description: 'Obtiene todas las categorías activas',
    auth: true
  }),
  routeConfig('GET', '/nivel/:nivel', null, 'Categorías por nivel', {
    description: 'Obtiene categorías filtradas por nivel',
    auth: true
  }),
  routeConfig('GET', '/rango-edad', null, 'Categorías por rango de edad', {
    description: 'Obtiene categorías filtradas por rango de edad',
    auth: true
  }),
  routeConfig('GET', '/horario/:dia', null, 'Categorías por horario', {
    description: 'Obtiene categorías que tienen clases en un día específico',
    auth: true
  }),
  routeConfig('GET', '/search', null, 'Buscar categorías', {
    description: 'Busca categorías por nombre o descripción',
    auth: true
  }),
  routeConfig('GET', '/stats', null, 'Estadísticas de categorías', {
    description: 'Obtiene estadísticas generales de categorías',
    auth: true
  }),
  routeConfig('GET', '/deleted', null, 'Categorías eliminadas', {
    description: 'Obtiene categorías eliminadas (soft delete)',
    auth: true
  }),
  routeConfig('GET', '/all-including-deleted', null, 'Todas las categorías', {
    description: 'Obtiene todas las categorías incluyendo eliminadas',
    auth: true
  }),
  routeConfig('GET', '/:id', 'categoriaIdSchema', 'Obtener categoría por ID', {
    description: 'Obtiene una categoría específica por su ID',
    auth: true
  }),
  routeConfig('POST', '/', 'createCategoriaSchema', 'Crear categoría', {
    description: 'Crea una nueva categoría',
    auth: true
  }),
  routeConfig('PUT', '/:id', 'updateCategoriaSchema', 'Actualizar categoría', {
    description: 'Actualiza una categoría existente',
    auth: true
  }),
  routeConfig('DELETE', '/:id', 'categoriaIdSchema', 'Eliminar categoría', {
    description: 'Elimina una categoría (soft delete)',
    auth: true
  }),
  routeConfig('PATCH', '/:id/restore', 'categoriaIdSchema', 'Restaurar categoría', {
    description: 'Restaura una categoría eliminada',
    auth: true
  }),
  routeConfig('PATCH', '/:id/activate', 'categoriaIdSchema', 'Activar categoría', {
    description: 'Activa una categoría',
    auth: true
  }),
  routeConfig('PATCH', '/:id/deactivate', 'categoriaIdSchema', 'Desactivar categoría', {
    description: 'Desactiva una categoría',
    auth: true
  })
];

export const categoriaSwaggerDocs = autoMapValidators(categoriaValidators, categoriaRouteConfigs, '/api/categorias', 'Categorias');

export default router;
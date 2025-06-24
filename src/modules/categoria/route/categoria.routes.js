/**
 * Rutas para el módulo de categorías
 */

import { Router } from 'express';
import { categoriaController } from '../controller/categoria.fluent.controller.js';
import { validateRequest } from '../../../middleware/validation.middleware.js';
import { 
  createCategoriaSchema, 
  updateCategoriaSchema, 
  categoriaIdSchema,
  categoriaQuerySchema 
} from '../validator/categoria.validators.js';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import { auditMiddleware } from '../../../middleware/audit.middleware.js';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas públicas (solo lectura)
router.get('/', 
  validateRequest(categoriaQuerySchema, 'query'),
  categoriaController.getAllCategorias.bind(categoriaController)
);

router.get('/activas', 
  categoriaController.getCategoriasActivas.bind(categoriaController)
);

router.get('/search', 
  categoriaController.searchCategorias.bind(categoriaController)
);

router.get('/nivel/:nivel', 
  categoriaController.getCategoriasByNivel.bind(categoriaController)
);

router.get('/rango-edad', 
  categoriaController.getCategoriasByRangoEdad.bind(categoriaController)
);

router.get('/horario/:dia', 
  categoriaController.getCategoriasByHorario.bind(categoriaController)
);

router.get('/stats', 
  categoriaController.getCategoriaStats.bind(categoriaController)
);

router.get('/deleted', 
  categoriaController.getDeletedCategorias.bind(categoriaController)
);

router.get('/all-including-deleted', 
  categoriaController.getAllCategoriasIncludingDeleted.bind(categoriaController)
);

router.get('/:id', 
  validateRequest(categoriaIdSchema, 'params'),
  categoriaController.getCategoriaById.bind(categoriaController)
);

// Rutas de escritura (requieren auditoría)
router.post('/', 
  auditMiddleware,
  validateRequest(createCategoriaSchema, 'body'),
  categoriaController.createCategoria.bind(categoriaController)
);

router.put('/:id', 
  auditMiddleware,
  validateRequest(categoriaIdSchema, 'params'),
  validateRequest(updateCategoriaSchema, 'body'),
  categoriaController.updateCategoria.bind(categoriaController)
);

router.delete('/:id', 
  auditMiddleware,
  validateRequest(categoriaIdSchema, 'params'),
  categoriaController.deleteCategoria.bind(categoriaController)
);

router.patch('/:id/restore', 
  auditMiddleware,
  validateRequest(categoriaIdSchema, 'params'),
  categoriaController.restoreCategoria.bind(categoriaController)
);

router.patch('/:id/activate', 
  auditMiddleware,
  validateRequest(categoriaIdSchema, 'params'),
  categoriaController.activateCategoria.bind(categoriaController)
);

router.patch('/:id/deactivate', 
  auditMiddleware,
  validateRequest(categoriaIdSchema, 'params'),
  categoriaController.deactivateCategoria.bind(categoriaController)
);

export default router;
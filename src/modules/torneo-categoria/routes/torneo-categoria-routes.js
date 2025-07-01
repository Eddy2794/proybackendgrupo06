import { Router } from 'express';
import { torneoCategoriaController } from '../controller/torneo-categoria-controller.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { validateSchema, validateObjectId } from '../../../middlewares/validation.js';
import * as torneoValidators from '../validator/torneo-categoria-validator.js';
import { autoCrudDocumentation, autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';

const router = Router();

const applyValidation = (schemaName, location = 'body') => {
    const schema = torneoValidators[schemaName];
    return schema ? [validateSchema(schema, location)] : [];
};

// Rutas principales
router.post('/', authMiddleware, ...applyValidation('createTorneoCategoriaSchema'), torneoCategoriaController.createTorneoCategoria);
router.get('/', authMiddleware, ...applyValidation('torneoCategoriaQuerySchema', 'query'), torneoCategoriaController.getTorneosCategorias);
router.get('/:id', authMiddleware, validateObjectId('id'), torneoCategoriaController.getTorneoCategoriaById);
router.get('/torneo/:idTorneo', authMiddleware, validateObjectId('idTorneo'), ...applyValidation('torneoCategoriaQuerySchema', 'query'), torneoCategoriaController.getCategoriasByTorneo);
router.get('/categoria/:idCategoria', authMiddleware, validateObjectId('idCategoria'), ...applyValidation('torneoCategoriaQuerySchema', 'query'), torneoCategoriaController.getTorneosByCategoria);
router.get('/torneo/:idTorneo/categoria/:idCategoria', authMiddleware, validateObjectId('idTorneo'), validateObjectId('idCategoria'), torneoCategoriaController.getTorneoCategoriaByCombination);
router.put('/:id', authMiddleware, validateObjectId('id'), ...applyValidation('updateTorneoCategoriaSchema'), torneoCategoriaController.updateTorneoCategoria);
router.delete('/:id', authMiddleware, validateObjectId('id'), torneoCategoriaController.deleteTorneoCategoria);

const torneoCategoriaRouteConfigs = [
    routeConfig('POST', '/', 'createTorneoCategoriaSchema', 'Crear relación torneo-categoría', {
        description: 'Crea una nueva relación entre un torneo y una categoría',
        auth: true,
        tags: ['Torneos-Categorías']
    }),
    routeConfig('GET', '/', 'torneoCategoriaQuerySchema', 'Obtener todas las relaciones', {
        description: 'Obtiene una lista paginada de todas las relaciones torneo-categoría',
        auth: true,
        tags: ['Torneos-Categorías']
    }),
    routeConfig('GET', '/:id', 'torneoCategoriaQuerySchema', 'Obtener relación torneo-categoría por ID', {
        description: 'Obtiene una relación torneo-categoría específica por su ID',
        auth: true,
        tags: ['Torneos-Categorías']
    }),
    routeConfig('GET', '/torneo/:idTorneo', 'torneoCategoriaQuerySchema', 'Obtener categorías por torneo', {
        description: 'Obtiene todas las categorías asignadas a un torneo específico',
        auth: true,
        tags: ['Torneos-Categorías']
    }),
    routeConfig('GET', '/categoria/:idCategoria', 'torneoCategoriaQuerySchema', 'Obtener torneos por categoría', {
        description: 'Obtiene todos los torneos asignados a una categoría específica',
        auth: true,
        tags: ['Torneos-Categorías']
    }),
    routeConfig('GET', '/torneo/:idTorneo/categoria/:idCategoria', null, 'Obtener relación específica torneo-categoría', {
        description: 'Obtiene la relación específica entre un torneo y una categoría',
        auth: true,
        tags: ['Torneos-Categorías']
    }),
    routeConfig('PUT', '/:id', 'updateTorneoCategoriaSchema', 'Actualizar relación torneo-categoría', {
        description: 'Actualiza una relación torneo-categoría existente',
        auth: true,
        tags: ['Torneos-Categorías']
    }),
    routeConfig('DELETE', '/:id', null, 'Eliminar relación torneo-categoría', {
        description: 'Elimina una relación torneo-categoría (eliminación lógica)',
        auth: true,
        tags: ['Torneos-Categorías']
    }),
];

export const torneoCategoriaSwaggerDocs = autoMapValidators(torneoValidators, torneoCategoriaRouteConfigs, '/api/torneos-categorias', 'Torneos-Categorías');

export default router;
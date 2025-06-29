import { Router } from 'express';
import { profCategController } from '../controller/profesor-caetegoria-controller.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { validateSchema, validateObjectId } from '../../../middlewares/validation.js';
import * as profesorValidators from '../validator/profesor-categoria-validator.js';
import { autoCrudDocumentation, autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';

const router = Router();

const applyValidation = (schemaName, location = 'body') => {
    const schema = profesorValidators[schemaName];
    return schema ? [validateSchema(schema, location)] : [];
};

router.post('/', authMiddleware, ...applyValidation('createProfesorCategoriaSchema'), profCategController.createProfesorCategoria);
router.get('/', authMiddleware, ...applyValidation('profesorCategoriaQuerySchema', 'query'), profCategController.getProfesores);
router.get('/:id', authMiddleware, validateObjectId('id'), profCategController.getProfesorCategoriaById);
router.get('/categoria/:idCategoria', authMiddleware, validateObjectId('idCategoria'), ...applyValidation('profesorCategoriaQuerySchema', 'query'), profCategController.getProfesoresByCategoria);
router.get('/profesor/:idProfesor', authMiddleware, validateObjectId('idProfesor'), ...applyValidation('profesorCategoriaQuerySchema', 'query'), profCategController.getCategoriaByProfesor);
router.put('/:id',authMiddleware, validateObjectId('id'), ...applyValidation('updateProfesorCategoriaSchema'), profCategController.updateProfesorCategoria);
router.delete('/:id', authMiddleware, validateObjectId('id'), profCategController.deleteProfesorCategoria);

const profesorCategoriaRouteConfigs = [
    routeConfig('POST', '/', 'createProfesorCategoriaSchema', 'Crear relación profesor-categoría', {
        description: 'Crea una nueva relación entre un profesor y una categoría',
        auth: true,
        tags: ['Profesores-Categorías']
    }),
    routeConfig('GET', '/', 'profesorCategoriaQuerySchema', 'Obtener todas las relaciones', {
        description: 'Obtiene una lista paginada de todas las relaciones profesor-categoría',
        auth: true,
        tags: ['Profesores-Categorías']
    }),
    routeConfig('GET', '/:id', 'profesorCategoriaQuerySchema', 'Obtener relación profesor-categoría por ID', {
        description: 'Obtiene una relación profesor-categoría específica por su ID',
        auth: true,
        tags: ['Profesores-Categorías']
    }),
    routeConfig('GET', '/categoria/:idCategoria', 'profesorCategoriaQuerySchema', 'Obtener profesores por categoría', {
        description: 'Obtiene todos los profesores asignados a una categoría específica',
        auth: true,
        tags: ['Profesores-Categorías']
    }),
    routeConfig('GET', '/profesor/:idProfesor', 'profesorCategoriaQuerySchema', 'Obtener categorías por profesor', {
        description: 'Obtiene todas las categorías asignadas a un profesor específico',
        auth: true,
        tags: ['Profesores-Categorías']
    }),
    routeConfig('PUT', '/:id', 'updateProfesorCategoriaSchema', 'Actualizar relación profesor-categoría', {
        description: 'Actualiza una relación profesor-categoría existente',
        auth: true,
        tags: ['Profesores-Categorías']
    }),
    routeConfig('DELETE', '/:id', null, 'Eliminar relación profesor-categoría', {
        description: 'Elimina una relación profesor-categoría (eliminación lógica)',
        auth: true,
        tags: ['Profesores-Categorías']
    }),
];

export const profesorCategoriaSwaggerDocs = autoMapValidators(profesorValidators, profesorCategoriaRouteConfigs, '/api/profesores-categorias', 'Profesores-Categorías');

export default router;
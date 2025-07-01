import { Router } from 'express';
import { alumnoCategoriaController } from '../controller/alumno_categoria.controller.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { validateSchema, validateObjectId } from '../../../middlewares/validation.js';
import * as alumnoCategoriaValidators from '../validator/alumno_categoria.validation.js';
import { autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';


const router = Router();

//Helper para aplicar validaciones 
const applyValidation = (schemaName, location = 'body') => {
    const schema = alumnoCategoriaValidators[schemaName];
    return schema ? [validateSchema(schema, location)] : [];
};

//Rutas de CRUD
router.post('/', authMiddleware, ...applyValidation('createAlumnoCategoriaSchema'), alumnoCategoriaController.create);
router.get('/', authMiddleware, ...applyValidation('alumnoCategoriaQuerySchema', 'query'), alumnoCategoriaController.getAll);
router.get('/:id', authMiddleware, validateObjectId('id'), alumnoCategoriaController.getById);
router.put('/:id', authMiddleware, validateObjectId('id'), ...applyValidation('updateAlumnoCategoriaSchema'), alumnoCategoriaController.upate);
router.delete('/eliminar/:id', authMiddleware, validateObjectId('id'), alumnoCategoriaController.delete);
router.delete('/:id', authMiddleware, validateObjectId('id'), alumnoCategoriaController.softDelete);
router.patch('/restaurar/:id', authMiddleware, validateObjectId('id'), alumnoCategoriaController.restore);
router.get('/alumno/:alumnoId', authMiddleware, validateObjectId('alumnoId'), alumnoCategoriaController.getByAlumno);
router.get('/categoria/:categoriaId', authMiddleware, validateObjectId('categoriaId'), alumnoCategoriaController.getByCategoria);
router.get('/stats', authMiddleware, alumnoCategoriaController.getStats);


//Documentación para Swagger
const alumnoCategoriaRouteConfigs = [
    routeConfig('POST', '/', 'createAlumnoCategoriaSchema', 'Crear relación alumno-categoría', {
        description: 'Crea una nueva relación entre un alumno y una categoría',
        auth: true
    }),
    routeConfig('GET', '/', 'alumnoCategoriaQuerySchema', 'Listar relaciones alumno-categoría', {
        description: 'Obtiene todas las relaciones activas entre alumnos y categorías',
        auth: true
    }),
    routeConfig('GET', '/:id', null, 'Obtener relación por ID', {
        description: 'Obtiene una relación específica entre un alumno y una categoría',
        auth: true
    }),
    routeConfig('PUT', '/:id', 'updateAlumnoCategoriaSchema', 'Actualizar relación', {
        description: 'Actualiza los datos de una relación alumno-categoría existente',
        auth: true
    }),
    routeConfig('DELETE', '/:id', null, 'Eliminar relación (soft delete)', {
        description: 'Marca como eliminada una relación alumno-categoría',
        auth: true
    }),
    routeConfig('DELETE', '/eliminar/:id', null, 'Eliminar relación permanentemente', {
        description: 'Elimina definitivamente una relación entre un alumno y una categoría',
        auth: true
    }),
    routeConfig('PATCH', '/:id/restore', null, 'Restaurar relación eliminada', {
        description: 'Restaura una relación previamente eliminada',
        auth: true
    }),
    routeConfig('GET', '/alumno/:alumnoId', null, 'Relaciones por alumno', {
        description: 'Obtiene todas las relaciones de un alumno con categorías',
        auth: true
    }),
    routeConfig('GET', '/categoria/:categoriaId', null, 'Relaciones por categoría', {
        description: 'Obtiene todos los alumnos que pertenecen a una categoría específica',
        auth: true
    }),
    routeConfig('GET', '/stats', null, 'Estadísticas de inscripciones', {
        description: 'Obtiene estadísticas sobre las inscripciones de alumnos a categorías',
        auth: true
    })
];

export const alumnoCategoriaSwaggerDocs = autoMapValidators(
    alumnoCategoriaValidators,
    alumnoCategoriaRouteConfigs,
    '/api/alumno-categorias',
    'Alumno Categorías'
);

export default router;
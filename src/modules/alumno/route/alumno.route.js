import { Router } from 'express';
import { alumnoController } from '../controller/alumno.controller.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { validateSchema, validateObjectId } from '../../../middlewares/validation.js';
import * as alumnoValidators from '../validator/alumno.validation.js';
import { autoMapAllValidators, autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';


const router = Router();

//Helper para aplicar validaciones
const applyValidation = (schemaName, location = 'body') => {
    const schema = alumnoValidators[schemaName];
    return schema ? [validateSchema(schema, location)] : [];
};

//Rutas de CRUD
router.post('/', authMiddleware, ...applyValidation('createAlumnoSchema'), alumnoController.createAlumno);
router.get('/', authMiddleware, ...applyValidation('alumnoQuerySchema', 'query'), alumnoController.getAllAlumnos);
router.get('/:id', authMiddleware, validateObjectId('id'), alumnoController.getAlumnoById);
router.get('/numero-socio/:numeroSocio', authMiddleware, alumnoController.getAlumnoByNumeroSocio);
router.put('/:id', authMiddleware, validateObjectId('id'), ...applyValidation('updateAlumnoSchema'), alumnoController.updateAlumno);
router.delete('/eliminar/:id', authMiddleware, validateObjectId('id'), alumnoController.deleteAlumnoFisico);
router.delete('/:id', authMiddleware, validateObjectId('id'), alumnoController.deleteAlumno);
router.patch('/restaurar/:id', authMiddleware, validateObjectId('id'), alumnoController.restoreAlumno);
router.get('/tutor/:tutorId', authMiddleware, validateObjectId('tutorId'), alumnoController.getAlumnosByTutorId);

//Documentación para Swagger

const alumnoRouteConfigs = [
    routeConfig('POST', '/', 'createAlumnoSchema', 'Crear alumno', {
        description: 'Crea un nuevo alumno en el sistema',
        auth: true
    }),
    routeConfig('GET', '/', 'alumnoQuerySchema', 'Obtener todos los alumnos', {
        description: 'Obtiene una lista paginada de alumnos',
        auth: true
    }),
    routeConfig('GET', '/:id', null, 'Obtener alumno por ID', {
        description: 'Obtiene los datos de un alumno específico',
        auth: true
    }),
    routeConfig('GET', '/numero-socio/:numeroSocio', null, 'Buscar por número de socio', {
        description: 'Obtiene un alumno por su número de socio',
        auth: true
    }),
    routeConfig('PUT', '/:id', 'updateAlumnoSchema', 'Actualizar alumno', {
        description: 'Actualiza los datos de un alumno existente',
        auth: true
    }),
    routeConfig('DELETE', '/eliminar/:id', null, 'Eliminar alumno permanentemente', {
        description: 'Elimina fisicamente un alumno',
        auth: true
    }),
    routeConfig('DELETE', '/:id', null, 'Eliminar alumno', {
        description: 'Marca como inactivo un alumno',
        auth: true
    }),
    routeConfig('PATCH', '/restaurar/:id', null, 'Restaurar alumno', {
        description: 'Restaura un alumno previamente eliminado',
        auth: true
    }),
    routeConfig('GET', '/tutor/:tutorId', null, 'Alumnos por tutor', {
        description: 'Obtiene todos los alumnos asociados a un tutor específico',
        auth: true
    })
];

export const alumnoSwaggerDocs = autoMapValidators(
    alumnoValidators,
    alumnoRouteConfigs,
    '/api/alumnos',
    'Alumnos'
);

export default router;
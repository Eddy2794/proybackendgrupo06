import { Router } from 'express';
import { profesorController } from '../controller/profesor-controller.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { validateSchema, validateObjectId } from '../../../middlewares/validation.js';
import * as profesorValidators from '../validator/profesor-validator.js';
import { autoCrudDocumentation, autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';


const router = Router();

const applyValidation = (schemaName, location = 'body') => {
    const schema = profesorValidators[schemaName];
    return schema ? [validateSchema(schema, location)] : [];
  };

  router.post('/',authMiddleware, ...applyValidation('createProfesorSchema'),profesorController.createProfesor);                 
  router.get('/', authMiddleware, ...applyValidation('profesorQuerySchema'), profesorController.getProfesores); //paginacion
  router.get('/:id', authMiddleware, validateObjectId('id'), profesorController.getProfesorById);
  router.put('/:id', authMiddleware, validateObjectId('id'), ...applyValidation('updateProfesorSchema'), profesorController.updateProfesor);                 
  router.delete('/:id', authMiddleware, validateObjectId('id'), profesorController.deleteProfesor);                


const profesorRouteConfigs = [
    routeConfig('POST', '/', 'createProfesorSchema', 'Crear profesor', {
        description: 'Crea un nuevo profesor en el sistema',
        auth: true
    }),
    routeConfig('GET', '/', 'profesorQuerySchema', 'Obtener profesores', {
        description: 'Obtiene una lista de profesores paginados',
        auth: true
    }),
    routeConfig('GET', '/:id', null, 'Obtener profesor por ID', {
        description: 'Obtiene un profesor por su ID',
        auth: true
    }),
    routeConfig('PUT', '/:id', 'updateProfesorSchema', 'Actualizar profesor', {
        description: 'Actualiza un profesor por su ID',
        auth: true
    }),
    routeConfig('DELETE', '/:id', null, 'Eliminar profesor', {
        description: 'Elimina un profesor por su ID',
        auth: true
    }),
];

export const profesorSwaggerDocs = autoMapValidators(profesorValidators, profesorRouteConfigs, '/api/profesores', 'Profesores');

export default router;
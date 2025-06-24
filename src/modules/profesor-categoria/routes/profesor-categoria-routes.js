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

router.post('/',authMiddleware, ...applyValidation('createProfesorCategoriaSchema'),profCategController.createProfesorCategoria);                 
router.get('/', authMiddleware, ...applyValidation('profesorCategoriaQuerySchema'), profCategController.getProfesores); //paginacion
router.get('/:idCategoria', authMiddleware, validateObjectId('id'), profCategController.getProfesoresByCategoria);
router.get('/:idProfesor', authMiddleware, validateObjectId('id'), profCategController.getCategoriaByProfesor);
router.put('/:id', authMiddleware, validateObjectId('id'), ...applyValidation('updateProfesorSchema'), profCategController.updateProfesorCategoria);                 
router.delete('/:id', authMiddleware, validateObjectId('id'), profCategController.deleteProfesorCategoria);         


const profesorCategoriaRouteConfigs = [
    routeConfig('POST', '/', 'createProfesorCategoriaSchema', 'Crear profesor categoria', {
        description: 'Crea un nuevo profesor categoria en el sistema',
        auth: true
    }),
    routeConfig('GET', '/', 'profesorCategoriaQuerySchema', 'Obtener profesores', {
        description: 'Obtiene una lista de profesores paginados',
        auth: true
    }),
    routeConfig('GET', '/:idCategoria', null, 'Obtener profesores por ID de categoria', {
        description: 'Obtiene un profesor por su ID de categoria',
        auth: true
    }),
    routeConfig('GET', '/:idProfesor', null, 'Obtener categorias por ID de profesor', {
        description: 'Obtiene una categoria por su ID de profesor',
        auth: true
    }),
    routeConfig('PUT', '/:id', 'updateProfesorCategoriaSchema', 'Actualizar la relacion profesor categoria', {
        description: 'Actualiza la relacion profesor categoria por su ID',
        auth: true
    }),
    routeConfig('DELETE', '/:id', null, 'Eliminar la relacion profesor categoria', {
        description: 'Elimina un profesor categoria por su ID',
        auth: true
    }),
];

export const profesorCategoriaSwaggerDocs = autoMapValidators(profesorValidators, profesorCategoriaRouteConfigs, '/api/profesores-categorias', 'Profesores Categorias');

export default router;
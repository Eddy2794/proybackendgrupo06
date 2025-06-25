import { Router } from "express";
import { torneoController } from '../controller/torneo.controller.js';
import * as torneoValidators from '../validator/torneo.validator.js';
import { validateSchema, validateObjectId } from '../../../middlewares/validation.js';
import { autoCrudDocumentation, autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';

const router = Router();
const applyValidation = (schemaName, location = 'body') => {
    const schema = torneoValidators[schemaName];
    return schema ? [validateSchema(schema, location)] : [];
};

router.get('/',authMiddleware, ...applyValidation('torneoQuerySchema'), torneoController.getTorneos);
router.post('/',authMiddleware, ...applyValidation('createTorneoSchema'), torneoController.createTorneo);
router.put('/:id',authMiddleware, validateObjectId('id'), ...applyValidation('updateTorneoSchema'), torneoController.updateTorneo);
router.delete('/:id',authMiddleware, validateObjectId('id'), torneoController.deleteTorneo);
router.get('/:id',authMiddleware, validateObjectId('id'), torneoController.getTorneoById);

const torneoRouteConfigs = [
    routeConfig('POST', '/', 'createTorneoSchema', 'Crear torneo', {
        description: 'Crea un nuevo torneo en el sistema',
        auth: true
    }),
    routeConfig('GET', '/', 'torneoQuerySchema', 'Obtener torneos', {
        description: 'Obtiene una lista de torneos paginados',
        auth: true
    }),
    routeConfig('GET', '/:id', null, 'Obtener torneo por ID', {
        description: 'Obtiene un torneo por su ID',
        auth: true
    }),
    routeConfig('PUT', '/:id', 'updateTorneoSchema', 'Actualizar torneo', {
        description: 'Actualiza un torneo por su ID',
        auth: true
    }),
    routeConfig('DELETE', '/:id', null, 'Eliminar torneo', {
        description: 'Elimina un torneo por su ID',
        auth: true
    }),
];

export const torneoSwaggerDocs = autoMapValidators(torneoValidators, torneoRouteConfigs, '/api/torneos', 'Torneos');
export default router;
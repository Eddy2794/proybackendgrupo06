import Joi from 'joi';

export const ALUMNO_ESTADOS = ['ACTIVO', 'INACTIVO'];


//Validación para creación de alumno
export const createAlumnoSchema = Joi.object({
    persona: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),

    tutor: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),

    numero_socio: Joi.string()
    .min(3)
    .max(20)
    .required(),

    observaciones_medicas: Joi.string()
    .max(300)
    .allow('', null),

    contacto_emergencia: Joi.string()
    .min(5)
    .max(100)
    .required(),

    telefono_emergencia: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .required(),

    autoriza_fotos: Joi.boolean()
    .required(),

    fecha_inscripcion: Joi.date()
    .iso()
    .required(),

    estado: Joi.string()
    .valid(...ALUMNO_ESTADOS)
    .required(),
});

//Actualizar Alumno
export const updateAlumnoSchema = Joi.object({

    persona: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/),

    tutor: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/),

    numero_socio: Joi.string()
    .min(3)
    .max(20),

    observaciones_medicas: Joi.string()
    .max(300)
    .allow('', null),

    contacto_emergencia: Joi.string()
    .min(5)
    .max(100),

    telefono_emergencia: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/),

    autoriza_fotos: Joi.boolean(),

    fecha_inscripcion: Joi.date()
    .iso(),

    estado: Joi.string()
    .valid(...ALUMNO_ESTADOS)
}).min(1);


//Validación de ID por parámetro
export const alumnoIdSchema = Joi.object({
    id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
});


//Query parameters para filtros
export const alumnoQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(50).trim().allow(''),
    estado: Joi.string().valid(...ALUMNO_ESTADOS),
    sort: Joi.string().valid('createdAt', '-createdAt', 'numero_socio', '-numero_socio').default('-createdAt')
});
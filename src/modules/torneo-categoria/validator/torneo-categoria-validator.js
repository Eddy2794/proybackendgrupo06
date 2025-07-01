import Joi from 'joi';

// Validaciones para TorneoCategoria
export const createTorneoCategoriaSchema = Joi.object({
    torneo: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'El ID del torneo debe ser un ObjectId válido',
            'any.required': 'El ID del torneo es requerido'
        }),
    categoria: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'El ID de la categoría debe ser un ObjectId válido',
            'any.required': 'El ID de la categoría es requerido'
        }),
    fecha_asignacion: Joi.date()
        .max('now')
        .messages({
            'date.max': 'La fecha de asignación no puede ser futura'
        }),
    observaciones: Joi.string()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Las observaciones no pueden exceder 500 caracteres'
        }),
    activa: Joi.boolean().default(true),
});

export const updateTorneoCategoriaSchema = Joi.object({
    torneo: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'El ID del torneo debe ser un ObjectId válido'
        }),
    categoria: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'El ID de la categoría debe ser un ObjectId válido'
        }),
    fecha_asignacion: Joi.date()
        .max('now')
        .messages({
            'date.max': 'La fecha de asignación no puede ser futura'
        }),
    observaciones: Joi.string()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Las observaciones no pueden exceder 500 caracteres'
        }),
    activa: Joi.boolean(),
});

// Validación única para todas las queries con paginación
export const torneoCategoriaQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'La página debe ser un número',
            'number.integer': 'La página debe ser un número entero',
            'number.min': 'La página debe ser mayor a 0'
        }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.base': 'El límite debe ser un número',
            'number.integer': 'El límite debe ser un número entero',
            'number.min': 'El límite debe ser mayor a 0',
            'number.max': 'El límite no puede exceder 100'
        }),
    sort: Joi.string()
        .valid('createdAt', '-createdAt', 'torneo', '-torneo', 'categoria', '-categoria',
            'fecha_inicio_inscripciones', '-fecha_inicio_inscripciones',
            'fecha_fin_inscripciones', '-fecha_fin_inscripciones')
        .default('-createdAt')
        .messages({
            'any.only': 'El campo de ordenamiento no es válido'
        }),
    search: Joi.string()
        .max(50)
        .trim()
        .messages({
            'string.max': 'El término de búsqueda no puede exceder 50 caracteres'
        }),
    activa: Joi.boolean()
        .default(true)
        .messages({
            'boolean.base': 'El filtro activa debe ser true o false'
        })
});
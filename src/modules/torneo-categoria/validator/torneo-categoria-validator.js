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
    max_participantes_categoria: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            'number.base': 'El máximo de participantes debe ser un número',
            'number.integer': 'El máximo de participantes debe ser un número entero',
            'number.min': 'El máximo de participantes debe ser mayor a 0',
            'any.required': 'El máximo de participantes por categoría es requerido'
        }),
    costo_inscripcion_categoria: Joi.number()
        .min(0)
        .required()
        .messages({
            'number.base': 'El costo de inscripción debe ser un número',
            'number.min': 'El costo de inscripción no puede ser negativo',
            'any.required': 'El costo de inscripción por categoría es requerido'
        }),
    observaciones: Joi.string()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Las observaciones no pueden exceder 500 caracteres'
        }),
    activa: Joi.boolean().default(true),
    fecha_inicio_inscripciones: Joi.date()
        .required()
        .messages({
            'date.base': 'La fecha de inicio de inscripciones debe ser una fecha válida',
            'any.required': 'La fecha de inicio de inscripciones es requerida'
        }),
    fecha_fin_inscripciones: Joi.date()
        .greater(Joi.ref('fecha_inicio_inscripciones'))
        .required()
        .messages({
            'date.base': 'La fecha de fin de inscripciones debe ser una fecha válida',
            'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
            'any.required': 'La fecha de fin de inscripciones es requerida'
        })
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
    max_participantes_categoria: Joi.number()
        .integer()
        .min(1)
        .messages({
            'number.base': 'El máximo de participantes debe ser un número',
            'number.integer': 'El máximo de participantes debe ser un número entero',
            'number.min': 'El máximo de participantes debe ser mayor a 0'
        }),
    costo_inscripcion_categoria: Joi.number()
        .min(0)
        .messages({
            'number.base': 'El costo de inscripción debe ser un número',
            'number.min': 'El costo de inscripción no puede ser negativo'
        }),
    observaciones: Joi.string()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Las observaciones no pueden exceder 500 caracteres'
        }),
    activa: Joi.boolean(),
    fecha_inicio_inscripciones: Joi.date()
        .messages({
            'date.base': 'La fecha de inicio de inscripciones debe ser una fecha válida'
        }),
    fecha_fin_inscripciones: Joi.date()
        .when('fecha_inicio_inscripciones', {
            is: Joi.exist(),
            then: Joi.date().greater(Joi.ref('fecha_inicio_inscripciones')),
            otherwise: Joi.date()
        })
        .messages({
            'date.base': 'La fecha de fin de inscripciones debe ser una fecha válida',
            'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio'
        })
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
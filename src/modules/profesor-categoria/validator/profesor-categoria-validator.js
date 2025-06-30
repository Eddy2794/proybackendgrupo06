import Joi from 'joi';

// Validaciones para ProfesorCategoria
export const createProfesorCategoriaSchema = Joi.object({
    profesor: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'El ID del profesor debe ser un ObjectId válido',
            'any.required': 'El ID del profesor es requerido'
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
        .min(2)
        .max(255)
        .required()
        .messages({
            'string.min': 'Las observaciones deben tener al menos 2 caracteres',
            'string.max': 'Las observaciones no pueden exceder 255 caracteres',
            'any.required': 'Las observaciones son requeridas'
        }),
    activo: Joi.boolean().default(true)
});

export const updateProfesorCategoriaSchema = Joi.object({
    profesor: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'El ID del profesor debe ser un ObjectId válido'
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
        .min(2)
        .max(255)
        .messages({
            'string.min': 'Las observaciones deben tener al menos 2 caracteres',
            'string.max': 'Las observaciones no pueden exceder 255 caracteres'
        }),
    activo: Joi.boolean()
});

// Validación única para todas las queries con paginación
export const profesorCategoriaQuerySchema = Joi.object({
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
        .valid('createdAt', '-createdAt', 'profesor', '-profesor', 'categoria', '-categoria', 'fecha_asignacion', '-fecha_asignacion')
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
    activo: Joi.boolean()
        .default(true)
        .messages({
            'boolean.base': 'El filtro activo debe ser true o false'
        })
});

// Validación para ObjectId en parámetros de ruta
export const objectIdParamSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'El ID debe ser un ObjectId válido',
            'any.required': 'El ID es requerido'
        })
});
  
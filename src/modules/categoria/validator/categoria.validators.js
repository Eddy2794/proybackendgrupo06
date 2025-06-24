import Joi from 'joi';

// Constantes para validaciones
export const NIVELES = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'COMPETITIVO'];
export const ESTADOS_CATEGORIA = ['ACTIVA', 'INACTIVA'];
export const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

// Esquema para validar horarios
const horarioSchema = Joi.object({
  dia: Joi.string()
    .valid(...DIAS_SEMANA)
    .required()
    .messages({
      'any.only': 'El día debe ser uno de: {#valids}',
      'any.required': 'El día es requerido'
    }),
  hora_inicio: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'La hora de inicio debe tener formato HH:MM',
      'any.required': 'La hora de inicio es requerida'
    }),
  hora_fin: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'La hora de fin debe tener formato HH:MM',
      'any.required': 'La hora de fin es requerida'
    })
});

// Esquema simplificado para crear categoría
export const createCategoriaSchema = Joi.object({
  nombre: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es requerido'
    }),

  edad_min: Joi.number()
    .integer()
    .min(3)
    .max(100)
    .required()
    .messages({
      'number.min': 'La edad mínima debe ser al menos 3 años',
      'number.max': 'La edad mínima no puede ser mayor a 100 años',
      'any.required': 'La edad mínima es requerida'
    }),

  edad_max: Joi.number()
    .integer()
    .min(3)
    .max(100)
    .greater(Joi.ref('edad_min'))
    .required()
    .messages({
      'number.min': 'La edad máxima debe ser al menos 3 años',
      'number.max': 'La edad máxima no puede ser mayor a 100 años',
      'number.greater': 'La edad máxima debe ser mayor que la edad mínima',
      'any.required': 'La edad máxima es requerida'
    }),

  descripcion: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    }),

  activa: Joi.boolean()
    .default(true)
    .optional(),

  cuota_mensual: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'La cuota mensual no puede ser negativa',
      'any.required': 'La cuota mensual es requerida'
    }),

  horarios: Joi.array()
    .items(horarioSchema)
    .min(1)
    .optional()
    .messages({
      'array.min': 'Debe especificar al menos un horario'
    }),

  max_alumnos: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required()
    .messages({
      'number.min': 'Debe permitir al menos 1 alumno',
      'number.max': 'No puede exceder 100 alumnos',
      'any.required': 'El máximo de alumnos es requerido'
    }),

  nivel: Joi.string()
    .valid(...NIVELES)
    .default('PRINCIPIANTE')
    .optional()
    .messages({
      'any.only': 'El nivel debe ser uno de: {#valids}'
    })
});

// Esquema simplificado para actualizar categoría
export const updateCategoriaSchema = Joi.object({
  nombre: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres'
    }),

  edad_min: Joi.number()
    .integer()
    .min(3)
    .max(100)
    .messages({
      'number.min': 'La edad mínima debe ser al menos 3 años',
      'number.max': 'La edad mínima no puede ser mayor a 100 años'
    }),

  edad_max: Joi.number()
    .integer()
    .min(3)
    .max(100)
    .when('edad_min', {
      is: Joi.exist(),
      then: Joi.number().greater(Joi.ref('edad_min')),
      otherwise: Joi.number()
    })
    .messages({
      'number.min': 'La edad máxima debe ser al menos 3 años',
      'number.max': 'La edad máxima no puede ser mayor a 100 años',
      'number.greater': 'La edad máxima debe ser mayor que la edad mínima'
    }),

  descripcion: Joi.string()
    .trim()
    .max(500)
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    }),

  activa: Joi.boolean(),

  cuota_mensual: Joi.number()
    .min(0)
    .messages({
      'number.min': 'La cuota mensual no puede ser negativa'
    }),

  horarios: Joi.array()
    .items(horarioSchema)
    .min(1)
    .messages({
      'array.min': 'Debe especificar al menos un horario'
    }),

  max_alumnos: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .messages({
      'number.min': 'Debe permitir al menos 1 alumno',
      'number.max': 'No puede exceder 100 alumnos'
    }),

  nivel: Joi.string()
    .valid(...NIVELES)
    .messages({
      'any.only': 'El nivel debe ser uno de: {#valids}'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

// Validación para parámetros de ID
export const categoriaIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'ID de categoría inválido',
      'any.required': 'El ID de categoría es requerido'
    })
});

// Validación para query parameters de búsqueda
export const categoriaQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', '-createdAt', 'nombre', '-nombre', 'cuota_mensual', '-cuota_mensual').default('-createdAt'),
  activa: Joi.boolean(),
  nivel: Joi.string().valid(...NIVELES),
  edad_min: Joi.number().integer().min(3).max(100),
  edad_max: Joi.number().integer().min(3).max(100),
  search: Joi.string().max(50).trim()
});
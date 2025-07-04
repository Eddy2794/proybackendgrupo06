import Joi from 'joi';

// Constantes para validaciones
export const NIVELES = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'COMPETITIVO'];
export const TIPOS_CATEGORIA = ['INFANTIL', 'JUVENIL', 'COMPETITIVO', 'RECREATIVO', 'ENTRENAMIENTO'];
export const ESTADOS_CATEGORIA = ['ACTIVA', 'INACTIVA', 'SUSPENDIDA'];
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

  edadMinima: Joi.number()
    .integer()
    .min(3)
    .max(100)
    .required()
    .messages({
      'number.min': 'La edad mínima debe ser al menos 3 años',
      'number.max': 'La edad mínima no puede ser mayor a 100 años',
      'any.required': 'La edad mínima es requerida'
    }),

  edadMaxima: Joi.number()
    .integer()
    .min(3)
    .max(100)
    .greater(Joi.ref('edadMinima'))
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

  estado: Joi.string()
    .valid('ACTIVA', 'INACTIVA', 'SUSPENDIDA')
    .default('ACTIVA')
    .optional(),

  precio: Joi.object({
    cuotaMensual: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.min': 'La cuota mensual no puede ser negativa',
        'any.required': 'La cuota mensual es requerida'
      }),
    descuentos: Joi.object({
      hermanos: Joi.number().min(0).max(100).default(0),
      pagoAnual: Joi.number().min(0).max(100).default(0),
      primeraVez: Joi.number().min(0).max(100).default(0)
    }).optional()
  }).required(),

  horarios: Joi.array()
    .items(horarioSchema)
    .optional()
    .messages({
      'array.min': 'Debe especificar al menos un horario'
    }),

  cupoMaximo: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required()
    .messages({
      'number.min': 'Debe permitir al menos 1 alumno',
      'number.max': 'No puede exceder 100 alumnos',
      'any.required': 'El máximo de alumnos es requerido'
    }),

  configuracionPago: Joi.object({
    permitePagoMensual: Joi.boolean().default(true),
    permitePagoAnual: Joi.boolean().default(true),
    requiereInscripcion: Joi.boolean().default(true)
  }).optional(),

  nivel: Joi.string()
    .valid(...NIVELES)
    .default('PRINCIPIANTE')
    .optional()
    .messages({
      'any.only': 'El nivel debe ser uno de: {#valids}'
    }),

  tipo: Joi.string()
    .valid(...TIPOS_CATEGORIA)
    .required()
    .messages({
      'any.only': 'El tipo debe ser uno de: {#valids}',
      'any.required': 'El tipo de categoría es requerido'
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

  edadMinima: Joi.number()
    .integer()
    .min(3)
    .max(100)
    .messages({
      'number.min': 'La edad mínima debe ser al menos 3 años',
      'number.max': 'La edad mínima no puede ser mayor a 100 años'
    }),

  edadMaxima: Joi.number()
    .integer()
    .min(3)
    .max(100)
    .when('edadMinima', {
      is: Joi.exist(),
      then: Joi.number().greater(Joi.ref('edadMinima')),
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

  estado: Joi.string()
    .valid('ACTIVA', 'INACTIVA', 'SUSPENDIDA'),

  precio: Joi.object({
    cuotaMensual: Joi.number()
      .min(0)
      .messages({
        'number.min': 'La cuota mensual no puede ser negativa'
      }),
    descuentos: Joi.object({
      hermanos: Joi.number().min(0).max(100),
      pagoAnual: Joi.number().min(0).max(100),
      primeraVez: Joi.number().min(0).max(100)
    }).optional()
  }),

  horarios: Joi.array()
    .items(horarioSchema)
    .messages({
      'array.min': 'Debe especificar al menos un horario'
    }),

  cupoMaximo: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .messages({
      'number.min': 'Debe permitir al menos 1 alumno',
      'number.max': 'No puede exceder 100 alumnos'
    }),

  configuracionPago: Joi.object({
    permitePagoMensual: Joi.boolean(),
    permitePagoAnual: Joi.boolean(),
    requiereInscripcion: Joi.boolean()
  }),

  nivel: Joi.string()
    .valid(...NIVELES)
    .messages({
      'any.only': 'El nivel debe ser uno de: {#valids}'
    }),

  tipo: Joi.string()
    .valid(...TIPOS_CATEGORIA)
    .messages({
      'any.only': 'El tipo debe ser uno de: {#valids}'
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
  sort: Joi.string().valid('createdAt', '-createdAt', 'nombre', '-nombre', 'precio.cuotaMensual', '-precio.cuotaMensual').default('-createdAt'),
  estado: Joi.string().valid('ACTIVA', 'INACTIVA', 'SUSPENDIDA'),
  nivel: Joi.string().valid(...NIVELES),
  edadMinima: Joi.number().integer().min(3).max(100),
  edadMaxima: Joi.number().integer().min(3).max(100),
  search: Joi.string().max(50).trim()
});
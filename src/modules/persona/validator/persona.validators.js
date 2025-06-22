import Joi from 'joi';

// Constantes para validaciones
export const TIPOS_DOCUMENTO = ['DNI', 'PASAPORTE', 'CEDULA'];
export const GENEROS = ['MASCULINO', 'FEMENINO', 'OTRO'];
export const ESTADOS_PERSONA = ['ACTIVO', 'INACTIVO'];

// Esquema simplificado para crear persona
export const createPersonaSchema = Joi.object({
  nombres: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  apellidos: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  tipoDocumento: Joi.string()
    .valid(...TIPOS_DOCUMENTO)
    .default('DNI'),

  numeroDocumento: Joi.string()
    .trim()
    .min(6)
    .max(20)
    .required(),

  fechaNacimiento: Joi.date()
    .max('now')
    .required(),

  genero: Joi.string()
    .valid(...GENEROS)
    .required(),

  telefono: Joi.string()
    .trim()
    .min(7)
    .max(15)
    .optional(),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .max(100)
    .required(),

  direccion: Joi.object({
    calle: Joi.string().trim().max(100).optional(),
    ciudad: Joi.string().trim().max(50).optional(),
    departamento: Joi.string().trim().max(50).optional(),
    codigoPostal: Joi.string().trim().max(10).optional(),
    pais: Joi.string().trim().max(50).default('Perú').optional()
  }).optional(),

  estado: Joi.string()
    .valid(...ESTADOS_PERSONA)
    .default('ACTIVO')
});

// Esquema simplificado para actualizar persona
export const updatePersonaSchema = Joi.object({
  nombres: Joi.string()
    .trim()
    .min(2)
    .max(50),

  apellidos: Joi.string()
    .trim()
    .min(2)
    .max(50),

  telefono: Joi.string()
    .trim()
    .min(7)
    .max(15),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .max(100),

  direccion: Joi.object({
    calle: Joi.string().trim().max(100).optional(),
    ciudad: Joi.string().trim().max(50).optional(),
    departamento: Joi.string().trim().max(50).optional(),
    codigoPostal: Joi.string().trim().max(10).optional(),
    pais: Joi.string().trim().max(50).optional()
  }).optional(),

  estado: Joi.string()
    .valid(...ESTADOS_PERSONA)
}).min(1);

// Validación para parámetros de ID
export const personaIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
});

// Validación para query parameters de búsqueda
export const personaQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', '-createdAt', 'nombres', '-nombres', 'apellidos', '-apellidos').default('-createdAt'),
  estado: Joi.string().valid(...ESTADOS_PERSONA),
  tipoDocumento: Joi.string().valid(...TIPOS_DOCUMENTO),
  search: Joi.string().max(50).trim()
});

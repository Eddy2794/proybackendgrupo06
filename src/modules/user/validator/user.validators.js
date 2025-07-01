import Joi from 'joi';

// Constantes para validaciones
export const USER_ROLES = ['USER', 'ADMIN', 'SUPER_ADMIN', 'TUTOR', 'MODERATOR'];
export const USER_STATES = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'PENDIENTE_VERIFICACION'];

// Esquemas de validación simplificados

// Validación para registro de usuario
export const createUserSchema = Joi.object({
  persona: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
    
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .lowercase()
    .required(),
    
  password: Joi.string()
    .min(6)
    .required(),
    
  rol: Joi.string()
    .valid(...USER_ROLES)
    .default('USER'),
    
  estado: Joi.string()
    .valid(...USER_STATES)
    .default('ACTIVO'),
    
  emailVerificado: Joi.boolean()
    .default(false)
});

// Validación para actualización de usuario
export const updateUserSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .lowercase(),
    
  password: Joi.string()
    .min(6),
    
  rol: Joi.string()
    .valid(...USER_ROLES),
    
  estado: Joi.string()
    .valid(...USER_STATES),
    
  emailVerificado: Joi.boolean()
}).min(1);

// Validación para parámetros de ID
export const userIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
});

// Validación para query parameters de búsqueda
export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', '-createdAt', 'username', '-username').default('-createdAt'),
  estado: Joi.string().valid(...USER_STATES),
  rol: Joi.string().valid(...USER_ROLES),
  search: Joi.string().max(50).trim()
});

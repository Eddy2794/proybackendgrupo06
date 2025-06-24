import Joi from 'joi';

/**
 * Validadores simplificados para entorno de desarrollo
 * Solo requieren username y password en texto plano
 */

export const registerDevSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
    .messages({
      'string.alphanum': 'El username solo puede contener caracteres alfanuméricos',
      'string.min': 'El username debe tener al menos 3 caracteres',
      'string.max': 'El username no puede tener más de 30 caracteres',
      'any.required': 'El username es obligatorio'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'La password debe tener al menos 6 caracteres',
      'any.required': 'La password es obligatoria'
    }),
  // Campos opcionales para completar el perfil
  nombres: Joi.string().min(2).max(50).optional(),
  apellidos: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().max(100).optional(),
  tipoDocumento: Joi.string().optional(),
  numeroDocumento: Joi.string().min(6).max(20).optional(),
  fechaNacimiento: Joi.date().max('now').optional(),
  genero: Joi.string().optional(),
  telefono: Joi.string().min(7).max(15).optional(),
  direccion: Joi.object({
    calle: Joi.string().max(100).optional(),
    ciudad: Joi.string().max(50).optional(),
    departamento: Joi.string().max(50).optional(),
    codigoPostal: Joi.string().max(10).optional(),
    pais: Joi.string().max(50).optional()
  }).optional()
});

export const loginDevSchema = Joi.object({
  username: Joi.string().required()
    .messages({
      'any.required': 'El username es obligatorio'
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'La password es obligatoria'
    })
});

export const changePasswordDevSchema = Joi.object({
  currentPassword: Joi.string().required()
    .messages({
      'any.required': 'La contraseña actual es obligatoria'
    }),
  newPassword: Joi.string().min(6).required()
    .messages({
      'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
      'any.required': 'La nueva contraseña es obligatoria'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({
      'any.only': 'La confirmación de contraseña debe coincidir con la nueva contraseña',
      'any.required': 'La confirmación de contraseña es obligatoria'
    })
});

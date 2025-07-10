import Joi from 'joi';

export const registerSchema = Joi.object({
  nombres: Joi.string().min(2).max(50).required(),
  apellidos: Joi.string().min(2).max(50).required(),
  tipoDocumento: Joi.string().required(),
  numeroDocumento: Joi.string().min(6).max(20).required(),
  fechaNacimiento: Joi.date().max('now').required(),
  genero: Joi.string().required(),
  telefono: Joi.string().min(7).max(15).optional(),
  email: Joi.string().email().max(100).required(),
  direccion: Joi.object({
    calle: Joi.string().max(100).optional(),
    ciudad: Joi.string().max(50).optional(),
    departamento: Joi.string().max(50).optional(),
    codigoPostal: Joi.string().max(10).optional(),
    pais: Joi.string().max(50).optional()
  }).optional(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  passwordHash: Joi.string().length(64).hex().required(),
  salt: Joi.string().length(32).hex().required(),
  encryptedPassword: Joi.string().required(),
  clientToken: Joi.string().optional(),
  timestamp: Joi.number().optional()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).optional()
    .messages({
      'string.min': 'La nueva contraseña debe tener al menos 6 caracteres'
    })
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Debe proporcionar un email válido',
      'any.required': 'El email es requerido'
    })
});

export const resetPasswordWithTokenSchema = Joi.object({
  email: Joi.string().email().required(),
  resetCode: Joi.string().length(6).required()
    .messages({
      'string.length': 'El código debe tener exactamente 6 dígitos',
      'any.required': 'El código de verificación es requerido'
    }),
  newPassword: Joi.string().min(6).required()
    .messages({
      'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
      'any.required': 'La nueva contraseña es requerida'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'any.required': 'Debe confirmar la nueva contraseña'
    })
});

export const resetPasswordSimpleSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Debe proporcionar un email válido',
      'any.required': 'El email es requerido'
    }),
  newPassword: Joi.string().min(6).required()
    .messages({
      'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
      'any.required': 'La nueva contraseña es requerida'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'any.required': 'Debe confirmar la nueva contraseña'
    })
});

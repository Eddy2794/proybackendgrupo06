import { logger } from '../utils/logger.js';
import { ERROR_CODES } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Errores de validación de Joi (ya manejados por el middleware, pero por si acaso)
  if (err.name === 'ValidationError' && err.isJoi) {
    const errors = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors
    });
  }

  // Errores de MongoDB
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos enviados',
      errors: errors
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: `El ${field} ya existe`,
      code: 'DUPLICATE_KEY'
    });
  }

  // Errores de autenticación
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación inválido',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación expirado',
      code: 'EXPIRED_TOKEN'
    });
  }

  // Errores de validación personalizados (contienen palabras clave)
  if (err.message && (
    err.message.includes('ya existe') ||
    err.message.includes('requerido') ||
    err.message.includes('inválido') ||
    err.message.includes('debe tener') ||
    err.message.includes('formato') ||
    err.message.includes('mayor de') ||
    err.message.includes('alfanumérico') ||
    err.message.includes('caracteres') ||
    err.message.includes('Credenciales inválidas') ||
    err.message.includes('Usuario no encontrado') ||
    err.message.includes('No autorizado')
  )) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: 'VALIDATION_ERROR'
    });
  }

  // Error por defecto
  return res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ?
      'Error interno del servidor' :
      err.message,
    code: 'INTERNAL_SERVER_ERROR'
  });
};
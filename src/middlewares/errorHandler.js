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
  // Errores de MongoDB
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.validation('Error de validación en los datos enviados', errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.error(`El ${field} ya existe`, 400);
  }

  // Errores de autenticación
  if (err.name === 'JsonWebTokenError') {
    return res.error('Token de autenticación inválido', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return res.error('Token de autenticación expirado', 401);
  }
  // Error por defecto
  return res.error(
    process.env.NODE_ENV === 'production' ?
      'Error interno del servidor' :
      err.message,
    err.statusCode || 500
  );
};
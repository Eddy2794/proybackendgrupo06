/**
 * Utilidades para crear respuestas HTTP estandarizadas SIMPLIFICADAS
 */

/**
 * Estructura base de respuesta exitosa
 * @param {string} message - Mensaje descriptivo
 * @param {any} data - Datos a devolver (opcional)
 * @returns {object} Respuesta estandarizada
 */
export const success = (message, data = null) => {
  const response = {
    success: true,
    message
  };
  if (data !== null) {
    response.data = data;
  }
  return response;
};

/**
 * Estructura base de respuesta de error SIMPLIFICADA
 * @param {string} message - Mensaje de error
 * @returns {object} Respuesta de error estandarizada
 */
export const error = (message) => {
  return {
    success: false,
    message
  };
};

/**
 * Respuesta de validación con errores específicos por campo
 * @param {string} message - Mensaje principal
 * @param {array} validationErrors - Array de errores de validación
 * @returns {object} Respuesta de validación estandarizada
 */
export const validation = (message, validationErrors = []) => {
  return {
    success: false,
    message,
    errors: validationErrors
  };
};

/**
 * Respuesta paginada
 * @param {string} message - Mensaje descriptivo
 * @param {array} items - Items de la página actual
 * @param {object} pagination - Información de paginación
 * @returns {object} Respuesta paginada estandarizada
 */
export const paginated = (message, items, pagination) => {
  return success(message, {
    items,
    pagination
  });
};

/**
 * Middleware para manejar respuestas exitosas
 * @param {object} req - Request de Express
 * @param {object} res - Response de Express
 * @param {function} next - Next function de Express
 */
export const responseMiddleware = (req, res, next) => {
  res.success = (message, data = null) => {
    return res.json(success(message, data));
  };
  res.error = (message, statusCode = 400) => {
    return res.status(statusCode).json(error(message));
  };
  res.validation = (message, validationErrors = [], statusCode = 422) => {
    return res.status(statusCode).json(validation(message, validationErrors));
  };
  res.paginated = (message, items, pagination, statusCode = 200) => {
    return res.status(statusCode).json(paginated(message, items, pagination));
  };
  next();
};

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

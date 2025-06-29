import config from '../config/index.js';

/**
 * Middleware simplificado para entorno de desarrollo
 * Omite las validaciones de seguridad avanzada cuando NODE_ENV === 'development'
 */

export const devSecurityBypass = (req, res, next) => {
  // Solo aplicar en entorno de desarrollo
  if (config.env === 'development') {
    console.log('🚧 [DEV MODE] Bypassing advanced security validations');
    return next();
  }
  
  // En producción, devolver error si se intenta usar este middleware
  return res.status(403).json({
    success: false,
    error: 'Este endpoint solo está disponible en entorno de desarrollo',
    code: 'DEV_ONLY_ENDPOINT'
  });
};

/**
 * Rate limiting más permisivo para desarrollo
 */
export const devRateLimit = (req, res, next) => {
  if (config.env === 'development') {
    // En desarrollo, no aplicar rate limiting
    return next();
  }
  
  // En producción, usar el rate limiting normal
  return next();
};

/**
 * Logging simplificado para desarrollo
 */
export const devLogger = (req, res, next) => {
  if (config.env === 'development') {
    console.log(`📝 [DEV] ${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']
      }
    });
  }
  next();
};

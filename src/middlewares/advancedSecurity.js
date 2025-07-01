import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createHash, pbkdf2Sync } from 'crypto'; // Usar módulo crypto nativo

/**
 * Middleware de rate limiting para autenticación
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // máximo 15 intentos por IP
  message: {
    error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Resetear el contador en login exitoso
  skipSuccessfulRequests: true,
});

/**
 * Middleware de rate limiting general
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Configuración de Helmet para seguridad
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Para evitar problemas con CORS en desarrollo
});

/**
 * Validar timestamp para prevenir replay attacks
 */
export const validateTimestamp = (req, res, next) => {
  const { timestamp } = req.body;
  
  if (!timestamp) {
    return next(); // Si no hay timestamp, continuar (compatibilidad)
  }
  
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  const timeDiff = Math.abs(now - requestTime);
  
  // Permitir hasta 5 minutos de diferencia
  const maxTimeDiff = 5 * 60 * 1000;
  
  if (timeDiff > maxTimeDiff) {
    return res.status(400).json({
      success: false,
      error: 'Request timestamp inválido. Posible replay attack.',
      code: 'INVALID_TIMESTAMP'
    });
  }
  
  next();
};

/**
 * Validar token de cliente para prevenir replay attacks
 */
export const validateClientToken = (req, res, next) => {
  const { clientToken } = req.body;
  
  if (!clientToken) {
    return next(); // Si no hay clientToken, continuar (compatibilidad)
  }
  
  // Aquí podrías implementar una cache Redis para tokens ya usados
  // Por ahora, solo validamos que existe y tiene el formato correcto
  if (typeof clientToken !== 'string' || clientToken.length !== 64) {
    return res.status(400).json({
      success: false,
      error: 'Client token inválido.',
      code: 'INVALID_CLIENT_TOKEN'
    });
  }
  
  next();
};

/**
 * Sanitizar inputs para prevenir injection attacks
 */
export const sanitizeInputs = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remover caracteres peligrosos
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };
  
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body) {
    sanitizeObject(req.body);
  }
  
  if (req.query) {
    sanitizeObject(req.query);
  }
  
  if (req.params) {
    sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Validar hash de contraseña del frontend
 */
export const validatePasswordHash = (req, res, next) => {
  const { passwordHash, salt, encryptedPassword } = req.body;
  
  // Se requiere hash, salt y contraseña cifrada
  if (!passwordHash || !salt || !encryptedPassword) {
    return res.status(400).json({
      success: false,
      error: 'Se requiere hash de contraseña, salt y contraseña cifrada para seguridad.',
      code: 'MISSING_SECURITY_DATA'
    });
  }
  
  try {
    // Validar formato del hash (debe ser hexadecimal de 64 caracteres)
    const hashRegex = /^[a-f0-9]{64}$/i;
    if (!hashRegex.test(passwordHash)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de hash de contraseña inválido.',
        code: 'INVALID_PASSWORD_HASH_FORMAT'
      });
    }
    
    // Validar formato del salt (debe ser hexadecimal de 32 caracteres)
    const saltRegex = /^[a-f0-9]{32}$/i;    if (!saltRegex.test(salt)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de salt inválido.',
        code: 'INVALID_SALT_FORMAT'
      });
    }
    
    // Validar que la contraseña cifrada no esté vacía
    if (typeof encryptedPassword !== 'string' || encryptedPassword.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña cifrada inválida.',
        code: 'INVALID_ENCRYPTED_PASSWORD'
      });
    }
    
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Error validando datos de seguridad.',
      code: 'SECURITY_VALIDATION_ERROR'
    });
  }
};

/**
 * Logging de eventos de seguridad
 */
export const securityLogger = (event, details, req) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    details
  };
  
  console.log('[SECURITY]', JSON.stringify(logEntry));
  
  // Aquí podrías enviar a un sistema de logging externo
  // como Winston, Bunyan, o un servicio de monitoreo
};

/**
 * Middleware para detectar patrones sospechosos
 */
export const detectSuspiciousActivity = (req, res, next) => {  const suspiciousPatterns = [
    /(\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bupdate\b|\bdrop\b)/i, // SQL Injection
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
    /(\.\.\/|\.\.\\)/g, // Path traversal
    /(eval\(|Function\(|setTimeout\(|setInterval\()/i // Code injection
  ];
  
  const checkString = (str) => {
    if (typeof str !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };
  
  const checkObject = (obj) => {
    for (const key in obj) {
      if (checkString(obj[key])) {
        return true;
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkObject(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  let suspicious = false;
  
  if (req.body && checkObject(req.body)) suspicious = true;
  if (req.query && checkObject(req.query)) suspicious = true;
  if (req.params && checkObject(req.params)) suspicious = true;
  
  if (suspicious) {
    securityLogger('SUSPICIOUS_ACTIVITY_DETECTED', {
      body: req.body,
      query: req.query,
      params: req.params
    }, req);
    
    return res.status(400).json({
      success: false,
      error: 'Actividad sospechosa detectada.',
      code: 'SUSPICIOUS_ACTIVITY'
    });
  }
  
  next();
};

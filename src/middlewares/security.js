import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.'
  }
});

// Middleware simple para sanitización manual (compatible con Express 5)
const sanitizeInput = (req, res, next) => {
  // Función simple para sanitizar objetos MongoDB
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

export const applySecurity = (app, useCsrf = false) => {
  // Helmet para headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  
  // Sanitización personalizada (compatible con Express 5)
  app.use(sanitizeInput);
  
  // Rate limiting
  app.use(rateLimiter);
};

export const csrfErrorHandler = (err, req, res, next) => {
  if (err && err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: "Token CSRF inválido o ausente." });
  }
  next(err);
};
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { doubleCsrf } from 'csrf-csrf';

// Configuración de rate limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiadas peticiones desde esta IP',
    message: 'Intenta de nuevo en 15 minutos.',
    retryAfter: '15 minutes'
  }
});

// Configuración de CSRF más segura
const csrfOptions = {
  getSecret: () => process.env.CSRF_SECRET || 'your-csrf-secret-key-here',
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => {
    return req.headers['x-csrf-token'] || req.body._csrf;
  }
};

const { doubleCsrfProtection, generateToken } = doubleCsrf(csrfOptions);

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
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
  
  // Sanitización personalizada (compatible con Express 5)
  app.use(sanitizeInput);
  
  // Rate limiting
  app.use(rateLimiter);

  // CSRF Protection (opcional)
  if (useCsrf && process.env.NODE_ENV === 'production') {
    app.use(doubleCsrfProtection);
    
    // Endpoint para obtener el token CSRF
    app.get('/api/csrf-token', (req, res) => {
      const token = generateToken(req, res);
      res.json({ csrfToken: token });
    });
  }
};

export const csrfErrorHandler = (err, req, res, next) => {
  if (err && (err.code === 'EBADCSRFTOKEN' || err.message?.includes('csrf'))) {
    return res.status(403).json({ 
      error: 'CSRF Token inválido',
      message: 'Token CSRF inválido o ausente. Obtén un nuevo token desde /api/csrf-token'
    });
  }
  next(err);
};
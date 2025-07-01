import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import morgan from 'morgan';
import cors from 'cors';
import { applySecurity, csrfErrorHandler } from './middlewares/security.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { responseMiddleware } from './utils/response.js';
import { setupSwagger } from './config/swagger.js';
import apiRoutes from './routes/index.js';
import { logger } from './utils/logger.js';
import { 
  generalRateLimit, 
  helmetConfig, 
  sanitizeInputs, 
  detectSuspiciousActivity,
  securityLogger 
} from './middlewares/advancedSecurity.js';

// Para poder usar __dirname con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurar proxy para obtener IPs reales
// app.set('trust proxy', true); // Solo habilitar si usas proxy inverso (Nginx, Heroku, etc.)

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'x-csrf-token',
    'x-app-origin',
    'x-request-timestamp',
    'x-request-nonce',
    'x-client-token',
    'x-user-agent-hash',
    'x-api-version',
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'referrer-policy',
    'x-client-version'  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Aplicar Helmet para seguridad de headers
app.use(helmetConfig);

// Rate limiting general
app.use(generalRateLimit);

// Middleware de respuesta estandarizada
app.use(responseMiddleware);

// Middleware de logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Middleware de parseo
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Middlewares de seguridad avanzada
app.use(sanitizeInputs);
app.use(detectSuspiciousActivity);

// Aplicar middlewares de seguridad (sin CSRF en desarrollo)
applySecurity(app, false);

// Servir archivos estáticos
app.use('/api/static', express.static(path.join(__dirname, '../static')));

// Rutas de la API
app.use('/api', apiRoutes);

// Documentación Swagger
setupSwagger(app);

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware de manejo de errores
app.use(csrfErrorHandler); // Manejo específico de errores CSRF
app.use(errorHandler);     // Manejo global de errores

export default app;
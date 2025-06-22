import express from 'express';
import { logger } from '../utils/logger.js';

// Importar las rutas de los módulos
import userRoutes from '../modules/user/route/user.routes.js';
import personaRoutes from '../modules/persona/route/persona.routes.js';
import authRoutes from '../modules/auth/route/auth.routes.js';

// Crear router principal de la API
const router = express.Router();

// Middleware para logging de rutas API
router.use((req, res, next) => {
  logger.debug(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Cargar las rutas de los módulos
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/personas', personaRoutes);

// Ruta de información de la API
router.get('/', (req, res) => {
  res.json({
    message: 'API REST - Proyecto Backend Grupo 06',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/api/users',
      personas: '/api/personas',
      docs: '/api-docs',
      health: '/health'
    },
    status: 'OK'
  });
});

export default router;
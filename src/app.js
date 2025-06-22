import express from 'express';
import cookieParser from 'cookie-parser';
import { applySecurity, csrfErrorHandler } from './middlewares/security.js';
import { errorHandler } from './middlewares/errorHandler.js';
import userRoutes from './modules/user/user.routes.js';
import personaRoutes from './modules/persona/persona.routes.js';
import profesorRoutes from './modules/profesor/profesor-routes.js';
import { setupSwagger } from './config/swagger.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

applySecurity(app, false); // Deshabilitamos CSRF temporalmente

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/profesores', profesorRoutes);

// Documentación Swagger
setupSwagger(app);

// Middleware de manejo de errores
app.use(csrfErrorHandler); // Manejo específico de errores CSRF
app.use(errorHandler);     // Manejo global de errores

export default app;
import express from 'express';
import cookieParser from 'cookie-parser';
import { applySecurity, csrfErrorHandler } from './middlewares/security.js';
import { errorHandler } from './middlewares/errorHandler.js';
import userRoutes from './modules/user/user.routes.js';
import { setupSwagger } from './config/swagger.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

applySecurity(app, true); // Pasa "false" si no usás CSRF

app.use('/api/users', userRoutes);

setupSwagger(app);

app.use(csrfErrorHandler); // Manejo específico de errores CSRF
app.use(errorHandler);     // Manejo global de errores

export default app;
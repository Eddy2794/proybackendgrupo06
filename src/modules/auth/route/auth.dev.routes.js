import { Router } from 'express';
import { authController } from '../controller/auth.fluent.controller.js';
import { validateSchema } from '../../../middlewares/validation.js';
import { 
  registerDevSchema, 
  loginDevSchema, 
  changePasswordDevSchema 
} from '../validator/auth.dev.validators.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { 
  devSecurityBypass, 
  devRateLimit, 
  devLogger 
} from '../../../middlewares/devSecurity.js';
import { autoMapValidators, routeConfig } from '../../../utils/swagger/api-docs.js';
import config from '../../../config/index.js';

const router = Router();

// Middleware para verificar que estamos en entorno de desarrollo
const ensureDevEnvironment = (req, res, next) => {
  if (config.env !== 'development') {
    return res.status(403).json({
      success: false,
      error: 'Estas rutas solo están disponibles en entorno de desarrollo',
      code: 'DEV_ONLY_ROUTES'
    });
  }
  next();
};

// Rutas de desarrollo simplificadas
router.post('/register', 
  ensureDevEnvironment,
  devLogger,
  devRateLimit,
  devSecurityBypass,
  validateSchema(registerDevSchema), 
  authController.register
);

router.post('/login', 
  ensureDevEnvironment,
  devLogger,
  devRateLimit,
  devSecurityBypass,
  validateSchema(loginDevSchema), 
  authController.login
);

router.post('/logout', 
  ensureDevEnvironment,
  devLogger,
  authMiddleware, 
  authController.logout
);

router.post('/change-password', 
  ensureDevEnvironment,
  devLogger,
  devRateLimit,
  authMiddleware, 
  devSecurityBypass,
  validateSchema(changePasswordDevSchema), 
  authController.changePassword
);

// Documentación automática para rutas de desarrollo
const authDevValidators = {
  registerDevSchema,
  loginDevSchema,
  changePasswordDevSchema
};

const authDevRouteConfigs = [
  routeConfig('POST', '/register', 'registerDevSchema', 'Registrar usuario (Desarrollo)', {
    description: 'Endpoint simplificado para desarrollo que solo requiere username y password en texto plano',
    response: 'Usuario registrado exitosamente'
  }),
  routeConfig('POST', '/login', 'loginDevSchema', 'Iniciar sesión (Desarrollo)', {
    description: 'Endpoint simplificado para desarrollo con autenticación básica',
    response: 'Login exitoso'
  }),
  routeConfig('POST', '/logout', null, 'Cerrar sesión (Desarrollo)', {
    description: 'Cierra la sesión del usuario en entorno de desarrollo',
    auth: true,
    response: 'Logout exitoso'
  }),
  routeConfig('POST', '/change-password', 'changePasswordDevSchema', 'Cambiar contraseña (Desarrollo)', {
    description: 'Cambia la contraseña del usuario en entorno de desarrollo',
    auth: true,
    response: 'Contraseña actualizada correctamente'
  })
];

export const authDevSwaggerDocs = autoMapValidators(authDevValidators, authDevRouteConfigs, '/api/auth/dev', 'Auth - Development');

export default router;

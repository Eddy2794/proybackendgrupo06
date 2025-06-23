import { Router } from 'express';
import * as authController from '../controller/auth.controller.js';
import { validateSchema } from '../validator/auth.middleware.js';
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

/**
 * @swagger
 * /api/auth/dev/register:
 *   post:
 *     summary: Registrar nuevo usuario (Solo desarrollo - sin seguridad avanzada)
 *     tags: [Auth - Development]
 *     description: Endpoint simplificado para desarrollo que solo requiere username y password en texto plano
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 description: Nombre de usuario (solo caracteres alfanuméricos)
 *                 example: "usuario123"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña en texto plano
 *                 example: "mipassword123"
 *               nombres:
 *                 type: string
 *                 description: Nombres del usuario (opcional)
 *                 example: "Juan Carlos"
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del usuario (opcional)
 *                 example: "Pérez García"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario (opcional)
 *                 example: "juan@example.com"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     username:
 *                       type: string
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 */
router.post('/register', 
  ensureDevEnvironment,
  devLogger,
  devRateLimit,
  devSecurityBypass,
  validateSchema(registerDevSchema), 
  authController.registerDev
);

/**
 * @swagger
 * /api/auth/dev/login:
 *   post:
 *     summary: Iniciar sesión (Solo desarrollo - sin seguridad avanzada)
 *     tags: [Auth - Development]
 *     description: Endpoint simplificado para desarrollo que solo requiere username y password en texto plano
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario
 *                 example: "usuario123"
 *               password:
 *                 type: string
 *                 description: Contraseña en texto plano
 *                 example: "mipassword123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login exitoso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Token JWT para autenticación
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Credenciales inválidas"
 *                 code:
 *                   type: string
 *                   example: "INVALID_CREDENTIALS"
 */
router.post('/login', 
  ensureDevEnvironment,
  devLogger,
  devRateLimit,
  devSecurityBypass,
  validateSchema(loginDevSchema), 
  authController.loginDev
);

/**
 * @swagger
 * /api/auth/dev/logout:
 *   post:
 *     summary: Cerrar sesión (Solo desarrollo)
 *     tags: [Auth - Development]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout exitoso"
 *       401:
 *         description: Token de autorización requerido
 */
router.post('/logout', 
  ensureDevEnvironment,
  devLogger,
  authMiddleware, 
  authController.logout
);

/**
 * @swagger
 * /api/auth/dev/change-password:
 *   post:
 *     summary: Cambiar contraseña (Solo desarrollo)
 *     tags: [Auth - Development]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual en texto plano
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Nueva contraseña en texto plano
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmación de la nueva contraseña
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
router.post('/change-password', 
  ensureDevEnvironment,
  devLogger,
  devRateLimit,
  authMiddleware, 
  devSecurityBypass,
  validateSchema(changePasswordDevSchema), 
  authController.changePasswordDev
);

export default router;

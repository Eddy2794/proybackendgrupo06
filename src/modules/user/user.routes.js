import { Router } from 'express';
import { 
  registerUser, 
  getUserProfile, 
  loginUser, 
  getCurrentUser,
  getAllUsers,
  updateUser,
  deleteUser,
  activateUser,
  changePassword,
  getUsersByRole,
  getUserStats
} from './user.controller.js';
import { body, param } from 'express-validator';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar nuevo usuario (con datos de persona)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombres
 *               - apellidos
 *               - numeroDocumento
 *               - fechaNacimiento
 *               - genero
 *               - email
 *               - username
 *               - password
 *             properties:
 *               # Datos de Persona
 *               nombres:
 *                 type: string
 *                 example: "Juan Carlos"
 *               apellidos:
 *                 type: string
 *                 example: "García López"
 *               tipoDocumento:
 *                 type: string
 *                 enum: [DNI, PASAPORTE, CEDULA, CARNET_EXTRANJERIA]
 *                 example: "DNI"
 *               numeroDocumento:
 *                 type: string
 *                 example: "12345678"
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               genero:
 *                 type: string
 *                 enum: [MASCULINO, FEMENINO, OTRO, PREFIERO_NO_DECIR]
 *                 example: "MASCULINO"
 *               telefono:
 *                 type: string
 *                 example: "+51987654321"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan.garcia@email.com"
 *               direccion:
 *                 type: object
 *                 properties:
 *                   calle:
 *                     type: string
 *                     example: "Av. Principal 123"
 *                   ciudad:
 *                     type: string
 *                     example: "Lima"
 *                   departamento:
 *                     type: string
 *                     example: "Lima"
 *                   pais:
 *                     type: string
 *                     example: "Perú"
 *               # Datos de Usuario
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "juangarcia"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 personaId:
 *                   type: string
 *                 username:
 *                   type: string
 *                 nombreCompleto:
 *                   type: string
 *       400:
 *         description: Error de validación
 */
router.post(
  '/register',
  [
    // Validaciones de Persona
    body('nombres').trim().notEmpty().isLength({ min: 2, max: 50 }),
    body('apellidos').trim().notEmpty().isLength({ min: 2, max: 50 }),
    body('numeroDocumento').trim().notEmpty().isLength({ min: 6, max: 20 }),
    body('fechaNacimiento').isISO8601().toDate(),
    body('genero').isIn(['MASCULINO', 'FEMENINO', 'OTRO', 'PREFIERO_NO_DECIR']),
    body('email').isEmail().normalizeEmail(),
    
    // Validaciones de Usuario
    body('username').trim().notEmpty().isLength({ min: 3, max: 30 }),
    body('password').isLength({ min: 6 })
  ],
  registerUser
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Users]
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
 *                 example: "juangarcia"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Credenciales inválidas
 */
router.post(
  '/login',
  [
    body('username').notEmpty(),
    body('password').notEmpty()
  ],
  loginUser
);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario actual
 *       401:
 *         description: No autorizado
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Obtener estadísticas de usuarios (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de usuarios
 */
router.get('/stats', authMiddleware, getUserStats);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios (con paginación)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO, SUSPENDIDO, PENDIENTE_VERIFICACION]
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN, MODERATOR]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/', authMiddleware, getAllUsers);

/**
 * @swagger
 * /api/users/role/{rol}:
 *   get:
 *     summary: Obtener usuarios por rol
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rol
 *         required: true
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN, MODERATOR]
 *     responses:
 *       200:
 *         description: Usuarios con el rol especificado
 */
router.get('/role/:rol', authMiddleware, getUsersByRole);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Cambiar contraseña del usuario actual
 *     tags: [Users]
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
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Contraseña actual incorrecta
 */
router.post(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  changePassword
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener perfil de usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', authMiddleware, getUserProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [USER, ADMIN, MODERATOR]
 *               estado:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO, SUSPENDIDO, PENDIENTE_VERIFICACION]
 *               configuraciones:
 *                 type: object
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
  '/:id',
  authMiddleware,
  [
    param('id').isMongoId(),
    body('username').optional().trim().isLength({ min: 3, max: 30 }),
    body('rol').optional().isIn(['USER', 'ADMIN', 'MODERATOR']),
    body('estado').optional().isIn(['ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'PENDIENTE_VERIFICACION'])
  ],
  updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Desactivar usuario (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario desactivado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', authMiddleware, deleteUser);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     summary: Activar usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario activado
 *       404:
 *         description: Usuario no encontrado
 */
router.patch('/:id/activate', authMiddleware, activateUser);

export default router;
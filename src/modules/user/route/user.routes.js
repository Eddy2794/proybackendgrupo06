import { Router } from 'express';
import { 
  getUserProfile, 
  getCurrentUser,
  getAllUsers,
  updateUser,
  deleteUser,
  activateUser,
  getUsersByRole,
  getUserStats
} from '../controller/user.controller.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { validateSchema, validateObjectId } from '../validator/user.middleware.js';
import { 
  updateUserSchema,
  userQuerySchema
} from '../validator/user.validators.js';

const router = Router();

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
router.get('/', authMiddleware, validateSchema(userQuerySchema, 'query'), getAllUsers);

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
router.get('/:id', authMiddleware, validateObjectId(), getUserProfile);

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
  validateObjectId(),
  validateSchema(updateUserSchema),
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
router.delete('/:id', authMiddleware, validateObjectId(), deleteUser);

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
router.patch('/:id/activate', authMiddleware, validateObjectId(), activateUser);

export default router;
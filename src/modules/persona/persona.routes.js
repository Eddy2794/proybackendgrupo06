import { Router } from 'express';
import * as personaController from './persona.controller.js';
import * as personaValidation from './persona.validation.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Persona:
 *       type: object
 *       required:
 *         - nombres
 *         - apellidos
 *         - numeroDocumento
 *         - fechaNacimiento
 *         - genero
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la persona
 *         nombres:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Nombres de la persona
 *         apellidos:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Apellidos de la persona
 *         tipoDocumento:
 *           type: string
 *           enum: [DNI, PASAPORTE, CEDULA, CARNET_EXTRANJERIA]
 *           default: DNI
 *         numeroDocumento:
 *           type: string
 *           minLength: 6
 *           maxLength: 20
 *           description: Número de documento único
 *         fechaNacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento
 *         genero:
 *           type: string
 *           enum: [MASCULINO, FEMENINO, OTRO, PREFIERO_NO_DECIR]
 *         telefono:
 *           type: string
 *           minLength: 7
 *           maxLength: 15
 *         email:
 *           type: string
 *           format: email
 *           description: Email único de la persona
 *         direccion:
 *           type: object
 *           properties:
 *             calle:
 *               type: string
 *               maxLength: 100
 *             ciudad:
 *               type: string
 *               maxLength: 50
 *             departamento:
 *               type: string
 *               maxLength: 50
 *             codigoPostal:
 *               type: string
 *               maxLength: 10
 *             pais:
 *               type: string
 *               maxLength: 50
 *               default: Perú
 *         estado:
 *           type: string
 *           enum: [ACTIVO, INACTIVO, SUSPENDIDO]
 *           default: ACTIVO
 *         nombreCompleto:
 *           type: string
 *           readOnly: true
 *           description: Nombre completo (virtual)
 *         edad:
 *           type: integer
 *           readOnly: true
 *           description: Edad calculada (virtual)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/personas:
 *   post:
 *     summary: Crear nueva persona
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
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
 *                   codigoPostal:
 *                     type: string
 *                     example: "15001"
 *                   pais:
 *                     type: string
 *                     example: "Perú"
 *     responses:
 *       201:
 *         description: Persona creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 persona:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     nombreCompleto:
 *                       type: string
 *                     email:
 *                       type: string
 *                     numeroDocumento:
 *                       type: string
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Persona ya existe
 */
router.post(
  '/',
  authMiddleware,
  personaValidation.validateCreatePersona,
  personaController.createPersona
);

/**
 * @swagger
 * /api/personas:
 *   get:
 *     summary: Obtener todas las personas (con paginación y filtros)
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO, SUSPENDIDO]
 *         description: Filtrar por estado
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *           enum: [MASCULINO, FEMENINO, OTRO, PREFIERO_NO_DECIR]
 *         description: Filtrar por género
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Buscar por nombre o apellido
 *     responses:
 *       200:
 *         description: Lista de personas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 personas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Persona'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get(
  '/',
  authMiddleware,
  personaValidation.validateSearchPersonas,
  personaController.getAllPersonas
);

/**
 * @swagger
 * /api/personas/search:
 *   get:
 *     summary: Buscar personas por nombre
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *       400:
 *         description: Parámetro de búsqueda inválido
 */
router.get(
  '/search',
  authMiddleware,
  personaController.searchPersonas
);

/**
 * @swagger
 * /api/personas/age-range:
 *   get:
 *     summary: Obtener personas por rango de edad
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: minAge
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 120
 *       - in: query
 *         name: maxAge
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 120
 *     responses:
 *       200:
 *         description: Personas en el rango de edad
 *       400:
 *         description: Rango de edad inválido
 */
router.get(
  '/age-range',
  authMiddleware,
  personaValidation.validateAgeRange,
  personaController.getPersonasByAge
);

/**
 * @swagger
 * /api/personas/{id}:
 *   get:
 *     summary: Obtener persona por ID
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Datos de la persona
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Persona'
 *       404:
 *         description: Persona no encontrada
 */
router.get(
  '/:id',
  authMiddleware,
  personaValidation.validatePersonaId,
  personaController.getPersonaById
);

/**
 * @swagger
 * /api/personas/{id}:
 *   put:
 *     summary: Actualizar persona
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la persona
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: object
 *               estado:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO, SUSPENDIDO]
 *     responses:
 *       200:
 *         description: Persona actualizada
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Persona no encontrada
 */
router.put(
  '/:id',
  authMiddleware,
  personaValidation.validateUpdatePersona,
  personaController.updatePersona
);

/**
 * @swagger
 * /api/personas/{id}:
 *   delete:
 *     summary: Desactivar persona (soft delete)
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Persona desactivada
 *       404:
 *         description: Persona no encontrada
 */
router.delete(
  '/:id',
  authMiddleware,
  personaValidation.validatePersonaId,
  personaController.deletePersona
);

/**
 * @swagger
 * /api/personas/{id}/activate:
 *   patch:
 *     summary: Activar persona
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Persona activada
 *       404:
 *         description: Persona no encontrada
 */
router.patch(
  '/:id/activate',
  authMiddleware,
  personaValidation.validatePersonaId,
  personaController.activatePersona
);

export default router;

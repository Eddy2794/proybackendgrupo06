import express from 'express';
import categoriaEscuelaController from '../controller/categoriaEscuela.controller.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { 
  validarCrearCategoria,
  validarActualizarCategoria,
  validarCategoriaId,
  validarBuscarCategorias
} from '../../pago/validator/pago.validator.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriaEscuela:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la categoría
 *         nombre:
 *           type: string
 *           description: Nombre de la categoría
 *           example: "Infantil Sub-10"
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la categoría
 *           example: "Categoría para niños de 8 a 10 años, entrenamiento recreativo"
 *         tipo:
 *           type: string
 *           enum: [INFANTIL, JUVENIL, ADULTO, VETERANOS, COMPETITIVO, RECREATIVO, ENTRENAMIENTO]
 *           description: Tipo de categoría
 *           example: "INFANTIL"
 *         edadMinima:
 *           type: number
 *           minimum: 3
 *           maximum: 100
 *           description: Edad mínima para la categoría
 *           example: 8
 *         edadMaxima:
 *           type: number
 *           minimum: 3
 *           maximum: 100
 *           description: Edad máxima para la categoría
 *           example: 10
 *         precio:
 *           type: object
 *           properties:
 *             cuotaMensual:
 *               type: number
 *               minimum: 0
 *               description: Precio de la cuota mensual
 *               example: 15000
 *             descuentos:
 *               type: object
 *               properties:
 *                 hermanos:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 100
 *                   description: Porcentaje de descuento por hermanos
 *                   example: 10
 *                 pagoAnual:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 100
 *                   description: Porcentaje de descuento por pago anual
 *                   example: 15
 *         estado:
 *           type: string
 *           enum: [ACTIVA, INACTIVA, SUSPENDIDA]
 *           description: Estado de la categoría
 *           default: ACTIVA
 *         cupoMaximo:
 *           type: number
 *           minimum: 1
 *           description: Cupo máximo de estudiantes (opcional)
 *           example: 25
 *         horarios:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               dia:
 *                 type: string
 *                 enum: [LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO]
 *                 example: "LUNES"
 *               horaInicio:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "16:00"
 *               horaFin:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "17:30"
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         fechaActualizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         creadoPor:
 *           type: string
 *           description: ID del usuario que creó la categoría
 *         actualizadoPor:
 *           type: string
 *           description: ID del usuario que actualizó la categoría por última vez
 */

/**
 * @swagger
 * tags:
 *   - name: Categorías de Escuela
 *     description: Gestión de categorías de la escuela de fútbol
 */

/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Crea una nueva categoría de escuela (solo administradores)
 *     tags: [Categorías de Escuela]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - tipo
 *               - edadMinima
 *               - edadMaxima
 *               - precio
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Infantil Sub-10"
 *               descripcion:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: "Categoría para niños de 8 a 10 años con entrenamiento recreativo los lunes y miércoles"
 *               tipo:
 *                 type: string
 *                 enum: [INFANTIL, JUVENIL, ADULTO, VETERANOS, COMPETITIVO, RECREATIVO, ENTRENAMIENTO]
 *                 example: "INFANTIL"
 *               edadMinima:
 *                 type: number
 *                 minimum: 3
 *                 maximum: 100
 *                 example: 8
 *               edadMaxima:
 *                 type: number
 *                 minimum: 3
 *                 maximum: 100
 *                 example: 10
 *               precio:
 *                 type: object
 *                 required:
 *                   - cuotaMensual
 *                 properties:
 *                   cuotaMensual:
 *                     type: number
 *                     minimum: 0
 *                     example: 15000
 *                   descuentos:
 *                     type: object
 *                     properties:
 *                       hermanos:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 100
 *                         example: 10
 *                       pagoAnual:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 100
 *                         example: 15
 *               cupoMaximo:
 *                 type: number
 *                 minimum: 1
 *                 example: 25
 *               horarios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - dia
 *                     - horaInicio
 *                     - horaFin
 *                   properties:
 *                     dia:
 *                       type: string
 *                       enum: [LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO]
 *                     horaInicio:
 *                       type: string
 *                       pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                     horaFin:
 *                       type: string
 *                       pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example:
 *                   - dia: "LUNES"
 *                     horaInicio: "16:00"
 *                     horaFin: "17:30"
 *                   - dia: "MIERCOLES"
 *                     horaInicio: "16:00"
 *                     horaFin: "17:30"
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CategoriaEscuela'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Ya existe una categoría con ese nombre
 */
router.post('/', authMiddleware, validarCrearCategoria, categoriaEscuelaController.crearCategoria);

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Obtiene todas las categorías con filtros opcionales
 *     tags: [Categorías de Escuela]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [INFANTIL, JUVENIL, ADULTO, VETERANOS, COMPETITIVO, RECREATIVO, ENTRENAMIENTO]
 *         description: Filtrar por tipo de categoría
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ACTIVA, INACTIVA, SUSPENDIDA]
 *         description: Filtrar por estado (por defecto solo ACTIVA para usuarios no admin)
 *       - in: query
 *         name: edad
 *         schema:
 *           type: number
 *           minimum: 3
 *           maximum: 100
 *         description: Filtrar categorías que incluyan esta edad
 *       - in: query
 *         name: precioMin
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio mínimo de cuota mensual
 *       - in: query
 *         name: precioMax
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio máximo de cuota mensual
 *     responses:
 *       200:
 *         description: Categorías obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categorias:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CategoriaEscuela'
 *                     total:
 *                       type: number
 *                       description: Total de categorías encontradas
 *                     filtrosAplicados:
 *                       type: object
 *                       description: Filtros que se aplicaron en la consulta
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', categoriaEscuelaController.obtenerCategorias);

/**
 * @swagger
 * /api/categorias/{categoriaId}:
 *   get:
 *     summary: Obtiene una categoría específica por ID
 *     tags: [Categorías de Escuela]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoriaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *         example: "60f7d123456789abcdef1234"
 *     responses:
 *       200:
 *         description: Categoría obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CategoriaEscuela'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:categoriaId', authMiddleware, validarCategoriaId, categoriaEscuelaController.obtenerCategoriaPorId);

/**
 * @swagger
 * /api/categorias/{categoriaId}:
 *   put:
 *     summary: Actualiza una categoría existente (solo administradores)
 *     tags: [Categorías de Escuela]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoriaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *         example: "60f7d123456789abcdef1234"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Infantil Sub-10 Actualizado"
 *               descripcion:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: "Categoría actualizada para niños de 8 a 10 años"
 *               precio:
 *                 type: object
 *                 properties:
 *                   cuotaMensual:
 *                     type: number
 *                     minimum: 0
 *                     example: 16000
 *               estado:
 *                 type: string
 *                 enum: [ACTIVA, INACTIVA, SUSPENDIDA]
 *                 example: "ACTIVA"
 *             description: Todos los campos son opcionales para actualización
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CategoriaEscuela'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Ya existe una categoría con ese nombre
 */
router.put('/:categoriaId', authMiddleware, validarActualizarCategoria, categoriaEscuelaController.actualizarCategoria);

/**
 * @swagger
 * /api/categorias/{categoriaId}:
 *   delete:
 *     summary: Elimina una categoría (soft delete) (solo administradores)
 *     tags: [Categorías de Escuela]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoriaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *         example: "60f7d123456789abcdef1234"
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: No se puede eliminar porque tiene pagos activos asociados
 */
router.delete('/:categoriaId', authMiddleware, validarCategoriaId, categoriaEscuelaController.eliminarCategoria);

/**
 * @swagger
 * /api/categorias/buscar/edad/{edad}:
 *   get:
 *     summary: Busca categorías por edad específica
 *     tags: [Categorías de Escuela]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: edad
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 3
 *           maximum: 100
 *         description: Edad a buscar
 *         example: 10
 *     responses:
 *       200:
 *         description: Categorías encontradas por edad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categorias:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CategoriaEscuela'
 *                     edad:
 *                       type: number
 *                     total:
 *                       type: number
 *       400:
 *         description: Edad inválida
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/buscar/edad/:edad', authMiddleware, categoriaEscuelaController.buscarPorEdad);

/**
 * @swagger
 * /api/categorias/buscar/tipo/{tipo}:
 *   get:
 *     summary: Busca categorías por tipo
 *     tags: [Categorías de Escuela]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [INFANTIL, JUVENIL, ADULTO, VETERANOS, COMPETITIVO, RECREATIVO, ENTRENAMIENTO]
 *         description: Tipo de categoría
 *         example: "INFANTIL"
 *     responses:
 *       200:
 *         description: Categorías encontradas por tipo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categorias:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CategoriaEscuela'
 *                     tipo:
 *                       type: string
 *                     total:
 *                       type: number
 *       400:
 *         description: Tipo de categoría inválido
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/buscar/tipo/:tipo', authMiddleware, categoriaEscuelaController.buscarPorTipo);

/**
 * @swagger
 * /api/categorias/buscar/precio:
 *   get:
 *     summary: Busca categorías por rango de precio
 *     tags: [Categorías de Escuela]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: precioMin
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio mínimo
 *         example: 10000
 *       - in: query
 *         name: precioMax
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio máximo
 *         example: 20000
 *     responses:
 *       200:
 *         description: Categorías encontradas por rango de precio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categorias:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CategoriaEscuela'
 *                     rangoPrecios:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: number
 *                         max:
 *                           type: number
 *                     total:
 *                       type: number
 *       400:
 *         description: Rango de precios inválido
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/buscar/precio', authMiddleware, categoriaEscuelaController.buscarPorRangoPrecio);

/**
 * @swagger
 * /api/categorias/estadisticas:
 *   get:
 *     summary: Obtiene estadísticas de las categorías (solo administradores)
 *     tags: [Categorías de Escuela]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     resumen:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           description: Total de categorías
 *                         activas:
 *                           type: number
 *                           description: Categorías activas
 *                         inactivas:
 *                           type: number
 *                           description: Categorías inactivas
 *                         porcentajeActivas:
 *                           type: number
 *                           description: Porcentaje de categorías activas
 *                     porTipo:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Tipo de categoría
 *                           cantidad:
 *                             type: number
 *                             description: Cantidad de categorías de este tipo
 *                           precioPromedio:
 *                             type: number
 *                             description: Precio promedio
 *                           precioMinimo:
 *                             type: number
 *                             description: Precio mínimo
 *                           precioMaximo:
 *                             type: number
 *                             description: Precio máximo
 *                     precios:
 *                       type: object
 *                       properties:
 *                         precioPromedio:
 *                           type: number
 *                         precioMinimo:
 *                           type: number
 *                         precioMaximo:
 *                           type: number
 *                         totalCategorias:
 *                           type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/estadisticas', authMiddleware, categoriaEscuelaController.obtenerEstadisticas);

export default router;

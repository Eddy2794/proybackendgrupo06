import express from 'express';
import pagoController from '../controller/pago.controller.js';
import { authMiddleware } from '../../../middlewares/authMiddleware.js';
import { 
  validarCrearCuota,
  validarCrearPagoAnual,
  validarCrearPagoQR,
  validarPagoId,
  validarHistorialPagos,
  validarWebhook,
  validarConsultarEstado,
  validarEstadisticas
} from '../validator/pago.validator.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Pago:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del pago
 *         usuario:
 *           type: string
 *           description: ID del usuario que realizó el pago
 *         categoria:
           type: string
           description: ID de la categoría
 *         tipo:
 *           type: string
 *           enum: [PAGO_CUOTA, PAGO_INSCRIPCION, PAGO_ANUAL, REEMBOLSO, AJUSTE]
 *           description: Tipo de operación
 *         periodo:
 *           type: object
 *           properties:
 *             mes:
 *               type: number
 *               minimum: 1
 *               maximum: 12
 *             anio:
 *               type: number
 *               minimum: 2020
 *               maximum: 2100
 *         montos:
 *           type: object
 *           properties:
 *             original:
 *               type: number
 *               description: Monto original antes de descuentos
 *             descuentos:
 *               type: number
 *               description: Monto de descuentos aplicados
 *             final:
 *               type: number
 *               description: Monto final a pagar
 *             comision:
 *               type: number
 *               description: Comisión de MercadoPago
 *         estado:
 *           type: string
 *           enum: [PENDIENTE, APROBADO, RECHAZADO, CANCELADO, REEMBOLSADO, EN_PROCESO, EN_MEDIACION, AUTORIZADO]
 *         mercadoPago:
 *           type: object
 *           properties:
 *             preferenceId:
 *               type: string
 *             paymentId:
 *               type: string
 *             status:
 *               type: string
 *             paymentMethod:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 installments:
 *                   type: number
 *         auditoria:
 *           type: object
 *           properties:
 *             fechaCreacion:
 *               type: string
 *               format: date-time
 *             fechaActualizacion:
 *               type: string
 *               format: date-time
 * 
 *     PreferenciaPago:
 *       type: object
 *       properties:
 *         preferenceId:
 *           type: string
 *           description: ID de la preferencia de MercadoPago
 *         pagoId:
 *           type: string
 *           description: ID del pago en nuestra base de datos
 *         initPoint:
 *           type: string
 *           description: URL para iniciar el pago en producción
 *         sandboxInitPoint:
 *           type: string
 *           description: URL para iniciar el pago en sandbox
 *         monto:
 *           type: number
 *           description: Monto total a pagar
 *         categoria:
 *           type: string
 *           description: Nombre de la categoría
 *         periodo:
 *           type: string
 *           description: Período del pago (mes/año)
 * 
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: Pagos
 *     description: Gestión de pagos con MercadoPago
 */

/**
 * @swagger
 * /api/payments/credentials:
 *   get:
 *     summary: Obtiene las credenciales públicas de MercadoPago
 *     tags: [Pagos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Credenciales obtenidas exitosamente
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
 *                     publicKey:
 *                       type: string
 *                       description: Public Key de MercadoPago para el frontend
 *                     urls:
 *                       type: object
 *                       properties:
 *                         success:
 *                           type: string
 *                         failure:
 *                           type: string
 *                         pending:
 *                           type: string
 *                     environment:
 *                       type: object
 *                       properties:
 *                         isTest:
 *                           type: boolean
 *                         environment:
 *                           type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/credentials', authMiddleware, pagoController.obtenerCredencialesPublicas);

/**
 * @swagger
 * /api/payments/cuota:
 *   post:
 *     summary: Crea una preferencia de pago para cuota mensual
 *     tags: [Pagos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoriaId
 *               - periodo
 *             properties:
 *               categoriaId:
 *                 type: string
 *                 description: ID de la categoría de escuela
 *                 example: "60f7d123456789abcdef1234"
 *               periodo:
 *                 type: object
 *                 required:
 *                   - mes
 *                   - anio
 *                 properties:
 *                   mes:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 12
 *                     example: 3
 *                   anio:
 *                     type: number
 *                     minimum: 2020
 *                     maximum: 2100
 *                     example: 2025
 *               descuentoTipo:
 *                 type: string
 *                 enum: [hermanos, pagoAnual]
 *                 description: Tipo de descuento a aplicar (opcional)
 *                 example: "hermanos"
 *     responses:
 *       200:
 *         description: Preferencia creada exitosamente
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
 *                   $ref: '#/components/schemas/PreferenciaPago'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: Ya existe un pago para este período
 */
router.post('/cuota', authMiddleware, validarCrearCuota, pagoController.crearPreferenciaCuota);

/**
 * @swagger
 * /api/payments/anual:
 *   post:
 *     summary: Crea una preferencia de pago anual
 *     tags: [Pagos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoriaId
 *               - anio
 *             properties:
 *               categoriaId:
 *                 type: string
 *                 description: ID de la categoría de escuela
 *                 example: "60f7d123456789abcdef1234"
 *               anio:
 *                 type: number
 *                 minimum: 2020
 *                 maximum: 2100
 *                 example: 2025
 *     responses:
 *       200:
 *         description: Preferencia de pago anual creada exitosamente
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
 *                   allOf:
 *                     - $ref: '#/components/schemas/PreferenciaPago'
 *                     - type: object
 *                       properties:
 *                         descuentoPorcentaje:
 *                           type: number
 *                           description: Porcentaje de descuento aplicado
 *                         anio:
 *                           type: number
 *                           description: Año del pago anual
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/anual', authMiddleware, validarCrearPagoAnual, pagoController.crearPreferenciaPagoAnual);

/**
 * @swagger
 * /api/payments/qr:
 *   post:
 *     summary: Crea un pago QR para mostrar en pantalla
 *     tags: [Pagos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoriaId
 *               - tipoPago
 *             properties:
 *               categoriaId:
 *                 type: string
 *                 description: ID de la categoría de escuela
 *                 example: "60f7d123456789abcdef1234"
 *               tipoPago:
 *                 type: string
 *                 enum: [cuota, anual]
 *                 description: Tipo de pago (cuota mensual o anual)
 *                 example: "cuota"
 *               periodo:
 *                 type: object
 *                 description: Período del pago (requerido para cuota, opcional para anual)
 *                 properties:
 *                   mes:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 12
 *                     example: 3
 *                   anio:
 *                     type: number
 *                     minimum: 2020
 *                     maximum: 2100
 *                     example: 2025
 *     responses:
 *       200:
 *         description: Pago QR creado exitosamente
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
 *                     preferenceId:
 *                       type: string
 *                       description: ID de la preferencia de MercadoPago
 *                     pagoId:
 *                       type: string
 *                       description: ID del pago en nuestra base de datos
 *                     qrData:
 *                       type: string
 *                       description: Datos del código QR
 *                     initPoint:
 *                       type: string
 *                       description: URL para iniciar el pago en producción
 *                     sandboxInitPoint:
 *                       type: string
 *                       description: URL para iniciar el pago en sandbox
 *                     monto:
 *                       type: number
 *                       description: Monto total a pagar
 *                     categoria:
 *                       type: string
 *                       description: Nombre de la categoría
 *                     descripcion:
 *                       type: string
 *                       description: Descripción del pago
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de expiración del QR (30 minutos)
 *                     metodoPago:
 *                       type: string
 *                       example: "QR"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: Ya existe un pago para este período
 */
router.post('/qr', authMiddleware, validarCrearPagoQR, pagoController.crearPagoQR);

/**
 * @swagger
 * /api/payments/webhooks/mercadopago:
 *   post:
 *     summary: Webhook para recibir notificaciones de MercadoPago
 *     tags: [Pagos]
 *     description: Endpoint interno para procesar notificaciones de MercadoPago. No requiere autenticación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - data
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [payment, order]
 *                 example: "payment"
 *               data:
 *                 type: object
 *                 required:
 *                   - id
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "12345678"
 *               api_version:
 *                 type: string
 *                 example: "v1"
 *               application_id:
 *                 type: string
 *               date_created:
 *                 type: string
 *                 format: date-time
 *               user_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 processed:
 *                   type: boolean
 */
router.post('/webhooks/mercadopago', validarWebhook, pagoController.manejarWebhook);

/**
 * @swagger
 * /api/payments/{pagoId}:
 *   get:
 *     summary: Obtiene información de un pago específico
 *     tags: [Pagos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pago
 *         example: "60f7d123456789abcdef1234"
 *     responses:
 *       200:
 *         description: Pago obtenido exitosamente
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
 *                   $ref: '#/components/schemas/Pago'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:pagoId', authMiddleware, validarPagoId, pagoController.obtenerPago);

/**
 * @swagger
 * /api/payments/historial:
 *   get:
 *     summary: Obtiene el historial de pagos del usuario actual
 *     tags: [Pagos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, APROBADO, RECHAZADO, CANCELADO, REEMBOLSADO, EN_PROCESO, EN_MEDIACION, AUTORIZADO]
 *         description: Filtrar por estado del pago
 *       - in: query
 *         name: anio
 *         schema:
 *           type: number
 *           minimum: 2020
 *           maximum: 2100
 *         description: Filtrar por año
 *       - in: query
 *         name: mes
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 12
 *         description: Filtrar por mes
 *       - in: query
 *         name: limite
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número máximo de resultados por página
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
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
 *                     pagos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Pago'
 *                     paginacion:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         pagina:
 *                           type: number
 *                         limite:
 *                           type: number
 *                         totalPaginas:
 *                           type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/historial', authMiddleware, validarHistorialPagos, pagoController.obtenerHistorialPagos);

/**
 * @swagger
 * /api/payments/estado:
 *   get:
 *     summary: Consulta el estado actual de un pago
 *     tags: [Pagos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: paymentId
 *         schema:
 *           type: string
 *         description: ID del pago en MercadoPago
 *       - in: query
 *         name: externalReference
 *         schema:
 *           type: string
 *         description: Referencia externa del pago
 *     responses:
 *       200:
 *         description: Estado del pago obtenido exitosamente
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
 *                     pagoId:
 *                       type: string
 *                     estado:
 *                       type: string
 *                     estadoDetalle:
 *                       type: string
 *                     monto:
 *                       type: number
 *                     fechaCreacion:
 *                       type: string
 *                       format: date-time
 *                     fechaActualizacion:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/estado', authMiddleware, validarConsultarEstado, pagoController.consultarEstadoPago);

/**
 * @swagger
 * /api/payments/estadisticas:
 *   get:
 *     summary: Obtiene estadísticas de pagos (solo administradores)
 *     tags: [Pagos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, APROBADO, RECHAZADO, CANCELADO, REEMBOLSADO, EN_PROCESO, EN_MEDIACION, AUTORIZADO]
 *         description: Filtrar por estado
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Estado del pago
 *                       cantidad:
 *                         type: number
 *                         description: Cantidad de pagos en este estado
 *                       montoTotal:
 *                         type: number
 *                         description: Monto total de pagos en este estado
 *                       montoPromedio:
 *                         type: number
 *                         description: Monto promedio de pagos en este estado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/estadisticas', authMiddleware, validarEstadisticas, pagoController.obtenerEstadisticas);

// Rutas de retorno desde MercadoPago
/**
 * @swagger
 * /api/payments/return/success:
 *   get:
 *     summary: Maneja retornos exitosos desde MercadoPago
 *     tags: [Pagos]
 *     description: Endpoint para manejar redirecciones exitosas desde MercadoPago
 *     parameters:
 *       - in: query
 *         name: payment_id
 *         schema:
 *           type: string
 *         description: ID del pago en MercadoPago
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Estado del pago
 *       - in: query
 *         name: external_reference
 *         schema:
 *           type: string
 *         description: Referencia externa
 *     responses:
 *       302:
 *         description: Redirección al frontend con información del pago
 */
router.get('/return/success', pagoController.manejarRetornoExitoso);

/**
 * @swagger
 * /api/payments/return/failure:
 *   get:
 *     summary: Maneja retornos fallidos desde MercadoPago
 *     tags: [Pagos]
 *     description: Endpoint para manejar redirecciones fallidas desde MercadoPago
 *     parameters:
 *       - in: query
 *         name: payment_id
 *         schema:
 *           type: string
 *         description: ID del pago en MercadoPago
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Estado del pago
 *       - in: query
 *         name: external_reference
 *         schema:
 *           type: string
 *         description: Referencia externa
 *     responses:
 *       302:
 *         description: Redirección al frontend con información del error
 */
router.get('/return/failure', pagoController.manejarRetornoFallido);

/**
 * @swagger
 * /api/payments/return/pending:
 *   get:
 *     summary: Maneja retornos pendientes desde MercadoPago
 *     tags: [Pagos]
 *     description: Endpoint para manejar redirecciones de pagos pendientes desde MercadoPago
 *     parameters:
 *       - in: query
 *         name: payment_id
 *         schema:
 *           type: string
 *         description: ID del pago en MercadoPago
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Estado del pago
 *       - in: query
 *         name: external_reference
 *         schema:
 *           type: string
 *         description: Referencia externa
 *     responses:
 *       302:
 *         description: Redirección al frontend con información del pago pendiente
 */
router.get('/return/pending', pagoController.manejarRetornoPendiente);

export default router;

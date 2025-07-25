import mercadoPagoService from '../service/mercadoPago.service.js';
import mercadoPagoConfig from '../../../config/mercadopago.js';
import Pago from '../model/pago.model.js';
import { validationResult } from 'express-validator';
import { successResponse, errorResponse } from '../../../utils/response.js';
import logger from '../../../utils/logger.js';

/**
 * Controlador para manejar todas las operaciones de pago con MercadoPago
 */

class PagoController {
  
  /**
   * Obtiene las credenciales públicas de MercadoPago para el frontend
   */
  async obtenerCredencialesPublicas(req, res) {
    try {
      const credenciales = mercadoPagoConfig.getPublicCredentials();
      const environmentInfo = mercadoPagoConfig.getEnvironmentInfo();
      
      return successResponse(res, 'Credenciales obtenidas exitosamente', {
        ...credenciales,
        environment: environmentInfo
      });
    } catch (error) {
      logger.error('Error obteniendo credenciales públicas', { error: error.message });
      return errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crea una preferencia de pago para cuota mensual
   */
  async crearPreferenciaCuota(req, res) {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validation('Datos de entrada inválidos', errors.array(), 400);
      }

      const usuarioId = req.user.userId;
      const { categoriaId, periodo, descuentoTipo } = req.body;

      // Obtener información adicional del request para auditoría
      const auditInfo = {
        ipUsuario: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      const resultado = await mercadoPagoService.crearPreferenciaCuota(
        usuarioId, 
        categoriaId, 
        periodo, 
        descuentoTipo
      );

      logger.info('Preferencia de cuota creada exitosamente', {
        usuario: usuarioId,
        preferenceId: resultado.preferenceId,
        monto: resultado.monto
      });

      return res.success('Preferencia de pago creada exitosamente', resultado);

    } catch (error) {
      logger.error('Error creando preferencia de cuota', {
        error: error.message,
        usuario: req.user?.id,
        body: req.body
      });

      if (error.message.includes('Ya existe un pago')) {
        return res.error(error.message, 409);
      }

      if (error.message.includes('no encontrada')) {
        return res.error(error.message, 404);
      }

      return errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crea una preferencia de pago anual
   */
  async crearPreferenciaPagoAnual(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Datos de entrada inválidos', 400, errors.array());
      }

      const usuarioId = req.user.userId;
      const { categoriaId, anio } = req.body;

      const resultado = await mercadoPagoService.crearPreferenciaAnual(
        usuarioId, 
        categoriaId, 
        anio
      );

      logger.info('Preferencia de pago anual creada exitosamente', {
        usuario: usuarioId,
        preferenceId: resultado.preferenceId,
        monto: resultado.monto,
        anio
      });

      return res.success('Preferencia de pago anual creada exitosamente', resultado);

    } catch (error) {
      logger.error('Error creando preferencia de pago anual', {
        error: error.message,
        usuario: req.user?.id,
        body: req.body
      });

      if (error.message.includes('no encontrada')) {
        return errorResponse(res, error.message, 404);
      }

      return errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Maneja las notificaciones webhook de MercadoPago
   */
  async manejarWebhook(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Webhook con datos inválidos', { errors: errors.array() });
        return res.status(400).json({ error: 'Datos inválidos' });
      }

      const resultado = await mercadoPagoService.procesarWebhook(
        req.headers,
        req.body,
        req.query
      );

      logger.info('Webhook procesado exitosamente', resultado);

      // MercadoPago espera un status 200 o 201
      return res.status(200).json({ 
        success: true, 
        processed: resultado.processed 
      });

    } catch (error) {
      logger.error('Error procesando webhook', {
        error: error.message,
        headers: req.headers,
        body: req.body,
        query: req.query
      });

      // Aún así devolver 200 para que MercadoPago no reintente
      return res.status(200).json({ 
        success: false, 
        error: 'Error interno' 
      });
    }
  }

  /**
   * Obtiene información de un pago específico
   */
  async obtenerPago(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'ID de pago inválido', 400, errors.array());
      }

      const { pagoId } = req.params;
      const usuarioId = req.user.id;
      const esAdmin = req.user.rol === 'ADMIN';

      const pago = await mercadoPagoService.obtenerPago(pagoId);

      if (!pago) {
        return errorResponse(res, 'Pago no encontrado', 404);
      }

      // Verificar que el usuario puede acceder a este pago
      if (!esAdmin && pago.usuario.toString() !== usuarioId) {
        return errorResponse(res, 'No autorizado para acceder a este pago', 403);
      }

      return successResponse(res, 'Pago obtenido exitosamente', pago);

    } catch (error) {
      logger.error('Error obteniendo pago', {
        error: error.message,
        pagoId: req.params.pagoId,
        usuario: req.user?.id
      });

      return errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene el historial de pagos del usuario actual
   */
  async obtenerHistorialPagos(req, res, next) {
    try {
      logger.info('Iniciando obtención de historial de pagos', {
        usuario: req.user?.userId,
        query: req.query
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error('Errores de validación en historial de pagos', { errors: errors.array() });
        return res.validation('Parámetros de consulta inválidos', errors.array());
      }

      const usuarioId = req.user.userId;
      const { estado, anio, mes, limit = 20, page = 1, tipoPeriodo } = req.query;

      const filtros = {};
      if (estado) filtros.estado = estado;
      if (anio) filtros.anio = parseInt(anio);
      if (mes) filtros.mes = parseInt(mes);
      if (tipoPeriodo) {
        // El frontend puede enviar 'mensual' o 'anual', mapear según sea necesario
        if (tipoPeriodo === 'mensual') {
          // Filtrar pagos que tengan mes definido
          filtros['periodo.mes'] = { $exists: true };
        } else if (tipoPeriodo === 'anual') {
          // Filtrar pagos que NO tengan mes (pagos anuales)
          filtros['periodo.mes'] = { $exists: false };
        }
      }

      logger.info('Filtros aplicados para historial', { usuarioId, filtros });

      // Llamar al servicio con logs adicionales
      logger.info('Llamando a mercadoPagoService.obtenerHistorialUsuario...');
      const historial = await mercadoPagoService.obtenerHistorialUsuario(usuarioId, filtros);
      
      logger.info('Respuesta del servicio de historial', {
        usuarioId,
        tipoRespuesta: typeof historial,
        esArray: Array.isArray(historial),
        totalRegistros: historial?.length || 0,
        primerosElementos: historial?.slice(0, 2) || []
      });

      // Verificar si historial es null o undefined
      if (!historial) {
        logger.warn('El servicio retornó null/undefined para el historial');
        return res.success('Historial obtenido exitosamente', {
          data: [],
          pagination: {
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: 0
          }
        });
      }

      // Implementar paginación
      const inicio = (parseInt(page) - 1) * parseInt(limit);
      const fin = inicio + parseInt(limit);
      const pagosPaginados = historial.slice(inicio, fin);

      const resultado = {
        data: pagosPaginados,
        pagination: {
          total: historial.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(historial.length / parseInt(limit))
        }
      };

      logger.info('Enviando respuesta de historial', {
        totalPagos: resultado.data.length,
        paginacion: resultado.pagination
      });

      return res.success('Historial obtenido exitosamente', resultado);

    } catch (error) {
      logger.error('Error obteniendo historial de pagos', {
        error: error.message,
        stack: error.stack,
        usuario: req.user?.userId,
        query: req.query
      });

      next(error);
    }
  }

  /**
   * Consulta el estado actual de un pago
   */
  async consultarEstadoPago(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Parámetros de consulta inválidos', 400, errors.array());
      }

      const { paymentId, externalReference } = req.query;
      const usuarioId = req.user.id;

      let pago;
      if (paymentId) {
        pago = await Pago.findOne({ 'mercadoPago.paymentId': paymentId });
      } else if (externalReference) {
        pago = await Pago.findOne({ 'mercadoPago.externalReference': externalReference });
      }

      if (!pago) {
        return errorResponse(res, 'Pago no encontrado', 404);
      }

      // Verificar autorización
      if (pago.usuario.toString() !== usuarioId && req.user.rol !== 'ADMIN') {
        return errorResponse(res, 'No autorizado', 403);
      }

      return successResponse(res, 'Estado del pago obtenido exitosamente', {
        pagoId: pago._id,
        estado: pago.estado,
        estadoDetalle: pago.mercadoPago.statusDetail,
        monto: pago.montos.final,
        fechaCreacion: pago.auditoria.fechaCreacion,
        fechaActualizacion: pago.auditoria.fechaActualizacion
      });

    } catch (error) {
      logger.error('Error consultando estado de pago', {
        error: error.message,
        query: req.query,
        usuario: req.user?.id
      });

      return errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene estadísticas de pagos (solo para administradores)
   */
  async obtenerEstadisticas(req, res) {
    try {
      // Verificar permisos de administrador
      if (req.user.rol !== 'ADMIN') {
        return errorResponse(res, 'No autorizado - Se requieren permisos de administrador', 403);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Parámetros de consulta inválidos', 400, errors.array());
      }

      const { fechaInicio, fechaFin, estado, categoriaId } = req.query;

      const filtros = {};
      if (fechaInicio && fechaFin) {
        filtros['auditoria.fechaCreacion'] = {
          $gte: new Date(fechaInicio),
          $lte: new Date(fechaFin)
        };
      }
      if (estado) filtros.estado = estado;
      if (categoriaId) filtros.categoria = categoriaId;

      const estadisticas = await mercadoPagoService.obtenerEstadisticas(filtros);

      return successResponse(res, 'Estadísticas obtenidas exitosamente', estadisticas);

    } catch (error) {
      logger.error('Error obteniendo estadísticas', {
        error: error.message,
        query: req.query,
        usuario: req.user?.id
      });

      return errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Endpoint para manejar retornos exitosos desde MercadoPago
   */
  async manejarRetornoExitoso(req, res) {
    try {
      const { payment_id, status, external_reference } = req.query;

      logger.info('Retorno exitoso desde MercadoPago', {
        payment_id,
        status,
        external_reference
      });

      // Aquí podrías redirigir al frontend con información del pago
      const redirectUrl = `${process.env.MP_SUCCESS_URL}?payment_id=${payment_id}&status=${status}&external_reference=${external_reference}`;
      
      return res.redirect(redirectUrl);

    } catch (error) {
      logger.error('Error manejando retorno exitoso', {
        error: error.message,
        query: req.query
      });

      const errorUrl = `${process.env.MP_FAILURE_URL}?error=processing_error`;
      return res.redirect(errorUrl);
    }
  }

  /**
   * Endpoint para manejar retornos fallidos desde MercadoPago
   */
  async manejarRetornoFallido(req, res) {
    try {
      const { payment_id, status, external_reference } = req.query;

      logger.warn('Retorno fallido desde MercadoPago', {
        payment_id,
        status,
        external_reference
      });

      const redirectUrl = `${process.env.MP_FAILURE_URL}?payment_id=${payment_id}&status=${status}&external_reference=${external_reference}`;
      
      return res.redirect(redirectUrl);

    } catch (error) {
      logger.error('Error manejando retorno fallido', {
        error: error.message,
        query: req.query
      });

      const errorUrl = `${process.env.MP_FAILURE_URL}?error=unknown_error`;
      return res.redirect(errorUrl);
    }
  }

  /**
   * Endpoint para manejar retornos pendientes desde MercadoPago
   */
  async manejarRetornoPendiente(req, res) {
    try {
      const { payment_id, status, external_reference } = req.query;

      logger.info('Retorno pendiente desde MercadoPago', {
        payment_id,
        status,
        external_reference
      });

      const redirectUrl = `${process.env.MP_PENDING_URL}?payment_id=${payment_id}&status=${status}&external_reference=${external_reference}`;
      
      return res.redirect(redirectUrl);

    } catch (error) {
      logger.error('Error manejando retorno pendiente', {
        error: error.message,
        query: req.query
      });

      const errorUrl = `${process.env.MP_FAILURE_URL}?error=processing_error`;
      return res.redirect(errorUrl);
    }
  }

  /**
   * Crea un pago QR para mostrar en pantalla
   */
  async crearPagoQR(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Datos de entrada inválidos', 400, errors.array());
      }

      const usuarioId = req.user.userId;
      const { categoriaId, tipoPago, periodo } = req.body;

      const resultado = await mercadoPagoService.crearPagoQR(
        usuarioId, 
        categoriaId, 
        tipoPago,
        periodo
      );

      logger.info('Pago QR creado exitosamente', {
        usuario: usuarioId,
        preferenceId: resultado.preferenceId,
        monto: resultado.monto,
        tipo: tipoPago
      });

      return res.success('Pago QR creado exitosamente', resultado);

    } catch (error) {
      logger.error('Error creando pago QR', {
        error: error.message,
        usuario: req.user?.id,
        body: req.body
      });

      if (error.message.includes('Ya existe un pago')) {
        return errorResponse(res, error.message, 409);
      }

      if (error.message.includes('no encontrada')) {
        return errorResponse(res, error.message, 404);
      }

      return errorResponse(res, 'Error interno del servidor', 500);
    }
  }
}

export default new PagoController();

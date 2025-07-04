import { Preference, Payment, Order } from 'mercadopago';
import mercadoPagoConfig from '../../../config/mercadopago.js';
import Pago from '../model/pago.model.js';
import Categoria from '../../categoria/model/categoria.model.js';
import logger from '../../../utils/logger.js';
import crypto from 'crypto';
import * as userService from '../../user/service/user.service.js';

/**
 * Servicio para manejar todas las operaciones con MercadoPago
 */

class MercadoPagoService {
  constructor() {
    this.client = mercadoPagoConfig.getClient();
    this.preferenceAPI = new Preference(this.client);
    this.paymentAPI = new Payment(this.client);
    this.orderAPI = new Order(this.client);
  }

  /**
   * Crea una preferencia de pago para una cuota mensual
   */
  async crearPreferenciaCuota(usuarioId, categoriaId, periodoData, descuentoTipo = null) {
    // Validar y obtener datos
    const categoria = await Categoria.findById(categoriaId);
    if (!categoria) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      throw err;
    }

    // Verificar si ya existe un pago para este período
    const pagoExistente = await this.verificarPagoExistente(usuarioId, categoriaId, periodoData);
    if (pagoExistente) {
      const err = new Error(`Ya existe un pago para el período ${periodoData.mes}/${periodoData.anio}`);
      err.statusCode = 409;
      err.code = 'PAGO_DUPLICADO_PERIODO';
      throw err;
    }

    // Calcular montos
    const montoOriginal = categoria.precio.cuotaMensual;
    const descuento = descuentoTipo != null ? 
      (montoOriginal * categoria.precio.descuentos[descuentoTipo] / 100) : 0;
    const montoFinal = montoOriginal - descuento;

    // Generar referencia externa única
    const externalReference = this.generarReferenciaExterna(usuarioId, 'CUOTA', periodoData);

    // Crear registro de pago en la base de datos
    const nuevoPago = new Pago({
      usuario: usuarioId,
      categoria: categoriaId,
      tipo: 'PAGO_CUOTA',
      periodo: periodoData,
      montos: {
        original: montoOriginal,
        descuentos: descuento,
        final: montoFinal,
        comision: 0 // Se calculará después del pago
      },
      estado: 'PENDIENTE',
      mercadoPago: {
        status: 'PENDIENTE',
        externalReference,
        description: `Cuota ${periodoData.mes}/${periodoData.anio} - ${categoria.nombre}`,
        urls: mercadoPagoConfig.getUrls()
      },
      auditoria: {
        creadoPor: usuarioId
      }
    });

    await nuevoPago.save();

    // Obtener email real del usuario
    let userEmail = 'usuario@example.com';
    try {
      const user = await userService.getUser(usuarioId);
      if (user) userEmail = user.persona?.email;
    } catch (e) {
      logger.warn('No se pudo obtener el email real del usuario, se usará uno genérico', { usuarioId, error: e.message });
    }

    // Crear preferencia en MercadoPago (solo campos recomendados y seguros)
    const preferenceData = {
      items: [{
        title: `Cuota ${periodoData.mes}/${periodoData.anio} - ${categoria.nombre}`,
        description: `Pago de cuota mensual - Categoría: ${categoria.nombre}`,
        quantity: 1,
        unit_price: montoFinal,
        currency_id: 'ARS'
      }],
      payer: {
        email: userEmail
      },
      external_reference: externalReference,
      back_urls: mercadoPagoConfig.getUrls(),
      notification_url: mercadoPagoConfig.getNotificationUrl ? mercadoPagoConfig.getNotificationUrl() : undefined,
      metadata: {
        usuario_id: usuarioId.toString(),
        categoria_id: categoriaId.toString(),
        pago_id: nuevoPago._id.toString(),
        tipo_pago: 'CUOTA_MENSUAL',
        periodo: `${periodoData.mes}/${periodoData.anio}`,
        monto_original: montoOriginal,
        descuento_aplicado: descuento
      }
    };
    // Elimina notification_url si no está definida
    if (!preferenceData.notification_url) delete preferenceData.notification_url;
    logger.debug('Preference Data enviada a MercadoPago', { preferenceData });
    const preference = await this.preferenceAPI.create({ body: preferenceData });

    // Actualizar el pago con el ID de la preferencia
    nuevoPago.mercadoPago.preferenceId = preference.id;
    await nuevoPago.save();

    logger.info(`Preferencia creada exitosamente`, {
      preferenceId: preference.id,
      pagoId: nuevoPago._id,
      usuario: usuarioId,
      monto: montoFinal
    });

    return {
      preferenceId: preference.id,
      pagoId: nuevoPago._id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      monto: montoFinal,
      categoria: categoria.nombre,
      periodo: `${periodoData.mes}/${periodoData.anio}`
    };
  }

  /**
   * Crea una preferencia para pago anual con descuento
   */
  /**
   * Crea una preferencia de pago anual (estructura similar a crearPreferenciaCuota)
   */
  async crearPreferenciaAnual(usuarioId, categoriaId, anio, descuentoTipo = null) {
    // Validar y obtener datos
    const categoria = await Categoria.findById(categoriaId);
    if (!categoria) {
      const err = new Error('Categoría no encontrada');
      err.statusCode = 404;
      throw err;
    }

    // Verificar si ya existe un pago anual para este año
    const pagoExistente = await Pago.findOne({
      usuario: usuarioId,
      categoria: categoriaId,
      'periodo.anio': anio,
      tipo: 'PAGO_ANUAL',
      estado: { $in: ['PENDIENTE', 'APROBADO', 'EN_PROCESO'] },
      deletedAt: null
    });
    if (pagoExistente) {
      const err = new Error(`Ya existe un pago anual para el año ${anio}`);
      err.statusCode = 409;
      err.code = 'PAGO_DUPLICADO_ANUAL';
      throw err;
    }

    // Calcular montos
    const montoMensual = categoria.precio.cuotaMensual;
    const montoAnualSinDescuento = montoMensual * 12;
    let descuento = 0;
    let descuentoAnual = 0;
    if (descuentoTipo && categoria.precio.descuentos[descuentoTipo]) {
      descuentoAnual = categoria.precio.descuentos[descuentoTipo];
      descuento = montoAnualSinDescuento * descuentoAnual / 100;
    } else if (typeof categoria.precio.descuentos.pagoAnual === 'number') {
      descuentoAnual = categoria.precio.descuentos.pagoAnual;
      descuento = montoAnualSinDescuento * descuentoAnual / 100;
    } else {
      descuentoAnual = 10;
      descuento = montoAnualSinDescuento * 0.10;
    }
    const montoFinal = montoAnualSinDescuento - descuento;

    // Generar referencia externa única
    const externalReference = this.generarReferenciaExterna(usuarioId, 'ANUAL', { anio });

    // Crear registro de pago en la base de datos
    const nuevoPago = new Pago({
      usuario: usuarioId,
      categoria: categoriaId,
      tipo: 'PAGO_ANUAL',
      periodo: { mes: 1, anio }, // Enero como mes de referencia
      montos: {
        original: montoAnualSinDescuento,
        descuentos: descuento,
        final: montoFinal,
        comision: 0 // Se calculará después del pago
      },
      estado: 'PENDIENTE',
      mercadoPago: {
        status: 'PENDIENTE',
        externalReference,
        description: `Pago Anual ${anio} - ${categoria.nombre}`,
        urls: mercadoPagoConfig.getUrls()
      },
      auditoria: {
        creadoPor: usuarioId
      }
    });

    await nuevoPago.save();

    // Obtener email real del usuario
    let userEmail = 'usuario@example.com';
    try {
      const user = await userService.getUser(usuarioId);
      if (user) userEmail = user.persona?.email;
    } catch (e) {
      logger.warn('No se pudo obtener el email real del usuario, se usará uno genérico', { usuarioId, error: e.message });
    }

    // Crear preferencia en MercadoPago (solo campos recomendados y seguros)
    const preferenceData = {
      items: [{
        title: `Pago Anual ${anio} - ${categoria.nombre}`,
        description: `Pago anual completo con ${descuentoAnual}% de descuento`,
        quantity: 1,
        unit_price: montoFinal,
        currency_id: 'ARS'
      }],
      payer: {
        email: userEmail
      },
      external_reference: externalReference,
      back_urls: mercadoPagoConfig.getUrls(),
      notification_url: mercadoPagoConfig.getNotificationUrl ? mercadoPagoConfig.getNotificationUrl() : undefined,
      metadata: {
        usuario_id: usuarioId.toString(),
        categoria_id: categoriaId.toString(),
        pago_id: nuevoPago._id.toString(),
        tipo_pago: 'PAGO_ANUAL',
        anio: anio.toString(),
        descuento_porcentaje: descuentoAnual
      },
      payment_methods: {
        installments: 12 // Permitir hasta 12 cuotas
      }
    };
    if (!preferenceData.notification_url) delete preferenceData.notification_url;
    logger.debug('Preference Data enviada a MercadoPago (anual)', { preferenceData });
    const preference = await this.preferenceAPI.create({ body: preferenceData });

    // Actualizar el pago con el ID de la preferencia
    nuevoPago.mercadoPago.preferenceId = preference.id;
    await nuevoPago.save();

    logger.info(`Preferencia anual creada exitosamente`, {
      preferenceId: preference.id,
      pagoId: nuevoPago._id,
      usuario: usuarioId,
      monto: montoFinal
    });

    return {
      preferenceId: preference.id,
      pagoId: nuevoPago._id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      monto: montoFinal,
      descuentoPorcentaje: descuentoAnual,
      categoria: categoria.nombre,
      anio
    };
  }

  /**
   * Procesa las notificaciones webhook de MercadoPago
   */
  async procesarWebhook(headers, body, query) {
    try {
      // Validar la firma del webhook
      if (!this.validarFirmaWebhook(headers, body, query)) {
        throw new Error('Firma de webhook inválida');
      }

      const { type, data } = body;
      
      logger.info('Webhook recibido', {
        type,
        dataId: data?.id,
        query
      });

      switch (type) {
        case 'payment':
          return await this.procesarNotificacionPago(data.id);
        case 'order':
          return await this.procesarNotificacionOrder(data.id);
        default:
          logger.warn('Tipo de webhook no manejado', { type });
          return { processed: false, message: 'Tipo no manejado' };
      }

    } catch (error) {
      logger.error('Error procesando webhook', {
        error: error.message,
        headers,
        body
      });
      throw error;
    }
  }

  /**
   * Procesa notificación de pago
   */
  async procesarNotificacionPago(paymentId) {
    try {
      // Obtener información del pago desde MercadoPago
      const payment = await this.paymentAPI.get({ id: paymentId });
      
      if (!payment) {
        throw new Error(`Pago ${paymentId} no encontrado en MercadoPago`);
      }

      // Buscar el pago en nuestra base de datos
      const pagoLocal = await Pago.findOne({
        $or: [
          { 'mercadoPago.paymentId': paymentId },
          { 'mercadoPago.externalReference': payment.external_reference }
        ]
      });

      if (!pagoLocal) {
        logger.warn('Pago no encontrado en base de datos local', {
          paymentId,
          externalReference: payment.external_reference
        });
        return { processed: false, message: 'Pago no encontrado localmente' };
      }

      // Actualizar información del pago
      pagoLocal.mercadoPago.paymentId = paymentId;
      pagoLocal.mercadoPago.status = payment.status;
      pagoLocal.mercadoPago.statusDetail = payment.status_detail;
      pagoLocal.mercadoPago.transactionAmount = payment.transaction_amount;
      pagoLocal.mercadoPago.netReceivedAmount = payment.transaction_details?.net_received_amount;
      pagoLocal.mercadoPago.totalPaidAmount = payment.transaction_details?.total_paid_amount;

      // Actualizar método de pago
      if (payment.payment_method_id) {
        pagoLocal.mercadoPago.paymentMethod = {
          id: payment.payment_method_id,
          type: payment.payment_type_id,
          issuer: payment.issuer_id,
          installments: payment.installments,
          lastFourDigits: payment.card?.last_four_digits
        };
      }

      // Actualizar fechas
      if (payment.date_created) {
        pagoLocal.mercadoPago.fechaCreacion = new Date(payment.date_created);
      }
      if (payment.date_approved) {
        pagoLocal.mercadoPago.fechaAprobacion = new Date(payment.date_approved);
      }

      // Actualizar estado general
      pagoLocal.estado = this.mapearEstadoPago(payment.status);

      // Calcular y actualizar comisión si el pago fue aprobado
      if (payment.status === 'approved') {
        pagoLocal.montos.comision = pagoLocal.calcularComision();
      }

      // Agregar notificación webhook al historial
      pagoLocal.procesamiento.notificacionesWebhook.push({
        tipo: 'payment',
        datos: payment,
        procesado: true
      });

      await pagoLocal.save();

      logger.info('Pago actualizado exitosamente', {
        pagoId: pagoLocal._id,
        paymentId,
        nuevoEstado: pagoLocal.estado,
        monto: payment.transaction_amount
      });

      return {
        processed: true,
        pagoId: pagoLocal._id,
        estado: pagoLocal.estado,
        monto: payment.transaction_amount
      };

    } catch (error) {
      logger.error('Error procesando notificación de pago', {
        error: error.message,
        paymentId
      });
      throw error;
    }
  }

  /**
   * Procesa notificación de orden
   */
  async procesarNotificacionOrder(orderId) {
    try {
      const order = await this.orderAPI.get({ id: orderId });
      
      // Buscar el pago asociado
      const pagoLocal = await Pago.findOne({
        'mercadoPago.orderId': orderId
      });

      if (pagoLocal) {
        pagoLocal.procesamiento.notificacionesWebhook.push({
          tipo: 'order',
          datos: order,
          procesado: true
        });
        await pagoLocal.save();
      }

      return { processed: true, orderId };
    } catch (error) {
      logger.error('Error procesando notificación de orden', {
        error: error.message,
        orderId
      });
      throw error;
    }
  }

  /**
   * Verifica si ya existe un pago para un período específico
   */
  async verificarPagoExistente(usuarioId, categoriaId, periodo) {
    return await Pago.findOne({
      usuario: usuarioId,
      categoria: categoriaId,
      'periodo.mes': periodo.mes,
      'periodo.anio': periodo.anio,
      estado: { $in: ['PENDIENTE', 'APROBADO', 'EN_PROCESO'] },
      deletedAt: null
    });
  }

  /**
   * Genera una referencia externa única
   */
  generarReferenciaExterna(usuarioId, tipo, periodo) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    
    if (tipo === 'CUOTA') {
      return `CUOTA_${usuarioId}_${periodo.mes}_${periodo.anio}_${timestamp}_${random}`;
    } else if (tipo === 'ANUAL') {
      return `ANUAL_${usuarioId}_${periodo.anio}_${timestamp}_${random}`;
    }
    
    return `PAGO_${usuarioId}_${timestamp}_${random}`;
  }

  /**
   * Valida la firma del webhook
   */
  validarFirmaWebhook(headers, body, query) {
    try {
      const xSignature = headers['x-signature'];
      const xRequestId = headers['x-request-id'];
      const dataId = query['data.id'];

      if (!xSignature || !xRequestId || !dataId) {
        return false;
      }

      // Extraer timestamp y hash de la firma
      const parts = xSignature.split(',');
      let ts = null;
      let hash = null;

      for (const part of parts) {
        const [key, value] = part.split('=');
        if (key?.trim() === 'ts') {
          ts = value?.trim();
        } else if (key?.trim() === 'v1') {
          hash = value?.trim();
        }
      }

      if (!ts || !hash) {
        return false;
      }

      // Crear el manifest string
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

      // Calcular HMAC
      const secret = process.env.MP_WEBHOOK_SECRET;
      const expectedHash = crypto
        .createHmac('sha256', secret)
        .update(manifest)
        .digest('hex');

      return hash === expectedHash;
    } catch (error) {
      logger.error('Error validando firma webhook', { error: error.message });
      return false;
    }
  }

  /**
   * Mapea los estados de MercadoPago a nuestros estados locales
   */
  mapearEstadoPago(estadoMP) {
    const mapeo = {
      'pending': 'PENDIENTE',
      'approved': 'APROBADO', 
      'authorized': 'AUTORIZADO',
      'in_process': 'EN_PROCESO',
      'in_mediation': 'EN_MEDIACION',
      'rejected': 'RECHAZADO',
      'cancelled': 'CANCELADO',
      'refunded': 'REEMBOLSADO',
      'charged_back': 'REEMBOLSADO'
    };

    return mapeo[estadoMP] || 'PENDIENTE';
  }

  /**
   * Obtiene información de un pago por su ID
   */
  async obtenerPago(pagoId) {
    return await Pago.findById(pagoId)
      .populate('usuario', 'username persona')
      .populate('categoria', 'nombre tipo precio');
  }

  /**
   * Obtiene el historial de pagos de un usuario
   */
  async obtenerHistorialUsuario(usuarioId, filtros = {}) {
    return await Pago.buscarPorUsuario(usuarioId, filtros);
  }

  /**
   * Obtiene estadísticas de pagos
   */
  async obtenerEstadisticas(filtros = {}) {
    return await Pago.obtenerEstadisticas(filtros);
  }
}

export default new MercadoPagoService();

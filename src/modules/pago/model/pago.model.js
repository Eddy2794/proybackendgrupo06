import mongoose from 'mongoose';
import simpleSoftDelete from '../../../utils/simpleSoftDelete.js';

/**
 * Modelo para registrar los pagos de cuotas realizados a través de MercadoPago.
 * Mantiene un historial completo de todas las transacciones.
 */

const ESTADO_PAGO = [
  'PENDIENTE',      // Pago iniciado pero no completado
  'APROBADO',       // Pago exitoso
  'RECHAZADO',      // Pago rechazado
  'CANCELADO',      // Pago cancelado por el usuario
  'REEMBOLSADO',    // Pago reembolsado
  'EN_PROCESO',     // Pago en proceso de verificación
  'EN_MEDIACION',   // Pago en mediación
  'AUTORIZADO'      // Pago autorizado pero no capturado
];

const METODO_PAGO = [
  'CREDIT_CARD',    // Tarjeta de crédito
  'DEBIT_CARD',     // Tarjeta de débito
  'BANK_TRANSFER',  // Transferencia bancaria
  'CASH',           // Efectivo (Rapipago, Pago Fácil)
  'DIGITAL_WALLET', // Billetera digital
  'OTHER'           // Otros métodos
];

const TIPO_OPERACION = [
  'PAGO_CUOTA',     // Pago de cuota mensual
  'PAGO_INSCRIPCION', // Pago de inscripción
  'PAGO_ANUAL',     // Pago anual con descuento
  'REEMBOLSO',      // Reembolso
  'AJUSTE'          // Ajuste de cuenta
];

const pagoSchema = new mongoose.Schema({
  // Información del usuario y categoría
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'La referencia al usuario es requerida']
  },
  
  categoriaEscuela: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoriaEscuela',
    required: [true, 'La referencia a la categoría es requerida']
  },
  
  // Información del pago
  tipo: {
    type: String,
    enum: {
      values: TIPO_OPERACION,
      message: 'Tipo de operación no válido'
    },
    required: [true, 'El tipo de operación es requerido'],
    default: 'PAGO_CUOTA'
  },
  
  // Detalles del período de pago (para cuotas mensuales)
  periodo: {
    mes: {
      type: Number,
      min: 1,
      max: 12,
      required: function() {
        return this.tipo === 'PAGO_CUOTA' || this.tipo === 'PAGO_ANUAL';
      }
    },
    anio: {
      type: Number,
      min: 2020,
      max: 2100,
      required: function() {
        return this.tipo === 'PAGO_CUOTA' || this.tipo === 'PAGO_ANUAL';
      }
    }
  },
  
  // Información financiera
  montos: {
    original: {
      type: Number,
      required: [true, 'El monto original es requerido'],
      min: [0, 'El monto no puede ser negativo']
    },
    
    descuentos: {
      type: Number,
      default: 0,
      min: [0, 'Los descuentos no pueden ser negativos']
    },
    
    final: {
      type: Number,
      required: [true, 'El monto final es requerido'],
      min: [0, 'El monto final no puede ser negativo']
    },
    
    comision: {
      type: Number,
      default: 0,
      min: [0, 'La comisión no puede ser negativa']
    }
  },
  
  // Información de MercadoPago
  mercadoPago: {
    // ID único de la preferencia de MercadoPago
    preferenceId: {
      type: String
    },
    
    // ID del pago en MercadoPago
    paymentId: {
      type: String
    },
    
    // ID de la orden en MercadoPago  
    orderId: {
      type: String
    },
    
    // Estado del pago en MercadoPago
    status: {
      type: String,
      enum: ESTADO_PAGO,
      default: 'PENDIENTE'
    },
    
    // Detalle del estado
    statusDetail: {
      type: String
    },
    
    // Método de pago utilizado
    paymentMethod: {
      id: String,
      type: {
        type: String,
        enum: METODO_PAGO
      },
      issuer: String,        // Banco emisor
      installments: Number,  // Cuotas
      lastFourDigits: String // Últimos 4 dígitos de la tarjeta
    },
    
    // URLs de retorno
    urls: {
      success: String,
      failure: String,
      pending: String
    },
    
    // Datos de la transacción
    transactionAmount: Number,
    netReceivedAmount: Number,
    totalPaidAmount: Number,
    
    // Fechas importantes
    fechaCreacion: Date,
    fechaAprobacion: Date,
    fechaVencimiento: Date,
    
    // Información adicional de MercadoPago
    externalReference: String,
    description: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  
  // Estado general del pago
  estado: {
    type: String,
    enum: ESTADO_PAGO,
    default: 'PENDIENTE'
  },
  
  // Información de procesamiento
  procesamiento: {
    intentos: {
      type: Number,
      default: 1,
      min: 0
    },
    
    ultimoIntento: {
      type: Date,
      default: Date.now
    },
    
    notificacionesWebhook: [{
      fecha: {
        type: Date,
        default: Date.now
      },
      tipo: String,
      datos: mongoose.Schema.Types.Mixed,
      procesado: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Información de auditoría
  auditoria: {
    fechaCreacion: {
      type: Date,
      default: Date.now
    },
    
    fechaActualizacion: {
      type: Date,
      default: Date.now
    },
    
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    actualizadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // IP del usuario al momento del pago
    ipUsuario: String,
    
    // User agent del navegador
    userAgent: String
  },
  
  // Notas y observaciones
  notas: {
    usuario: String,      // Notas del usuario
    administrador: String, // Notas del administrador
    sistema: String       // Notas del sistema
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices compuestos para optimizar consultas
pagoSchema.index({ usuario: 1, estado: 1 });
pagoSchema.index({ 'periodo.anio': 1, 'periodo.mes': 1 });
pagoSchema.index({ 'mercadoPago.status': 1, 'auditoria.fechaCreacion': -1 });
pagoSchema.index({ tipo: 1, estado: 1 });
pagoSchema.index({ 'mercadoPago.paymentId': 1 }, { sparse: true });
pagoSchema.index({ 'mercadoPago.preferenceId': 1 }, { sparse: true });

// Plugin de soft delete
pagoSchema.plugin(simpleSoftDelete);

// Middleware pre-save
pagoSchema.pre('save', function(next) {
  // Actualizar fecha de modificación
  if (this.isModified() && !this.isNew) {
    this.auditoria.fechaActualizacion = new Date();
  }
  
  // Validar que el monto final sea correcto
  if (this.isModified('montos')) {
    const montoCalculado = this.montos.original - this.montos.descuentos;
    if (Math.abs(this.montos.final - montoCalculado) > 0.01) {
      return next(new Error('El monto final no coincide con el cálculo (original - descuentos)'));
    }
  }
  
  next();
});

// Middleware post-save para logging
pagoSchema.post('save', function(doc) {
  console.log(`Pago ${doc._id} guardado - Estado: ${doc.estado} - Usuario: ${doc.usuario}`);
});

// Métodos de instancia
pagoSchema.methods.actualizarEstado = function(nuevoEstado, detalles = {}) {
  this.estado = nuevoEstado;
  this.mercadoPago.status = nuevoEstado;
  
  if (detalles.statusDetail) {
    this.mercadoPago.statusDetail = detalles.statusDetail;
  }
  
  if (nuevoEstado === 'APROBADO' && !this.mercadoPago.fechaAprobacion) {
    this.mercadoPago.fechaAprobacion = new Date();
  }
  
  this.auditoria.fechaActualizacion = new Date();
  
  return this.save();
};

pagoSchema.methods.agregarNotificacionWebhook = function(tipo, datos) {
  this.procesamiento.notificacionesWebhook.push({
    tipo,
    datos,
    fecha: new Date()
  });
  
  return this.save();
};

pagoSchema.methods.esReembolsable = function() {
  return this.estado === 'APROBADO' && 
         this.tipo !== 'REEMBOLSO' && 
         !this.deletedAt;
};

pagoSchema.methods.calcularComision = function() {
  // Comisión básica de MercadoPago (esto debería venir de configuración)
  const comisionPorcentaje = 0.029; // 2.9%
  const comisionFija = 2.99; // $2.99 ARS
  
  return (this.montos.final * comisionPorcentaje) + comisionFija;
};

pagoSchema.methods.toJSON = function() {
  const pago = this.toObject();
  
  // Formatear montos para la respuesta
  pago.montosFormateados = {
    original: `$${pago.montos.original.toLocaleString('es-AR')}`,
    descuentos: `$${pago.montos.descuentos.toLocaleString('es-AR')}`,
    final: `$${pago.montos.final.toLocaleString('es-AR')}`,
    comision: `$${pago.montos.comision.toLocaleString('es-AR')}`
  };
  
  // Formatear período
  if (pago.periodo && pago.periodo.mes && pago.periodo.anio) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    pago.periodoFormateado = `${meses[pago.periodo.mes - 1]} ${pago.periodo.anio}`;
  }
  
  return pago;
};

// Métodos estáticos
pagoSchema.statics.buscarPorUsuario = function(usuarioId, opciones = {}) {
  const filtros = { usuario: usuarioId, deletedAt: null };
  
  if (opciones.estado) {
    filtros.estado = opciones.estado;
  }
  
  if (opciones.anio) {
    filtros['periodo.anio'] = opciones.anio;
  }
  
  if (opciones.mes) {
    filtros['periodo.mes'] = opciones.mes;
  }
  
  return this.find(filtros)
    .populate('categoriaEscuela', 'nombre tipo precio')
    .populate('usuario', 'username persona')
    .sort({ 'auditoria.fechaCreacion': -1 });
};

pagoSchema.statics.buscarPorPeriodo = function(anio, mes = null) {
  const filtros = { 'periodo.anio': anio, deletedAt: null };
  
  if (mes) {
    filtros['periodo.mes'] = mes;
  }
  
  return this.find(filtros)
    .populate('categoriaEscuela', 'nombre tipo precio')
    .populate('usuario', 'username persona')
    .sort({ 'auditoria.fechaCreacion': -1 });
};

pagoSchema.statics.obtenerEstadisticas = function(filtros = {}) {
  const pipeline = [
    { $match: { deletedAt: null, ...filtros } },
    {
      $group: {
        _id: '$estado',
        cantidad: { $sum: 1 },
        montoTotal: { $sum: '$montos.final' },
        montoPromedio: { $avg: '$montos.final' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Exportar constantes
export { ESTADO_PAGO, METODO_PAGO, TIPO_OPERACION };

const Pago = mongoose.model('Pago', pagoSchema);

export default Pago;

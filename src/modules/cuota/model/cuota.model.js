import mongoose from 'mongoose';
import simpleSoftDelete from '../../../utils/simpleSoftDelete.js';

const CUOTA_ESTADOS = ['PENDIENTE', 'PAGA', 'VENCIDA'];

const cuotaSchema = new mongoose.Schema({
  alumno_categoria_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AlumnoCategoria',
    required: true,
    index: true
  },
  mes: { 
    type: String, 
    required: true 
  },
  anio: { 
    type: Number, 
    required: true, 
    index: true 
  },
  monto: { 
    type: Number, 
    required: true 
  },
  estado: { 
    type: String, 
    enum: CUOTA_ESTADOS, 
    default: 'PENDIENTE', 
    index: true 
  },
  fecha_vencimiento: { 
    type: Date, 
    required: true 
  },
  fecha_pago: { 
    type: Date, 
    default: null 
  },
  metodo_pago: { 
    type: String, 
    default: '' 
  },
  descuento: { 
    type: Number, 
    default: 0 
  },
  recargo: { 
    type: Number, 
    default: 0 
  },
  observaciones: { 
    type: String, 
    default: '' 
  },
  comprobante_numero: { 
    type: String, 
    default: '' 
  },
  usuario_cobro: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  }
}, { timestamps: true });

// Virtual para obtener datos completos de la relación alumno-categoría
cuotaSchema.virtual('alumno_categoria_datos', {
  ref: 'AlumnoCategoria',
  localField: 'alumno_categoria_id',
  foreignField: '_id',
  justOne: true
});

// Virtual para calcular el total a pagar
cuotaSchema.virtual('total_a_pagar').get(function() {
  return (this.monto - (this.descuento || 0) + (this.recargo || 0));
});

// Remover campos no deseados del JSON response
cuotaSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Incluir virtuals al convertir a objeto o JSON
cuotaSchema.set('toObject', { virtuals: true });
cuotaSchema.set('toJSON', { virtuals: true });

// Plugin de soft delete
cuotaSchema.plugin(simpleSoftDelete);

// Índice único para evitar duplicidad de cuotas por periodo y alumno-categoría
cuotaSchema.index(
  { alumno_categoria_id: 1, anio: 1, mes: 1 },
  { unique: true, partialFilterExpression: { deleted: null } }
);

export default mongoose.model('Cuota', cuotaSchema); 
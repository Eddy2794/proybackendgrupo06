import mongoose from 'mongoose';
import simpleSoftDelete from '../../../utils/simpleSoftDelete.js';

// Constantes para el modelo
const NIVELES = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'COMPETITIVO'];
const TIPOS_CATEGORIA = ['INFANTIL', 'JUVENIL', 'COMPETITIVO', 'RECREATIVO'];
const ESTADOS_CATEGORIA = ['ACTIVA', 'INACTIVA', 'SUSPENDIDA'];
const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

const categoriaSchema = new mongoose.Schema({
  // Campos básicos
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    unique: true,
    trim: true,
    index: true
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  
  // Campos de edad estandarizados para MercadoPago
  edadMinima: {
    type: Number,
    required: [true, 'La edad mínima es requerida'],
    min: [3, 'La edad mínima debe ser al menos 3 años'],
    max: [100, 'La edad mínima no puede ser mayor a 100 años']
  },
  edadMaxima: {
    type: Number,
    required: [true, 'La edad máxima es requerida'],
    min: [3, 'La edad máxima debe ser al menos 3 años'],
    max: [100, 'La edad máxima no puede ser mayor a 100 años']
  },
  
  // Campos originales removidos - ahora son virtuales verdaderos
  
  // Tipo de categoría para MercadoPago
  tipo: {
    type: String,
    enum: {
      values: TIPOS_CATEGORIA,
      message: 'Tipo de categoría no válido'
    },
    required: [true, 'El tipo de categoría es requerido']
  },
  
  // Estado robusto para MercadoPago
  estado: {
    type: String,
    enum: {
      values: ESTADOS_CATEGORIA,
      message: 'Estado no válido'
    },
    default: 'ACTIVA',
    index: true
  },
  
  // Campo original activa removido - ahora es virtual verdadero
  
  // Estructura de precio para MercadoPago
  precio: {
    cuotaMensual: {
      type: Number,
      required: [true, 'La cuota mensual es requerida'],
      min: [0, 'La cuota mensual no puede ser negativa']
    },
    descuentos: {
      hermanos: {
        type: Number,
        default: 0,
        min: [0, 'El descuento no puede ser negativo'],
        max: [100, 'El descuento no puede ser mayor al 100%']
      },
      pagoAnual: {
        type: Number,
        default: 0,
        min: [0, 'El descuento no puede ser negativo'],
        max: [100, 'El descuento no puede ser mayor al 100%']
      },
      primeraVez: {
        type: Number,
        default: 0,
        min: [0, 'El descuento no puede ser negativo'],
        max: [100, 'El descuento no puede ser mayor al 100%']
      }
    }
  },
  
  // Campo original cuota_mensual removido - ahora es virtual verdadero
  
  // Configuración de cupos
  cupoMaximo: {
    type: Number,
    required: [true, 'El máximo de alumnos es requerido'],
    min: [1, 'Debe permitir al menos 1 alumno'],
    max: [100, 'No puede exceder 100 alumnos']
  },
  
  // Campo original max_alumnos removido - ahora es virtual verdadero
  
  // Horarios
  horarios: [{
    dia: {
      type: String,
      enum: {
        values: DIAS_SEMANA,
        message: 'Día de la semana no válido'
      },
      required: true
    },
    hora_inicio: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    },
    hora_fin: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    }
  }],
  
  // Configuración específica para MercadoPago
  configuracionPago: {
    permitePagoMensual: {
      type: Boolean,
      default: true
    },
    permitePagoAnual: {
      type: Boolean,
      default: true
    },
    requiereInscripcion: {
      type: Boolean,
      default: true
    }
  },
  
  // Campo nivel para compatibilidad
  nivel: {
    type: String,
    enum: {
      values: NIVELES,
      message: 'Nivel no válido'
    },
    default: 'PRINCIPIANTE'
  },
  
  // Metadatos de migración
  migracion: {
    fechaMigracion: Date,
    categoriaOriginalId: mongoose.Schema.Types.ObjectId,
    version: String
  }
}, {
  timestamps: true
});

// Índices adicionales para búsquedas eficientes
categoriaSchema.index({ edadMinima: 1, edadMaxima: 1 });
categoriaSchema.index({ estado: 1 });
categoriaSchema.index({ tipo: 1 });
categoriaSchema.index({ 'precio.cuotaMensual': 1 });
categoriaSchema.index({ nivel: 1 });

// Índices eliminados - ya no se necesitan campos de compatibilidad

// Virtual para rango de edad
categoriaSchema.virtual('rangoEdad').get(function() {
  return `${this.edadMinima} - ${this.edadMaxima} años`;
});

// Virtual para contar alumnos actuales (se implementará cuando se tenga el módulo alumno)
categoriaSchema.virtual('alumnosActuales').get(function() {
  // Por ahora retorna 0, se implementará cuando se tenga la relación con alumnos
  return 0;
});

// Virtual para verificar si tiene cupos disponibles
categoriaSchema.virtual('tieneCupos').get(function() {
  return this.alumnosActuales < this.cupoMaximo;
});

// Campos virtuales de compatibilidad eliminados - usar solo nomenclatura nueva

// Métodos de instancia para MercadoPago
categoriaSchema.methods.calcularPrecioConDescuento = function(tipoDescuento = null, meses = 1) {
  const precioBase = this.precio.cuotaMensual * meses;
  let descuento = 0;
  
  if (tipoDescuento && this.precio.descuentos[tipoDescuento]) {
    descuento = this.precio.descuentos[tipoDescuento];
  }
  
  const montoDescuento = (precioBase * descuento) / 100;
  return {
    precioBase,
    descuento,
    montoDescuento,
    precioFinal: precioBase - montoDescuento
  };
};

categoriaSchema.methods.esEdadValida = function(edad) {
  return edad >= this.edadMinima && edad <= this.edadMaxima;
};

categoriaSchema.methods.getInfoMercadoPago = function() {
  return {
    id: this._id,
    nombre: this.nombre,
    tipo: this.tipo,
    precio: this.precio,
    configuracion: this.configuracionPago
  };
};

// Métodos estáticos para búsquedas
categoriaSchema.statics.buscarPorTipo = function(tipo) {
  return this.find({ tipo, estado: 'ACTIVA', deletedAt: null });
};

categoriaSchema.statics.buscarPorRangoPrecio = function(minimo, maximo) {
  return this.find({
    'precio.cuotaMensual': { $gte: minimo, $lte: maximo },
    estado: 'ACTIVA',
    deletedAt: null
  });
};

categoriaSchema.statics.buscarPorEdad = function(edad) {
  return this.find({
    edadMinima: { $lte: edad },
    edadMaxima: { $gte: edad },
    estado: 'ACTIVA',
    deletedAt: null
  });
};

// Incluir virtuals en JSON
categoriaSchema.set('toJSON', { virtuals: true });
categoriaSchema.set('toObject', { virtuals: true });

// Middleware pre-save para validaciones adicionales
categoriaSchema.pre('save', function(next) {
  // Validar que edadMinima sea menor que edadMaxima
  if (this.edadMinima >= this.edadMaxima) {
    return next(new Error('La edad mínima debe ser menor que la edad máxima'));
  }
  
  // Capitalizar correctamente el nombre
  if (this.nombre) {
    this.nombre = this.nombre.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Validar estructura de precio
  if (this.precio && !this.precio.cuotaMensual) {
    return next(new Error('La cuota mensual es requerida en la estructura de precio'));
  }
  
  // Validar horarios
  if (this.horarios && this.horarios.length > 0) {
    for (let horario of this.horarios) {
      const inicio = horario.hora_inicio.split(':').map(Number);
      const fin = horario.hora_fin.split(':').map(Number);
      
      const minutosInicio = inicio[0] * 60 + inicio[1];
      const minutosFin = fin[0] * 60 + fin[1];
      
      
      if (minutosInicio >= minutosFin) {
        return next(new Error('La hora de inicio debe ser menor que la hora de fin'));
      }
    }
  }
  
  // Campos de compatibilidad ahora son virtuales - no necesitan sincronización
  
  next();
});

// Plugin SÚPER SIMPLE de soft delete
categoriaSchema.plugin(simpleSoftDelete);

export default mongoose.model('Categoria', categoriaSchema);
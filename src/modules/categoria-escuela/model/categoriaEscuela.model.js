import mongoose from 'mongoose';
import simpleSoftDelete from '../../../utils/simpleSoftDelete.js';

/**
 * Modelo para las categorías de la escuela de fútbol.
 * Define las diferentes categorías con sus precios de cuota mensual.
 */

const CATEGORIA_TYPES = [
  'INFANTIL', 'JUVENIL', 'COMPETITIVO', 'RECREATIVO', 'ENTRENAMIENTO'
];

const categoriaEscuelaSchema = new mongoose.Schema({
  // Información básica de la categoría
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    trim: true,
    unique: true,
    index: true
  },
  
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true
  },
  
  tipo: {
    type: String,
    enum: {
      values: CATEGORIA_TYPES,
      message: 'Tipo de categoría no válido'
    },
    required: [true, 'El tipo de categoría es requerido']
  },
  
  // Rango de edades
  edadMinima: {
    type: Number,
    required: [true, 'La edad mínima es requerida'],
    min: [3, 'La edad mínima no puede ser menor a 3 años'],
    max: [100, 'La edad mínima no puede ser mayor a 100 años']
  },
  
  edadMaxima: {
    type: Number,
    required: [true, 'La edad máxima es requerida'],
    min: [3, 'La edad máxima no puede ser menor a 3 años'],
    max: [100, 'La edad máxima no puede ser mayor a 100 años'],
    validate: {
      validator: function(value) {
        return value >= this.edadMinima;
      },
      message: 'La edad máxima debe ser mayor o igual a la edad mínima'
    }
  },
  
  // Configuración de precios
  precio: {
    cuotaMensual: {
      type: Number,
      required: [true, 'El precio de la cuota mensual es requerido'],
      min: [0, 'El precio no puede ser negativo'],
      validate: {
        validator: function(value) {
          return Number.isFinite(value) && value >= 0;
        },
        message: 'El precio debe ser un número válido mayor o igual a 0'
      }
    },
    
    // Descuentos opcionales
    descuentos: {
      hermanos: {
        type: Number,
        default: 0,
        min: [0, 'El descuento no puede ser negativo'],
        max: [100, 'El descuento no puede ser mayor a 100%']
      },
      
      pagoAnual: {
        type: Number,
        default: 0,
        min: [0, 'El descuento no puede ser negativo'],
        max: [100, 'El descuento no puede ser mayor a 100%']
      }
    }
  },
  
  // Configuración operativa
  estado: {
    type: String,
    enum: ['ACTIVA', 'INACTIVA', 'SUSPENDIDA'],
    default: 'ACTIVA'
  },
  
  cupoMaximo: {
    type: Number,
    default: null,
    min: [1, 'El cupo máximo debe ser al menos 1']
  },
  
  // Horarios y días de entrenamiento
  horarios: [{
    dia: {
      type: String,
      enum: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'],
      required: true
    },
    horaInicio: {
      type: String,
      required: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    },
    horaFin: {
      type: String,
      required: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    }
  }],
  
  // Metadatos
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
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para optimizar consultas
categoriaEscuelaSchema.index({ tipo: 1, estado: 1 });
categoriaEscuelaSchema.index({ edadMinima: 1, edadMaxima: 1 });
categoriaEscuelaSchema.index({ 'precio.cuotaMensual': 1 });

// Plugin de soft delete
categoriaEscuelaSchema.plugin(simpleSoftDelete);

// Middleware pre-save para actualizar fecha de modificación
categoriaEscuelaSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.fechaActualizacion = new Date();
  }
  next();
});

// Validación personalizada para horarios
categoriaEscuelaSchema.pre('save', function(next) {
  if (this.horarios && this.horarios.length > 0) {
    for (const horario of this.horarios) {
      const inicio = new Date(`2000-01-01T${horario.horaInicio}:00`);
      const fin = new Date(`2000-01-01T${horario.horaFin}:00`);
      
      if (fin <= inicio) {
        return next(new Error('La hora de fin debe ser posterior a la hora de inicio'));
      }
    }
  }
  next();
});

// Métodos de instancia
categoriaEscuelaSchema.methods.calcularPrecioConDescuento = function(tipoDescuento = null) {
  let precio = this.precio.cuotaMensual;
  
  if (tipoDescuento && this.precio.descuentos[tipoDescuento]) {
    const descuento = this.precio.descuentos[tipoDescuento];
    precio = precio * (1 - descuento / 100);
  }
  
  return Math.round(precio * 100) / 100; // Redondear a 2 decimales
};

categoriaEscuelaSchema.methods.estaEnRangoEdad = function(edad) {
  return edad >= this.edadMinima && edad <= this.edadMaxima;
};

categoriaEscuelaSchema.methods.toJSON = function() {
  const categoria = this.toObject();
  
  // Agregar campos calculados
  categoria.precioFormateado = {
    cuotaMensual: `$${categoria.precio.cuotaMensual.toLocaleString('es-AR')}`,
    conDescuentoHermanos: `$${this.calcularPrecioConDescuento('hermanos').toLocaleString('es-AR')}`,
    conDescuentoAnual: `$${this.calcularPrecioConDescuento('pagoAnual').toLocaleString('es-AR')}`
  };
  
  categoria.rangoEdad = `${categoria.edadMinima} - ${categoria.edadMaxima} años`;
  
  return categoria;
};

// Métodos estáticos
categoriaEscuelaSchema.statics.buscarPorEdad = function(edad) {
  return this.find({
    edadMinima: { $lte: edad },
    edadMaxima: { $gte: edad },
    estado: 'ACTIVA',
    deletedAt: null
  });
};

categoriaEscuelaSchema.statics.buscarPorTipo = function(tipo) {
  return this.find({
    tipo: tipo,
    estado: 'ACTIVA',
    deletedAt: null
  });
};

categoriaEscuelaSchema.statics.buscarPorRangoPrecio = function(precioMin, precioMax) {
  return this.find({
    'precio.cuotaMensual': { $gte: precioMin, $lte: precioMax },
    estado: 'ACTIVA',
    deletedAt: null
  });
};

// Exportar constantes junto con el modelo
export { CATEGORIA_TYPES };

const CategoriaEscuela = mongoose.model('CategoriaEscuela', categoriaEscuelaSchema);

export default CategoriaEscuela;

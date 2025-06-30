import mongoose from 'mongoose';
import simpleSoftDelete from '../../../utils/simpleSoftDelete.js';

// Constantes para el modelo
const NIVELES = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'COMPETITIVO'];
const ESTADOS_CATEGORIA = ['ACTIVA', 'INACTIVA'];
const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    unique: true,
    trim: true,
    index: true
  },
  edad_min: {
    type: Number,
    required: [true, 'La edad mínima es requerida'],
    min: [3, 'La edad mínima debe ser al menos 3 años'],
    max: [100, 'La edad mínima no puede ser mayor a 100 años']
  },
  edad_max: {
    type: Number,
    required: [true, 'La edad máxima es requerida'],
    min: [3, 'La edad máxima debe ser al menos 3 años'],
    max: [100, 'La edad máxima no puede ser mayor a 100 años']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  activa: {
    type: Boolean,
    default: true,
    index: true
  },
  cuota_mensual: {
    type: Number,
    required: [true, 'La cuota mensual es requerida'],
    min: [0, 'La cuota mensual no puede ser negativa']
  },
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
  max_alumnos: {
    type: Number,
    required: [true, 'El máximo de alumnos es requerido'],
    min: [1, 'Debe permitir al menos 1 alumno'],
    max: [100, 'No puede exceder 100 alumnos']
  },
  nivel: {
    type: String,
    enum: {
      values: NIVELES,
      message: 'Nivel no válido'
    },
    required: [true, 'El nivel es requerido'],
    default: 'PRINCIPIANTE'
  }
}, {
  timestamps: true
});

// Índices adicionales para búsquedas eficientes
categoriaSchema.index({ edad_min: 1, edad_max: 1 });
categoriaSchema.index({ activa: 1 });
categoriaSchema.index({ nivel: 1 });
categoriaSchema.index({ cuota_mensual: 1 });

// Virtual para rango de edad
categoriaSchema.virtual('rangoEdad').get(function() {
  return `${this.edad_min} - ${this.edad_max} años`;
});

// Virtual para contar alumnos actuales (se implementará cuando se tenga el módulo alumno)
categoriaSchema.virtual('alumnosActuales').get(function() {
  // Por ahora retorna 0, se implementará cuando se tenga la relación con alumnos
  return 0;
});

// Virtual para verificar si tiene cupos disponibles
categoriaSchema.virtual('tieneCupos').get(function() {
  return this.alumnosActuales < this.max_alumnos;
});

// Incluir virtuals en JSON
categoriaSchema.set('toJSON', { virtuals: true });
categoriaSchema.set('toObject', { virtuals: true });

// Middleware pre-save para validaciones adicionales
categoriaSchema.pre('save', function(next) {
  // Validar que edad_min sea menor que edad_max
  if (this.edad_min >= this.edad_max) {
    return next(new Error('La edad mínima debe ser menor que la edad máxima'));
  }
  
  // Capitalizar correctamente el nombre
  this.nombre = this.nombre.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
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
  
  next();
});

// Plugin SÚPER SIMPLE de soft delete
categoriaSchema.plugin(simpleSoftDelete);

export default mongoose.model('Categoria', categoriaSchema);
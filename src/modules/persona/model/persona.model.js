import mongoose from 'mongoose';
import simpleSoftDelete from '../../../utils/simpleSoftDelete.js';

// Constantes para el modelo
const TIPOS_DOCUMENTO = ['DNI', 'PASAPORTE', 'CEDULA', 'CARNET_EXTRANJERIA'];
const GENEROS = ['MASCULINO', 'FEMENINO', 'OTRO', 'PREFIERO_NO_DECIR'];
const ESTADOS_PERSONA = ['ACTIVO', 'INACTIVO'];

const personaSchema = new mongoose.Schema({
  nombres: {
    type: String,
    required: [true, 'Los nombres son requeridos'],
    trim: true
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son requeridos'],
    trim: true
  },
  tipoDocumento: {
    type: String,
    required: [true, 'El tipo de documento es requerido'],
    enum: {
      values: TIPOS_DOCUMENTO,
      message: 'Tipo de documento no válido'
    },
    default: 'DNI'
  },
  numeroDocumento: {
    type: String,
    required: [true, 'El número de documento es requerido'],
    unique: true,
    trim: true
  },
  fechaNacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es requerida']
  },
  genero: {
    type: String,
    enum: {
      values: GENEROS,
      message: 'Género no válido'
    },
    required: [true, 'El género es requerido']
  },
  telefono: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true
  },
  direccion: {
    calle: {
      type: String,
      trim: true
    },
    ciudad: {
      type: String,
      trim: true
    },
    departamento: {
      type: String,
      trim: true
    },
    codigoPostal: {
      type: String,
      trim: true
    },
    pais: {
      type: String,
      trim: true,
      default: 'Argentina'
    }
  },
  estado: {
    type: String,
    enum: {
      values: ESTADOS_PERSONA,
      message: 'Estado no válido'
    },
    default: 'ACTIVO'
  }
}, {
  timestamps: true
});

// Índices adicionales para búsquedas eficientes (no duplicar los unique)
personaSchema.index({ nombres: 1, apellidos: 1 });
personaSchema.index({ estado: 1 });
personaSchema.index({ fechaNacimiento: 1 });

// Virtual para nombre completo
personaSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombres} ${this.apellidos}`;
});

// Virtual para edad
personaSchema.virtual('edad').get(function() {
  const hoy = new Date();
  const nacimiento = new Date(this.fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const diaActual = hoy.getDate();
  
  if (mesActual < nacimiento.getMonth() || 
      (mesActual === nacimiento.getMonth() && diaActual < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
});

// Incluir virtuals en JSON
personaSchema.set('toJSON', { virtuals: true });
personaSchema.set('toObject', { virtuals: true });

// Middleware pre-save para validaciones adicionales
personaSchema.pre('save', function(next) {
  // Capitalizar correctamente nombres y apellidos (primera letra de cada palabra)
  this.nombres = this.nombres.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  this.apellidos = this.apellidos.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
    next();
});

// Plugin SÚPER SIMPLE de soft delete
personaSchema.plugin(simpleSoftDelete);

export default mongoose.model('Persona', personaSchema);

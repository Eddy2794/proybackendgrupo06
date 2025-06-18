import mongoose from 'mongoose';

const personaSchema = new mongoose.Schema({
  nombres: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  apellidos: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  tipoDocumento: {
    type: String,
    required: true,
    enum: ['DNI', 'PASAPORTE', 'CEDULA', 'CARNET_EXTRANJERIA'],
    default: 'DNI'
  },
  numeroDocumento: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 6,
    maxlength: 20
  },
  fechaNacimiento: {
    type: Date,
    required: true,
    validate: {
      validator: function(fecha) {
        const hoy = new Date();
        const edad = hoy.getFullYear() - fecha.getFullYear();
        return edad >= 13 && edad <= 120; // Edad mínima 13 años
      },
      message: 'La edad debe estar entre 13 y 120 años'
    }
  },
  genero: {
    type: String,
    enum: ['MASCULINO', 'FEMENINO', 'OTRO', 'PREFIERO_NO_DECIR'],
    required: true
  },
  telefono: {
    type: String,
    trim: true,
    minlength: 7,
    maxlength: 15,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Formato de teléfono inválido'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Formato de email inválido'
    }
  },
  direccion: {
    calle: {
      type: String,
      trim: true,
      maxlength: 100
    },
    ciudad: {
      type: String,
      trim: true,
      maxlength: 50
    },
    departamento: {
      type: String,
      trim: true,
      maxlength: 50
    },
    codigoPostal: {
      type: String,
      trim: true,
      maxlength: 10
    },
    pais: {
      type: String,
      trim: true,
      maxlength: 50,
      default: 'Perú'
    }
  },
  estado: {
    type: String,
    enum: ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'],
    default: 'ACTIVO'
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
personaSchema.index({ numeroDocumento: 1 });
personaSchema.index({ email: 1 });
personaSchema.index({ nombres: 1, apellidos: 1 });

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

export default mongoose.model('Persona', personaSchema);

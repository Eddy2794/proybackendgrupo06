import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import simpleSoftDelete from '../../../utils/simpleSoftDelete.js';

// Constantes para el modelo
const USER_ROLES = ['USER', 'ADMIN', 'MODERATOR'];
const USER_STATES = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'PENDIENTE_VERIFICACION'];
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos
const BCRYPT_ROUNDS = 12;

const userSchema = new mongoose.Schema({
  // Referencia a la persona (tabla padre)
  persona: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Persona',
    required: [true, 'La referencia a persona es requerida'],
    unique: true
  },
  
  // Datos específicos del usuario
  username: {
    type: String,
    required: [true, 'El username es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  
  password: {
    type: String,
    required: [true, 'La contraseña es requerida']
  },
  
  // Configuraciones del usuario
  rol: {
    type: String,
    enum: {
      values: USER_ROLES,
      message: 'Rol no válido'
    },
    default: 'USER'
  },
  
  estado: {
    type: String,
    enum: {
      values: USER_STATES,
      message: 'Estado no válido'
    },
    default: 'ACTIVO',
    index: true
  },
  
  configuraciones: {
    notificacionesEmail: {
      type: Boolean,
      default: true
    },
    notificacionesPush: {
      type: Boolean,
      default: false
    },
    perfilPublico: {
      type: Boolean,
      default: false
    },
    temaOscuro: {
      type: Boolean,
      default: false
    }
  },
  
  // Información de autenticación
  ultimoLogin: {
    type: Date,
    index: true
  },
  
  intentosLogin: {
    type: Number,
    default: 0,
    min: [0, 'Los intentos de login no pueden ser negativos'],
    max: [MAX_LOGIN_ATTEMPTS, `No se pueden tener más de ${MAX_LOGIN_ATTEMPTS} intentos`]
  },
  
  bloqueadoHasta: {
    type: Date
  },
  
  tokenVerificacion: {
    type: String
  },
  
  emailVerificado: {
    type: Boolean,
    default: false
  },
  
  // Imagen de perfil en base64
  imagenPerfil: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        // Si no hay valor, es válido (imagen opcional)
        if (!v) return true;
        // Si hay valor, debe ser una cadena base64 válida para imagen
        return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(v);
      },
      message: 'La imagen de perfil debe ser un formato válido (JPEG, PNG, GIF, WEBP) en base64'
    }
  },
  
  tokenRecuperacion: {
    type: String
  },
  
  tokenRecuperacionExpira: {
    type: Date
  },
  
  // Historial de autenticación
  historialAuth: [{
    fechaLogin: {
      type: Date,
      default: Date.now
    },
    exitoso: {
      type: Boolean,
      required: true
    },
    metodo: {
      type: String,
      enum: ['credentials', 'google-oauth', 'google-oauth-register', 'dev-credentials'],
      required: true
    },
    userAgent: {
      type: String,
      default: 'Unknown'
    },
    ip: {
      type: String,
      default: '0.0.0.0'
    }
  }]
}, {
  timestamps: true
});

// Índices adicionales para búsquedas eficientes
userSchema.index({ createdAt: -1 });
userSchema.index({ 'configuraciones.perfilPublico': 1 });

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si el usuario está bloqueado
userSchema.methods.isBlocked = function() {
  return this.bloqueadoHasta && new Date() < this.bloqueadoHasta;
};

// Método para incrementar intentos de login
userSchema.methods.incrementLoginAttempts = async function() {
  this.intentosLogin += 1;
  
  // Si alcanza el máximo de intentos, bloquear por el tiempo configurado
  if (this.intentosLogin >= MAX_LOGIN_ATTEMPTS) {
    this.bloqueadoHasta = new Date(Date.now() + LOCKOUT_DURATION);
  }
  
  return this.save();
};

// Método para resetear intentos de login
userSchema.methods.resetLoginAttempts = async function() {
  this.intentosLogin = 0;
  this.bloqueadoHasta = undefined;
  this.ultimoLogin = new Date();
  return this.save();
};

// Virtual para obtener datos completos con persona
userSchema.virtual('datosCompletos', {
  ref: 'Persona',
  localField: 'persona',
  foreignField: '_id',
  justOne: true
});

// Remover password del JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.tokenVerificacion;
  delete user.tokenRecuperacion;
  delete user.tokenRecuperacionExpira;
  return user;
};

// Incluir virtuals en JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Plugin SÚPER SIMPLE de soft delete
userSchema.plugin(simpleSoftDelete);

export default mongoose.model('User', userSchema);
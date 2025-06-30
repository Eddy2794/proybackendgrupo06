import mongoose from 'mongoose';

const torneoCategoriaSchema = new mongoose.Schema({
    torneo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Torneo',
        required: [true, 'La referencia a torneo es requerida']
    },
    
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
        required: [true, 'La referencia a categoria es requerida']
    },
    
    max_participantes_categoria: {
        type: Number,
        required: [true, 'El máximo de participantes por categoría es requerido'],
        min: [1, 'El máximo de participantes debe ser mayor a 0']
    },
    
    costo_inscripcion_categoria: {
        type: Number,
        required: [true, 'El costo de inscripción por categoría es requerido'],
        min: [0, 'El costo de inscripción no puede ser negativo']
    },
    
    observaciones: {
        type: String,
        trim: true,
        maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
    },
    
    activa: {
        type: Boolean,
        default: true
    },
    
    fecha_inicio_inscripciones: {
        type: Date,
        required: [true, 'La fecha de inicio de inscripciones es requerida']
    },
    
    fecha_fin_inscripciones: {
        type: Date,
        required: [true, 'La fecha de fin de inscripciones es requerida'],
        validate: {
            validator: function(value) {
                return value > this.fecha_inicio_inscripciones;
            },
            message: 'La fecha de fin debe ser posterior a la fecha de inicio'
        }
    }
}, {
    timestamps: true
});

// Índice compuesto para evitar duplicados
torneoCategoriaSchema.index({ torneo: 1, categoria: 1 }, { unique: true });

export default mongoose.models.TorneoCategoria || mongoose.model('TorneoCategoria', torneoCategoriaSchema);
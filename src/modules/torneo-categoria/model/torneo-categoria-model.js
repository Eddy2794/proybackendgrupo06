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
    
    fecha_asignacion: {
        type: Date,
        required: [true, 'La fecha de asignación es requerida'],
        default: Date.now
    },

    observaciones: {
        type: String,
        trim: true,
        maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
    },

    estado: {
        type: String,
        enum: ['ACTIVO', 'INACTIVO'],
        default: 'ACTIVO'
    }
}, {
    timestamps: true
});

// Índice compuesto para evitar duplicados
torneoCategoriaSchema.index({ torneo: 1, categoria: 1 }, { unique: true });

export default mongoose.models.TorneoCategoria || mongoose.model('TorneoCategoria', torneoCategoriaSchema);
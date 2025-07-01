import mongoose from 'mongoose';

const profesorCategoriaSchema = new mongoose.Schema({
    profesor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profesor',
        required: [true, 'La referencia a profesor es requerida']
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
        minlength: 0,
        maxlength: 255
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.models.ProfesorCategoria || mongoose.model('ProfesorCategoria', profesorCategoriaSchema);
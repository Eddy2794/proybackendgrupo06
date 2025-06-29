import mongoose from 'mongoose';

const profesorSchema = new mongoose.Schema({
    persona: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Persona',
        required: [true, 'La referencia a persona es requerida'],
        unique: true
      },
    titulo: {
        type: String,
        required: [true, 'El titulo es requerido'],
        trim: true,
        minlength: 2,
        maxlength: 70
    },
    experiencia_anios: {
        type: Number,
        required: [true, 'La experiencia en años es requerida'],
        min: 0, 
        max: 50
    },
    fecha_contratacion: {
        type: Date,
        required: [true, 'La fecha de contratación es requerida']
    },
    salario: {
        type: Number,
        min: 0,
    },
    activo_laboral: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});

export default mongoose.models.Profesor || mongoose.model('Profesor', profesorSchema);
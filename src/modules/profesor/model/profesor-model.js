import mongoose from 'mongoose';

const profesorSchema = new mongoose.Schema({
    persona: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Persona',
        required: true,
        unique: true
      },
    titulo: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 70
    },
    experiencia_anios: {
        type: Number,
        required: true,
        min: 0, 
        max: 50
    },
    fecha_contratacion: {
        type: Date,
        required: true
    },
    salario: {
        type: Number,
        required: true,
        min: 0,
    },
    activo_laboral: {
        type: Boolean,
        required: true
    },
}, {
    timestamps: true
});

export default mongoose.models.Profesor || mongoose.model('Profesor', profesorSchema);
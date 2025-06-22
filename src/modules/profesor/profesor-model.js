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
        maxlength: 70,
        validate: {
            validator: function(v) {
                return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/.test(v);
            },
            message: 'El título solo puede contener letras, espacios, guiones y puntos'
        }
    },
    experiencia_anios: {
        type: Number,
        required: true,
        min: 0, 
        max: 50,
        validate: {
            validator: function(v) {
                return Number.isInteger(v) && v >= 0;
            },
            message: 'Los años de experiencia deben ser un número entero positivo'
        }
    },
    fecha_contratacion: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                const hoy = new Date();
                return v <= hoy;
            },
            message: 'La fecha de contratación no puede ser futura'
        }
    },
    salario: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(v) {
                return v > 0 && Number.isFinite(v);
            },
            message: 'El salario debe ser un número positivo válido'
        }
    },
    activo_laboral: {
        type: Boolean,
        required: true
    },
}, {
    timestamps: true
});

export default mongoose.models.Profesor || mongoose.model('Profesor', profesorSchema);
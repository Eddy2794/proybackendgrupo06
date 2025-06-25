import mongoose from 'mongoose';


const torneoSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        minlength: 2,
        maxlength: 70
    },
    descripcion: {
        type: String,
        required: [true, 'La descripcion es requerida'],
        trim: true,
        minlength: 2,
        maxlength: 70
    },
    lugar: {
        type: String,
        required: [true, 'El lugar es requerido'],
        minlength: 2,
        maxlength: 70
    },
    direccion: {
        type: String,
        required: [true, 'La direccion es requerida'],
        minlength: 2,
        maxlength: 70
    },
    organizador: {
        type: String,
        required: [true, 'El organizador es requerido'],
        minlength: 2,
        maxlength: 70
    },
    fecha_inicio: {
        type: Date,
        required: [true, 'La fecha de inicio es requerido']
    },
    fecha_fin: {
        type: Date,
        required: [true, 'La fecha de fin es requerido']
    },
    costo_inscripcion: {
        type: Number,
        required: [true, 'El costo de inscripcion es requerido'],
        min: 0
    },
    activo: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    })

export default mongoose.model('Torneo', torneoSchema);
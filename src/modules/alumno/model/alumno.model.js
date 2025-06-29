import mongoose from 'mongoose';
import simpleSoftDelete from '../../../utils/simpleSoftDelete.js';

const ALUMNO_ESTADOS = ['ACTIVO', 'INACTIVO'];

const alumnoSchema = new mongoose.Schema({
    // Referencia a la persona (tabla padre)
    persona: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Persona',
        required: true,
        unique: true
    },

    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Persona',
        required: true
    },


    // Datos específicos del Alumno
    numero_socio: {
        type: String,
        required: true,
        unique: true
    },

    observaciones_medicas: {
        type: String,
        required: false
    },

    contacto_emergencia: {
        type: String,
        required: true
    },

    telefono_emergencia: {
        type: String,
        required: true
    },

    autoriza_fotos: {
        type: Boolean,
        required: true
    },

    fecha_inscripcion: {
        type: Date,
        required: true
    },

    estado: {
        type: String,
        enum: {
            values: ALUMNO_ESTADOS,
            message: 'Estado no válido'
        },
        default: 'ACTIVO',
        index: true
    }
}, {
   timestamps: true
});

//Indice para búsquedas eficientes
alumnoSchema.index({ numero_socio: 1 });
alumnoSchema.index({ persona_id: 1 });

//virtual para obtener datos completos de la persona
alumnoSchema.virtual('persona_datos', {
    ref: 'Persona',
    localField: 'persona',
    foreignField: '_id',
    justOne: true
});

//virtual para obtener datos completos del tutor
alumnoSchema.virtual('tutor_datos', {
    ref: 'Persona',
    localField: 'tutor',
    foreignField: '_id',
    justOne: true
});

//Remover campos no deseados del JSON response
alumnoSchema.methods.toJSON = function() {
    const alumno = this.toObject();
    delete alumno.__v;
    return alumno;
};

//Incluir virtuals al convertir a objeto o JSON
alumnoSchema.set('toObject', { virtuals: true });
alumnoSchema.set('toJSON', { virtuals: true });

//Plugin de soft delete
alumnoSchema.plugin(simpleSoftDelete);

export default mongoose.model('Alumno', alumnoSchema);
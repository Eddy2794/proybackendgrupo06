import mongoose from 'mongoose';
import simpleSoftDelete from '../../../utils/simpleSoftDelete.js';

export const ALUMNO_CATEGORIA_ESTADOS = ['ACTIVO', 'INACTIVO'];

const alumnoCategoriaSchema = new mongoose.Schema({
  alumno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumno',
    required: true
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },
  fecha_inscripcion: {
    type: Date,
    required: true
  },
  estado: {
    type: String,
    enum: ALUMNO_CATEGORIA_ESTADOS,
    default: 'ACTIVO',
    required: true
  },
  observaciones: {
    type: String,
    maxlength: 300,
    default: ''
  },
  fecha_baja: {
    type: Date,
    default: null
  },
  motivo_baja: {
    type: String,
    maxlength: 300,
    default: ''
  }
}, {
  timestamps: true
});

//Index para asegurar unicidad y evitar duplicados
alumnoCategoriaSchema.index({ alumno: 1, categoria: 1 }, { unique: true, partialFilterExpression: { deleted: null } });

//Remover campos no deseados del JSON response
alumnoCategoriaSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

//virtual para obtener datos completos del alumno
alumnoCategoriaSchema.virtual('alumno_datos', {
  ref: 'Alumno',
  localField: 'alumno',
  foreignField: '_id',
  justOne: true
});

//virtual para obtener datos completos de la categoria
alumnoCategoriaSchema.virtual('categoria_datos', {
  ref: 'Categoria',
  localField: 'categoria',
  foreignField: '_id',
  justOne: true
});

//Plugin de soft delete
alumnoCategoriaSchema.plugin(simpleSoftDelete);

export default mongoose.model('AlumnoCategoria', alumnoCategoriaSchema);
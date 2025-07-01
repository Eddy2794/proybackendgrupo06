import Cuota from '../model/cuota.model.js';
import mongoose from 'mongoose';

// Crear una nueva cuota
export const create = async (data) => {
  const cuota = new Cuota(data);
  return await cuota.save();
};

// Buscar una cuota por su ID y poblar la relación alumno-categoría
export const findById = async (id) => {
  return await Cuota.findById(id).populate('alumno_categoria_id');
}
  

// Buscar todas las cuotas de una relación alumno-categoría, ordenadas por año y mes descendente
export const findByAlumnoCategoria = async (alumnoCategoriaId) => {
  return await Cuota.find({ alumno_categoria_id: alumnoCategoriaId }).sort({ anio: -1, mes: -1 });
}

// Actualizar una cuota por su ID
export const updateById = async (id, data) => {
  return await Cuota.findByIdAndUpdate(id, data, { new: true });
}

// Eliminar una cuota de forma física
export const deleteById = async (id) => {
  return await Cuota.findByIdAndDelete(id);
}

// Buscar todas las cuotas por estado (PENDIENTE, PAGA, VENCIDA)
export const findByEstado = async (estado) => {
  const populateConfig = [
    {
      path: 'alumno_categoria_id',
      populate: [
        { path: 'alumno', model: 'Alumno', populate: { path: 'persona', model: 'Persona' } },
        { path: 'categoria_datos' }
      ]
    }
  ];
  if (!estado) {
    return await Cuota.find().populate(populateConfig);
  }
  return await Cuota.find({ estado }).populate(populateConfig);
}

// Buscar todas las cuotas de un periodo específico (año y mes)
export const findByPeriodo = async (anio, mes) => {
  return await Cuota.find({ anio, mes });
}

// Buscar una cuota única por filtro (usado para verificar duplicados)
export const findOne = async (filter) => {
  return  await Cuota.findOne(filter);
}

// Buscar todas las cuotas vencidas (pendientes y con fecha de vencimiento pasada)
export const findVencidas = async (fechaReferencia) => {
  return await Cuota.find({
    estado: 'PENDIENTE',
    fecha_vencimiento: { $lt: fechaReferencia }
  });
}

// Eliminar una cuota de forma lógica (soft delete)
export const softDeleteById = async (id, deletedBy = null) => {
  return await Cuota.softDeleteById(id, deletedBy);
}

// Restaurar una cuota eliminada lógicamente
export const restoreById = async (id, restoredBy = null) =>
  await Cuota.updateOne(
    { _id: id },
    {
      deleted: null,
      deletedBy: null,
      restoredAt: new Date(),
      restoredBy: restoredBy
    }
  );

// Buscar una cuota por ID, incluyendo eliminadas lógicamente
export const findWithDeletedById = async (id) =>
  await Cuota.findOne({ _id: id });

// Buscar una cuota por ID, ignorando cualquier hook de Mongoose
export const findRawById = async (id) => {
  return await Cuota.collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
};
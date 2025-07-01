import Alumno from '../model/alumno.model.js';
import mongoose from 'mongoose';

//Crear alumno
export const createAlumno = async (data) => {
    const alumno = new Alumno(data);
    return await alumno.save();
};

//Obtener alumno por ID
export const findById = async (id) => {
    return await Alumno.findById(id)
        .populate('persona_datos')
        .populate('tutor_datos');
};

//Obtener alumno por número de socio
export const findByNumeroSocio = async (numeroSocio) => {
    return await Alumno.findOne({ numero_socio: numeroSocio })
        .populate('persona_datos')
        .populate('tutor_datos');
};

//Obtener todos los alumnos (paginados)
export const findAll = async (filter = {}, options = {}) => {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (filter.estado) query.estado = filter.estado;
    if (filter.tutor_id) query.tutor_id = filter.tutor_id;

    const alumnos = await Alumno
        .find(query)
        .populate('persona_datos')
        .populate('tutor_datos')
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await Alumno.countDocuments(query);

    return {
        alumnos,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    }
};

//Actualizar alumno por ID
export const updateById = async (id, data) => {
    return await Alumno.findByIdAndUpdate(id, data, { new: true })
        .populate('persona_datos')
        .populate('tutor_datos');
};

//Eliminación fisica permanente
export const deleteById = async (id) => {
    return await Alumno.findByIdAndDelete(id);
};

//Eliminación lógica (soft delete) con auditoría y cambio de estado
export const softDeleteById = async (id, deletedBy = null) => {
    return await Alumno.findByIdAndUpdate(
        id,
        {
            deleted: new Date(),
            deletedBy: deletedBy,
            restoredAt: null,
            restoredBy: null,
            estado: 'INACTIVO'
        },
        { new: true }
    );
};

//Restaurar alumno eliminado (con auditoría y cambio de estado)
export const restoreById = async (id, restoredBy = null) => {
    return await Alumno.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        {
            $set: {
                deleted: null,
                deletedBy: null,
                restoredAt: new Date(),
                restoredBy: restoredBy,
                estado: 'ACTIVO'
            }
        }
    );
};

//Obtener alumnos por ID de tutor
export const findByTutorId = async (tutorId) => {
    return await Alumno.find({ tutor: tutorId })
        .populate('persona_datos')
        .populate('tutor_datos');
};

// Buscar un alumno por ID, incluyendo eliminados lógicamente
export const findWithDeletedById = async (id) =>
  await Alumno.findOne({ _id: id });

// Buscar un alumno por ID, ignorando cualquier hook de Mongoose
export const findRawById = async (id) => {
  return await Alumno.collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
};

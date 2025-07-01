import AlumnoCategoria from '../model/alumno_categoria.model.js';
import mongoose from 'mongoose';

export const create = async (data) => {
    const nuevaRelacion = new AlumnoCategoria(data);
    return await nuevaRelacion.save();
};

export const findById = async (id) => {
    return await AlumnoCategoria.findById(id)
        .populate({ path: 'alumno_datos', populate: { path: 'persona' } })
        .populate('categoria_datos');
};

export const findAll = async (filter = {}, options = {}) => {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const query = { deleted: null, ...filter };

    const datos = await AlumnoCategoria.find(query)
        .populate({ 
            path: 'alumno_datos', 
            populate: { 
                path: 'persona',
                select: 'nombres apellidos email telefono'
            } 
        })
        .populate('categoria_datos')
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const total = await AlumnoCategoria.countDocuments(query);

    return {
        datos,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

export const updateById = async (id, data) => {
    return await AlumnoCategoria.findByIdAndUpdate(id, data, { new: true });
};

export const deleteById = async (id) => {
    return await AlumnoCategoria.findByIdAndDelete(id);
};

//Eliminación lógica (soft delete) con auditoría y cambio de estado
export const softDeleteById = async (id, deletedBy = null) => {
    return await AlumnoCategoria.findByIdAndUpdate(
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

//Restaurar relación eliminada (con auditoría y cambio de estado)
export const restoreById = async (id, restoredBy = null) => {
    return await AlumnoCategoria.collection.updateOne(
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

// Método para buscar un registro eliminado específicamente
export const findDeletedById = async (id) => {
    return await AlumnoCategoria.findOne({ _id: id, deleted: { $ne: null } })
        .populate({ path: 'alumno_datos', populate: { path: 'persona' } })
        .populate('categoria_datos');
};

//Obtener por alumno y categoría (unico)
export const findByAlumnoAndCategoria = async (alumnoId, categoriaId) => {
    return await AlumnoCategoria.findOne({
        alumno: alumnoId,
        categoria: categoriaId,
        deleted: null
    });
};


export const findByAlumno = async (alumnoId) => {
    return await AlumnoCategoria.find({ alumno: alumnoId, deleted: null })
        .populate({ path: 'alumno_datos', populate: { path: 'persona' } })
        .populate('categoria_datos');
};


export const findByCategoria = async (categoriaId) => {
    return await AlumnoCategoria.find({ categoria: categoriaId, deleted: null })
        .populate({ path: 'alumno_datos', populate: { path: 'persona' } })
        .populate('categoria_datos');
};

// Método para obtener todas las inscripciones con datos de categoría para estadísticas
export const findAllWithCategories = async () => {
    return await AlumnoCategoria.find({ deleted: null, estado: 'ACTIVO' })
        .populate('categoria', 'nombre')
        .populate({ path: 'alumno', populate: { path: 'persona', select: 'nombre apellido' } })
        .sort({ fecha_inscripcion: -1 });
};
import Profesor from '../model/profesor-categoria-model.js';

export const create = async(data) => {
    const profesorCategoria = new ProfesorCategoria(data);
    return await profesorCategoria.save();
}

export const findByCategoria = async (idCategoria) => {
    return await ProfesorCategoria.find({ categoria: idCategoria })
    .populate('profesor');
}

export const findByProfesor = async (idProfesor) => {
    return await ProfesorCategoria.find({ profesor: idProfesor })
    .populate('categoria');
}

export const findAll = async () => {
    return await ProfesorCategoria.find()
        .populate('profesor').populate('categoria');
}

export const updateById = async(id, profesorCategoriaData) => {
    return await ProfesorCategoria.findByIdAndUpdate(id, profesorCategoriaData, { new: true }); 
}

export const deleteById = async(id) => {
    return await ProfesorCategoria.findByIdAndDelete(id);
}
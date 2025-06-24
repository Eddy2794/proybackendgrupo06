import * as profesorRepository from '../repository/profesor-categoria-repository.js';

export const getProfesores = async () => {
    const profesores = await profesorRepository.findAll();  //fijarse se ponemos que salte error si no hay profesores
    if (!profesores) {
        throw new Error('No hay profesores');
    }
    return profesores;
};

export const getProfesoresByCategoria = async (idCategoria) => {
    const profesores = await profesorRepository.findByCategoria(idCategoria);
    if (!profesores) {
        throw new Error('No hay profesores en esta categoria');
    }
    return profesores;
};

export const getCategoriaByProfesor = async (idProfesor) => {
    const categorias = await profesorRepository.findByProfesor(idProfesor);
    if (!categorias) {
        throw new Error('No hay categorias en esta profesor');
    }
    return categorias;
};
export const createProfesorCategoria = async (profesorCategoriaData) => {
    const profesorCategoria = await profesorRepository.create(profesorCategoriaData);
    if (!profesorCategoria) {
        throw new Error('Error al crear el profesor categoria');
    }
    return profesorCategoria;
};

export const updateProfesorCategoria = async (id, profesorCategoriaData) => { 
    const profesorCategoria = await profesorRepository.updateById(id, profesorCategoriaData);
    if (!profesorCategoria) {
        throw new Error('Error al actualizar el profesor categoria');
    }
    return profesorCategoria;
};

export const deleteProfesorCategoria = async (id) => {//eliminacion logica
    const profesorCategoria = await profesorRepository.deleteById(id);
    if (!profesorCategoria) {
        throw new Error('Error al eliminar el profesor categoria');
    }
    return profesor;
};
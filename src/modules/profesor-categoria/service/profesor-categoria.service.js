import * as profesorRepository from '../repository/profesor-categoria-repository.js';

export const getProfesores = async (queryOptions = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', search, activo } = queryOptions;
    
    const profesores = await profesorRepository.findAll({ page, limit, sort, search, activo });
    
    if (!profesores || profesores.length === 0) {
        throw new Error('No se encontraron relaciones profesor-categoría');
    }
    
    return profesores;
};

export const getProfesoresByCategoria = async (idCategoria, queryOptions = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', activo = true } = queryOptions;
    
    const profesores = await profesorRepository.findByCategoria(idCategoria, { 
        page, 
        limit, 
        sort, 
        activo
    });
    
    if (!profesores || profesores.length === 0) {
        throw new Error('No se encontraron profesores en esta categoría');
    }
    
    return profesores;
};

export const getCategoriaByProfesor = async (idProfesor, queryOptions = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', activo = true } = queryOptions;
    
    const categorias = await profesorRepository.findByProfesor(idProfesor, { 
        page, 
        limit, 
        sort, 
        activo
    });
    
    if (!categorias || categorias.length === 0) {
        throw new Error('No se encontraron categorías para este profesor');
    }
    
    return categorias;
};

export const createProfesorCategoria = async (profesorCategoriaData) => {
    const profesorCategoria = await profesorRepository.create(profesorCategoriaData);
    
    if (!profesorCategoria) {
        throw new Error('Error al crear la relación profesor-categoría');
    }
    
    return profesorCategoria;
};

export const updateProfesorCategoria = async (id, profesorCategoriaData) => {
    const profesorCategoria = await profesorRepository.updateById(id, profesorCategoriaData);
    
    if (!profesorCategoria) {
        throw new Error('Error al actualizar la relación profesor-categoría');
    }
    
    return profesorCategoria;
};

export const deleteProfesorCategoria = async (id) => {
    const profesorCategoria = await profesorRepository.deleteById(id);
    
    if (!profesorCategoria) {
        throw new Error('Error al eliminar la relación profesor-categoría');
    }
    
    return profesorCategoria;
};

export const getProfesorCategoriaById = async (id) => {
    const profesorCategoria = await profesorRepository.findById(id);
    
    if (!profesorCategoria) {
        throw new Error('Relación profesor-categoría no encontrada');
    }
    
    return profesorCategoria;
};
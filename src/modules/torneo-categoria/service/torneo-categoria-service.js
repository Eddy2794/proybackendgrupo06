import * as torneoRepository from '../repository/torneo-categoria-repository.js';

export const getTorneosCategorias = async (queryOptions = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', search, activa } = queryOptions;
    
    const torneosCategorias = await torneoRepository.findAll({ page, limit, sort, search, activa });
    
    if (!torneosCategorias || torneosCategorias.data.length === 0) {
        throw new Error('No se encontraron relaciones torneo-categoría');
    }
    
    return torneosCategorias;
};

export const getCategoriasByTorneo = async (idTorneo, queryOptions = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', estado = 'ACTIVO' } = queryOptions;
    
    const categorias = await torneoRepository.findByTorneo(idTorneo, { 
        page, 
        limit, 
        sort, 
        activa
    });
    
    if (!categorias || categorias.data.length === 0) {
        throw new Error('No se encontraron categorías en este torneo');
    }
    
    return categorias;
};

export const getTorneosByCategoria = async (idCategoria, queryOptions = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', estado = 'ACTIVO' } = queryOptions;
    
    const torneos = await torneoRepository.findByCategoria(idCategoria, { 
        page, 
        limit, 
        sort, 
        activa
    });
    
    if (!torneos || torneos.data.length === 0) {
        throw new Error('No se encontraron torneos para esta categoría');
    }
    
    return torneos;
};

export const createTorneoCategoria = async (torneoCategoriaData) => {
    // Verificar si ya existe la relación
    const existingRelation = await torneoRepository.findByTorneoAndCategoria(
        torneoCategoriaData.torneo, 
        torneoCategoriaData.categoria
    );
    
    if (existingRelation) {
        throw new Error('Ya existe una relación entre este torneo y esta categoría');
    }
    
    const torneoCategoria = await torneoRepository.create(torneoCategoriaData);
    
    if (!torneoCategoria) {
        throw new Error('Error al crear la relación torneo-categoría');
    }
    
    return torneoCategoria;
};

export const updateTorneoCategoria = async (id, torneoCategoriaData) => {
    // Si se están actualizando torneo o categoría, verificar que no exista duplicado
    if (torneoCategoriaData.torneo || torneoCategoriaData.categoria) {
        const currentRelation = await torneoRepository.findById(id);
        if (!currentRelation) {
            throw new Error('Relación torneo-categoría no encontrada');
        }
        
        const newTorneoId = torneoCategoriaData.torneo || currentRelation.torneo._id;
        const newCategoriaId = torneoCategoriaData.categoria || currentRelation.categoria._id;
        
        const existingRelation = await torneoRepository.findByTorneoAndCategoria(
            newTorneoId, 
            newCategoriaId
        );
        
        if (existingRelation && existingRelation._id.toString() !== id) {
            throw new Error('Ya existe una relación entre este torneo y esta categoría');
        }
    }
    
    const torneoCategoria = await torneoRepository.updateById(id, torneoCategoriaData);
    
    if (!torneoCategoria) {
        throw new Error('Error al actualizar la relación torneo-categoría');
    }
    
    return torneoCategoria;
};

export const deleteTorneoCategoria = async (id) => {
    const torneoCategoria = await torneoRepository.deleteById(id);
    
    if (!torneoCategoria) {
        throw new Error('Error al eliminar la relación torneo-categoría');
    }
    
    return torneoCategoria;
};

export const getTorneoCategoriaById = async (id) => {
    const torneoCategoria = await torneoRepository.findById(id);
    
    if (!torneoCategoria) {
        throw new Error('Relación torneo-categoría no encontrada');
    }
    
    return torneoCategoria;
};

export const getTorneoCategoriaByCombination = async (idTorneo, idCategoria) => {
    const torneoCategoria = await torneoRepository.findByTorneoAndCategoria(idTorneo, idCategoria);
    
    if (!torneoCategoria) {
        throw new Error('No se encontró la relación entre el torneo y la categoría especificados');
    }
    
    return torneoCategoria;
};
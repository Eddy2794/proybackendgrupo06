import TorneoCategoria from '../model/torneo-categoria-model.js';

export const create = async (data) => {
    const torneoCategoria = new TorneoCategoria(data);
    return await torneoCategoria.save();
};

export const findByTorneo = async (idTorneo, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', activa = true } = options;
    
    const skip = (page - 1) * limit;
    const query = { torneo: idTorneo };
    
    if (activa !== undefined) {
        query.activa = activa;
    }
    
    const [categorias, total] = await Promise.all([
        TorneoCategoria.find(query)
            .populate({
                path: 'torneo',
                select: 'nombre descripcion fecha_inicio fecha_fin lugar estado'
            })
            .populate({
                path: 'categoria',
                select: 'nombre descripcion edad_min edad_max nivel cuota_mensual'
            })
            .sort(sort)
            .skip(skip)
            .limit(limit),
        TorneoCategoria.countDocuments(query)
    ]);
    
    return {
        data: categorias,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const findByCategoria = async (idCategoria, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', activa = true } = options;
    
    const skip = (page - 1) * limit;
    const query = { categoria: idCategoria };
    
    if (activa !== undefined) {
        query.activa = activa;
    }
    
    const [torneos, total] = await Promise.all([
        TorneoCategoria.find(query)
            .populate({
                path: 'torneo',
                select: 'nombre descripcion fecha_inicio fecha_fin lugar estado'
            })
            .populate({
                path: 'categoria',
                select: 'nombre descripcion edad_min edad_max nivel cuota_mensual'
            })
            .sort(sort)
            .skip(skip)
            .limit(limit),
        TorneoCategoria.countDocuments(query)
    ]);
    
    return {
        data: torneos,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const findAll = async (options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', search, activa } = options;
    
    const skip = (page - 1) * limit;
    const query = {};
    
    // Filtro por estado activa
    if (activa !== undefined) {
        query.activa = activa;
    }
    
    // Filtro de búsqueda
    if (search) {
        query.$or = [
            { observaciones: { $regex: search, $options: 'i' } },
            { 'torneo.nombre': { $regex: search, $options: 'i' } },
            { 'categoria.nombre': { $regex: search, $options: 'i' } }
        ];
    }
    
    const [torneosCategorias, total] = await Promise.all([
        TorneoCategoria.find(query)
            .populate({
                path: 'torneo',
                select: 'nombre descripcion fecha_inicio fecha_fin lugar estado'
            })
            .populate({
                path: 'categoria',
                select: 'nombre descripcion edad_min edad_max nivel cuota_mensual'
            })
            .sort(sort)
            .skip(skip)
            .limit(limit),
        TorneoCategoria.countDocuments(query)
    ]);
    
    return {
        data: torneosCategorias,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const updateById = async (id, torneoCategoriaData) => {
    return await TorneoCategoria.findByIdAndUpdate(id, torneoCategoriaData, { new: true })
        .populate({
            path: 'torneo',
            select: 'nombre descripcion fecha_inicio fecha_fin lugar estado'
        })
        .populate({
            path: 'categoria',
            select: 'nombre descripcion edad_min edad_max nivel cuota_mensual'
        });
};

export const deleteById = async (id) => {
    // Implementar eliminación lógica en lugar de física
    return await TorneoCategoria.findByIdAndUpdate(
        id, 
        { activa: false }, 
        { new: true }
    ).populate({
        path: 'torneo',
        select: 'nombre descripcion fecha_inicio fecha_fin lugar estado'
    }).populate({
        path: 'categoria',
        select: 'nombre descripcion edad_min edad_max nivel cuota_mensual'
    });
};

export const findById = async (id) => {
    return await TorneoCategoria.findById(id)
        .populate({
            path: 'torneo',
            select: 'nombre descripcion fecha_inicio fecha_fin lugar estado'
        })
        .populate({
            path: 'categoria',
            select: 'nombre descripcion edad_min edad_max nivel cuota_mensual'
        });
};

// Función específica para verificar si existe una relación torneo-categoría
export const findByTorneoAndCategoria = async (idTorneo, idCategoria) => {
    return await TorneoCategoria.findOne({ 
        torneo: idTorneo, 
        categoria: idCategoria 
    })
    .populate({
        path: 'torneo',
        select: 'nombre descripcion fecha_inicio fecha_fin lugar estado'
    })
    .populate({
        path: 'categoria',
        select: 'nombre descripcion edad_min edad_max nivel cuota_mensual'
    });
};
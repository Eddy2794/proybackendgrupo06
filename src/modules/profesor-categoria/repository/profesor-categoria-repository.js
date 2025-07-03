import ProfesorCategoria from '../model/profesor-categoria-model.js';

export const create = async (data) => {
    const profesorCategoria = new ProfesorCategoria(data);
    return await profesorCategoria.save();
};

export const findByCategoria = async (idCategoria, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', activo = true } = options;
    
    const skip = (page - 1) * limit;
    const query = { categoria: idCategoria };
    
    if (activo !== undefined) {
        query.activo = activo;
    }
    console.log(query);
    const [profesores, total] = await Promise.all([
        ProfesorCategoria.find(query)
            .populate({
                path: 'profesor',
                populate: {
                    path: 'persona',
                    select: 'nombre apellido email telefono dni'
                }
            })
            .populate('categoria')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        ProfesorCategoria.countDocuments(query)
    ]);
    
    console.log(profesores);
    return {
        profesores: profesores,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const findByProfesor = async (idProfesor, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', activo = true } = options;
    
    const skip = (page - 1) * limit;
    const query = { profesor: idProfesor };
    
    if (activo !== undefined) {
        query.activo = activo;
    }
    
    const [categorias, total] = await Promise.all([
        ProfesorCategoria.find(query)
            .populate({
                path: 'profesor',
                populate: {
                    path: 'persona',
                    select: 'nombres apellidos email telefono dni'
                }
            })
            .populate('categoria')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        ProfesorCategoria.countDocuments(query)
    ]);
    
    return {
        categorias: categorias,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const findAll = async (options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt', search, activo } = options;
    
    const skip = (page - 1) * limit;
    const query = {};
    
    // Filtro por estado activo
    if (activo !== undefined) {
        query.activo = activo;
    }
    
    // Filtro de búsqueda
    if (search) {
        query.$or = [
            { observaciones: { $regex: search, $options: 'i' } },
            { 'profesor.nombre': { $regex: search, $options: 'i' } },
            { 'categoria.nombre': { $regex: search, $options: 'i' } }
        ];
    }
    
    const [profesoresCategorias, total] = await Promise.all([
        ProfesorCategoria.find(query)
            .populate({
                path: 'profesor',
                populate: {
                    path: 'persona',
                    select: 'nombres apellidos email telefono dni'
                }
            })
            .populate('categoria')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        ProfesorCategoria.countDocuments(query)
    ]);
    return {
        profesoresCategorias: profesoresCategorias,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const updateById = async (id, profesorCategoriaData) => {
    return await ProfesorCategoria.findByIdAndUpdate(id, profesorCategoriaData, { new: true })
        .populate({
            path: 'profesor',
            populate: {
                path: 'persona',
                select: 'nombres apellidos email telefono dni'
            }
        })
        .populate('categoria');
};

export const deleteById = async (id) => {
    // Implementar eliminación lógica en lugar de física
    return await ProfesorCategoria.findByIdAndUpdate(
        id, 
        { activo: false }, 
        { new: true }
    ).populate({
        path: 'profesor',
        populate: {
            path: 'persona',
            select: 'nombres apellidos email telefono dni'
        }
    }).populate('categoria');
};

export const findById = async (id) => {
    return await ProfesorCategoria.findById(id)
        .populate({
            path: 'profesor',
            populate: {
                path: 'persona',
                select: 'nombres apellidos email telefono dni'
            }
        })
        .populate('categoria');
};

export const findByProfesorAndCategoria = async (idProfesor, idCategoria, options = {}) => {
    const { activo = true } = options;
    
    const query = { 
        profesor: idProfesor, 
        categoria: idCategoria 
    };
    
    if (activo !== undefined) {
        query.activo = activo;
    }
    
    return await ProfesorCategoria.findOne(query)
        .populate({
            path: 'profesor',
            populate: {
                path: 'persona',
                select: 'nombres apellidos email telefono dni'
            }
        })
        .populate('categoria');
};

export const deactivateByProfesor = async (idProfesor) => {
    return await ProfesorCategoria.updateMany(
        { profesor: idProfesor, activo: true },
        { $set: { activo: false } }
    );
};
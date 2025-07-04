import Categoria from '../model/categoria.model.js';

export const create = async (data) => {
  const categoria = new Categoria(data);
  return await categoria.save();
};

export const findById = async (id) => {
  return await Categoria.findById(id);
};

export const findByNombre = async (nombre) => {
  return await Categoria.findOne({ nombre: nombre.trim() });
};

export const findAll = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
  const skip = (page - 1) * limit;
  
  const query = { ...filter };
  
  // Si hay filtro de estado, aplicarlo
  if (filter.estado !== undefined) {
    query.estado = filter.estado;
  }
  // Filtro por estado
  if (filter.estado) {
    query.estado = filter.estado;
    delete filter.estado;
  }
  
  // Si hay filtro de nivel, aplicarlo
  if (filter.nivel) {
    query.nivel = filter.nivel;
  }
  
  // Si hay filtros de edad, aplicarlos
  if (filter.edadMinima !== undefined || filter.edadMaxima !== undefined) {
    if (filter.edadMinima !== undefined) {
      query.edadMaxima = filter.edadMinima;
    }
    if (filter.edadMaxima !== undefined) {
      query.edadMinima = filter.edadMaxima;
    }
  }
  // Filtros de edad
  if (filter.edadMinima !== undefined) {
    query.edadMinima = { $gte: filter.edadMinima };
    delete filter.edadMinima;
  }
  if (filter.edadMaxima !== undefined) {
    query.edadMaxima = { $lte: filter.edadMaxima };
    delete filter.edadMaxima;
  }
  
  // Si hay búsqueda por texto, aplicarla
  if (filter.search) {
    const regex = new RegExp(filter.search, 'i');
    query.$or = [
      { nombre: regex },
      { descripcion: regex }
    ];
    delete query.search;
  }
  
  const categorias = await Categoria
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await Categoria.countDocuments(query);
  
  return {
    categorias,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const updateById = async (id, data) => {
  return await Categoria.findByIdAndUpdate(
    id, 
    { ...data, updatedAt: new Date() }, 
    { new: true, runValidators: true }
  );
};

export const softDeleteById = async (id, deletedBy = null) => {
  return await Categoria.softDeleteById(id, deletedBy);
};

export const restoreById = async (id, restoredBy = null) => {
  return await Categoria.restoreById(id, restoredBy);
};

export const findDeleted = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, sort = { deleted: -1 } } = options;
  const skip = (page - 1) * limit;
  
  const categorias = await Categoria
    .findDeleted(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await Categoria.findDeleted(filter).countDocuments();
  
  return {
    categorias,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const findWithDeleted = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
  const skip = (page - 1) * limit;
  
  const categorias = await Categoria
    .findWithDeleted(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await Categoria.findWithDeleted(filter).countDocuments();
  
  return {
    categorias,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const searchByName = async (searchTerm) => {
  const regex = new RegExp(searchTerm, 'i');
  return await Categoria.find({
    $or: [
      { nombre: regex },
      { descripcion: regex }
    ]
  }).limit(20);
};

export const findByNivel = async (nivel) => {
  return await Categoria.find({ nivel, estado: 'ACTIVA' });
};

export const findByRangoEdad = async (edadMin, edadMax) => {
  return await Categoria.find({
    edadMinima: { $lte: edadMax },
    edadMaxima: { $gte: edadMin },
    estado: 'ACTIVA'
  });
};

export const findActivas = async () => {
  return await Categoria.find({ estado: 'ACTIVA' }).sort({ nombre: 1 });
};

export const findByHorario = async (dia) => {
  return await Categoria.find({
    'horarios.dia': dia,
    estado: 'ACTIVA'
  });
};

/**
 * Métodos con soporte para transacciones MongoDB
 */

export const createWithSession = async (data, session) => {
  const categoria = new Categoria(data);
  return await categoria.save({ session });
};

export const findByNombreWithSession = async (nombre, session) => {
  return await Categoria.findOne({ nombre: nombre.trim() }, null, { session });
};

export const findByIdWithSession = async (id, session) => {
  return await Categoria.findById(id, null, { session });
};

export const updateByIdWithSession = async (id, data, session) => {
  return await Categoria.findByIdAndUpdate(
    id, 
    { ...data, updatedAt: new Date() }, 
    { new: true, runValidators: true, session }
  );
};

export const softDeleteByIdWithSession = async (id, deletedBy = null, session) => {
  const categoria = await Categoria.findById(id, null, { session });
  if (!categoria) return null;
  categoria.deleted = new Date();
  categoria.deletedBy = deletedBy;
  categoria.restoredAt = null;
  categoria.restoredBy = null;
  return await categoria.save({ session });
};

export const restoreByIdWithSession = async (id, restoredBy = null, session) => {
  const categoria = await Categoria.findWithDeleted({ _id: id }).session(session);
  if (!categoria) return null;
  categoria.deleted = null;
  categoria.deletedBy = null;
  categoria.restoredAt = new Date();
  categoria.restoredBy = restoredBy;
  return await categoria.save({ session });
};
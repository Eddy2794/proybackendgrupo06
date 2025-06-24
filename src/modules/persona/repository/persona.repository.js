import Persona from '../model/persona.model.js';

export const create = async (data) => {
  const persona = new Persona(data);
  return await persona.save();
};

export const findById = async (id) => {
  return await Persona.findById(id);
};

export const findByEmail = async (email) => {
  return await Persona.findOne({ email: email.toLowerCase() });
};

export const findByDocumento = async (numeroDocumento) => {
  return await Persona.findOne({ numeroDocumento });
};

export const findAll = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
  const skip = (page - 1) * limit;
  
  const query = { ...filter };
  
  // Si hay filtro de estado, aplicarlo
  if (filter.estado) {
    query.estado = filter.estado;
  }
  
  const personas = await Persona
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await Persona.countDocuments(query);
  
  return {
    personas,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const updateById = async (id, data) => {
  return await Persona.findByIdAndUpdate(
    id, 
    { ...data, updatedAt: new Date() }, 
    { new: true, runValidators: true }
  );
};

export const softDeleteById = async (id, deletedBy = null) => {
  return await Persona.softDeleteById(id, deletedBy);
};

export const restoreById = async (id, restoredBy = null) => {
  return await Persona.restoreById(id, restoredBy);
};

export const findDeleted = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, sort = { deleted: -1 } } = options;
  const skip = (page - 1) * limit;
  
  const personas = await Persona
    .findDeleted(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await Persona.findDeleted(filter).countDocuments();
  
  return {
    personas,
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
  
  const personas = await Persona
    .findWithDeleted(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await Persona.findWithDeleted(filter).countDocuments();
  
  return {
    personas,
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
  return await Persona.find({
    $or: [
      { nombres: regex },
      { apellidos: regex }
    ]
  }).limit(20);
};

export const findByAge = async (minAge, maxAge) => {
  const hoy = new Date();
  const fechaMax = new Date(hoy.getFullYear() - minAge, hoy.getMonth(), hoy.getDate());
  const fechaMin = new Date(hoy.getFullYear() - maxAge - 1, hoy.getMonth(), hoy.getDate());
  
  return await Persona.find({
    fechaNacimiento: {
      $gte: fechaMin,
      $lte: fechaMax
    }
  });
};

/**
 * Métodos con soporte para transacciones MongoDB
 */

export const createWithSession = async (data, session) => {
  const persona = new Persona(data);
  return await persona.save({ session });
};

export const findByEmailWithSession = async (email, session) => {
  return await Persona.findOne({ email: email.toLowerCase() }, null, { session });
};

export const findByDocumentoWithSession = async (numeroDocumento, session) => {
  return await Persona.findOne({ numeroDocumento }, null, { session });
};

export const findByIdWithSession = async (id, session) => {
  return await Persona.findById(id, null, { session });
};

export const updateByIdWithSession = async (id, data, session) => {
  return await Persona.findByIdAndUpdate(
    id, 
    { ...data, updatedAt: new Date() }, 
    { new: true, runValidators: true, session }
  );
};

export const softDeleteByIdWithSession = async (id, deletedBy = null, session) => {
  const persona = await Persona.findById(id, null, { session });
  if (!persona) return null;
  persona.deleted = new Date();
  persona.deletedBy = deletedBy;
  persona.restoredAt = null;
  persona.restoredBy = null;
  return await persona.save({ session });
};

export const restoreByIdWithSession = async (id, restoredBy = null, session) => {
  const persona = await Persona.findWithDeleted({ _id: id }).session(session);
  if (!persona) return null;
  persona.deleted = null;
  persona.deletedBy = null;
  persona.restoredAt = new Date();
  persona.restoredBy = restoredBy;
  return await persona.save({ session });
};

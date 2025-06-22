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

export const deleteById = async (id) => {
  return await Persona.findByIdAndDelete(id);
};

export const softDeleteById = async (id) => {
  return await Persona.findByIdAndUpdate(
    id,
    { estado: 'INACTIVO', updatedAt: new Date() },
    { new: true }
  );
};

export const searchByName = async (searchTerm) => {
  const regex = new RegExp(searchTerm, 'i');
  return await Persona.find({
    $or: [
      { nombres: regex },
      { apellidos: regex }
    ],
    estado: 'ACTIVO'
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
    },
    estado: 'ACTIVO'
  });
};

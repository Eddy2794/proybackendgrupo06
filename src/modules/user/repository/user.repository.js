import User from '../model/user.model.js';

export const create = async (data) => {
  const user = new User(data);
  return await user.save();
};

export const findById = async (id) => {
  return await User.findById(id)
    .populate('persona')
    .select('-password');
};

export const findByUsername = async (username) => {
  return await User.findOne({ username: username.toLowerCase() })
    .populate('persona');
};

export const findByPersonaId = async (personaId) => {
  return await User.findOne({ persona: personaId })
    .populate('persona');
};

export const findByPersonaEmail = async (email) => {
  return await User.findOne()
    .populate({
      path: 'persona',
      match: { email: email }
    })
    .then(user => {
      // Si la persona no coincide con el email, el populate devuelve null
      return user && user.persona ? user : null;
    });
};

export const findAll = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
  const skip = (page - 1) * limit;
  
  // Crear query base
  let query = { ...filter };
  
  // Si hay búsqueda, construir filtro de búsqueda
  if (filter.search) {
    const searchTerm = filter.search;
    delete query.search; // Remover search del filtro principal
    
    // Buscar por username (directamente en el modelo User)
    const usernameFilter = {
      username: { $regex: searchTerm, $options: 'i' }
    };
    
    // Para buscar en los datos de persona, necesitamos hacer un populate y filtrar
    // Primero obtenemos los IDs de personas que coinciden con la búsqueda
    const personaIds = await User.aggregate([
      {
        $lookup: {
          from: 'personas',
          localField: 'persona',
          foreignField: '_id',
          as: 'personaData'
        }
      },
      {
        $unwind: '$personaData'
      },
      {
        $match: {
          $or: [
            { 'personaData.nombres': { $regex: searchTerm, $options: 'i' } },
            { 'personaData.apellidos': { $regex: searchTerm, $options: 'i' } },
            { 'personaData.email': { $regex: searchTerm, $options: 'i' } }
          ]
        }
      },
      {
        $project: { _id: 1 }
      }
    ]);
    
    const userIdsFromPersona = personaIds.map(item => item._id);
    
    // Combinar búsqueda por username y por datos de persona
    query = {
      ...query,
      $or: [
        usernameFilter,
        { _id: { $in: userIdsFromPersona } }
      ]
    };
  }
  
  const users = await User
    .find(query)
    .populate('persona')
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await User.countDocuments(query);
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const updateById = async (id, data) => {
  return await User.findByIdAndUpdate(
    id, 
    { ...data, updatedAt: new Date() }, 
    { new: true, runValidators: true }
  ).populate('persona').select('-password');
};

export const softDeleteById = async (id, deletedBy = null) => {
  return await User.softDeleteById(id, deletedBy);
};

export const restoreById = async (id, restoredBy = null) => {
  return await User.restoreById(id, restoredBy);
};

export const findDeleted = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, sort = { deleted: -1 } } = options;
  const skip = (page - 1) * limit;
  
  // Crear query base para usuarios eliminados
  let query = { ...filter };
  
  // Si hay búsqueda, construir filtro de búsqueda
  if (filter.search) {
    const searchTerm = filter.search;
    delete query.search; // Remover search del filtro principal
    
    // Buscar por username (directamente en el modelo User)
    const usernameFilter = {
      username: { $regex: searchTerm, $options: 'i' }
    };
    
    // Para buscar en los datos de persona en usuarios eliminados
    const personaIds = await User.aggregate([
      {
        $match: { deleted: { $ne: null } } // Solo usuarios eliminados
      },
      {
        $lookup: {
          from: 'personas',
          localField: 'persona',
          foreignField: '_id',
          as: 'personaData'
        }
      },
      {
        $unwind: '$personaData'
      },
      {
        $match: {
          $or: [
            { 'personaData.nombres': { $regex: searchTerm, $options: 'i' } },
            { 'personaData.apellidos': { $regex: searchTerm, $options: 'i' } },
            { 'personaData.email': { $regex: searchTerm, $options: 'i' } }
          ]
        }
      },
      {
        $project: { _id: 1 }
      }
    ]);
    
    const userIdsFromPersona = personaIds.map(item => item._id);
    
    // Combinar búsqueda por username y por datos de persona
    query = {
      ...query,
      $or: [
        usernameFilter,
        { _id: { $in: userIdsFromPersona } }
      ]
    };
  }
  
  const users = await User
    .findDeleted(query)
    .populate('persona')
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await User.findDeleted(query).countDocuments();
  
  return {
    users,
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
  
  // Crear query base
  let query = { ...filter };
  
  // Si hay búsqueda, construir filtro de búsqueda
  if (filter.search) {
    const searchTerm = filter.search;
    delete query.search; // Remover search del filtro principal
    
    // Buscar por username (directamente en el modelo User)
    const usernameFilter = {
      username: { $regex: searchTerm, $options: 'i' }
    };
    
    // Para buscar en los datos de persona (incluyendo eliminados)
    const personaIds = await User.aggregate([
      {
        $lookup: {
          from: 'personas',
          localField: 'persona',
          foreignField: '_id',
          as: 'personaData'
        }
      },
      {
        $unwind: '$personaData'
      },
      {
        $match: {
          $or: [
            { 'personaData.nombres': { $regex: searchTerm, $options: 'i' } },
            { 'personaData.apellidos': { $regex: searchTerm, $options: 'i' } },
            { 'personaData.email': { $regex: searchTerm, $options: 'i' } }
          ]
        }
      },
      {
        $project: { _id: 1 }
      }
    ]);
    
    const userIdsFromPersona = personaIds.map(item => item._id);
    
    // Combinar búsqueda por username y por datos de persona
    query = {
      ...query,
      $or: [
        usernameFilter,
        { _id: { $in: userIdsFromPersona } }
      ]
    };
  }
  
  const users = await User
    .findWithDeleted(query)
    .populate('persona')
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await User.findWithDeleted(query).countDocuments();
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const findByRole = async (rol) => {
  return await User.find({ rol, estado: 'ACTIVO' })
    .populate('persona')
    .select('-password');
};

export const countByStatus = async () => {
  return await User.aggregate([
    {
      $group: {
        _id: '$estado',
        count: { $sum: 1 }
      }
    }
  ]);
};

/**
 * Métodos con soporte para transacciones MongoDB
 */

export const createWithSession = async (data, session) => {
  const user = new User(data);
  return await user.save({ session });
};

export const findByUsernameWithSession = async (username, session) => {
  return await User.findOne({ username: username.toLowerCase() }, null, { session })
    .populate('persona');
};

export const findByPersonaIdWithSession = async (personaId, session) => {
  return await User.findOne({ persona: personaId }, null, { session })
    .populate('persona');
};

export const findByIdWithSession = async (id, session) => {
  return await User.findById(id, null, { session })
    .populate('persona')
    .select('-password');
};

export const updateByIdWithSession = async (id, data, session) => {
  return await User.findByIdAndUpdate(
    id, 
    { ...data, updatedAt: new Date() }, 
    { new: true, runValidators: true, session }
  ).populate('persona').select('-password');
};

export const softDeleteByIdWithSession = async (id, deletedBy = null, session) => {
  const user = await User.findById(id, null, { session });
  if (!user) return null;
  user.deleted = new Date();
  user.deletedBy = deletedBy;
  user.restoredAt = null;
  user.restoredBy = null;
  return await user.save({ session });
};

export const restoreByIdWithSession = async (id, restoredBy = null, session) => {
  const user = await User.findWithDeleted({ _id: id }).session(session);
  if (!user) return null;
  user.deleted = null;
  user.deletedBy = null;
  user.restoredAt = new Date();
  user.restoredBy = restoredBy;
  return await user.save({ session });
};

export const getDeletedStats = async () => {
  return await User.getDeletedStats();
};

export const countAll = async () => {
  return await User.findWithDeleted({}).countDocuments();
};

export const countDeleted = async () => {
  return await User.findDeleted({}).countDocuments();
};
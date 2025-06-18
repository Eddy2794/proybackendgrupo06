import User from './user.model.js';

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

export const findAll = async (filter = {}, options = {}) => {
  const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
  const skip = (page - 1) * limit;
  
  const users = await User
    .find(filter)
    .populate('persona')
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await User.countDocuments(filter);
  
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

export const deleteById = async (id) => {
  return await User.findByIdAndDelete(id);
};

export const softDeleteById = async (id) => {
  return await User.findByIdAndUpdate(
    id,
    { estado: 'INACTIVO', updatedAt: new Date() },
    { new: true }
  ).populate('persona').select('-password');
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
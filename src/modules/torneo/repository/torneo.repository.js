import Torneo from '../model/torneo.model.js';

export const create = async(data)=>{
    const torneo = new Torneo(data);
    return await torneo.save();
}

export const findAll = async()=>{
    return Torneo.find();
}

export const findById = async(id)=>{
    return await Torneo.findById(id);
}

export const deleteById = async (id) => {
  return await Torneo.findByIdAndDelete(id);
};

//para eliminacion logica, por el momento solo usamos la eliminacion normal
export const softDeleteById = async (id) => {
  return await Torneo.findByIdAndUpdate(
    id,
    { estado: 'INACTIVO', updatedAt: new Date() },
    { new: true }
    )
}

export const updateById = async (id, data) => {
  return await Torneo.findByIdAndUpdate(
    id,
    data, 
    { new: true }
  );
};
import Profesor from '../model/profesor-model.js';

export const create = async(data) => {
    const profesor = new Profesor(data);
    return await profesor.save();
}

export const findByPersonaId = async (personaId) => {
    return await Profesor.findOne({ persona: personaId })
      .populate('persona');
};

export const findById = async (id) => {
    return await Profesor.findById(id)
        .populate('persona');
}

export const findAll = async () => {
    return await Profesor.find()
        .populate('persona');
}

export const updateById = async(id, profesorData) => {
    return await Profesor.findByIdAndUpdate(id, profesorData, { new: true }); 
}

export const deleteById = async(id) => {
    return await Profesor.findByIdAndDelete(id);
}
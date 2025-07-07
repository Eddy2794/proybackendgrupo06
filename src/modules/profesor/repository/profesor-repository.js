import * as personaRepository from '../../persona/repository/persona.repository.js';
import Profesor from '../model/profesor-model.js';
import * as profesorCategoriaService from '../../profesor-categoria/service/profesor-categoria.service.js';
import * as personaService from '../../persona/service/persona.service.js';

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
    return await Profesor.find({ activo_laboral: true })
        .populate('persona');
}

export const updateById = async(id, profesorData) => {
    return await Profesor.findByIdAndUpdate(id, profesorData, { new: true }); 
}

export const deleteById = async(id) => {
    return await Profesor.findByIdAndDelete(id);
}
export const deleteProfesor = async (id) => {
    // Desactivar relaciones en profesor-categoria usando el service
    await profesorCategoriaService.desactivarPorProfesor(id);

    // Buscar el profesor para obtener el id de persona
    const profesor = await findById(id);
    if (!profesor) {
        throw new Error('Error al eliminar el profesor');
    }

    // Eliminación lógica: poner activo_laboral en false
    await updateById(id, { activo_laboral: false });

    // Eliminación lógica de la persona asociada
    if (profesor.persona && profesor.persona._id) {
        await personaService.softDeletePersona(profesor.persona._id);
    }

    return { ...profesor.toObject(), activo_laboral: false };
};
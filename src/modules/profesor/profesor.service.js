import * as profesorRepository from './profesor-repository.js';
import * as personaService from '../persona/persona.service.js';

export const createProfesor = async ({ titulo, experiencia_anios, fecha_contratacion, salario, activo_laboral, personaData }) => {
    const persona = await personaService.createPersona(personaData);

    const existingProfesorByPersona = await profesorRepository.findByPersonaId(persona._id);
    if (existingProfesorByPersona) {
        throw new Error('Ya existe un profesor asociado a esta persona');
    }

    const profesorData = {
        persona: persona._id,
        titulo: titulo,
        experiencia_anios: experiencia_anios,
        fecha_contratacion: fecha_contratacion,
        salario: salario,
        activo_laboral: activo_laboral,
    }

    await profesorRepository.create(profesorData);

    return {
        message: 'Profesor registrado correctamente',
    }

}

export const getProfesorById = async (id) => {
    const profesor = await profesorRepository.findById(id);
    if (!profesor) {
        throw new Error('Profesor no encontrado');
    }
    return profesor;
}

export const getProfesores = async () => {
    const profesores = await profesorRepository.findAll();
    if (!profesores) {
        throw new Error('No hay profesores');
    }
    return profesores;
}

export const editProfesor = async (id, profesorData) => {

    const { persona, ...datosProfesor } = profesorData;
    if (profesorData.persona) {
        await personaService.updatePersona(profesorData.persona._id, profesorData.persona);
    }

    const profesorActualizado = await profesorRepository.updateById(id, datosProfesor);

    if (!profesorActualizado) {
        throw new Error('Error al actualizar el profesor');
    }

    return profesorActualizado;
}

export const deleteProfesor = async (id) => {
    const profesorEliminado = await profesorRepository.deleteById(id);
    if (!profesorEliminado) {
        throw new Error('Error al eliminar el profesor');
    }
    return profesorEliminado;
}   
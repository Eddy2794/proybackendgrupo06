import * as profesorRepository from '../repository/profesor-repository.js';
import * as personaService from '../../persona/service/persona.service.js';
import * as profesorCategoriaService from '../../profesor-categoria/service/profesor-categoria.service.js';


export const getProfesores = async () => {
    const profesores = await profesorRepository.findAll();  //fijarse se ponemos que salte error si no hay profesores
    if (!profesores) {
        throw new Error('No hay profesores');
    }
    return profesores;
};

export const getProfesorById = async (id) => {
    const profesor = await profesorRepository.findById(id);
    if (!profesor) {
        throw new Error('Profesor no encontrado');
    }
    return profesor;
};
export const createProfesor = async (profesorData) => {
    const persona = await personaService.createPersona(profesorData.personaData);
    console.log(persona);
    if (!persona) {
        throw new Error('Error al crear la persona');
    }
    const existingProfesorByPersona = await profesorRepository.findByPersonaId(persona._id);
    if (existingProfesorByPersona) {
        throw new Error('Ya existe un profesor asociado a esta persona');
    }
    profesorData.persona = persona._id;
    const profesor = await profesorRepository.create(profesorData);
    if (!profesor) {
        throw new Error('Error al crear el profesor');
    }
    return profesor;
};

export const updateProfesor = async (id, profesorData) => { 
    const { personaData, ...datosProfesor } = profesorData;
    if (personaData) {
        await personaService.updatePersona(personaData._id, personaData);
    }
    const profesor = await profesorRepository.updateById(id, datosProfesor);
    if (!profesor) {
        throw new Error('Error al actualizar el profesor');
    }
    return profesor;
};

export const deleteProfesor = async (id) => {
    // Desactivar relaciones en profesor-categoria usando el service
    await profesorCategoriaService.desactivarPorProfesor(id);
    const profesor = await profesorRepository.deleteById(id);
    if (!profesor) {
        throw new Error('Error al eliminar el profesor');
    }
    return profesor;
};
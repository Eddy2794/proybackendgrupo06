import * as alumnoRepo from '../repository/alumno.repository.js';


//Obtener alumno por ID
export const getAlumno = async (id) => {
    const alumno = await alumnoRepo.findById(id);
    if(!alumno) {
        throw new Error('Alumno no encontrado');
    }
    return alumno;
};

//Obtener alumno por número de socio
export const getAlumnoByNumeroSocio = async (numero_socio) => {
    const alumno = await alumnoRepo.findByNumeroSocio(numero_socio);
    if(!alumno) {
        throw new Error('Alumno no encontrado');
    }
    return alumno;
};

//Obtener todos los alumnos (activos por defecto)
export const getAllAlumnos = async (filters = {}, options = {}) => {
    return await alumnoRepo.findAll(filters, options);
};


//Crear alumno
export const createAlumno = async (data) => {
    try {
        const existing = await alumnoRepo.findByNumeroSocio(data.numero_socio);
        if(existing) {
            throw new Error('El número de socio ya está en uso');
        }

        data.estado = data.estado || 'ACTIVO';
        return await alumnoRepo.createAlumno(data);
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Esta persona ya es un alumno en el sistema');
        }
        throw error;
    }
};


//Actualizar alumno por ID
export const updateAlumno = async (id, updateData) => {
    const alumno = await alumnoRepo.findById(id);
    if(!alumno) {
        throw new Error('Alumno no encontrado');
    }

   if(updateData.numero_socio && updateData.numero_socio !== alumno.numero_socio) {
    const exists = await alumnoRepo.findByNumeroSocio(updateData.numero_socio);
    if(exists) {
        throw new Error('El número de socio ya está en uso');
    }
   }

   return await alumnoRepo.updateById(id, updateData);

};

//Eliminar alumno de forma fisica
export const deleteAlumnoPermanently = async (id) => {
    const alumno = await alumnoRepo.findById(id);
    if(!alumno) {
        throw new Error('Alumno no encontrado');
    }

    return await alumnoRepo.deleteById(id);
}

//Eliminar alumno por ID (soft delete)
export const deleteAlumno =  async (id, deleteBy = null) => {
    const alumno = await alumnoRepo.findById(id);
    if(!alumno) {
        throw new Error('Alumno no encontrado');
    }

    if(alumno.estado === 'INACTIVO') {
        throw new Error('El alumno ya está inactivo');
    }

    return await alumnoRepo.softDeleteById(id, deleteBy);
};

//Restaurar alumno eliminado
export const restoreAlumno = async (id, restoreBy = null) => {
    const alumno = await alumnoRepo.findRawById(id);
    if(!alumno) throw new Error('Alumno no encontrado');
    return await alumnoRepo.restoreById(id, restoreBy);
};

//Obtener alumnos por tutor
export const getAlumnosByTutorId = async (tutorId) => {
    return await alumnoRepo.findByTutorId(tutorId);
};
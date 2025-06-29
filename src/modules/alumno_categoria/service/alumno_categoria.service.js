import * as alumnoCategoriaRepo from '../repository/alumno_categoria.repository.js';

// Crear una nueva relación alumno-categoría
export const createAlumnoCategoria = async (data) => {
    const existing = await alumnoCategoriaRepo.findByAlumnoAndCategoria(data.alumno, data.categoria);
    if (existing) {
        throw new Error('El alumno ya está inscripto en esta categoría');
    }

    data.estado = data.estado || 'ACTIVO';

    return await alumnoCategoriaRepo.create(data);
};

// Obtener por ID
export const getAlumnoCategoriaById = async (id) => {
    const relacion = await alumnoCategoriaRepo.findById(id);
    if (!relacion) {
        throw new Error('Inscripción no encontrada');
    }
    return relacion;
};

// Obtener todos con filtros
export const getAllAlumnoCategorias = async (filter = {}, options = {}) => {
    return await alumnoCategoriaRepo.findAll(filter, options);
};

// Actualizar una inscripción por ID
export const updateAlumnoCategoria = async (id, updateData) => {
    const existing = await alumnoCategoriaRepo.findById(id);
    if (!existing) {
        throw new Error('Inscripción no encontrada');
    }

    // Validar que no cree una inscripción duplicada si cambia alumno o categoría
    if (
        (updateData.alumno && updateData.alumno !== existing.alumno.toString()) ||
        (updateData.categoria && updateData.categoria !== existing.categoria.toString())
      ) {
        const existe = await alumnoCategoriaRepo.findByAlumnoAndCategoria(
          updateData.alumno || existing.alumno,
          updateData.categoria || existing.categoria
        );
        if (existe) {
          throw new Error('Ya existe esta inscripción con los nuevos datos');
        }
      }
    return await alumnoCategoriaRepo.updateById(id, updateData);
};

// Eliminar físicamente
export const deleteAlumnoCategoriaPermanently = async (id) => {
    const relacion = await alumnoCategoriaRepo.findById(id);
    if (!relacion) {
        throw new Error('Inscripción no encontrada');
    }
    return await alumnoCategoriaRepo.deleteById(id);
};

// Soft delete
export const deleteAlumnoCategoria = async (id, deleteBy = null) => {
    const relacion = await alumnoCategoriaRepo.findById(id);
    if (!relacion) {
        throw new Error('Inscripción no encontrada');
    }

    if (relacion.estado === 'INACTIVO') {
        throw new Error('La inscripción ya está inactiva');
    }

    return await alumnoCategoriaRepo.softDeleteById(id, deleteBy);
};

// Restaurar
export const restoreAlumnoCategoria = async (id, restoreBy = null) => {
    let relacion = await alumnoCategoriaRepo.findDeletedById(id);
    
    if (!relacion) {
        relacion = await alumnoCategoriaRepo.findById(id);
        if (!relacion) {
            throw new Error('Inscripción no encontrada');
        }
        if (relacion.estado === 'ACTIVO') {
            throw new Error('La inscripción ya está activa');
        }
    }

    return await alumnoCategoriaRepo.restoreById(id, restoreBy);
};

//Listar por alumno
export const getCategoriasByAlumno = async (alumnoId) => {
    return await alumnoCategoriaRepo.findByAlumno(alumnoId);
};

//Listar por categoría
export const getAlumnosByCategoria = async (categoriaId) => {
    return await alumnoCategoriaRepo.findByCategoria(categoriaId);
};


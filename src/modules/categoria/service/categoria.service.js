import * as categoriaRepo from '../repository/categoria.repository.js';

export const createCategoria = async (categoriaData) => {
  // Validar que no exista una categoría con el mismo nombre
  const existingCategoria = await categoriaRepo.findByNombre(categoriaData.nombre);
  if (existingCategoria) {
    throw new Error('Ya existe una categoría registrada con este nombre');
  }

  // Validar que la edad mínima sea menor que la máxima
  if (categoriaData.edadMinima >= categoriaData.edadMaxima) {
    throw new Error('La edad mínima debe ser menor que la edad máxima');
  }

  // Validar horarios si se proporcionan
  if (categoriaData.horarios && categoriaData.horarios.length > 0) {
    for (let horario of categoriaData.horarios) {
      const inicio = horario.hora_inicio.split(':').map(Number);
      const fin = horario.hora_fin.split(':').map(Number);
      
      const minutosInicio = inicio[0] * 60 + inicio[1];
      const minutosFin = fin[0] * 60 + fin[1];
      
      if (minutosInicio >= minutosFin) {
        throw new Error(`La hora de inicio (${horario.hora_inicio}) debe ser menor que la hora de fin (${horario.hora_fin}) para el día ${horario.dia}`);
      }
    }
  }

  return await categoriaRepo.create(categoriaData);
};

export const getCategoriaById = async (id) => {
  const categoria = await categoriaRepo.findById(id);
  if (!categoria) {
    throw new Error('Categoría no encontrada');
  }
  return categoria;
};

export const getCategoriaByNombre = async (nombre) => {
  const categoria = await categoriaRepo.findByNombre(nombre);
  if (!categoria) {
    throw new Error('Categoría no encontrada');
  }
  return categoria;
};

export const getAllCategorias = async (filters = {}, options = {}) => {
  return await categoriaRepo.findAll(filters, options);
};

export const updateCategoria = async (id, updateData) => {
  // Verificar que la categoría existe
  const existingCategoria = await categoriaRepo.findById(id);
  if (!existingCategoria) {
    throw new Error('Categoría no encontrada');
  }

  // Si se está actualizando el nombre, verificar que no exista
  if (updateData.nombre && updateData.nombre !== existingCategoria.nombre) {
    const nombreExists = await categoriaRepo.findByNombre(updateData.nombre);
    if (nombreExists) {
      throw new Error('El nombre ya está en uso por otra categoría');
    }
  }

  // Validar edades si se están actualizando
  const edadMin = updateData.edadMinima !== undefined ? updateData.edadMinima : existingCategoria.edadMinima;
  const edadMax = updateData.edadMaxima !== undefined ? updateData.edadMaxima : existingCategoria.edadMaxima;
  
  if (edadMin >= edadMax) {
    throw new Error('La edad mínima debe ser menor que la edad máxima');
  }

  // Validar horarios si se están actualizando
  if (updateData.horarios && updateData.horarios.length > 0) {
    for (let horario of updateData.horarios) {
      const inicio = horario.hora_inicio.split(':').map(Number);
      const fin = horario.hora_fin.split(':').map(Number);
      
      const minutosInicio = inicio[0] * 60 + inicio[1];
      const minutosFin = fin[0] * 60 + fin[1];
      
      if (minutosInicio >= minutosFin) {
        throw new Error(`La hora de inicio (${horario.hora_inicio}) debe ser menor que la hora de fin (${horario.hora_fin}) para el día ${horario.dia}`);
      }
    }
  }

  return await categoriaRepo.updateById(id, updateData);
};

export const deleteCategoria = async (id, deletedBy = null) => {
  const categoria = await categoriaRepo.findById(id);
  if (!categoria) {
    throw new Error('Categoría no encontrada');
  }
  
  // TODO: Verificar que no tenga alumnos asignados antes de eliminar
  // Esta validación se implementará cuando se tenga el módulo de alumnos
  
  return await categoriaRepo.softDeleteById(id, deletedBy);
};

export const restoreCategoria = async (id, restoredBy = null) => {
  return await categoriaRepo.restoreById(id, restoredBy);
};

export const getDeletedCategorias = async (filters = {}, options = {}) => {
  return await categoriaRepo.findDeleted(filters, options);
};

export const getAllCategoriasIncludingDeleted = async (filters = {}, options = {}) => {
  return await categoriaRepo.findWithDeleted(filters, options);
};

export const searchCategorias = async (searchTerm) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
  }

  return await categoriaRepo.searchByName(searchTerm.trim());
};

export const getCategoriasByNivel = async (nivel) => {
  return await categoriaRepo.findByNivel(nivel);
};

export const getCategoriasByRangoEdad = async (edadMin, edadMax) => {
  if (edadMin < 0 || edadMax < 0 || edadMin > edadMax) {
    throw new Error('Rango de edad inválido');
  }

  return await categoriaRepo.findByRangoEdad(edadMin, edadMax);
};

export const getCategoriasActivas = async () => {
  return await categoriaRepo.findActivas();
};

export const getCategoriasByHorario = async (dia) => {
  const diasValidos = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  if (!diasValidos.includes(dia.toUpperCase())) {
    throw new Error('Día de la semana inválido');
  }

  return await categoriaRepo.findByHorario(dia.toUpperCase());
};

export const activateCategoria = async (id) => {
  const categoria = await categoriaRepo.findById(id);
  if (!categoria) {
    throw new Error('Categoría no encontrada');
  }

  return await categoriaRepo.updateById(id, { estado: 'ACTIVA' });
};

export const deactivateCategoria = async (id) => {
  const categoria = await categoriaRepo.findById(id);
  if (!categoria) {
    throw new Error('Categoría no encontrada');
  }

  // TODO: Verificar que no tenga alumnos activos antes de desactivar
  // Esta validación se implementará cuando se tenga el módulo de alumnos

  return await categoriaRepo.updateById(id, { estado: 'INACTIVA' });
};

export const getCategoriaStats = async () => {
  const totalCategorias = await categoriaRepo.findAll({}, { page: 1, limit: 1 });
  const categoriasActivas = await categoriaRepo.findAll({ estado: 'ACTIVA' }, { page: 1, limit: 1 });
  
  return {
    total: totalCategorias.pagination.total,
    activas: categoriasActivas.pagination.total,
    inactivas: totalCategorias.pagination.total - categoriasActivas.pagination.total
  };
};

/**
 * Método para crear categoría con soporte para transacciones
 */
export const createCategoriaWithSession = async (categoriaData, session) => {
  // Validar que no exista una categoría con el mismo nombre
  const existingCategoria = await categoriaRepo.findByNombreWithSession(categoriaData.nombre, session);
  if (existingCategoria) {
    throw new Error('Ya existe una categoría registrada con este nombre');
  }

  // Validar que la edad mínima sea menor que la máxima
  if (categoriaData.edadMinima >= categoriaData.edadMaxima) {
    throw new Error('La edad mínima debe ser menor que la edad máxima');
  }

  // Validar horarios si se proporcionan
  if (categoriaData.horarios && categoriaData.horarios.length > 0) {
    for (let horario of categoriaData.horarios) {
      const inicio = horario.hora_inicio.split(':').map(Number);
      const fin = horario.hora_fin.split(':').map(Number);
      
      const minutosInicio = inicio[0] * 60 + inicio[1];
      const minutosFin = fin[0] * 60 + fin[1];
      
      if (minutosInicio >= minutosFin) {
        throw new Error(`La hora de inicio (${horario.hora_inicio}) debe ser menor que la hora de fin (${horario.hora_fin}) para el día ${horario.dia}`);
      }
    }
  }

  return await categoriaRepo.createWithSession(categoriaData, session);
};
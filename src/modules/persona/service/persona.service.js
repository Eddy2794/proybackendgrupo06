import * as personaRepo from '../repository/persona.repository.js';

export const createPersona = async (personaData) => {
  // Validar que no exista una persona con el mismo documento
  const existingPersona = await personaRepo.findByDocumento(personaData.numeroDocumento);
  if (existingPersona) {
    throw new Error('Ya existe una persona registrada con este número de documento');
  }

  // Validar que no exista una persona con el mismo email
  const existingEmail = await personaRepo.findByEmail(personaData.email);
  if (existingEmail) {
    throw new Error('Ya existe una persona registrada con este email');
  }

  // Validar edad mínima
  const fechaNacimiento = new Date(personaData.fechaNacimiento);
  const hoy = new Date();
  const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  
  if (edad < 13) {
    throw new Error('La persona debe ser mayor de 13 años para registrarse');
  }

  return await personaRepo.create(personaData);
};

export const getPersonaById = async (id) => {
  const persona = await personaRepo.findById(id);
  if (!persona) {
    throw new Error('Persona no encontrada');
  }
  
  if (persona.estado === 'INACTIVO') {
    throw new Error('La persona está inactiva');
  }
  
  return persona;
};

export const getPersonaByEmail = async (email) => {
  const persona = await personaRepo.findByEmail(email);
  if (!persona) {
    throw new Error('Persona no encontrada');
  }
  return persona;
};

export const getPersonaByDocumento = async (numeroDocumento) => {
  const persona = await personaRepo.findByDocumento(numeroDocumento);
  if (!persona) {
    throw new Error('Persona no encontrada');
  }
  return persona;
};

export const getAllPersonas = async (filters = {}, options = {}) => {
  return await personaRepo.findAll(filters, options);
};

export const updatePersona = async (id, updateData) => {
  // Verificar que la persona existe
  const existingPersona = await personaRepo.findById(id);
  if (!existingPersona) {
    throw new Error('Persona no encontrada');
  }

  // Si se está actualizando el email, verificar que no exista
  if (updateData.email && updateData.email !== existingPersona.email) {
    const emailExists = await personaRepo.findByEmail(updateData.email);
    if (emailExists) {
      throw new Error('El email ya está en uso por otra persona');
    }
  }

  // Si se está actualizando el documento, verificar que no exista
  if (updateData.numeroDocumento && updateData.numeroDocumento !== existingPersona.numeroDocumento) {
    const documentoExists = await personaRepo.findByDocumento(updateData.numeroDocumento);
    if (documentoExists) {
      throw new Error('El número de documento ya está en uso por otra persona');
    }
  }

  return await personaRepo.updateById(id, updateData);
};

export const deletePersona = async (id) => {
  const persona = await personaRepo.findById(id);
  if (!persona) {
    throw new Error('Persona no encontrada');
  }

  // Soft delete - cambiar estado a INACTIVO
  return await personaRepo.softDeleteById(id);
};

export const activatePersona = async (id) => {
  const persona = await personaRepo.findById(id);
  if (!persona) {
    throw new Error('Persona no encontrada');
  }

  return await personaRepo.updateById(id, { estado: 'ACTIVO' });
};

export const searchPersonas = async (searchTerm) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
  }

  return await personaRepo.searchByName(searchTerm.trim());
};

export const getPersonasByAge = async (minAge, maxAge) => {
  if (minAge < 0 || maxAge < 0 || minAge > maxAge) {
    throw new Error('Rango de edad inválido');
  }

  return await personaRepo.findByAge(minAge, maxAge);
};

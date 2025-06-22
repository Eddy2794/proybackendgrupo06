import * as personaService from '../service/persona.service.js';
import { validationResult } from 'express-validator';

export const createPersona = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.validation('Errores de validación', errors.array());
    }
    const persona = await personaService.createPersona(req.body);
    return res.success('Persona creada exitosamente', persona);
  } catch (error) {
    next(error);
  }
};

export const getPersonaById = async (req, res, next) => {
  try {
    const persona = await personaService.getPersonaById(req.params.id);
    if (!persona) {
      return res.error('Persona no encontrada', 404);
    }
    return res.success('Persona obtenida exitosamente', persona);
  } catch (error) {
    next(error);
  }
};

export const getAllPersonas = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, estado, genero, search } = req.query;
    const filters = {};
    if (estado) filters.estado = estado;
    if (genero) filters.genero = genero;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };
    let personas, pagination;
    if (search) {
      personas = await personaService.searchPersonas(search);
      pagination = { page: 1, pages: 1, total: personas.length, limit: personas.length };
    } else {
      const result = await personaService.getAllPersonas(filters, options);
      personas = result.personas;
      pagination = result.pagination;
    }
    return res.paginated('Lista de personas', personas, pagination);
  } catch (error) {
    next(error);
  }
};

export const updatePersona = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.validation('Errores de validación', errors.array());
    }
    const persona = await personaService.updatePersona(req.params.id, req.body);
    if (!persona) {
      return res.error('Persona no encontrada', 404);
    }
    return res.success('Persona actualizada exitosamente', persona);
  } catch (error) {
    next(error);
  }
};

export const deletePersona = async (req, res, next) => {
  try {
    const deleted = await personaService.deletePersona(req.params.id);
    if (!deleted) {
      return res.error('Persona no encontrada', 404);
    }
    return res.success('Persona desactivada exitosamente');
  } catch (error) {
    next(error);
  }
};

export const activatePersona = async (req, res, next) => {
  try {
    const persona = await personaService.activatePersona(req.params.id);
    if (!persona) {
      return res.error('Persona no encontrada', 404);
    }
    return res.success('Persona activada exitosamente', persona);
  } catch (error) {
    next(error);
  }
};

export const searchPersonas = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.validation('Parámetro de búsqueda requerido');
    }
    const personas = await personaService.searchPersonas(q);
    return res.success('Resultados de búsqueda de personas', personas);
  } catch (error) {
    next(error);
  }
};

export const getPersonasByAge = async (req, res, next) => {
  try {
    const { minAge, maxAge } = req.query;
    if (!minAge || !maxAge) {
      return res.validation('Parámetros minAge y maxAge son requeridos');
    }
    const personas = await personaService.getPersonasByAge(
      parseInt(minAge),
      parseInt(maxAge)
    );
    return res.success('Personas filtradas por edad', personas);
  } catch (error) {
    next(error);
  }
};

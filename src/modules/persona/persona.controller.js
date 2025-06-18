import * as personaService from './persona.service.js';
import { validationResult } from 'express-validator';

export const createPersona = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Errores de validación',
        errors: errors.array() 
      });
    }

    const persona = await personaService.createPersona(req.body);
    
    res.status(201).json({
      message: 'Persona creada exitosamente',
      persona: {
        id: persona._id,
        nombreCompleto: persona.nombreCompleto,
        email: persona.email,
        numeroDocumento: persona.numeroDocumento
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPersonaById = async (req, res, next) => {
  try {
    const persona = await personaService.getPersonaById(req.params.id);
    res.json(persona);
  } catch (error) {
    if (error.message === 'Persona no encontrada') {
      return res.status(404).json({ message: error.message });
    }
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

    let result;
    
    if (search) {
      // Si hay búsqueda, usar el método de búsqueda
      result = {
        personas: await personaService.searchPersonas(search),
        pagination: { page: 1, limit: 20, total: null, pages: 1 }
      };
    } else {
      result = await personaService.getAllPersonas(filters, options);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updatePersona = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Errores de validación',
        errors: errors.array() 
      });
    }

    const persona = await personaService.updatePersona(req.params.id, req.body);
    
    res.json({
      message: 'Persona actualizada exitosamente',
      persona
    });
  } catch (error) {
    if (error.message === 'Persona no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const deletePersona = async (req, res, next) => {
  try {
    await personaService.deletePersona(req.params.id);
    
    res.json({
      message: 'Persona desactivada exitosamente'
    });
  } catch (error) {
    if (error.message === 'Persona no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const activatePersona = async (req, res, next) => {
  try {
    const persona = await personaService.activatePersona(req.params.id);
    
    res.json({
      message: 'Persona activada exitosamente',
      persona
    });
  } catch (error) {
    if (error.message === 'Persona no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const searchPersonas = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        message: 'Parámetro de búsqueda requerido' 
      });
    }

    const personas = await personaService.searchPersonas(q);
    res.json(personas);
  } catch (error) {
    next(error);
  }
};

export const getPersonasByAge = async (req, res, next) => {
  try {
    const { minAge, maxAge } = req.query;
    
    if (!minAge || !maxAge) {
      return res.status(400).json({ 
        message: 'Parámetros minAge y maxAge son requeridos' 
      });
    }

    const personas = await personaService.getPersonasByAge(
      parseInt(minAge), 
      parseInt(maxAge)
    );
    
    res.json(personas);
  } catch (error) {
    next(error);
  }
};

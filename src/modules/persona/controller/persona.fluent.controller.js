/**
 * Controlador de personas con documentación automática
 */

import * as personaService from '../service/persona.service.js';

export class PersonaController {
  
  async getAllPersonas(req, res, next) {
    try {
      const { page = 1, limit = 10, search, estado } = req.query;
      const filters = {};
      if (search) filters.search = search;
      if (estado) filters.estado = estado;
      
      const options = { page: parseInt(page), limit: parseInt(limit) };
      const result = await personaService.getAllPersonas(filters, options);
      return res.success('Personas obtenidas exitosamente', result);
    } catch (error) {
      next(error);
    }
  }

  async getPersonaById(req, res, next) {
    try {
      const { id } = req.params;
      const persona = await personaService.getPersonaById(id);
      return res.success('Persona obtenida exitosamente', persona);
    } catch (error) {
      next(error);
    }
  }

  async createPersona(req, res, next) {
    try {
      const personaData = req.body;
      const persona = await personaService.createPersona(personaData);
      return res.success('Persona creada exitosamente', persona);
    } catch (error) {
      next(error);
    }
  }

  async updatePersona(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const persona = await personaService.updatePersona(id, updateData);
      return res.success('Persona actualizada exitosamente', persona);
    } catch (error) {
      next(error);
    }
  }  async deletePersona(req, res, next) {
    try {
      const { id } = req.params;
      const deletedBy = req.auditUser || req.user?.userId || null; // Priorizar middleware de auditoría
      const persona = await personaService.deletePersona(id, deletedBy);
      return res.success('Persona eliminada exitosamente', persona);
    } catch (error) {
      next(error);
    }
  }

  async restorePersona(req, res, next) {
    try {
      const { id } = req.params;
      const restoredBy = req.auditUser || req.user?.userId || null; // Priorizar middleware de auditoría
      const persona = await personaService.restorePersona(id, restoredBy);
      return res.success('Persona restaurada exitosamente', persona);
    } catch (error) {
      next(error);
    }
  }

  async getDeletedPersonas(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = { page: parseInt(page), limit: parseInt(limit) };
      const result = await personaService.getDeletedPersonas({}, options);
      return res.success('Personas eliminadas obtenidas exitosamente', result);
    } catch (error) {
      next(error);
    }
  }

  async getAllPersonasIncludingDeleted(req, res, next) {
    try {
      const { page = 1, limit = 10, includeDeleted = false } = req.query;
      const options = { page: parseInt(page), limit: parseInt(limit) };
      
      const result = includeDeleted === 'true' 
        ? await personaService.getAllPersonasIncludingDeleted({}, options)
        : await personaService.getAllPersonas({}, options);
        
      return res.success('Personas obtenidas exitosamente', result);
    } catch (error) {
      next(error);
    }
  }

  async activatePersona(req, res, next) {
    try {
      const { id } = req.params;
      const persona = await personaService.activatePersona(id);
      return res.success('Persona activada exitosamente', persona);
    } catch (error) {
      next(error);
    }
  }

  async searchPersonas(req, res, next) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.error('Parámetro de búsqueda requerido', 400);
      }
      const personas = await personaService.searchPersonas(query);
      return res.success('Búsqueda completada exitosamente', personas);
    } catch (error) {
      next(error);
    }
  }

  async getPersonaStats(req, res, next) {
    try {
      // Simular estadísticas básicas
      const totalPersonas = await personaService.getAllPersonas({}, { page: 1, limit: 1 });
      const stats = {
        total: totalPersonas.total || 0,
        activas: totalPersonas.total || 0,
        message: 'Estadísticas básicas obtenidas'
      };
      return res.success('Estadísticas obtenidas exitosamente', stats);
    } catch (error) {
      next(error);
    }
  }
}

export const personaController = new PersonaController();

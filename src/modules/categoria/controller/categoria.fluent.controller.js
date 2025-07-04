/**
 * Controlador de categorías con documentación automática
 */

import * as categoriaService from '../service/categoria.service.js';

export class CategoriaController {
  
  async getAllCategorias(req, res, next) {
    try {
      const { page = 1, limit = 10, search, estado, nivel, edadMinima, edadMaxima } = req.query;
      const filters = {};
      if (search) filters.nombre = { $regex: search, $options: 'i' };
      if (estado) filters.estado = estado;
      if (nivel) filters.nivel = nivel;
      if (edadMinima !== undefined) filters.edadMinima = { $gte: parseInt(edadMinima) };
      if (edadMaxima !== undefined) filters.edadMaxima = { $lte: parseInt(edadMaxima) };
      
      const options = { page: parseInt(page), limit: parseInt(limit) };
      const result = await categoriaService.getAllCategorias(filters, options);
      return res.success('Categorías obtenidas exitosamente', result);
    } catch (error) {
      next(error);
    }
  }

  async getCategoriaById(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.getCategoriaById(id);
      return res.success('Categoría obtenida exitosamente', categoria);
    } catch (error) {
      next(error);
    }
  }

  async createCategoria(req, res, next) {
    try {
      const categoriaData = req.body;
      const categoria = await categoriaService.createCategoria(categoriaData);
      return res.success('Categoría creada exitosamente', categoria);
    } catch (error) {
      next(error);
    }
  }

  async updateCategoria(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const categoria = await categoriaService.updateCategoria(id, updateData);
      return res.success('Categoría actualizada exitosamente', categoria);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategoria(req, res, next) {
    try {
      const { id } = req.params;
      const deletedBy = req.auditUser || req.user?.userId || null; // Priorizar middleware de auditoría
      const categoria = await categoriaService.deleteCategoria(id, deletedBy);
      return res.success('Categoría eliminada exitosamente', categoria);
    } catch (error) {
      next(error);
    }
  }

  async restoreCategoria(req, res, next) {
    try {
      const { id } = req.params;
      const restoredBy = req.auditUser || req.user?.userId || null; // Priorizar middleware de auditoría
      const categoria = await categoriaService.restoreCategoria(id, restoredBy);
      return res.success('Categoría restaurada exitosamente', categoria);
    } catch (error) {
      next(error);
    }
  }

  async getDeletedCategorias(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = { page: parseInt(page), limit: parseInt(limit) };
      const result = await categoriaService.getDeletedCategorias({}, options);
      return res.success('Categorías eliminadas obtenidas exitosamente', result);
    } catch (error) {
      next(error);
    }
  }

  async getAllCategoriasIncludingDeleted(req, res, next) {
    try {
      const { page = 1, limit = 10, includeDeleted = false } = req.query;
      const options = { page: parseInt(page), limit: parseInt(limit) };
      
      const result = includeDeleted === 'true' 
        ? await categoriaService.getAllCategoriasIncludingDeleted({}, options)
        : await categoriaService.getAllCategorias({}, options);
        
      return res.success('Categorías obtenidas exitosamente', result);
    } catch (error) {
      next(error);
    }
  }

  async activateCategoria(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.activateCategoria(id);
      return res.success('Categoría activada exitosamente', categoria);
    } catch (error) {
      next(error);
    }
  }

  async deactivateCategoria(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.deactivateCategoria(id);
      return res.success('Categoría desactivada exitosamente', categoria);
    } catch (error) {
      next(error);
    }
  }

  async searchCategorias(req, res, next) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.error('Parámetro de búsqueda requerido', 400);
      }
      const categorias = await categoriaService.searchCategorias(query);
      return res.success('Búsqueda completada exitosamente', categorias);
    } catch (error) {
      next(error);
    }
  }

  async getCategoriasByNivel(req, res, next) {
    try {
      const { nivel } = req.params;
      const categorias = await categoriaService.getCategoriasByNivel(nivel);
      return res.success('Categorías por nivel obtenidas exitosamente', categorias);
    } catch (error) {
      next(error);
    }
  }

  async getCategoriasByRangoEdad(req, res, next) {
    try {
      const { edadMinima, edadMaxima } = req.query;
      if (!edadMinima || !edadMaxima) {
        return res.error('Se requieren edadMinima y edadMaxima', 400);
      }
      const categorias = await categoriaService.getCategoriasByRangoEdad(
        parseInt(edadMinima), 
        parseInt(edadMaxima)
      );
      return res.success('Categorías por rango de edad obtenidas exitosamente', categorias);
    } catch (error) {
      next(error);
    }
  }

  async getCategoriasActivas(req, res, next) {
    try {
      const categorias = await categoriaService.getCategoriasActivas();
      return res.success('Categorías activas obtenidas exitosamente', categorias);
    } catch (error) {
      next(error);
    }
  }

  async getCategoriasByHorario(req, res, next) {
    try {
      const { dia } = req.params;
      const categorias = await categoriaService.getCategoriasByHorario(dia);
      return res.success('Categorías por horario obtenidas exitosamente', categorias);
    } catch (error) {
      next(error);
    }
  }

  async getCategoriaStats(req, res, next) {
    try {
      const stats = await categoriaService.getCategoriaStats();
      return res.success('Estadísticas obtenidas exitosamente', stats);
    } catch (error) {
      next(error);
    }
  }
}

export const categoriaController = new CategoriaController();
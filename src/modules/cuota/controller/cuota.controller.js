import * as cuotaService from '../service/cuota.service.js';

export class CuotaController {
  async create(req, res, next) {
    try {
      const result = await cuotaService.crearCuota(req.body);
      return res.success('Cuota creada correctamente', result);
    } catch (error) { 
      next(error); 
    }
  }

  async getById(req, res, next) {
    try {
      const result = await cuotaService.obtenerCuotaPorId(req.params.id);
      return res.success('Cuota obtenida correctamente', result);
    } catch (error) { 
      next(error); 
    }
  }

  async getByAlumnoCategoria(req, res, next) {
    try {
      const result = await cuotaService.obtenerCuotasPorAlumnoCategoria(req.params.alumnoCategoriaId);
      return res.success('Cuotas obtenidas correctamente', result);
    } catch (error) { 
      next(error); 
    }
  }

  async update(req, res, next) {
    try {
      const result = await cuotaService.actualizarCuota(req.params.id, req.body);
      return res.success('Cuota actualizada correctamente', result);
    } catch (error) { 
      next(error); 
    }
  }

  async delete(req, res, next) {
    try {
      const result = await cuotaService.eliminarCuota(req.params.id);
      return res.success('Cuota eliminada correctamente', result);
    } catch (error) { 
      next(error); 
    }
  }

  async softDelete(req, res, next) {
    try {
      const deletedBy = req.user?.userId || null;
      const result = await cuotaService.deleteCuota(req.params.id, deletedBy);
      return res.success('Cuota eliminada lógicamente', result);
    } catch (error) { 
      next(error); 
    }
  }

  async restore(req, res, next) {
    try {
      const restoredBy = req.user?.userId || null;
      const result = await cuotaService.restoreCuota(req.params.id, restoredBy);
      return res.success('Cuota restaurada correctamente', result);
    } catch (error) { 
      next(error); 
    }
  }

  async getByEstado(req, res, next) {
    try {
      const { estado } = req.query;
      const result = await cuotaService.obtenerCuotasPorEstado(estado);
      return res.success('Cuotas filtradas por estado', result);
    } catch (error) { 
      next(error); 
    }
  }

  async getByPeriodo(req, res, next) {
    try {
      const { anio, mes } = req.query;
      const result = await cuotaService.obtenerCuotasPorPeriodo(anio, mes);
      return res.success('Cuotas filtradas por periodo', result);
    } catch (error) { 
      next(error); 
    }
  }

  async marcarComoPagada(req, res, next) {
    try {
      const result = await cuotaService.marcarCuotaComoPagada(req.params.id, req.body);
      return res.success('Cuota marcada como pagada', result);
    } catch (error) { 
      next(error); 
    }
  }

  async getVencidas(req, res, next) {
    try {
      const { fecha } = req.query;
      const fechaReferencia = fecha ? new Date(fecha) : new Date();
      const result = await cuotaService.obtenerCuotasVencidas(fechaReferencia);
      return res.success('Cuotas vencidas obtenidas', result);
    } catch (error) { 
      next(error); 
    }
  }
}

export const cuotaController = new CuotaController(); 
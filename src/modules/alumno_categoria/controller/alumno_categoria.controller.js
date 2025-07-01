import * as alumnoCategoriaService from '../service/alumno_categoria.service.js';

export class AlumnoCategoriaController {

    async create(req, res, next) {
        try {
            const result = await alumnoCategoriaService.createAlumnoCategoria(req.body);
            return res.success('Inscripción creada correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const result = await alumnoCategoriaService.getAllAlumnoCategorias(req.query);
            return res.success('Inscripciones obtenidas correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const result = await alumnoCategoriaService.getAlumnoCategoriaById(req.params.id);
            return res.success('Inscripción obtenida correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async upate(req, res, next) {
        try {
            const result = await alumnoCategoriaService.updateAlumnoCategoria(req.params.id, req.body);
            return res.success('Inscripción actualizada correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await alumnoCategoriaService.deleteAlumnoCategoriaPermanently(req.params.id);
            return res.success('Inscripción eliminada correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async softDelete(req, res, next) {
        try {
            const deletedBy = req.auditUser || req.user?.userId || null; //Si no hay usuario, se pasa null
            const result = await alumnoCategoriaService.deleteAlumnoCategoria(req.params.id, deletedBy);
            return res.success('Inscripción eliminada correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async restore(req, res, next) {
        try {
            const restoredBy = req.auditUser || req.user?.userId || null; //Si no hay usuario, se pasa null
            const result = await alumnoCategoriaService.restoreAlumnoCategoria(req.params.id, restoredBy);
            return res.success('Inscripción restaurada correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async getByAlumno(req, res, next) {
        try {
            const result = await alumnoCategoriaService.getCategoriasByAlumno(req.params.alumnoId);
            return res.success('Inscripciones obtenidas correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async getByCategoria(req, res, next) {
        try {
            const result = await alumnoCategoriaService.getAlumnosByCategoria(req.params.categoriaId);
            return res.success('Inscripciones obtenidas correctamente', result);
        } catch (error) {
            next(error);
        }
    }

    async getStats(req, res, next) {
        try {
            const period = req.query.period || 'month'; // day, month, year
            const result = await alumnoCategoriaService.getInscripcionesStats(period);
            return res.success('Estadísticas obtenidas correctamente', result);
        } catch (error) {
            next(error);
        }
    }
    
}

export const alumnoCategoriaController = new AlumnoCategoriaController();
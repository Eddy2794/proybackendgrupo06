import * as profesorCategoriaService from '../service/profesor-categoria.service.js';

export class ProfesorCategoriaController {
    async createProfesorCategoria(req, res, next) {
        try {
            const profesorCategoriaData = req.body;
            const profesorCategoria = await profesorCategoriaService.createProfesorCategoria(profesorCategoriaData);
            return res.success('Relación profesor-categoría creada exitosamente', profesorCategoria);
        } catch (error) {
            next(error);
        }
    }

    async getProfesores(req, res, next) {
        try {
           
            const { page = 1, limit = 10, sort = '-createdAt', search, activo } = req.query;
            
            const queryOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort,
                search,
                activo: activo !== undefined ? activo === 'true' : undefined
            };

            const profesores = await profesorCategoriaService.getProfesores(queryOptions);
            return res.success('Relaciones profesor-categoría obtenidas exitosamente', profesores);
        } catch (error) {
            next(error);
        }
    }

    async getProfesoresByCategoria(req, res, next) {
        try {
            const { idCategoria } = req.params;
            const { page = 1, limit = 10, sort = '-createdAt', activo = true } = req.query;
            
            const queryOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort,
                activo: 'true'
            };

            const profesores = await profesorCategoriaService.getProfesoresByCategoria(idCategoria, queryOptions);
            return res.success('Profesores de la categoría obtenidos exitosamente', profesores);
        } catch (error) {
            next(error);
        }
    }

    async getCategoriaByProfesor(req, res, next) {
        try {
            const { idProfesor } = req.params;
            const { page = 1, limit = 10, sort = '-createdAt', activo = true } = req.query;
            
            const queryOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort,
                activo:'true'
            };

            const categorias = await profesorCategoriaService.getCategoriaByProfesor(idProfesor, queryOptions);
            return res.success('Categorías del profesor obtenidas exitosamente', categorias);
        } catch (error) {
            next(error);
        }
    }

    async updateProfesorCategoria(req, res, next) {
        try {
            const { id } = req.params;
            const profesorCategoriaData = req.body;
            const profesorCategoria = await profesorCategoriaService.updateProfesorCategoria(id, profesorCategoriaData);
            return res.success('Relación profesor-categoría actualizada exitosamente', profesorCategoria);
        } catch (error) {
            next(error);
        }
    }

    async deleteProfesorCategoria(req, res, next) {
        try {
            const { id } = req.params;
            const profesorCategoria = await profesorCategoriaService.deleteProfesorCategoria(id);
            return res.success('Relación profesor-categoría eliminada exitosamente', profesorCategoria);
        } catch (error) {
            next(error);
        }
    }

    async getProfesorCategoriaById(req, res, next) {
        try {
            const { id } = req.params;
            const profesorCategoria = await profesorCategoriaService.getProfesorCategoriaById(id);
            return res.success('Relación profesor-categoría obtenida exitosamente', profesorCategoria);
        } catch (error) {
            next(error);
        }
    }
}

export const profCategController = new ProfesorCategoriaController();
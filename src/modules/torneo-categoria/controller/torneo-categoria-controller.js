import * as torneoCategoriaService from '../service/torneo-categoria-service.js';

export class TorneoCategoriaController {
    async createTorneoCategoria(req, res, next) {
        try {
            const torneoCategoriaData = req.body;
            const torneoCategoria = await torneoCategoriaService.createTorneoCategoria(torneoCategoriaData);
            return res.success('Relación torneo-categoría creada exitosamente', torneoCategoria);
        } catch (error) {
            next(error);
        }
    }

    async getTorneosCategorias(req, res, next) {
        try {
            const { page = 1, limit = 10, sort = '-createdAt', search, activa } = req.query;
            
            const queryOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort,
                search,
                estado: activa !== undefined ? (activa === 'true' ? 'ACTIVO' : 'INACTIVO') : undefined
            };

            const torneosCategorias = await torneoCategoriaService.getTorneosCategorias(queryOptions);
            return res.success('Relaciones torneo-categoría obtenidas exitosamente', torneosCategorias);
        } catch (error) {
            next(error);
        }
    }

    async getCategoriasByTorneo(req, res, next) {
        try {
            const { idTorneo } = req.params;
            const { page = 1, limit = 10, sort = '-createdAt', estado = 'ACTIVO' } = req.query;
            
            const queryOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort,
                estado: estado
            };

            const categorias = await torneoCategoriaService.getCategoriasByTorneo(idTorneo, queryOptions);
            return res.success('Categorías del torneo obtenidas exitosamente', categorias);
        } catch (error) {
            next(error);
        }
    }

    async getTorneosByCategoria(req, res, next) {
        try {
            const { idCategoria } = req.params;
            const { page = 1, limit = 10, sort = '-createdAt', estado = 'ACTIVO' } = req.query;
            
            const queryOptions = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort,
                estado: estado
            };

            const torneos = await torneoCategoriaService.getTorneosByCategoria(idCategoria, queryOptions);
            return res.success('Torneos de la categoría obtenidos exitosamente', torneos);
        } catch (error) {
            next(error);
        }
    }

    async updateTorneoCategoria(req, res, next) {
        try {
            const { id } = req.params;
            const torneoCategoriaData = req.body;
            const torneoCategoria = await torneoCategoriaService.updateTorneoCategoria(id, torneoCategoriaData);
            return res.success('Relación torneo-categoría actualizada exitosamente', torneoCategoria);
        } catch (error) {
            next(error);
        }
    }

    async deleteTorneoCategoria(req, res, next) {
        try {
            const { id } = req.params;
            const torneoCategoria = await torneoCategoriaService.deleteTorneoCategoria(id);
            return res.success('Relación torneo-categoría eliminada exitosamente', torneoCategoria);
        } catch (error) {
            next(error);
        }
    }

    async getTorneoCategoriaById(req, res, next) {
        try {
            const { id } = req.params;
            const torneoCategoria = await torneoCategoriaService.getTorneoCategoriaById(id);
            return res.success('Relación torneo-categoría obtenida exitosamente', torneoCategoria);
        } catch (error) {
            next(error);
        }
    }

    async getTorneoCategoriaByCombination(req, res, next) {
        try {
            const { idTorneo, idCategoria } = req.params;
            const torneoCategoria = await torneoCategoriaService.getTorneoCategoriaByCombination(idTorneo, idCategoria);
            return res.success('Relación torneo-categoría obtenida exitosamente', torneoCategoria);
        } catch (error) {
            next(error);
        }
    }
}

export const torneoCategoriaController = new TorneoCategoriaController();
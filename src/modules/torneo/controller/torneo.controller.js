import * as torneoService from '../service/torneo.service.js';

export class TorneoController {
    async createTorneo(req, res, next) {
        try {
            const torneoData = req.body;
            const torneo = await torneoService.createTorneo(torneoData);
            return res.success('Torneo creado exitosamente', torneo);
        } catch (error) {
            next(error);
        }
    }
    async getTorneos(req, res, next) {
        try {
            const torneos = await torneoService.getAllTorneos();
            return res.success('Torneos obtenidos exitosamente', torneos);
        } catch (error) {
            next(error);
        }
    }
    async getTorneoById(req, res, next) {
        try {
            const { id } = req.params;
            const torneo = await torneoService.getTorneoById(id);
            return res.success('Torneo obtenido exitosamente', torneo);
        } catch (error) {
            next(error);
        }
    }
    async updateTorneo(req, res, next) {
        try {
            const { id } = req.params;
            const torneoData = req.body
            const torneo = await torneoService.updateTorneo(id, torneoData);
            return res.success('Torneo actualizado exitosamente', torneo);
        } catch (error) {
            next(error);
        }
    }
    async deleteTorneo(req, res, next) {
        try {
            const { id } = req.params;
            const torneo = await torneoService.deleteTorneo(id);
            return res.success('Torneo eliminado exitosamente', torneo);
        } catch (error) {
            next(error);
        }
    }
}
export const torneoController = new TorneoController();
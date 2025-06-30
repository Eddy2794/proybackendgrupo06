import * as alumnoService from '../service/alumno.service.js';

export class AlumnoController {
    async createAlumno(req, res, next) {
        try {
            const alumno = await alumnoService.createAlumno(req.body);
            return res.success('Alumno creado exitosamente', alumno);
        } catch (error) {
            next(error);
        }
    }

    async getAllAlumnos(req, res, next) {
        try {
            const { page = 1, limit = 10, estado, search } = req.query;
            const filters = {};
            if (estado) filters.estado = estado;
            if (search) filters.search = search;

            const options = { page: parseInt(page), limit: parseInt(limit) };
            const result = await alumnoService.getAllAlumnos(filters, options);
            return res.success('Alumnos obtenidos exitosamente', result);
        } catch (error) {
            next(error);
        }
    }

    async getAlumnoById(req, res, next) {
        try {
            const { id } = req.params;
            const alumno = await alumnoService.getAlumno(id);
            return res.success('Alumno obtenido exitosamente', alumno);
        } catch (error) {
            next(error);
        }
    }

    async getAlumnoByNumeroSocio(req, res, next) {
        try {
            const { numeroSocio } = req.params; 
            const alumno = await alumnoService.getAlumnoByNumeroSocio(numeroSocio);
            return res.success('Alumno obtenido exitosamente', alumno);
        } catch (error) {
            next(error);
        }
    }

    async updateAlumno(req, res, next) {
        try {
            const { id } = req.params;
            const alumno = await alumnoService.updateAlumno(id, req.body);
            return res.success('Alumno actualizado exitosamente', alumno);
        } catch (error) {
            next(error);
        }
    }

    async deleteAlumnoFisico(req, res, next) {
        try {
            const { id } = req.params;                              
            const alumno = await alumnoService.deleteAlumnoPermanently(id);
            return res.success('Alumno eliminado de forma fisica exitosamente', alumno);
        } catch (error) {
            next(error);
        }
    }

    async deleteAlumno(req, res, next) {
        try {
            const { id } = req.params;
            const deletedBy = req.user?.userId || null;
            const alumno = await alumnoService.deleteAlumno(id, deletedBy);
            return res.success('Alumno eliminado exitosamente', alumno);
        } catch (error) {
            next(error);
        }
    }

    async restoreAlumno(req, res, next) {
        try {
            const { id } = req.params;
            const restoredBy = req.user?.userId || null;
            const alumno = await alumnoService.restoreAlumno(id, restoredBy);                       
            return res.success('Alumno restaurado exitosamente', alumno);
        } catch (error) {
            next(error);
        }
    }

    async getAlumnosByTutorId(req, res, next) {
        try {
            const { tutorId } = req.params;
            const alumnos = await alumnoService.getAlumnosByTutorId(tutorId);
            return res.success('Alumnos del tutor obtenidos exitosamente', alumnos);
        } catch (error) {
            next(error);
        }
    }
}

export const alumnoController = new AlumnoController();

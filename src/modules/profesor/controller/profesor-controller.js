import * as profesorService from '../service/profesor.service.js';


export class ProfesorController  {
    async createProfesor(req, res, next) {
        try{
            const profesorData = req.body;
            const profesor = await profesorService.createProfesor(profesorData);
            return res.success('Profesor creado exitosamente', profesor);
        }catch(error){
            next(error);
        }
    }
    async getProfesores(req, res, next) {
        try{
            const profesores = await profesorService.getProfesores();
            return res.success('Profesores obtenidos exitosamente', profesores);
        }catch(error){
            next(error);
        }
    }
    async getProfesorById(req, res, next) {
        try{
            const { id } = req.params;
            const profesor = await profesorService.getProfesorById(id);
            return res.success('Profesor obtenido exitosamente', profesor);
        }catch(error){
            next(error);
        }
    }
    async updateProfesor(req, res, next) {
        try{
            const { id } = req.params;
            const profesorData = req.body;
            const profesor = await profesorService.updateProfesor(id, profesorData);
            return res.success('Profesor actualizado exitosamente', profesor);
        }catch(error){
            next(error);
        }
    }
    async deleteProfesor(req, res, next) {
        try{
            const { id } = req.params;
            const profesor = await profesorService.deleteProfesor(id);
            return res.success('Profesor eliminado exitosamente', profesor);
        }catch(error){
            next(error);
        }
    }
}

export const profesorController = new ProfesorController();
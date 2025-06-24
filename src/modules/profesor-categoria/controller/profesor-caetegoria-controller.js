import * as profesorCategoriaService from '../service/profesor-categoria.service.js';


export class ProfesorCategoriaController  {
    async createProfesorCategoria(req, res, next) {
        try{
            const profesorCategoriaData = req.body;
            const profesorCategoria = await profesorCategoriaService.createProfesorCategoria(profesorCategoriaData);
            return res.success('Profesor creado exitosamente', profesorCategoria);
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
    async getProfesoresByCategoria(req, res, next) {
        try{
            const { idCategoria } = req.params;
            const profesor = await profesorService.getProfesoresByCategoria(idCategoria);
            return res.success('Profesores obtenidos exitosamente', profesor);
        }catch(error){
            next(error);
        }
    }
    async getCategoriaByProfesor(req, res, next) {
        try{
            const { idProfesor } = req.params;
            const categorias = await profesorService.getCategoriaByProfesor(idProfesor);
            return res.success('Categorias obtenidas exitosamente', categorias);
        }catch(error){
            next(error);
        }
    }

    async updateProfesorCategoria(req, res, next) {
        try{
            const { id } = req.params;
            const profesorCategoriaData = req.body;
            const profesorCategoria = await profesorCategoriaService.updateProfesorCategoria(id, profesorCategoriaData);
            return res.success('Profesor categoria actualizado exitosamente', profesorCategoria);
        }catch(error){
            next(error);
        }
    }
    async deleteProfesorCategoria(req, res, next) {
        try{
            const { id } = req.params;
            const profesorCategoria = await profesorCategoriaService.deleteProfesorCategoria(id); 
            return res.success('Profesor categoria eliminado exitosamente', profesorCategoria);
        }catch(error){
            next(error);
        }
    }
}

export const profCategController = new ProfesorCategoriaController();
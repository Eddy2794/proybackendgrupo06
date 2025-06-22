import * as profesorService from '../service/profesor.service.js';

export const createProfesor = async (req, res) => {
    try {
        const { titulo, experiencia_anios, fecha_contratacion, salario, activo_laboral, personaData } = req.body;
        
        const result = await profesorService.createProfesor({
            titulo,
            experiencia_anios,
            fecha_contratacion, 
            salario,
            activo_laboral,
            personaData
        })

        res.status(201).json({
            message: result.message
          });
    } catch (error) {
        res.status(400).json({
            message: "Error al registrar el profesor",
            error: error.message
        });
    }
};


export const getProfesorById = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor = await profesorService.getProfesorById(id);
    res.status(200).json({
        message: "Profesor obtenido correctamente",
        profesor
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener el profesor"
    });
  }
}

export const getProfesores = async (req, res) => {
    try {
        const profesores = await profesorService.getProfesores(); 
        res.status(200).json({
            message: "Profesores obtenidos correctamente",
            profesores
        });
    }catch(error) {
        res.status(400).json({
            message: "Error al obtener los profesores"
        });
    }
    
}

export const editProfesor = async(req, res) => {
    try {
        const { id } = req.params;
        const profesor = await profesorService.editProfesor(id, req.body);
        res.status(200).json({
            message: "Profesor actualizado correctamente",
            profesor
        });
    } catch (error) {
        res.status(400).json({
            message: "Error al actualizar el profesor"
        });
    }
}

export const deleteProfesor = async(req, res) => {
    try {
        const { id } = req.params;
        const profesor = await profesorService.deleteProfesor(id);
        res.status(200).json({
            message: "Profesor eliminado correctamente",
            profesor
        });
    } catch (error) {
        res.status(400).json({
            message: "Error al eliminar el profesor"
        });
    }
}

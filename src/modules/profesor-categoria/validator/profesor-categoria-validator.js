import Joi from 'joi';


// Validaciones para ProfesorCategoria
const diasEnum = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

export const createProfesorCategoriaSchema = Joi.object({
    profesor: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
    categoria: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
    fecha_asignacion: Joi.date(), // El modelo pone default, así que no es estrictamente requerido aquí
    observaciones: Joi.string()
        .min(2)
        .max(255)
        .required(),
    dias_asignados: Joi.array()
        .items(Joi.string().valid(...diasEnum))
        .min(1)
        .required(),
    activo: Joi.boolean().default(true)
});

export const updateProfesorCategoriaSchema = Joi.object({
    profesor: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/),
    categoria: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/),
    fecha_asignacion: Joi.date(),
    observaciones: Joi.string()
        .min(2)
        .max(255),
    dias_asignados: Joi.array()
        .items(Joi.string().valid(...diasEnum))
        .min(1),
    activo: Joi.boolean()
});
export const profesorCategoriaQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('createdAt', '-createdAt', 'username', '-username').default('-createdAt'),
    search: Joi.string().max(50).trim()
});

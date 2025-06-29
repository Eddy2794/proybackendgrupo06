import Joi from 'joi';


export const createProfesorSchema = Joi.object({
    /*persona: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),*/
    titulo: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
        .required(),
    experiencia_anios: Joi.number()
        .integer()
        .min(0)
        .max(50)
        .required(),
    fecha_contratacion: Joi.date()
        .max('now')
        .required(),
    salario: Joi.number()
        .min(0)
        .max(100000000000),
    activo_laboral: Joi.boolean()
        .default(true),
    personaData: Joi.object(),

});

export const updateProfesorSchema = Joi.object({
    /*persona: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/),*/
    titulo: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/),
    experiencia_anios: Joi.number()
        .integer()
        .min(0)
        .max(50),
    fecha_contratacion: Joi.date()
        .max('now'),
    salario: Joi.number()
        .min(0)
        .max(100000000000),
    activo_laboral: Joi.boolean()
        .default(true),
    personaData: Joi.object(),
});

export const profesorIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
});

export const profesorQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('createdAt', '-createdAt', 'username', '-username').default('-createdAt'),
    search: Joi.string().max(50).trim()
});

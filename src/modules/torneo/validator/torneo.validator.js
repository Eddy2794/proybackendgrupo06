import Joi from "joi";

export const createTorneoSchema = Joi.object({
    nombre: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
        .required(),
    descripcion: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
        .required(),
    lugar: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
        .required(),
    direccion: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
        .required(),
    organizador: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
        .required(),
    costo_inscripcion: Joi.number()
        .integer()
        .min(0)
        .required(),
    fecha_inicio: Joi.date()
        .min('now')
        .required(),
    activo: Joi.boolean()
        .default(true),
});
export const updateTorneoSchema = Joi.object({
    nombre: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/),
    descripcion: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/),
    lugar: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/),
    direccion: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/),
    organizador: Joi.string()
        .min(2)
        .max(70)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/),
    costo_inscripcion: Joi.number()
        .integer()
        .min(0),
    fecha_inicio: Joi.date()
        .min('now'),
    activo: Joi.boolean()
        .default(true),
})
export const torneoIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
})
export const torneoQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('createdAt', '-createdAt', 'username', '-username').default('-createdAt'),
    search: Joi.string().max(50).trim()
});
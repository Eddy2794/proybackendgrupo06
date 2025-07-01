import Joi from 'joi';

export const ALUMNO_CATEGORIA_ESTADOS = ['ACTIVO', 'INACTIVO'];

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Debe ser un ObjectId válido');

//Validación para crear una nueva relación alumno-categoria
export const createAlumnoCategoriaSchema = Joi.object({
  alumno: objectId.required(),

  categoria: objectId.required(),

  fecha_inscripcion: Joi.date()
  .iso()
  .required(),

  estado: Joi.string()
  .valid(...ALUMNO_CATEGORIA_ESTADOS)
  .required(),

  observaciones: Joi.string()
  .max(300)
  .allow('', null),

  fecha_baja: Joi.date()
  .iso()
  .allow('', null),

  motivo_baja: Joi.string()
  .max(300)
  .allow('', null),
});

//Validación para actualizar una relación alumno-categoria
export const updateAlumnoCategoriaSchema = Joi.object({
  alumno: objectId,

  categoria: objectId,

  fecha_inscripcion: Joi.date()
  .iso()
  .allow('', null),

  estado: Joi.string()
  .valid(...ALUMNO_CATEGORIA_ESTADOS),

  observaciones: Joi.string()
  .max(300)
  .allow('', null),

  fecha_baja: Joi.date()
  .iso()
  .allow('', null),

  motivo_baja: Joi.string()
  .max(300)
  .allow('', null),
}).min(1);

//Query parameters para filtros
export const alumnoCategoriaQuerySchema = Joi.object({
  alumno: objectId,
  categoria: objectId,
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(50).trim().allow(''),
  estado: Joi.string().valid(...ALUMNO_CATEGORIA_ESTADOS),
  sort: Joi.string().valid('createdAt', '-createdAt', 'fecha_inscripcion', '-fecha_inscripcion').default('-createdAt')
});

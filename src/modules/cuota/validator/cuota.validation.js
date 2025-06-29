import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Debe ser un ObjectId válido');

export const CUOTA_ESTADOS = ['PENDIENTE', 'PAGA', 'VENCIDA'];

// Validación para crear una cuota
export const createCuotaSchema = Joi.object({
  alumno_categoria_id: objectId.required(),
  mes: Joi.string()
  .required(),

  anio: Joi.number()
  .integer()
  .min(2000)
  .max(2100)
  .required(),

  monto: Joi.number()
  .min(0)
  .required(),

  estado: Joi.string()
  .valid(...CUOTA_ESTADOS),

  fecha_vencimiento: Joi.date()
  .iso()
  .required(),

  fecha_pago: Joi.date()
  .iso()
  .allow(null, ''),

  metodo_pago: Joi.string()
  .max(50)
  .allow('', null),

  descuento: Joi.number()
  .min(0)
  .allow(null),

  recargo: Joi.number()
  .min(0)
  .allow(null),

  observaciones: Joi.string()
  .max(300)
  .allow('', null),

  comprobante_numero: Joi.string()
  .max(50)
  .allow('', null),

  usuario_cobro: objectId.allow(null, ''),
});

// Validación para actualizar una cuota
export const updateCuotaSchema = Joi.object({
  mes: Joi.string(),

  anio: Joi.number()
  .integer()
  .min(2000)
  .max(2100),

  monto: Joi.number()
  .min(0),

  estado: Joi.string()
  .valid(...CUOTA_ESTADOS),

  fecha_vencimiento: Joi.date()
  .iso(),

  fecha_pago: Joi.date()
  .iso()
  .allow(null, ''),

  metodo_pago: Joi.string()
  .max(50)
  .allow('', null),

  descuento: Joi.number()
  .min(0)
  .allow(null),

  recargo: Joi.number()
  .min(0)
  .allow(null),

  observaciones: Joi.string()
  .max(300)
  .allow('', null),

  comprobante_numero: Joi.string()
  .max(50)
  .allow('', null),
  
  usuario_cobro: objectId.allow(null, ''),
}).min(1);

// Query parameters para filtros
export const cuotaQuerySchema = Joi.object({
  alumno_categoria_id: objectId,
  estado: Joi.string().valid(...CUOTA_ESTADOS),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  anio: Joi.number().integer().min(2000).max(2100),
  mes: Joi.string().max(20),
  sort: Joi.string().valid('createdAt', '-createdAt', 'fecha_vencimiento', '-fecha_vencimiento').default('-createdAt')
}); 
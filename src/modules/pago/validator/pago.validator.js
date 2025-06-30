import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Validadores para las operaciones de pago con MercadoPago
 */

// Validador para crear preferencia de cuota mensual
export const validarCrearCuota = [
  body('categoriaId')
    .notEmpty()
    .withMessage('El ID de categoría es requerido')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de categoría inválido');
      }
      return true;
    }),
  
  body('periodo')
    .notEmpty()
    .withMessage('El período es requerido')
    .isObject()
    .withMessage('El período debe ser un objeto'),
  
  body('periodo.mes')
    .notEmpty()
    .withMessage('El mes es requerido')
    .isInt({ min: 1, max: 12 })
    .withMessage('El mes debe ser un número entre 1 y 12'),
  
  body('periodo.anio')
    .notEmpty()
    .withMessage('El año es requerido')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('El año debe estar entre 2020 y 2100'),
  
  body('descuentoTipo')
    .optional()
    .isIn(['hermanos', 'pagoAnual'])
    .withMessage('Tipo de descuento inválido')
];

// Validador para crear preferencia de pago anual
export const validarCrearPagoAnual = [
  body('categoriaId')
    .notEmpty()
    .withMessage('El ID de categoría es requerido')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de categoría inválido');
      }
      return true;
    }),
  
  body('anio')
    .notEmpty()
    .withMessage('El año es requerido')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('El año debe estar entre 2020 y 2100')
];

// Validador para obtener pago por ID
export const validarPagoId = [
  param('pagoId')
    .notEmpty()
    .withMessage('El ID del pago es requerido')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de pago inválido');
      }
      return true;
    })
];

// Validador para obtener historial de pagos
export const validarHistorialPagos = [
  query('estado')
    .optional()
    .isIn(['PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'REEMBOLSADO', 'EN_PROCESO', 'EN_MEDIACION', 'AUTORIZADO'])
    .withMessage('Estado de pago inválido'),
  
  query('anio')
    .optional()
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Año inválido'),
  
  query('mes')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Mes inválido'),
  
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser mayor a 0')
];

// Validador para webhook de MercadoPago
export const validarWebhook = [
  body('type')
    .notEmpty()
    .withMessage('El tipo de notificación es requerido')
    .isIn(['payment', 'order'])
    .withMessage('Tipo de notificación inválido'),
  
  body('data')
    .notEmpty()
    .withMessage('Los datos de la notificación son requeridos')
    .isObject()
    .withMessage('Los datos deben ser un objeto'),
  
  body('data.id')
    .notEmpty()
    .withMessage('El ID en los datos es requerido')
];

// Validador para consultar estado de pago
export const validarConsultarEstado = [
  query('paymentId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('ID de pago de MercadoPago inválido'),
  
  query('externalReference')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Referencia externa inválida'),
  
  // Al menos uno de los dos debe estar presente
  query()
    .custom((value, { req }) => {
      if (!req.query.paymentId && !req.query.externalReference) {
        throw new Error('Debe proporcionar paymentId o externalReference');
      }
      return true;
    })
];

// Validador para obtener estadísticas
export const validarEstadisticas = [
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  
  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida'),
  
  query('estado')
    .optional()
    .isIn(['PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'REEMBOLSADO', 'EN_PROCESO', 'EN_MEDIACION', 'AUTORIZADO'])
    .withMessage('Estado inválido'),
  
  query('categoriaId')
    .optional()
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de categoría inválido');
      }
      return true;
    })
];

// Validador para crear categoría de escuela
export const validarCrearCategoria = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),
  
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres')
    .trim(),
  
  body('tipo')
    .notEmpty()
    .withMessage('El tipo es requerido')
    .isIn(['INFANTIL', 'JUVENIL', 'ADULTO', 'VETERANOS', 'COMPETITIVO', 'RECREATIVO', 'ENTRENAMIENTO'])
    .withMessage('Tipo de categoría inválido'),
  
  body('edadMinima')
    .notEmpty()
    .withMessage('La edad mínima es requerida')
    .isInt({ min: 3, max: 100 })
    .withMessage('La edad mínima debe estar entre 3 y 100 años'),
  
  body('edadMaxima')
    .notEmpty()
    .withMessage('La edad máxima es requerida')
    .isInt({ min: 3, max: 100 })
    .withMessage('La edad máxima debe estar entre 3 y 100 años')
    .custom((value, { req }) => {
      if (value < req.body.edadMinima) {
        throw new Error('La edad máxima debe ser mayor o igual a la edad mínima');
      }
      return true;
    }),
  
  body('precio')
    .notEmpty()
    .withMessage('La configuración de precio es requerida')
    .isObject()
    .withMessage('El precio debe ser un objeto'),
  
  body('precio.cuotaMensual')
    .notEmpty()
    .withMessage('El precio de cuota mensual es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser mayor o igual a 0'),
  
  body('precio.descuentos')
    .optional()
    .isObject()
    .withMessage('Los descuentos deben ser un objeto'),
  
  body('precio.descuentos.hermanos')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('El descuento por hermanos debe estar entre 0 y 100%'),
  
  body('precio.descuentos.pagoAnual')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('El descuento por pago anual debe estar entre 0 y 100%'),
  
  body('cupoMaximo')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El cupo máximo debe ser mayor a 0'),
  
  body('horarios')
    .optional()
    .isArray()
    .withMessage('Los horarios deben ser un array'),
  
  body('horarios.*.dia')
    .optional()
    .isIn(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'])
    .withMessage('Día de la semana inválido'),
  
  body('horarios.*.horaInicio')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de hora de inicio inválido (HH:MM)'),
  
  body('horarios.*.horaFin')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de hora de fin inválido (HH:MM)')
];

// Validador para actualizar categoría
export const validarActualizarCategoria = [
  param('categoriaId')
    .notEmpty()
    .withMessage('El ID de categoría es requerido')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de categoría inválido');
      }
      return true;
    }),
  
  // Los campos de actualización son opcionales pero deben ser válidos si se proporcionan
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),
  
  body('descripcion')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres')
    .trim(),
  
  body('precio.cuotaMensual')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser mayor o igual a 0'),
  
  body('estado')
    .optional()
    .isIn(['ACTIVA', 'INACTIVA', 'SUSPENDIDA'])
    .withMessage('Estado de categoría inválido')
];

// Validador para obtener categoría por ID
export const validarCategoriaId = [
  param('categoriaId')
    .notEmpty()
    .withMessage('El ID de categoría es requerido')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de categoría inválido');
      }
      return true;
    })
];

// Validador para búsqueda de categorías
export const validarBuscarCategorias = [
  query('tipo')
    .optional()
    .isIn(['INFANTIL', 'JUVENIL', 'ADULTO', 'VETERANOS', 'COMPETITIVO', 'RECREATIVO', 'ENTRENAMIENTO'])
    .withMessage('Tipo de categoría inválido'),
  
  query('estado')
    .optional()
    .isIn(['ACTIVA', 'INACTIVA', 'SUSPENDIDA'])
    .withMessage('Estado inválido'),
  
  query('edad')
    .optional()
    .isInt({ min: 3, max: 100 })
    .withMessage('La edad debe estar entre 3 y 100 años'),
  
  query('precioMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio mínimo debe ser mayor o igual a 0'),
  
  query('precioMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio máximo debe ser mayor o igual a 0')
    .custom((value, { req }) => {
      if (req.query.precioMin && value < parseFloat(req.query.precioMin)) {
        throw new Error('El precio máximo debe ser mayor al precio mínimo');
      }
      return true;
    })
];

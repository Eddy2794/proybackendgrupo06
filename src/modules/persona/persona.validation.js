import { body, param, query } from 'express-validator';

export const validateCreatePersona = [
  body('nombres')
    .trim()
    .notEmpty()
    .withMessage('Los nombres son requeridos')
    .isLength({ min: 2, max: 50 })
    .withMessage('Los nombres deben tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los nombres solo pueden contener letras y espacios'),

  body('apellidos')
    .trim()
    .notEmpty()
    .withMessage('Los apellidos son requeridos')
    .isLength({ min: 2, max: 50 })
    .withMessage('Los apellidos deben tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los apellidos solo pueden contener letras y espacios'),

  body('tipoDocumento')
    .optional()
    .isIn(['DNI', 'PASAPORTE', 'CEDULA', 'CARNET_EXTRANJERIA'])
    .withMessage('Tipo de documento inválido'),

  body('numeroDocumento')
    .trim()
    .notEmpty()
    .withMessage('El número de documento es requerido')
    .isLength({ min: 6, max: 20 })
    .withMessage('El número de documento debe tener entre 6 y 20 caracteres')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('El número de documento solo puede contener letras y números'),

  body('fechaNacimiento')
    .isISO8601()
    .withMessage('Formato de fecha inválido (usar YYYY-MM-DD)')
    .toDate()
    .custom((value) => {
      const hoy = new Date();
      const nacimiento = new Date(value);
      const edad = hoy.getFullYear() - nacimiento.getFullYear();
      
      if (edad < 13 || edad > 120) {
        throw new Error('La edad debe estar entre 13 y 120 años');
      }
      return true;
    }),

  body('genero')
    .isIn(['MASCULINO', 'FEMENINO', 'OTRO', 'PREFIERO_NO_DECIR'])
    .withMessage('Género inválido'),

  body('telefono')
    .optional()
    .trim()
    .isLength({ min: 7, max: 15 })
    .withMessage('El teléfono debe tener entre 7 y 15 caracteres')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido'),

  body('email')
    .isEmail()
    .withMessage('Formato de email inválido')
    .normalizeEmail()
    .toLowerCase(),

  body('direccion.calle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La calle no puede exceder 100 caracteres'),

  body('direccion.ciudad')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La ciudad no puede exceder 50 caracteres'),

  body('direccion.departamento')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El departamento no puede exceder 50 caracteres'),

  body('direccion.codigoPostal')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('El código postal no puede exceder 10 caracteres'),

  body('direccion.pais')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El país no puede exceder 50 caracteres')
];

export const validateUpdatePersona = [
  param('id')
    .isMongoId()
    .withMessage('ID de persona inválido'),

  body('nombres')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Los nombres deben tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los nombres solo pueden contener letras y espacios'),

  body('apellidos')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Los apellidos deben tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los apellidos solo pueden contener letras y espacios'),

  body('tipoDocumento')
    .optional()
    .isIn(['DNI', 'PASAPORTE', 'CEDULA', 'CARNET_EXTRANJERIA'])
    .withMessage('Tipo de documento inválido'),

  body('numeroDocumento')
    .optional()
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('El número de documento debe tener entre 6 y 20 caracteres')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('El número de documento solo puede contener letras y números'),

  body('fechaNacimiento')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido (usar YYYY-MM-DD)')
    .toDate()
    .custom((value) => {
      const hoy = new Date();
      const nacimiento = new Date(value);
      const edad = hoy.getFullYear() - nacimiento.getFullYear();
      
      if (edad < 13 || edad > 120) {
        throw new Error('La edad debe estar entre 13 y 120 años');
      }
      return true;
    }),

  body('genero')
    .optional()
    .isIn(['MASCULINO', 'FEMENINO', 'OTRO', 'PREFIERO_NO_DECIR'])
    .withMessage('Género inválido'),

  body('telefono')
    .optional()
    .trim()
    .isLength({ min: 7, max: 15 })
    .withMessage('El teléfono debe tener entre 7 y 15 caracteres')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Formato de email inválido')
    .normalizeEmail()
    .toLowerCase(),

  body('estado')
    .optional()
    .isIn(['ACTIVO', 'INACTIVO', 'SUSPENDIDO'])
    .withMessage('Estado inválido')
];

export const validatePersonaId = [
  param('id')
    .isMongoId()
    .withMessage('ID de persona inválido')
];

export const validateSearchPersonas = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('El término de búsqueda debe tener al menos 2 caracteres'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El número de página debe ser un entero positivo'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),

  query('estado')
    .optional()
    .isIn(['ACTIVO', 'INACTIVO', 'SUSPENDIDO'])
    .withMessage('Estado inválido'),

  query('genero')
    .optional()
    .isIn(['MASCULINO', 'FEMENINO', 'OTRO', 'PREFIERO_NO_DECIR'])
    .withMessage('Género inválido')
];

export const validateAgeRange = [
  query('minAge')
    .isInt({ min: 0, max: 120 })
    .withMessage('La edad mínima debe estar entre 0 y 120'),

  query('maxAge')
    .isInt({ min: 0, max: 120 })
    .withMessage('La edad máxima debe estar entre 0 y 120')
    .custom((value, { req }) => {
      if (parseInt(value) < parseInt(req.query.minAge)) {
        throw new Error('La edad máxima debe ser mayor a la edad mínima');
      }
      return true;
    })
];

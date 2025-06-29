/**
 * Middlewares genéricos de validación para toda la aplicación
 * Centralizados para evitar duplicación
 */

// Middleware genérico para validación de Joi
export const validateSchema = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'params' ? req.params : 
                 source === 'query' ? req.query : 
                 req.body;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors
      });
    }

    // Reemplazar los datos con los validados y sanitizados
    if (source === 'params') {
      req.params = value;
    } else if (source === 'query') {
      Object.assign(req.query, value); 
    } else {
      req.body = value;
    }

    next();
  };
};

// Middleware específico para validar ObjectId en parámetros
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
        error: `El parámetro ${paramName} debe ser un ObjectId válido`
      });
    }

    next();
  };
};

// Middleware para validar múltiples schemas en una sola request
export const validateMultiple = (validations) => {
  return (req, res, next) => {
    for (const { schema, source = 'body', required = true } of validations) {
      const data = source === 'params' ? req.params : 
                   source === 'query' ? req.query : 
                   req.body;

      // Si no es requerido y no hay datos, continuar
      if (!required && (!data || Object.keys(data).length === 0)) {
        continue;
      }

      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          source: source
        }));

        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors
        });
      }

      // Actualizar los datos validados
      if (source === 'params') {
        req.params = value;
      } else if (source === 'query') {
        req.query = value;
      } else {
        req.body = value;
      }
    }

    next();
  };
};

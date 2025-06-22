import Joi from 'joi';

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
      req.query = value;
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
        message: `${paramName} debe ser un ObjectId válido`
      });
    }
    
    next();
  };
};

// Middleware para validar que la persona existe
export const validatePersonaExists = async (req, res, next) => {
  try {
    const Persona = (await import('./persona.model.js')).default;
    const personaId = req.params.id;
    
    const persona = await Persona.findById(personaId);
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    req.persona = persona; // Guardar la persona en el request para uso posterior
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al validar persona',
      error: error.message
    });
  }
};

// Middleware para validar unicidad de email y documento
export const validateUniqueness = async (req, res, next) => {
  try {
    const Persona = (await import('./persona.model.js')).default;
    const { email, numeroDocumento } = req.body;
    const personaId = req.params.id; // Para actualizaciones

    // Construir query de búsqueda excluyendo el registro actual en actualizaciones
    const query = {
      $or: []
    };

    if (email) {
      query.$or.push({ email: email });
    }

    if (numeroDocumento) {
      query.$or.push({ numeroDocumento: numeroDocumento });
    }

    // Si es una actualización, excluir el registro actual
    if (personaId) {
      query._id = { $ne: personaId };
    }

    // Solo buscar si hay campos para validar
    if (query.$or.length > 0) {
      const existingPersona = await Persona.findOne(query);
      
      if (existingPersona) {
        const conflicts = [];
        if (existingPersona.email === email) {
          conflicts.push('email');
        }
        if (existingPersona.numeroDocumento === numeroDocumento) {
          conflicts.push('número de documento');
        }
        
        return res.status(409).json({
          success: false,
          message: `Ya existe una persona con el mismo ${conflicts.join(' y ')}`
        });
      }
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al validar unicidad',
      error: error.message
    });
  }
};

// Middleware para validar que el número de documento sea válido según el tipo
export const validateDocumentFormat = (req, res, next) => {
  const { tipoDocumento, numeroDocumento } = req.body;
  
  if (!tipoDocumento || !numeroDocumento) {
    return next(); // Si no están presentes, que lo maneje la validación de Joi
  }

  let isValid = false;
  let expectedFormat = '';

  switch (tipoDocumento) {
    case 'DNI':
      isValid = /^\d{8}$/.test(numeroDocumento);
      expectedFormat = '8 dígitos';
      break;
    case 'PASAPORTE':
      isValid = /^[A-Z0-9]{6,12}$/.test(numeroDocumento);
      expectedFormat = '6-12 caracteres alfanuméricos';
      break;
    case 'CEDULA':
      isValid = /^\d{6,12}$/.test(numeroDocumento);
      expectedFormat = '6-12 dígitos';
      break;
    case 'CARNET_EXTRANJERIA':
      isValid = /^[A-Z0-9]{6,15}$/.test(numeroDocumento);
      expectedFormat = '6-15 caracteres alfanuméricos';
      break;
    default:
      return next(); // Tipo no reconocido, que lo maneje Joi
  }

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: `El formato del número de documento no es válido para ${tipoDocumento}. Formato esperado: ${expectedFormat}`
    });
  }

  next();
};

// Middleware para sanitizar entrada de persona
export const sanitizePersonaInput = (allowedFields = []) => {
  return (req, res, next) => {
    if (allowedFields.length === 0) {
      return next();
    }
    
    const sanitizedBody = {};
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        sanitizedBody[field] = req.body[field];
      }
    });
    
    req.body = sanitizedBody;
    next();
  };
};

/**
 * Sistema de documentación automática simplificado con mapeo de Joi
 */

/**
 * Convierte un esquema de Joi a Swagger Schema
 */
function joiToSwagger(joiSchema) {
  if (!joiSchema || !joiSchema.describe) {
    return { type: 'object' };
  }

  const description = joiSchema.describe();
  return convertJoiDescription(description);
}

/**
 * Convierte la descripción de Joi a formato Swagger
 */
function convertJoiDescription(desc) {
  const swagger = {};

  switch (desc.type) {
    case 'object':
      swagger.type = 'object';
      swagger.properties = {};
      swagger.required = [];

      if (desc.keys) {
        Object.entries(desc.keys).forEach(([key, keyDesc]) => {
          swagger.properties[key] = convertJoiDescription(keyDesc);
          
          // Agregar a required si es obligatorio
          if (keyDesc.flags?.presence === 'required') {
            swagger.required.push(key);
          }
        });
      }

      // Limpiar required si está vacío
      if (swagger.required.length === 0) {
        delete swagger.required;
      }
      break;

    case 'string':
      swagger.type = 'string';
      
      // Manejar validaciones específicas
      if (desc.rules) {
        desc.rules.forEach(rule => {
          switch (rule.name) {
            case 'min':
              swagger.minLength = rule.args?.limit;
              break;
            case 'max':
              swagger.maxLength = rule.args?.limit;
              break;
            case 'email':
              swagger.format = 'email';
              break;
            case 'pattern':
              swagger.pattern = rule.args?.regex?.source;
              break;
          }
        });
      }

      // Manejar valores válidos (enum)
      if (desc.allow) {
        swagger.enum = desc.allow;
      }

      // Agregar ejemplo básico
      if (desc.flags?.default !== undefined) {
        swagger.default = desc.flags.default;
      }
      break;

    case 'number':
      swagger.type = desc.rules?.find(r => r.name === 'integer') ? 'integer' : 'number';
      
      if (desc.rules) {
        desc.rules.forEach(rule => {
          switch (rule.name) {
            case 'min':
              swagger.minimum = rule.args?.limit;
              break;
            case 'max':
              swagger.maximum = rule.args?.limit;
              break;
          }
        });
      }
      break;

    case 'date':
      swagger.type = 'string';
      swagger.format = 'date';
      break;

    case 'boolean':
      swagger.type = 'boolean';
      break;

    case 'array':
      swagger.type = 'array';
      if (desc.items && desc.items.length > 0) {
        swagger.items = convertJoiDescription(desc.items[0]);
      }
      break;

    default:
      swagger.type = 'string';
  }

  return swagger;
}

/**
 * Crea documentación de endpoint de forma simple
 */
function createDoc(method, path, options = {}) {
  const doc = {
    method: method.toUpperCase(),
    path,
    summary: options.summary || '',
    description: options.description || options.summary || '',
    tags: options.tags || ['API'],
    auth: options.auth || false,
    body: options.body || null,
    params: options.params || null,
    query: options.query || null,
    response: options.response || 'Success'
  };

  // Si se proporciona un esquema Joi, convertirlo automáticamente
  if (options.joiSchema) {
    doc.body = joiToSwagger(options.joiSchema);
  }

  return doc;
}

/**
 * Helpers para métodos HTTP con soporte para Joi
 */
export const GET = (path, options) => createDoc('GET', path, options);
export const POST = (path, options) => createDoc('POST', path, options);
export const PUT = (path, options) => createDoc('PUT', path, options);
export const DELETE = (path, options) => createDoc('DELETE', path, options);
export const PATCH = (path, options) => createDoc('PATCH', path, options);

/**
 * Helper para crear documentación con esquema Joi
 */
export const withJoi = (method, path, joiSchema, options = {}) => {
  return createDoc(method, path, { ...options, joiSchema });
};

/**
 * Genera documentación Swagger para una lista de endpoints
 */
export function generateSwaggerPaths(endpoints, basePath = '') {
  const paths = {};
  
  endpoints.forEach(endpoint => {
    const fullPath = `${basePath}${endpoint.path}`;
    
    if (!paths[fullPath]) {
      paths[fullPath] = {};
    }
    
    paths[fullPath][endpoint.method.toLowerCase()] = {
      summary: endpoint.summary,
      description: endpoint.description,
      tags: endpoint.tags,
      ...(endpoint.auth && { security: [{ bearerAuth: [] }] }),
      ...(endpoint.body && {
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: endpoint.body }
          }
        }
      }),
      ...(endpoint.params && {
        parameters: Object.entries(endpoint.params).map(([name, param]) => ({
          name,
          in: 'path',
          required: true,
          schema: { type: param.type || 'string' },
          description: param.description || '',
          example: param.example
        }))
      }),
      ...(endpoint.query && {
        parameters: [
          ...(paths[fullPath][endpoint.method.toLowerCase()]?.parameters || []),
          ...Object.entries(endpoint.query).map(([name, param]) => ({
            name,
            in: 'query',
            required: param.required || false,
            schema: { type: param.type || 'string' },
            description: param.description || '',
            example: param.example
          }))
        ]
      }),
      responses: {
        200: {
          description: endpoint.response,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: endpoint.response },
                  data: { type: 'object' }
                }
              }
            }
          }
        },
        ...(endpoint.auth && {
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }),
        400: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        500: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    };
  });
  
  return paths;
}

/**
 * Mapea automáticamente validadores de un módulo a documentación
 * @param {Object} validators - Objeto con los validadores Joi del módulo
 * @param {Array} routeConfigs - Configuraciones de rutas con mapeo de validadores
 * @param {string} basePath - Ruta base del módulo (ej: '/api/auth')
 * @param {string} tag - Tag para agrupar en Swagger
 * @returns {Object} Documentación Swagger generada automáticamente
 */
export function autoMapValidators(validators, routeConfigs, basePath = '', tag = 'API') {
  const endpoints = [];
  
  routeConfigs.forEach(config => {
    const { method, path, validatorKey, summary, description, auth = false, response = 'Success' } = config;
    
    const options = {
      summary,
      description: description || summary,
      tags: [tag],
      auth,
      response
    };
    
    // Si hay un validador asociado, usar withJoi para mapeo automático
    if (validatorKey && validators[validatorKey]) {
      endpoints.push(withJoi(method, path, validators[validatorKey], options));
    } else {
      // Si no hay validador, crear documentación básica
      endpoints.push(createDoc(method, path, options));
    }
  });
  
  return generateSwaggerPaths(endpoints, basePath);
}

/**
 * Mapea automáticamente TODOS los validadores de un módulo sin configuración manual
 * Útil para generar documentación completa de todos los schemas disponibles
 * @param {Object} validators - Objeto con todos los validadores Joi del módulo
 * @param {string} moduleName - Nombre del módulo (ej: 'Auth', 'Users', 'Persona')
 * @returns {Object} Documentación Swagger de todos los schemas como componentes reutilizables
 */
export function autoMapAllValidators(validators, moduleName = 'API') {
  const schemas = {};
  
  Object.entries(validators).forEach(([validatorName, joiSchema]) => {
    // Solo procesar esquemas Joi válidos
    if (joiSchema && typeof joiSchema.describe === 'function') {
      const schemaName = `${moduleName}_${validatorName.replace('Schema', '')}`;
      schemas[schemaName] = joiToSwagger(joiSchema);
    }
  });
  
  return schemas;
}

/**
 * Genera documentación completa de un módulo con detección automática de patrones
 * @param {Object} validators - Validadores del módulo
 * @param {Object} routes - Configuración de rutas básica
 * @param {string} basePath - Ruta base del módulo
 * @param {string} moduleName - Nombre del módulo
 * @returns {Object} Documentación completa con paths y schemas
 */
export function autoDocumentModule(validators, routes, basePath, moduleName) {
  return {
    paths: autoMapValidators(validators, routes, basePath, moduleName),
    schemas: autoMapAllValidators(validators, moduleName)
  };
}

/**
 * Helper para crear documentación de módulos con patrones comunes de CRUD
 * @param {Object} config - Configuración del módulo
 * @returns {Object} Documentación automática basada en patrones CRUD
 */
export function autoCrudDocumentation(config) {
  const { 
    validators, 
    basePath, 
    moduleName,
    entityName = moduleName.toLowerCase(),
    createValidator = 'createSchema',
    updateValidator = 'updateSchema',
    idValidator = 'idSchema',
    queryValidator = 'querySchema'
  } = config;
  
  const crudRoutes = [
    routeConfig('GET', '/', queryValidator, `Listar ${entityName}s`, {
      description: `Obtiene una lista paginada de ${entityName}s con filtros opcionales`,
      auth: true,
      response: `Lista de ${entityName}s obtenida exitosamente`
    }),
    
    routeConfig('GET', '/:id', idValidator, `Obtener ${entityName} por ID`, {
      description: `Obtiene un ${entityName} específico por su ID`,
      auth: true,
      response: `${entityName} obtenido exitosamente`
    }),
    
    routeConfig('POST', '/', createValidator, `Crear ${entityName}`, {
      description: `Crea un nuevo ${entityName} en el sistema`,
      auth: true,
      response: `${entityName} creado exitosamente`
    }),
    
    routeConfig('PUT', '/:id', updateValidator, `Actualizar ${entityName}`, {
      description: `Actualiza los datos de un ${entityName} existente`,
      auth: true,
      response: `${entityName} actualizado exitosamente`
    }),
    
    routeConfig('DELETE', '/:id', idValidator, `Eliminar ${entityName}`, {
      description: `Elimina un ${entityName} del sistema`,
      auth: true,
      response: `${entityName} eliminado exitosamente`
    })
  ];
  
  return autoDocumentModule(validators, crudRoutes, basePath, moduleName);
}

/**
 * Helper para crear configuración de rutas de forma más sencilla
 */
export function routeConfig(method, path, validatorKey, summary, options = {}) {
  return {
    method: method.toUpperCase(),
    path,
    validatorKey,
    summary,
    description: options.description || summary,
    auth: options.auth || false,
    response: options.response || 'Success'
  };
}

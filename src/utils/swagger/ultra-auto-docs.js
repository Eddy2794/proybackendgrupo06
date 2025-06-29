/**
 * Sistema de documentación ULTRA-AUTOMÁTICO
 * Mapea automáticamente todos los módulos y validadores de la aplicación
 */

import { 
  autoMapAllValidators, 
  autoCrudDocumentation, 
  generateSwaggerPaths 
} from './api-docs.js';

/**
 * Auto-detecta y documenta TODOS los módulos de la aplicación
 * @param {Object} modules - Configuración de módulos con sus validadores
 * @returns {Object} Documentación completa de toda la aplicación
 */
export function autoDocumentFullApplication(modules) {
  const fullDocumentation = {
    paths: {},
    schemas: {},
    tags: []
  };

  Object.entries(modules).forEach(([moduleName, moduleConfig]) => {
    const { 
      validators, 
      basePath, 
      entityName,
      customRoutes = null,
      isCrud = true 
    } = moduleConfig;

    // Generar documentación del módulo
    let moduleDoc;
    
    if (isCrud && !customRoutes) {
      // Usar documentación CRUD automática
      moduleDoc = autoCrudDocumentation({
        validators,
        basePath,
        moduleName,
        entityName: entityName || moduleName.toLowerCase()
      });
    } else if (customRoutes) {
      // Usar rutas personalizadas
      moduleDoc = {
        paths: generateSwaggerPaths(customRoutes, basePath),
        schemas: autoMapAllValidators(validators, moduleName)
      };
    } else {
      // Solo generar schemas sin paths
      moduleDoc = {
        paths: {},
        schemas: autoMapAllValidators(validators, moduleName)
      };
    }

    // Combinar con documentación global
    Object.assign(fullDocumentation.paths, moduleDoc.paths);
    Object.assign(fullDocumentation.schemas, moduleDoc.schemas);
    
    // Agregar tag
    fullDocumentation.tags.push({
      name: moduleName,
      description: `Operaciones relacionadas con ${entityName || moduleName.toLowerCase()}s`
    });

    console.log(`✅ Módulo ${moduleName} documentado automáticamente`);
    console.log(`   - Schemas: ${Object.keys(moduleDoc.schemas).length}`);
    console.log(`   - Endpoints: ${Object.keys(moduleDoc.paths).length}`);
  });

  return fullDocumentation;
}

/**
 * Configuración automática de todos los módulos de la aplicación
 * ¡Solo necesitas importar los validadores y el sistema hace el resto!
 */
export async function setupAutoDocumentation() {
  try {
    // Importar dinámicamente todos los validadores
    const authValidators = await import('../modules/auth/validator/auth.validators.js');
    const userValidators = await import('../modules/user/validator/user.validators.js');
    const personaValidators = await import('../modules/persona/validator/persona.validators.js');

    // Configuración automática de módulos
    const applicationModules = {
      'Auth': {
        validators: authValidators,
        basePath: '/api/auth',
        entityName: 'autenticación',
        isCrud: false, // Auth tiene endpoints personalizados
        customRoutes: [
          // Estos se podrían detectar automáticamente analizando las rutas
        ]
      },
      
      'Users': {
        validators: userValidators,
        basePath: '/api/users',
        entityName: 'usuario',
        isCrud: true // CRUD estándar
      },
      
      'Personas': {
        validators: personaValidators,
        basePath: '/api/personas', 
        entityName: 'persona',
        isCrud: true // CRUD estándar
      }
    };

    // Generar documentación completa automáticamente
    const fullAppDocumentation = autoDocumentFullApplication(applicationModules);
    
    console.log('🚀 Documentación automática generada para toda la aplicación:');
    console.log(`   📊 Total Schemas: ${Object.keys(fullAppDocumentation.schemas).length}`);
    console.log(`   🛣️  Total Endpoints: ${Object.keys(fullAppDocumentation.paths).length}`);
    console.log(`   🏷️  Total Módulos: ${fullAppDocumentation.tags.length}`);

    return fullAppDocumentation;

  } catch (error) {
    console.error('❌ Error al generar documentación automática:', error);
    return { paths: {}, schemas: {}, tags: [] };
  }
}

/**
 * Middleware para inyectar automáticamente la documentación en Swagger
 */
export function injectAutoDocumentation(swaggerConfig) {
  return async function(req, res, next) {
    if (!swaggerConfig._autoDocInjected) {
      const autoDoc = await setupAutoDocumentation();
      
      // Inyectar en la configuración de Swagger
      Object.assign(swaggerConfig.paths || {}, autoDoc.paths);
      Object.assign(swaggerConfig.components?.schemas || {}, autoDoc.schemas);
      swaggerConfig.tags = [...(swaggerConfig.tags || []), ...autoDoc.tags];
      
      swaggerConfig._autoDocInjected = true;
      console.log('📚 Documentación automática inyectada en Swagger');
    }
    next();
  };
}

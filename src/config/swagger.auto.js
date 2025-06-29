/**
 * Configuración de Swagger con DOCUMENTACIÓN ULTRA-AUTOMÁTICA
 * El sistema detecta y documenta automáticamente todos los módulos
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { setupAutoDocumentation } from '../utils/swagger/ultra-auto-docs.js';

// Configuración base de Swagger
const baseSwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Proyecto Backend Grupo 06 API - AUTO-DOCUMENTADA',
      version: '2.0.0',
      description: 'API RESTful con documentación automática generada desde validadores Joi',
      contact: {
        name: 'Grupo 06',
        email: 'grupo06@example.com'
      }
    },
    servers: [
      { 
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido mediante login'
        }
      },
      schemas: {
        // Los schemas se generarán automáticamente desde los validadores Joi
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Detailed error' },
            code: { type: 'number', example: 400 }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        }
      }
    },
    paths: {
      // Los paths se generarán automáticamente desde los módulos
    },
    tags: [
      // Los tags se generarán automáticamente para cada módulo
    ]
  },
  apis: [] // No necesitamos especificar archivos, todo es automático
};

/**
 * Genera la documentación completa de forma automática
 */
async function generateAutoSwaggerConfig() {
  try {
    console.log('🔄 Generando documentación automática...');
    
    // Obtener documentación automática de toda la aplicación
    const autoDocumentation = await setupAutoDocumentation();
    
    // Combinar configuración base con documentación automática
    const fullConfig = {
      ...baseSwaggerOptions.definition,
      paths: {
        ...baseSwaggerOptions.definition.paths,
        ...autoDocumentation.paths
      },
      components: {
        ...baseSwaggerOptions.definition.components,
        schemas: {
          ...baseSwaggerOptions.definition.components.schemas,
          ...autoDocumentation.schemas
        }
      },
      tags: [
        ...baseSwaggerOptions.definition.tags,
        ...autoDocumentation.tags
      ]
    };

    console.log('✅ Documentación automática generada exitosamente');
    return fullConfig;

  } catch (error) {
    console.error('❌ Error generando documentación automática:', error);
    return baseSwaggerOptions.definition; // Fallback a configuración base
  }
}

/**
 * Configuración de Swagger con documentación automática
 */
export async function setupSwagger(app) {
  const swaggerConfig = await generateAutoSwaggerConfig();
  
  const specs = swaggerJsdoc({
    definition: swaggerConfig,
    apis: []
  });

  // Middleware personalizado para mostrar estadísticas
  app.use('/docs', (req, res, next) => {
    console.log('📖 Documentación Swagger accedida');
    console.log(`   📊 Schemas disponibles: ${Object.keys(swaggerConfig.components?.schemas || {}).length}`);
    console.log(`   🛣️  Endpoints documentados: ${Object.keys(swaggerConfig.paths || {}).length}`);
    next();
  });

  // Configurar Swagger UI
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2d5aa0; }
      .swagger-ui .info .description { color: #666; }
    `,
    customSiteTitle: 'API Docs - Auto-generada',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tagsSorter: 'alpha'
    }
  }));

  console.log('📚 Swagger configurado en http://localhost:3000/docs');
  console.log('🤖 Documentación generada automáticamente desde validadores Joi');
}

/**
 * Función para obtener estadísticas de la documentación
 */
export async function getDocumentationStats() {
  const config = await generateAutoSwaggerConfig();
  
  return {
    totalSchemas: Object.keys(config.components?.schemas || {}).length,
    totalEndpoints: Object.keys(config.paths || {}).length,
    totalTags: config.tags?.length || 0,
    modules: config.tags?.map(tag => tag.name) || []
  };
}

// Configuración legacy para compatibilidad
export const swaggerConfig = baseSwaggerOptions;

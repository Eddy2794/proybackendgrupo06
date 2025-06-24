import swaggerUi from 'swagger-ui-express';
import { authSwaggerDocs } from '../modules/auth/route/auth.fluent.routes.js';
import { userSwaggerDocs } from '../modules/user/route/user.fluent.routes.js';
import { personaSwaggerDocs } from '../modules/persona/route/persona.fluent.routes.js';
import { categoriaSwaggerDocs } from '../modules/categoria/route/categoria.routes.js';
import { authDevSwaggerDocs } from '../modules/auth/route/auth.dev.routes.js';
import config from './index.js';

// Configuración base de Swagger con documentación automática
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Proyecto Backend Grupo 06 API',
    version: '1.0.0',
    description: 'API RESTful con Express 5, MongoDB y autenticación JWT - Documentación Automática',
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
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'string' } }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object', nullable: true }
        }
      }
    }
  },  tags: [
    { name: 'Auth', description: 'Operaciones de autenticación' },
    { name: 'Users', description: 'Gestión de usuarios' },
    { name: 'Personas', description: 'Gestión de personas' },
    { name: 'Auth - Development', description: 'Endpoints de desarrollo para autenticación (solo en dev)' }
  ]
};

// Combinar automáticamente toda la documentación generada
const completeSwaggerSpec = {
  ...swaggerDefinition,
  paths: {
    ...authSwaggerDocs,
    ...userSwaggerDocs,
    ...personaSwaggerDocs,
    ...categoriaSwaggerDocs,
    // Incluir rutas de desarrollo solo si estamos en entorno de desarrollo
    ...(config.env === 'development' ? authDevSwaggerDocs : {})
  }
};

export const setupSwagger = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(completeSwaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Docs - Documentación Automática',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true
    }
  }));
  
  // Endpoint para obtener el JSON de la especificación
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(completeSwaggerSpec);
  });
  console.log('📚 Swagger configurado con documentación automática:');
  console.log(`   🔗 Documentación: http://localhost:3000/docs`);
  console.log(`   📄 JSON Spec: http://localhost:3000/docs.json`);
  console.log(`   🤖 Total Endpoints: ${Object.keys(completeSwaggerSpec.paths).length}`);
  
  if (config.env === 'development') {
    console.log(`   🚧 Rutas de desarrollo incluidas en documentación`);
  }
};

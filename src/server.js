import app from './app.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import config from './config/index.js';

// Configuración del puerto y entorno
const { port, env } = config;

let server;

// Función para cierre graceful del servidor
const gracefulShutdown = (signal) => {
  logger.info(`🔄 Received ${signal}, shutting down gracefully...`);
  
  if (server) {
    server.close(() => {
      logger.info('✅ HTTP server closed');
      // Cerrar conexión de base de datos
      process.exit(0);
    });
    
    // Forzar cierre después de 10 segundos
    setTimeout(() => {
      logger.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Manejar señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Función para inicializar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    logger.info('✅ Database connected successfully');

    // Iniciar el servidor HTTP
    server = app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port} in ${env} mode`);
      logger.info(`📚 API Documentation: http://localhost:${port}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${port}/health`);
      
      if (env === 'development') {
        console.log(`\n🚀 Server running at http://localhost:${port}`);
        console.log(`📚 API Docs: http://localhost:${port}/api-docs`);
        console.log(`🏥 Health: http://localhost:${port}/health\n`);
      }
    });

    // Configurar timeout del servidor
    server.timeout = 30000; // 30 segundos
    server.keepAliveTimeout = 65000; // 65 segundos
    server.headersTimeout = 66000; // 66 segundos

    // Manejar errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${port} is already in use`);
      } else {
        logger.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();
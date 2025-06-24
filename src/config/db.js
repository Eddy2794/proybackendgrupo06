import mongoose from 'mongoose';
import config from './index.js';
import { logger } from '../utils/logger.js';

// Configuración de Mongoose
mongoose.set('strictQuery', true);

// Configurar opciones de conexión optimizadas
const connectionOptions = {
  maxPoolSize: 10, // Máximo número de conexiones en el pool
  serverSelectionTimeoutMS: 5000, // Tiempo para seleccionar servidor
  socketTimeoutMS: 45000, // Tiempo de timeout para sockets
};

export const connectDB = async () => {
  try {
    // Configurar eventos de conexión antes de conectar
    mongoose.connection.on('connected', () => {
      logger.info('🔗 Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      logger.error('❌ Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ Mongoose disconnected');
    });

    // Manejar cierre graceful de la aplicación
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

    // Conectar a MongoDB sin opciones deprecadas
    const conn = await mongoose.connect(config.dbUri, connectionOptions);
    
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};
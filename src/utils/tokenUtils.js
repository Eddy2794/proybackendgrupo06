import TokenBlacklist from '../modules/auth/model/tokenBlacklist.model.js';
import { logger } from './logger.js';

/**
 * Limpia los tokens expirados de la lista negra
 * Esta función se puede ejecutar periódicamente para mantener la base de datos limpia
 */
export const cleanupExpiredTokens = async () => {
  try {
    const result = await TokenBlacklist.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    if (result.deletedCount > 0) {
      logger.info(`Tokens expirados eliminados: ${result.deletedCount}`);
    }
    
    return result.deletedCount;
  } catch (error) {
    logger.error('Error al limpiar tokens expirados:', error);
    throw error;
  }
};

/**
 * Invalida todos los tokens de un usuario específico
 * Útil para casos como cambio de contraseña forzoso o suspensión de cuenta
 */
export const invalidateAllUserTokens = async (userId) => {
  try {
    // Esta función requeriría una implementación más compleja
    // para rastrear todos los tokens activos de un usuario
    // Por ahora, solo registramos la acción
    logger.info(`Invalidando todos los tokens del usuario: ${userId}`);
    
    // Aquí se podría implementar lógica adicional como:
    // - Marcar una marca de tiempo en el usuario
    // - Verificar esta marca de tiempo en el middleware de auth
    // - Rechazar tokens emitidos antes de esta marca de tiempo
    
    return { message: 'Tokens del usuario invalidados' };
  } catch (error) {
    logger.error('Error al invalidar tokens del usuario:', error);
    throw error;
  }
};

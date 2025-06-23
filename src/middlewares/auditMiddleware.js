/**
 * Middleware de Auditoría para Soft Delete
 * Extrae automáticamente el usuario actual para operaciones de auditoría
 */

/**
 * Middleware que extrae el ID del usuario actual para auditoría
 * Se debe usar antes de cualquier operación de soft delete/restore
 */
export const extractUserForAudit = (req, res, next) => {
  // Intentar obtener el usuario del token JWT
  if (req.user && req.user.userId) {
    req.auditUser = req.user.userId;
  } else if (req.user && req.user.id) {
    req.auditUser = req.user.id;
  } else {
    // Si no hay usuario autenticado, usar null (para operaciones del sistema)
    req.auditUser = null;
  }
  
  next();
};

/**
 * Middleware específico para soft delete
 */
export const auditSoftDelete = (req, res, next) => {
  extractUserForAudit(req, res, next);
};

/**
 * Middleware específico para restore
 */
export const auditRestore = (req, res, next) => {
  extractUserForAudit(req, res, next);
};

export default {
  extractUserForAudit,
  auditSoftDelete,
  auditRestore
};

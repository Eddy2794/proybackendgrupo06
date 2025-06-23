/**
 * Plugin SIMPLE de Soft Delete con Auditoría
 * Soft delete seguro con metadatos de auditoría automáticos
 */

import mongoose from 'mongoose';

export const simpleSoftDelete = function(schema) {
  // Agregar campos de auditoría para soft delete
  schema.add({
    deleted: { 
      type: Date, 
      default: null, 
      index: true 
    },
    deletedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      default: null 
    },
    restoredAt: { 
      type: Date, 
      default: null 
    },
    restoredBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      default: null 
    }
  });

  // Filtrar automáticamente en TODAS las consultas
  schema.pre(/^find/, function() {
    if (!this.getQuery().deleted) {
      this.where({ deleted: null });
    }
  });

  // Método para eliminar con auditoría
  schema.methods.softDelete = function(deletedBy = null) {
    this.deleted = new Date();
    this.deletedBy = deletedBy;
    this.restoredAt = null;
    this.restoredBy = null;
    return this.save();
  };

  // Método para restaurar con auditoría
  schema.methods.restore = function(restoredBy = null) {
    this.deleted = null;
    this.deletedBy = null;
    this.restoredAt = new Date();
    this.restoredBy = restoredBy;
    return this.save();
  };

  // Static para buscar eliminados
  schema.statics.findDeleted = function(filter = {}) {
    return this.find({ ...filter, deleted: { $ne: null } });
  };

  // Static para buscar TODO (incluyendo eliminados)
  schema.statics.findWithDeleted = function(filter = {}) {
    return this.find(filter);
  };

  // Soft delete estático con auditoría
  schema.statics.softDeleteById = function(id, deletedBy = null) {
    return this.findByIdAndUpdate(id, { 
      deleted: new Date(),
      deletedBy: deletedBy,
      restoredAt: null,
      restoredBy: null
    }, { new: true });
  };

  // Restore estático con auditoría
  schema.statics.restoreById = function(id, restoredBy = null) {
    return this.findByIdAndUpdate(id, { 
      deleted: null,
      deletedBy: null,
      restoredAt: new Date(),
      restoredBy: restoredBy
    }, { new: true });  };

  // Obtener estadísticas de eliminados
  schema.statics.getDeletedStats = function() {
    return this.aggregate([
      { $match: { deleted: { $ne: null } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          oldestDeletion: { $min: '$deleted' },
          newestDeletion: { $max: '$deleted' }
        }
      }
    ]);
  };

  // Virtual para estado legible
  schema.virtual('status').get(function() {
    if (this.deleted) {
      return 'ELIMINADO';
    }
    return 'ACTIVO';
  });

  // Incluir virtuals en JSON
  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });
};

export default simpleSoftDelete;

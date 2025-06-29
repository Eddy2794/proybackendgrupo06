/**
 * Plugin de Mongoose para implementar Soft Delete
 * Permite marcar registros como eliminados sin borrarlos físicamente
 */

import mongoose from 'mongoose';

export const softDeletePlugin = function(schema, options = {}) {
  // Opciones por defecto
  const defaultOptions = {
    indexFields: true,
    validateBeforeDelete: true,
    deletedField: 'isDeleted',
    deletedAtField: 'deletedAt',
    deletedByField: 'deletedBy',
    restoreField: 'restoredAt',
    restoreByField: 'restoredBy'
  };
  
  const opts = { ...defaultOptions, ...options };
  
  // Agregar campos de soft delete al schema
  schema.add({
    [opts.deletedField]: {
      type: Boolean,
      default: false,
      index: opts.indexFields
    },
    [opts.deletedAtField]: {
      type: Date,
      index: opts.indexFields
    },
    [opts.deletedByField]: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    [opts.restoreField]: {
      type: Date
    },
    [opts.restoreByField]: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  });
  
  // Índice compuesto para mejorar performance
  if (opts.indexFields) {
    schema.index({ [opts.deletedField]: 1, [opts.deletedAtField]: 1 });
  }
  
  // Middleware para filtrar documentos eliminados en queries por defecto
  const excludeDeleted = function() {
    if (!this.getQuery()[opts.deletedField]) {
      this.where({ [opts.deletedField]: { $ne: true } });
    }
  };
  
  // Aplicar middleware a todas las operaciones de consulta
  schema.pre(/^find/, excludeDeleted);
  schema.pre('aggregate', function() {
    // Para aggregation pipelines, agregar match stage al inicio
    this.pipeline().unshift({ $match: { [opts.deletedField]: { $ne: true } } });
  });
  schema.pre('count', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);
  schema.pre('distinct', excludeDeleted);
  
  // Método para soft delete
  schema.methods.softDelete = function(deletedBy = null) {
    this[opts.deletedField] = true;
    this[opts.deletedAtField] = new Date();
    if (deletedBy) {
      this[opts.deletedByField] = deletedBy;
    }
    // Limpiar campos de restore
    this[opts.restoreField] = undefined;
    this[opts.restoreByField] = undefined;
    
    return this.save();
  };
  
  // Método para restaurar documento
  schema.methods.restore = function(restoredBy = null) {
    this[opts.deletedField] = false;
    this[opts.restoreField] = new Date();
    if (restoredBy) {
      this[opts.restoreByField] = restoredBy;
    }
    // Limpiar campos de delete
    this[opts.deletedAtField] = undefined;
    this[opts.deletedByField] = undefined;
    
    return this.save();
  };
  
  // Método para verificar si está eliminado
  schema.methods.isDeleted = function() {
    return this[opts.deletedField] === true;
  };
  
  // Método para hard delete (eliminar físicamente)
  schema.methods.hardDelete = function() {
    return this.deleteOne();
  };
  
  // Statics para queries incluyendo eliminados
  schema.statics.findDeleted = function(filter = {}) {
    return this.find({ ...filter, [opts.deletedField]: true });
  };
  
  schema.statics.findWithDeleted = function(filter = {}) {
    return this.find(filter);
  };
  
  schema.statics.countDeleted = function(filter = {}) {
    return this.countDocuments({ ...filter, [opts.deletedField]: true });
  };
  
  schema.statics.countWithDeleted = function(filter = {}) {
    return this.countDocuments(filter);
  };
  
  // Static para soft delete por ID
  schema.statics.softDeleteById = function(id, deletedBy = null) {
    const updateData = {
      [opts.deletedField]: true,
      [opts.deletedAtField]: new Date()
    };
    
    if (deletedBy) {
      updateData[opts.deletedByField] = deletedBy;
    }
    
    return this.findByIdAndUpdate(id, updateData, { new: true });
  };
  
  // Static para restaurar por ID
  schema.statics.restoreById = function(id, restoredBy = null) {
    const updateData = {
      [opts.deletedField]: false,
      [opts.restoreField]: new Date(),
      $unset: {
        [opts.deletedAtField]: 1,
        [opts.deletedByField]: 1
      }
    };
    
    if (restoredBy) {
      updateData[opts.restoreByField] = restoredBy;
    }
    
    return this.findByIdAndUpdate(id, updateData, { new: true });
  };
  
  // Virtual para obtener información de eliminación
  schema.virtual('deletionInfo').get(function() {
    if (!this[opts.deletedField]) return null;
    
    return {
      isDeleted: this[opts.deletedField],
      deletedAt: this[opts.deletedAtField],
      deletedBy: this[opts.deletedByField],
      restoredAt: this[opts.restoreField],
      restoredBy: this[opts.restoreByField]
    };
  });
  
  // Método para obtener historial de eliminación/restauración
  schema.methods.getDeletionHistory = function() {
    const history = [];
    
    if (this[opts.deletedAtField]) {
      history.push({
        action: 'deleted',
        date: this[opts.deletedAtField],
        by: this[opts.deletedByField]
      });
    }
    
    if (this[opts.restoreField]) {
      history.push({
        action: 'restored',
        date: this[opts.restoreField],
        by: this[opts.restoreByField]
      });
    }
    
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  };
  
  // Método para verificar si puede ser eliminado
  schema.methods.canBeDeleted = function() {
    if (opts.validateBeforeDelete && typeof opts.validateBeforeDelete === 'function') {
      return opts.validateBeforeDelete.call(this);
    }
    return !this[opts.deletedField];
  };
  
  // Hook para transformar JSON (opcional: incluir info de eliminación en development)
  schema.methods.toJSON = function() {
    const obj = this.toObject();
    
    // En desarrollo, incluir información de soft delete
    if (process.env.NODE_ENV === 'development') {
      obj.deletionInfo = this.deletionInfo;
    } else {
      // En producción, remover campos internos de soft delete
      delete obj[opts.deletedField];
      delete obj[opts.deletedAtField];
      delete obj[opts.deletedByField];
      delete obj[opts.restoreField];
      delete obj[opts.restoreByField];
    }
    
    return obj;
  };
};

export default softDeletePlugin;

/**
 * Módulo de Categorías
 * Exporta todas las funcionalidades del módulo categoria
 */

export { default as categoriaRoutes } from './route/categoria.routes.js';
export { categoriaController } from './controller/categoria.fluent.controller.js';
export { Categoria } from './model/categoria.model.js';
export * as categoriaService from './service/categoria.service.js';
export * as categoriaRepository from './repository/categoria.repository.js';
export * as categoriaValidators from './validator/categoria.validators.js';
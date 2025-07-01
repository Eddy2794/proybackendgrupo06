import CategoriaEscuela from '../model/categoriaEscuela.model.js';
import { validationResult } from 'express-validator';
import { successResponse, errorResponse } from '../../../utils/response.js';
import logger from '../../../utils/logger.js';

/**
 * Controlador para manejar las categorías de la escuela de fútbol
 */

class CategoriaEscuelaController {

  /**
   * Crea una nueva categoría de escuela
   */
  async crearCategoria(req, res) {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validation('Datos de entrada inválidos', errors.array());
      }

      // Solo administradores pueden crear categorías
      if (req.user.rol !== 'ADMIN') {
        return res.error('No autorizado - Se requieren permisos de administrador', 403);
      }

      const datosCategoria = {
        ...req.body,
        creadoPor: req.user.id,
        actualizadoPor: req.user.id
      };

      const nuevaCategoria = new CategoriaEscuela(datosCategoria);
      await nuevaCategoria.save();

      logger.info('Categoría de escuela creada exitosamente', {
        categoriaId: nuevaCategoria._id,
        nombre: nuevaCategoria.nombre,
        creadoPor: req.user.id
      });

      return res.success('Categoría creada exitosamente', nuevaCategoria, 201);

    } catch (error) {
      logger.error('Error creando categoría de escuela', {
        error: error.message,
        body: req.body,
        usuario: req.user?.id
      });

      if (error.code === 11000) {
        return res.error('Ya existe una categoría con ese nombre', 409);
      }

      return res.error('Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene todas las categorías con filtros opcionales
   */
  async obtenerCategorias(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validation('Parámetros de consulta inválidos', errors.array());
      }

      const { tipo, estado, activo, edad, precioMin, precioMax } = req.query;

      // Construir filtros
      const filtros = { deletedAt: null };

      if (tipo) {
        filtros.tipo = tipo;
      }

      // Manejar tanto 'estado' como 'activo' para compatibilidad
      if (estado) {
        filtros.estado = estado;
      } else if (activo !== undefined) {
        // Si se pasa activo=true, buscar categorías ACTIVA
        filtros.estado = activo === 'true' ? 'ACTIVA' : { $ne: 'ACTIVA' };
      } else {
        // Por defecto, solo mostrar categorías activas para usuarios no admin
        if (req.user?.rol !== 'ADMIN') {
          filtros.estado = 'ACTIVA';
        }
      }

      if (edad) {
        filtros.edadMinima = { $lte: parseInt(edad) };
        filtros.edadMaxima = { $gte: parseInt(edad) };
      }

      if (precioMin || precioMax) {
        filtros['precio.cuotaMensual'] = {};
        if (precioMin) filtros['precio.cuotaMensual'].$gte = parseFloat(precioMin);
        if (precioMax) filtros['precio.cuotaMensual'].$lte = parseFloat(precioMax);
      }

      logger.info('Buscando categorías con filtros:', { filtros, query: req.query });
      console.log('Filtros aplicados:', filtros);
      const categorias = await CategoriaEscuela.find(filtros)
        .populate('creadoPor', 'username')
        .populate('actualizadoPor', 'username')
        .sort({ 'precio.cuotaMensual': 1, nombre: 1 });

      logger.info(`Encontradas ${categorias.length} categorías`);

      return res.success('Categorías obtenidas exitosamente', {
        categorias,
        total: categorias.length,
        filtrosAplicados: filtros
      });

    } catch (error) {
      logger.error('Error obteniendo categorías', {
        error: error.message,
        query: req.query,
        usuario: req.user?.id
      });

      return res.error('Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene una categoría específica por ID
   */
  async obtenerCategoriaPorId(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validation('ID de categoría inválido', errors.array());
      }

      const { categoriaId } = req.params;

      const categoria = await CategoriaEscuela.findById(categoriaId)
        .populate('creadoPor', 'username')
        .populate('actualizadoPor', 'username');

      if (!categoria) {
        return res.error('Categoría no encontrada', 404);
      }

      // Verificar si la categoría está activa para usuarios no admin
      if (req.user?.rol !== 'ADMIN' && categoria.estado !== 'ACTIVA') {
        return res.error('Categoría no disponible', 404);
      }

      return res.success('Categoría obtenida exitosamente', categoria);

    } catch (error) {
      logger.error('Error obteniendo categoría por ID', {
        error: error.message,
        categoriaId: req.params.categoriaId,
        usuario: req.user?.id
      });

      return res.error('Error interno del servidor', 500);
    }
  }

  /**
   * Actualiza una categoría existente
   */
  async actualizarCategoria(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validation('Datos inválidos', errors.array());
      }

      // Solo administradores pueden actualizar categorías
      if (req.user.rol !== 'ADMIN') {
        return res.error('No autorizado - Se requieren permisos de administrador', 403);
      }

      const { categoriaId } = req.params;
      const datosActualizacion = {
        ...req.body,
        actualizadoPor: req.user.id,
        fechaActualizacion: new Date()
      };

      const categoriaActualizada = await CategoriaEscuela.findByIdAndUpdate(
        categoriaId,
        datosActualizacion,
        { new: true, runValidators: true }
      ).populate('actualizadoPor', 'username');

      if (!categoriaActualizada) {
        return res.error('Categoría no encontrada', 404);
      }

      logger.info('Categoría actualizada exitosamente', {
        categoriaId,
        nombre: categoriaActualizada.nombre,
        actualizadoPor: req.user.id
      });

      return res.success('Categoría actualizada exitosamente', categoriaActualizada);

    } catch (error) {
      logger.error('Error actualizando categoría', {
        error: error.message,
        categoriaId: req.params.categoriaId,
        body: req.body,
        usuario: req.user?.id
      });

      if (error.code === 11000) {
        return res.error('Ya existe una categoría con ese nombre', 409);
      }

      return res.error('Error interno del servidor', 500);
    }
  }

  /**
   * Elimina (soft delete) una categoría
   */
  async eliminarCategoria(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.validation('ID de categoría inválido', errors.array());
      }

      // Solo administradores pueden eliminar categorías
      if (req.user.rol !== 'ADMIN') {
        return res.error('No autorizado - Se requieren permisos de administrador', 403);
      }

      const { categoriaId } = req.params;

      const categoria = await CategoriaEscuela.findById(categoriaId);
      if (!categoria) {
        return res.error('Categoría no encontrada', 404);
      }

      // Verificar si hay pagos asociados a esta categoría
      const Pago = (await import('../../../modules/pago/model/pago.model.js')).default;
      const pagosActivos = await Pago.countDocuments({
        categoriaEscuela: categoriaId,
        estado: { $in: ['PENDIENTE', 'APROBADO', 'EN_PROCESO'] },
        deletedAt: null
      });

      if (pagosActivos > 0) {
        return res.error('No se puede eliminar la categoría porque tiene pagos activos asociados', 409);
      }

      // Realizar soft delete
      await categoria.softDelete();

      logger.info('Categoría eliminada exitosamente', {
        categoriaId,
        nombre: categoria.nombre,
        eliminadoPor: req.user.id
      });

      return res.success('Categoría eliminada exitosamente');

    } catch (error) {
      logger.error('Error eliminando categoría', {
        error: error.message,
        categoriaId: req.params.categoriaId,
        usuario: req.user?.id
      });

      return res.error('Error interno del servidor', 500);
    }
  }

  /**
   * Busca categorías por edad específica
   */
  async buscarPorEdad(req, res) {
    try {
      const { edad } = req.params;
      const edadNum = parseInt(edad);

      if (isNaN(edadNum) || edadNum < 3 || edadNum > 100) {
        return res.error('Edad inválida (debe estar entre 3 y 100 años)', 400);
      }

      const categorias = await CategoriaEscuela.buscarPorEdad(edadNum);

      return res.success('Categorías encontradas por edad', {
        categorias,
        edad: edadNum,
        total: categorias.length
      });

    } catch (error) {
      logger.error('Error buscando categorías por edad', {
        error: error.message,
        edad: req.params.edad
      });

      return res.error('Error interno del servidor', 500);
    }
  }

  /**
   * Busca categorías por tipo
   */
  async buscarPorTipo(req, res) {
    try {
      const { tipo } = req.params;

      const tiposValidos = ['INFANTIL', 'JUVENIL', 'ADULTO', 'VETERANOS', 'COMPETITIVO', 'RECREATIVO', 'ENTRENAMIENTO'];
      if (!tiposValidos.includes(tipo)) {
        return res.error('Tipo de categoría inválido', 400);
      }

      const categorias = await CategoriaEscuela.buscarPorTipo(tipo);

      return res.success('Categorías encontradas por tipo', {
        categorias,
        tipo,
        total: categorias.length
      });

    } catch (error) {
      logger.error('Error buscando categorías por tipo', {
        error: error.message,
        tipo: req.params.tipo
      });

      return res.error('Error interno del servidor', 500);
    }
  }

  /**
   * Busca categorías por rango de precio
   */
  async buscarPorRangoPrecio(req, res) {
    try {
      const { precioMin, precioMax } = req.query;

      if (!precioMin || !precioMax) {
        return res.error('Se requieren precioMin y precioMax', 400);
      }

      const min = parseFloat(precioMin);
      const max = parseFloat(precioMax);

      if (isNaN(min) || isNaN(max) || min < 0 || max < 0 || min > max) {
        return res.error('Rango de precios inválido', 400);
      }

      const categorias = await CategoriaEscuela.buscarPorRangoPrecio(min, max);

      return res.success('Categorías encontradas por rango de precio', {
        categorias,
        rangoPrecios: { min, max },
        total: categorias.length
      });

    } catch (error) {
      logger.error('Error buscando categorías por rango de precio', {
        error: error.message,
        query: req.query
      });

      return res.error('Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene estadísticas de las categorías
   */
  async obtenerEstadisticas(req, res) {
    try {
      // Solo administradores pueden ver estadísticas
      if (req.user.rol !== 'ADMIN') {
        return res.error('No autorizado - Se requieren permisos de administrador', 403);
      }

      // Estadísticas básicas
      const totalCategorias = await CategoriaEscuela.countDocuments({ deletedAt: null });
      const categoriasActivas = await CategoriaEscuela.countDocuments({ estado: 'ACTIVA', deletedAt: null });
      const categoriasInactivas = await CategoriaEscuela.countDocuments({ estado: 'INACTIVA', deletedAt: null });

      // Estadísticas por tipo
      const estadisticasPorTipo = await CategoriaEscuela.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: '$tipo',
            cantidad: { $sum: 1 },
            precioPromedio: { $avg: '$precio.cuotaMensual' },
            precioMinimo: { $min: '$precio.cuotaMensual' },
            precioMaximo: { $max: '$precio.cuotaMensual' }
          }
        },
        { $sort: { cantidad: -1 } }
      ]);

      // Rango de precios general
      const rangoPreciosGeneral = await CategoriaEscuela.aggregate([
        { $match: { deletedAt: null, estado: 'ACTIVA' } },
        {
          $group: {
            _id: null,
            precioPromedio: { $avg: '$precio.cuotaMensual' },
            precioMinimo: { $min: '$precio.cuotaMensual' },
            precioMaximo: { $max: '$precio.cuotaMensual' },
            totalCategorias: { $sum: 1 }
          }
        }
      ]);

      const estadisticas = {
        resumen: {
          total: totalCategorias,
          activas: categoriasActivas,
          inactivas: categoriasInactivas,
          porcentajeActivas: totalCategorias > 0 ? Math.round((categoriasActivas / totalCategorias) * 100) : 0
        },
        porTipo: estadisticasPorTipo,
        precios: rangoPreciosGeneral[0] || {
          precioPromedio: 0,
          precioMinimo: 0,
          precioMaximo: 0,
          totalCategorias: 0
        }
      };

      return res.success('Estadísticas obtenidas exitosamente', estadisticas);

    } catch (error) {
      logger.error('Error obteniendo estadísticas de categorías', {
        error: error.message,
        usuario: req.user?.id
      });

      return res.error('Error interno del servidor', 500);
    }
  }
}

export default new CategoriaEscuelaController();

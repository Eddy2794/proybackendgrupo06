import * as alumnoCategoriaRepo from '../repository/alumno_categoria.repository.js';

// Crear una nueva relación alumno-categoría
export const createAlumnoCategoria = async (data) => {
    const existing = await alumnoCategoriaRepo.findByAlumnoAndCategoria(data.alumno, data.categoria);
    if (existing) {
        throw new Error('El alumno ya está inscripto en esta categoría');
    }

    data.estado = data.estado || 'ACTIVO';

    return await alumnoCategoriaRepo.create(data);
};

// Obtener por ID
export const getAlumnoCategoriaById = async (id) => {
    const relacion = await alumnoCategoriaRepo.findById(id);
    if (!relacion) {
        throw new Error('Inscripción no encontrada');
    }
    return relacion;
};

// Obtener todos con filtros
export const getAllAlumnoCategorias = async (filter = {}, options = {}) => {
    return await alumnoCategoriaRepo.findAll(filter, options);
};

// Actualizar una inscripción por ID
export const updateAlumnoCategoria = async (id, updateData) => {
    const existing = await alumnoCategoriaRepo.findById(id);
    if (!existing) {
        throw new Error('Inscripción no encontrada');
    }

    // Validar que no cree una inscripción duplicada si cambia alumno o categoría
    if (
        (updateData.alumno && updateData.alumno !== existing.alumno.toString()) ||
        (updateData.categoria && updateData.categoria !== existing.categoria.toString())
      ) {
        const existe = await alumnoCategoriaRepo.findByAlumnoAndCategoria(
          updateData.alumno || existing.alumno,
          updateData.categoria || existing.categoria
        );
        if (existe) {
          throw new Error('Ya existe esta inscripción con los nuevos datos');
        }
      }
    return await alumnoCategoriaRepo.updateById(id, updateData);
};

// Eliminar físicamente
export const deleteAlumnoCategoriaPermanently = async (id) => {
    const relacion = await alumnoCategoriaRepo.findById(id);
    if (!relacion) {
        throw new Error('Inscripción no encontrada');
    }
    return await alumnoCategoriaRepo.deleteById(id);
};

// Soft delete
export const deleteAlumnoCategoria = async (id, deleteBy = null) => {
    const relacion = await alumnoCategoriaRepo.findById(id);
    if (!relacion) {
        throw new Error('Inscripción no encontrada');
    }

    if (relacion.estado === 'INACTIVO') {
        throw new Error('La inscripción ya está inactiva');
    }

    return await alumnoCategoriaRepo.softDeleteById(id, deleteBy);
};

// Restaurar
export const restoreAlumnoCategoria = async (id, restoreBy = null) => {
    let relacion = await alumnoCategoriaRepo.findDeletedById(id);
    
    if (!relacion) {
        relacion = await alumnoCategoriaRepo.findById(id);
        if (!relacion) {
            throw new Error('Inscripción no encontrada');
        }
        if (relacion.estado === 'ACTIVO') {
            throw new Error('La inscripción ya está activa');
        }
    }

    return await alumnoCategoriaRepo.restoreById(id, restoreBy);
};

//Listar por alumno
export const getCategoriasByAlumno = async (alumnoId) => {
    return await alumnoCategoriaRepo.findByAlumno(alumnoId);
};

//Listar por categoría
export const getAlumnosByCategoria = async (categoriaId) => {
    return await alumnoCategoriaRepo.findByCategoria(categoriaId);
};

//Obtener estadísticas para dashboard
export const getInscripcionesStats = async (period = 'month') => {
    try {
        // Obtener todas las inscripciones activas con datos de categoría
        const inscripciones = await alumnoCategoriaRepo.findAllWithCategories();
        
        const stats = {
            totalInscripciones: inscripciones.length,
            inscripcionesPorCategoria: [],
            inscripcionesPorDia: [],
            inscripcionesPorMes: [],
            inscripcionesPorAno: [],
            categorias: []
        };

        // Agrupar por categoría
        const categoriaMap = new Map();
        inscripciones.forEach(inscripcion => {
            const categoriaId = inscripcion.categoria._id.toString();
            const categoriaNombre = inscripcion.categoria.nombre;
            
            if (!categoriaMap.has(categoriaId)) {
                categoriaMap.set(categoriaId, {
                    _id: categoriaId,
                    nombre: categoriaNombre,
                    cantidad: 0,
                    inscripciones: []
                });
            }
            
            const categoria = categoriaMap.get(categoriaId);
            categoria.cantidad++;
            categoria.inscripciones.push(inscripcion);
        });

        // Convertir a arrays
        categoriaMap.forEach((data, categoriaId) => {
            stats.inscripcionesPorCategoria.push({
                categoria: data.nombre,
                cantidad: data.cantidad
            });
            stats.categorias.push({
                _id: categoriaId,
                nombre: data.nombre
            });
        });

        // Generar datos por período
        if (period === 'day') {
            stats.inscripcionesPorDia = generateDayData(inscripciones);
        } else if (period === 'month') {
            stats.inscripcionesPorMes = generateMonthData(inscripciones);
        } else if (period === 'year') {
            stats.inscripcionesPorAno = generateYearData(inscripciones);
        }

        return stats;
    } catch (error) {
        throw new Error('Error al obtener estadísticas: ' + error.message);
    }
};

// Funciones auxiliares para generar datos por período
function generateDayData(inscripciones) {
    const dias = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date(now);
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().split('T')[0];
        
        const cantidad = inscripciones.filter(inscripcion => {
            const fechaInscripcion = new Date(inscripcion.fecha_inscripcion);
            return fechaInscripcion.toISOString().split('T')[0] === fechaStr;
        }).length;
        
        dias.push({
            fecha: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
            cantidad
        });
    }
    
    return dias;
}

function generateMonthData(inscripciones) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    return meses.map((mes, index) => {
        const cantidad = inscripciones.filter(inscripcion => {
            const fecha = new Date(inscripcion.fecha_inscripcion);
            return fecha.getMonth() === index && fecha.getFullYear() === new Date().getFullYear();
        }).length;
        
        return { mes, cantidad };
    });
}

function generateYearData(inscripciones) {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        const cantidad = inscripciones.filter(inscripcion => {
            const fecha = new Date(inscripcion.fecha_inscripcion);
            return fecha.getFullYear() === year;
        }).length;
        
        years.push({
            ano: year.toString(),
            cantidad
        });
    }
    
    return years;
}


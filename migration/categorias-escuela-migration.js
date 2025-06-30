import mongoose from 'mongoose';
import CategoriaEscuela from '../src/modules/categoria-escuela/model/categoriaEscuela.model.js';
import logger from '../src/utils/logger.js';

/**
 * Migración para crear categorías de escuela de fútbol por defecto
 */

const categoriasPorDefecto = [
  {
    nombre: "Infantil Sub-8",
    descripcion: "Categoría para niños de 6 a 8 años. Entrenamiento lúdico enfocado en diversión y desarrollo de habilidades básicas del fútbol.",
    tipo: "INFANTIL",
    edadMinima: 6,
    edadMaxima: 8,
    precio: {
      cuotaMensual: 12000,
      descuentos: {
        hermanos: 15,
        pagoAnual: 10
      }
    },
    estado: "ACTIVA",
    cupoMaximo: 20,
    horarios: [
      { dia: "MARTES", horaInicio: "16:00", horaFin: "17:00" },
      { dia: "JUEVES", horaInicio: "16:00", horaFin: "17:00" }
    ]
  },
  {
    nombre: "Infantil Sub-10",
    descripcion: "Categoría para niños de 8 a 10 años. Introducción a conceptos básicos de juego y trabajo en equipo.",
    tipo: "INFANTIL",
    edadMinima: 8,
    edadMaxima: 10,
    precio: {
      cuotaMensual: 15000,
      descuentos: {
        hermanos: 15,
        pagoAnual: 12
      }
    },
    estado: "ACTIVA",
    cupoMaximo: 22,
    horarios: [
      { dia: "LUNES", horaInicio: "16:30", horaFin: "17:30" },
      { dia: "MIERCOLES", horaInicio: "16:30", horaFin: "17:30" }
    ]
  },
  {
    nombre: "Infantil Sub-12",
    descripcion: "Categoría para niños de 10 a 12 años. Desarrollo de técnicas individuales y primeros conceptos tácticos.",
    tipo: "INFANTIL",
    edadMinima: 10,
    edadMaxima: 12,
    precio: {
      cuotaMensual: 18000,
      descuentos: {
        hermanos: 15,
        pagoAnual: 15
      }
    },
    estado: "ACTIVA",
    cupoMaximo: 24,
    horarios: [
      { dia: "MARTES", horaInicio: "17:00", horaFin: "18:30" },
      { dia: "VIERNES", horaInicio: "17:00", horaFin: "18:30" }
    ]
  },
  {
    nombre: "Juvenil Sub-15",
    descripcion: "Categoría para adolescentes de 12 a 15 años. Perfeccionamiento técnico y desarrollo táctico avanzado.",
    tipo: "JUVENIL",
    edadMinima: 12,
    edadMaxima: 15,
    precio: {
      cuotaMensual: 22000,
      descuentos: {
        hermanos: 12,
        pagoAnual: 18
      }
    },
    estado: "ACTIVA",
    cupoMaximo: 25,
    horarios: [
      { dia: "LUNES", horaInicio: "18:00", horaFin: "19:30" },
      { dia: "MIERCOLES", horaInicio: "18:00", horaFin: "19:30" }
    ]
  },
  {
    nombre: "Juvenil Sub-18",
    descripcion: "Categoría para jóvenes de 15 a 18 años. Preparación pre-competitiva con enfoque en formación integral.",
    tipo: "JUVENIL",
    edadMinima: 15,
    edadMaxima: 18,
    precio: {
      cuotaMensual: 25000,
      descuentos: {
        hermanos: 10,
        pagoAnual: 20
      }
    },
    estado: "ACTIVA",
    cupoMaximo: 28,
    horarios: [
      { dia: "MARTES", horaInicio: "19:00", horaFin: "20:30" },
      { dia: "JUEVES", horaInicio: "19:00", horaFin: "20:30" }
    ]
  },
  {
    nombre: "Adultos Recreativo",
    descripcion: "Categoría para adultos de 18 a 45 años. Fútbol recreativo enfocado en mantener la forma física y disfrutar del deporte.",
    tipo: "RECREATIVO",
    edadMinima: 18,
    edadMaxima: 45,
    precio: {
      cuotaMensual: 20000,
      descuentos: {
        hermanos: 8,
        pagoAnual: 15
      }
    },
    estado: "ACTIVA",
    cupoMaximo: 30,
    horarios: [
      { dia: "LUNES", horaInicio: "20:00", horaFin: "21:30" },
      { dia: "MIERCOLES", horaInicio: "20:00", horaFin: "21:30" }
    ]
  },
  {
    nombre: "Veteranos +45",
    descripcion: "Categoría para adultos mayores de 45 años. Fútbol adaptado con énfasis en el disfrute y la actividad física saludable.",
    tipo: "VETERANOS",
    edadMinima: 45,
    edadMaxima: 70,
    precio: {
      cuotaMensual: 18000,
      descuentos: {
        hermanos: 10,
        pagoAnual: 20
      }
    },
    estado: "ACTIVA",
    cupoMaximo: 25,
    horarios: [
      { dia: "MARTES", horaInicio: "19:30", horaFin: "21:00" },
      { dia: "SABADO", horaInicio: "09:00", horaFin: "10:30" }
    ]
  },
  {
    nombre: "Competitivo Elite",
    descripcion: "Categoría de alto rendimiento para jóvenes de 16 a 22 años con aspiraciones competitivas. Entrenamiento intensivo.",
    tipo: "COMPETITIVO",
    edadMinima: 16,
    edadMaxima: 22,
    precio: {
      cuotaMensual: 35000,
      descuentos: {
        hermanos: 5,
        pagoAnual: 25
      }
    },
    estado: "ACTIVA",
    cupoMaximo: 20,
    horarios: [
      { dia: "LUNES", horaInicio: "19:30", horaFin: "21:30" },
      { dia: "MIERCOLES", horaInicio: "19:30", horaFin: "21:30" },
      { dia: "VIERNES", horaInicio: "19:30", horaFin: "21:30" }
    ]
  },
  {
    nombre: "Entrenamiento Personalizado",
    descripcion: "Sesiones de entrenamiento individual o en grupos reducidos. Disponible para todas las edades con objetivos específicos.",
    tipo: "ENTRENAMIENTO",
    edadMinima: 6,
    edadMaxima: 60,
    precio: {
      cuotaMensual: 45000,
      descuentos: {
        hermanos: 0,
        pagoAnual: 30
      }
    },
    estado: "ACTIVA",
    cupoMaximo: 5,
    horarios: [
      { dia: "SABADO", horaInicio: "08:00", horaFin: "12:00" },
      { dia: "DOMINGO", horaInicio: "08:00", horaFin: "12:00" }
    ]
  }
];

async function migrarCategorias() {
  try {
    console.log('🏃‍♂️ Iniciando migración de categorías de escuela...');

    // Verificar si ya existen categorías
    const categoriasExistentes = await CategoriaEscuela.countDocuments({});
    
    if (categoriasExistentes > 0) {
      console.log(`⚠️  Ya existen ${categoriasExistentes} categorías en la base de datos.`);
      console.log('¿Desea continuar y agregar las categorías por defecto? (Pueden duplicarse nombres)');
      
      // En un entorno real, podrías implementar una confirmación aquí
      // Por ahora, continuaremos solo si no hay categorías
      console.log('🛑 Migración cancelada para evitar duplicados.');
      return;
    }

    // Crear categorías por defecto
    const categoriasCreadas = [];
    
    for (const categoriaData of categoriasPorDefecto) {
      try {
        const categoria = new CategoriaEscuela(categoriaData);
        await categoria.save();
        categoriasCreadas.push(categoria);
        
        console.log(`✅ Categoría creada: ${categoria.nombre} (${categoria.tipo})`);
      } catch (error) {
        console.error(`❌ Error creando categoría ${categoriaData.nombre}:`, error.message);
      }
    }

    console.log('\n📊 Resumen de la migración:');
    console.log(`✅ Categorías creadas exitosamente: ${categoriasCreadas.length}`);
    console.log(`❌ Errores: ${categoriasPorDefecto.length - categoriasCreadas.length}`);

    // Mostrar estadísticas por tipo
    const estadisticasPorTipo = {};
    categoriasCreadas.forEach(categoria => {
      estadisticasPorTipo[categoria.tipo] = (estadisticasPorTipo[categoria.tipo] || 0) + 1;
    });

    console.log('\n📈 Categorías por tipo:');
    Object.entries(estadisticasPorTipo).forEach(([tipo, cantidad]) => {
      console.log(`   ${tipo}: ${cantidad} categorías`);
    });

    console.log('\n🎉 Migración de categorías completada exitosamente!');
    
    // Mostrar rango de precios
    const precios = categoriasCreadas.map(c => c.precio.cuotaMensual);
    const precioMin = Math.min(...precios);
    const precioMax = Math.max(...precios);
    const precioPromedio = precios.reduce((a, b) => a + b, 0) / precios.length;

    console.log('\n💰 Información de precios:');
    console.log(`   Precio mínimo: $${precioMin.toLocaleString('es-AR')}`);
    console.log(`   Precio máximo: $${precioMax.toLocaleString('es-AR')}`);
    console.log(`   Precio promedio: $${Math.round(precioPromedio).toLocaleString('es-AR')}`);

  } catch (error) {
    console.error('❌ Error durante la migración de categorías:', error);
    logger.error('Error en migración de categorías', { error: error.message });
    throw error;
  }
}

// Función para ejecutar la migración si se llama directamente
async function ejecutarMigracion() {
  try {
    // Conectar a la base de datos si no está conectado
    if (mongoose.connection.readyState === 0) {
      const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/proybackendgrupo06';
      await mongoose.connect(DB_URI);
      console.log('🔗 Conectado a la base de datos para migración');
    }

    await migrarCategorias();

  } catch (error) {
    console.error('💥 Error fatal en la migración:', error);
    process.exit(1);
  } finally {
    // Cerrar la conexión si fue abierta aquí
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Desconectado de la base de datos');
    }
  }
}

// Exportar tanto la función de migración como la función de ejecución
export { migrarCategorias, ejecutarMigracion };

// Si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  ejecutarMigracion();
}

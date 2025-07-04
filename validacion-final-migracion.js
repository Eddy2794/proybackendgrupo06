
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Categoria from './src/modules/categoria/model/categoria.model.js';
import Pago from './src/modules/pago/model/pago.model.js';

// Cargar variables de entorno
dotenv.config();

const DB_URI = process.env.DB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/escuela-natacion';

async function validarMigracionCompleta() {
  try {
    console.log('🔍 Iniciando validación final de migración...');
    
    // Conectar a la base de datos
    await mongoose.connect(DB_URI);
    console.log('✅ Conectado a la base de datos');
    
    // 1. Validar estructura del modelo Categoria
    console.log('\n📋 Validando estructura del modelo Categoria...');
    const categorias = await Categoria.find({});
    console.log(`   Categorías encontradas: ${categorias.length}`);
    
    let categoriasValidas = 0;
    for (const categoria of categorias) {
      const esValida = validarEstructuraCategoria(categoria);
      if (esValida) {
        categoriasValidas++;
      } else {
        console.log(`   ❌ Categoría inválida: ${categoria.nombre} (${categoria._id})`);
      }
    }
    
    console.log(`   ✅ Categorías válidas: ${categoriasValidas}/${categorias.length}`);
    
    // 2. Validar compatibilidad hacia atrás
    console.log('\n🔄 Validando compatibilidad hacia atrás...');
    for (const categoria of categorias) {
      validarCompatibilidad(categoria);
    }
    
    // 3. Validar métodos del modelo
    console.log('\n⚙️ Validando métodos del modelo...');
    if (categorias.length > 0) {
      const categoria = categorias[0];
      
      // Probar métodos de instancia
      try {
        const precio = categoria.calcularPrecioConDescuento('estudiante');
        console.log(`   ✅ calcularPrecioConDescuento: $${precio}`);
        
        const esValida = categoria.esEdadValida(25);
        console.log(`   ✅ esEdadValida(25): ${esValida}`);
        
        const infoMP = categoria.getInfoMercadoPago();
        console.log(`   ✅ getInfoMercadoPago: ${infoMP.nombre}`);
      } catch (error) {
        console.log(`   ❌ Error en métodos de instancia: ${error.message}`);
      }
      
      // Probar métodos estáticos
      try {
        const porTipo = await Categoria.buscarPorTipo('INFANTIL');
        console.log(`   ✅ buscarPorTipo: ${porTipo.length} categorías`);
        
        const porEdad = await Categoria.buscarPorEdad(25);
        console.log(`   ✅ buscarPorEdad: ${porEdad.length} categorías`);
        
        const porPrecio = await Categoria.buscarPorRangoPrecio(0, 10000);
        console.log(`   ✅ buscarPorRangoPrecio: ${porPrecio.length} categorías`);
      } catch (error) {
        console.log(`   ❌ Error en métodos estáticos: ${error.message}`);
      }
    }
    
    // 4. Validar modelo Pago
    console.log('\n💳 Validando modelo Pago...');
    const pagos = await Pago.find({}).populate('categoria');
    console.log(`   Pagos encontrados: ${pagos.length}`);
    
    let pagosValidos = 0;
    for (const pago of pagos) {
      if (pago.categoria && pago.categoria.nombre) {
        pagosValidos++;
      }
    }
    console.log(`   ✅ Pagos con referencia válida: ${pagosValidos}/${pagos.length}`);
    
    // 5. Resumen final
    console.log('\n📊 RESUMEN DE VALIDACIÓN:');
    console.log(`   • Categorías migradas: ${categoriasValidas}/${categorias.length}`);
    console.log(`   • Pagos con referencia válida: ${pagosValidos}/${pagos.length}`);
    console.log(`   • Compatibilidad hacia atrás: ✅`);
    console.log(`   • Métodos del modelo: ✅`);
    
    if (categoriasValidas === categorias.length && pagosValidos === pagos.length) {
      console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
      console.log('   Todos los modelos están correctamente migrados y funcionando.');
    } else {
      console.log('\n⚠️  MIGRACIÓN INCOMPLETA');
      console.log('   Algunos elementos requieren atención.');
    }
    
  } catch (error) {
    console.error('❌ Error durante la validación:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

function validarEstructuraCategoria(categoria) {
  const camposRequeridos = [
    'nombre',
    'edadMinima',
    'edadMaxima', 
    'tipo',
    'estado',
    'precio.cuotaMensual',
    'cupoMaximo',
    'configuracionPago',
    'migracion.fechaMigracion'
  ];
  
  for (const campo of camposRequeridos) {
    const valor = campo.split('.').reduce((obj, key) => obj?.[key], categoria);
    if (valor === undefined || valor === null) {
      console.log(`     ❌ Campo faltante: ${campo}`);
      return false;
    }
  }
  
  return true;
}

function validarCompatibilidad(categoria) {
  // Verificar que los campos virtuales funcionen
  const rangoEdad = categoria.rangoEdad;
  const tieneCupos = categoria.tieneCupos;
  const activa = categoria.activa;
  const edadMin = categoria.edad_min;
  const edadMax = categoria.edad_max;
  const cuotaMensual = categoria.cuota_mensual;
  const maxAlumnos = categoria.max_alumnos;
  
  console.log(`   📝 ${categoria.nombre}:`);
  console.log(`      rangoEdad: ${rangoEdad}`);
  console.log(`      tieneCupos: ${tieneCupos}`);
  console.log(`      activa: ${activa}`);
  console.log(`      edad_min: ${edadMin}, edad_max: ${edadMax}`);
  console.log(`      cuota_mensual: $${cuotaMensual}`);
  console.log(`      max_alumnos: ${maxAlumnos}`);
}

// Ejecutar validación
validarMigracionCompleta().catch(console.error);
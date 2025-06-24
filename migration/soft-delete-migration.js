/**
 * Script de Migración - Aplicar Soft Delete a Datos Existentes
 * 
 * Este script debe ejecutarse UNA SOLA VEZ después de implementar el soft delete
 * para agregar los campos necesarios a los documentos existentes en la base de datos.
 */

import mongoose from 'mongoose';
import config from '../src/config/index.js';

const runMigration = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(config.dbUri);
    console.log('🔗 Conectado a MongoDB para migración');

    // Obtener referencias a las colecciones
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const personasCollection = db.collection('personas');

    console.log('🚀 Iniciando migración de Soft Delete...');

    // 1. Migrar colección de Users
    const usersResult = await usersCollection.updateMany(
      { 
        isDeleted: { $exists: false } 
      },
      { 
        $set: { 
          isDeleted: false 
        } 
      }
    );

    console.log(`👥 Users migrados: ${usersResult.modifiedCount} documentos actualizados`);

    // 2. Migrar colección de Personas
    const personasResult = await personasCollection.updateMany(
      { 
        isDeleted: { $exists: false } 
      },
      { 
        $set: { 
          isDeleted: false 
        } 
      }
    );

    console.log(`👤 Personas migradas: ${personasResult.modifiedCount} documentos actualizados`);

    // 3. Crear índices para mejorar performance
    console.log('📊 Creando índices para optimización...');

    // Índices para Users
    await usersCollection.createIndex({ isDeleted: 1 });
    await usersCollection.createIndex({ isDeleted: 1, deletedAt: 1 });
    console.log('✅ Índices creados para Users');

    // Índices para Personas
    await personasCollection.createIndex({ isDeleted: 1 });
    await personasCollection.createIndex({ isDeleted: 1, deletedAt: 1 });
    console.log('✅ Índices creados para Personas');

    // 4. Verificar migración
    const totalUsers = await usersCollection.countDocuments();
    const activeUsers = await usersCollection.countDocuments({ isDeleted: false });
    const deletedUsers = await usersCollection.countDocuments({ isDeleted: true });

    const totalPersonas = await personasCollection.countDocuments();
    const activePersonas = await personasCollection.countDocuments({ isDeleted: false });
    const deletedPersonas = await personasCollection.countDocuments({ isDeleted: true });

    console.log('🔍 Verificación de migración:');
    console.log(`   Users - Total: ${totalUsers}, Activos: ${activeUsers}, Eliminados: ${deletedUsers}`);
    console.log(`   Personas - Total: ${totalPersonas}, Activas: ${activePersonas}, Eliminadas: ${deletedPersonas}`);

    console.log('✅ Migración de Soft Delete completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Función para revertir migración (en caso de emergencia)
const revertMigration = async () => {
  try {
    await mongoose.connect(config.dbUri);
    console.log('🔗 Conectado a MongoDB para reversar migración');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const personasCollection = db.collection('personas');

    console.log('⚠️  Reversando migración de Soft Delete...');

    // Remover campos de soft delete (solo de documentos que no están eliminados)
    const usersResult = await usersCollection.updateMany(
      { isDeleted: false },
      { 
        $unset: { 
          isDeleted: 1,
          deletedAt: 1,
          deletedBy: 1,
          restoredAt: 1,
          restoredBy: 1
        } 
      }
    );

    const personasResult = await personasCollection.updateMany(
      { isDeleted: false },
      { 
        $unset: { 
          isDeleted: 1,
          deletedAt: 1,
          deletedBy: 1,
          restoredAt: 1,
          restoredBy: 1
        } 
      }
    );

    console.log(`👥 Users revertidos: ${usersResult.modifiedCount}`);
    console.log(`👤 Personas revertidas: ${personasResult.modifiedCount}`);
    console.log('⚠️  ADVERTENCIA: Los documentos con isDeleted: true NO fueron modificados');
    console.log('✅ Reversión completada');

  } catch (error) {
    console.error('❌ Error durante la reversión:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--revert')) {
  console.log('⚠️  MODO REVERSIÓN ACTIVADO');
  console.log('⚠️  Esto removerá los campos de soft delete de documentos activos');
  revertMigration();
} else {
  console.log('🚀 MODO MIGRACIÓN NORMAL');
  console.log('📝 Agregando campos de soft delete a documentos existentes');
  runMigration();
}

// Agregar información de uso
console.log(`
📚 INSTRUCCIONES DE USO:

🚀 Aplicar migración (normal):
   node migration/soft-delete-migration.js

⚠️  Revertir migración (emergencia):
   node migration/soft-delete-migration.js --revert

📝 NOTAS IMPORTANTES:
   - Este script debe ejecutarse UNA SOLA VEZ después de implementar soft delete
   - La reversión NO afecta documentos que están marcados como eliminados
   - Se recomienda hacer backup de la base de datos antes de ejecutar
   - Los índices mejoran significativamente el rendimiento de las consultas
`);

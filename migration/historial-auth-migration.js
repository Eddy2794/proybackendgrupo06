/**
 * Migración para agregar el campo historialAuth a usuarios existentes
 * y registrar su último acceso conocido
 */

import mongoose from 'mongoose';
import config from '../src/config/index.js';

async function migrateHistorialAuth() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(config.mongoUrl);
    console.log('✅ Conectado a MongoDB para migración de historial de autenticación');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Buscar usuarios que no tienen historialAuth
    const usersWithoutHistory = await usersCollection.find({ 
      historialAuth: { $exists: false } 
    }).toArray();

    console.log(`📊 Encontrados ${usersWithoutHistory.length} usuarios sin historial de autenticación`);

    let migratedCount = 0;

    for (const user of usersWithoutHistory) {
      const historialAuth = [];
      
      // Si el usuario tiene ultimoLogin, crear una entrada histórica
      if (user.ultimoLogin) {
        historialAuth.push({
          fechaLogin: user.ultimoLogin,
          exitoso: true,
          metodo: 'migration-historical',
          userAgent: 'Migración - Último acceso conocido',
          ip: '0.0.0.0'
        });
      }

      // Actualizar el usuario con el nuevo campo
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            historialAuth: historialAuth 
          } 
        }
      );

      migratedCount++;
      
      if (migratedCount % 10 === 0) {
        console.log(`📈 Migrados ${migratedCount}/${usersWithoutHistory.length} usuarios...`);
      }
    }

    console.log(`✅ Migración completada: ${migratedCount} usuarios actualizados`);
    
    // Verificar la migración
    const totalUsers = await usersCollection.countDocuments();
    const usersWithHistory = await usersCollection.countDocuments({ 
      historialAuth: { $exists: true } 
    });
    
    console.log(`📊 Estado final: ${usersWithHistory}/${totalUsers} usuarios con historial de autenticación`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar migración si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Iniciando migración de historial de autenticación...');
  migrateHistorialAuth()
    .then(() => {
      console.log('✅ Migración completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la migración:', error);
      process.exit(1);
    });
}

export default migrateHistorialAuth;

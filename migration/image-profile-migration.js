/**
 * Migración para agregar el campo imagenPerfil a usuarios existentes
 */

import mongoose from 'mongoose';
import User from '../src/modules/user/model/user.model.js';
import config from '../src/config/index.js';

const runImageProfileMigration = async () => {
  try {
    console.log('🔄 Iniciando migración para agregar campo imagenPerfil...');
    
    // Conectar a la base de datos
    await mongoose.connect(config.database.mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Buscar usuarios que no tienen el campo imagenPerfil
    const usersWithoutImage = await User.find({ 
      imagenPerfil: { $exists: false } 
    });

    console.log(`📊 Encontrados ${usersWithoutImage.length} usuarios sin campo imagenPerfil`);

    if (usersWithoutImage.length > 0) {
      // Actualizar usuarios para agregar el campo imagenPerfil como null
      const result = await User.updateMany(
        { imagenPerfil: { $exists: false } },
        { $set: { imagenPerfil: null } }
      );

      console.log(`✅ Actualizados ${result.modifiedCount} usuarios con imagenPerfil: null`);
    } else {
      console.log('ℹ️  Todos los usuarios ya tienen el campo imagenPerfil');
    }

    // Verificar que la migración fue exitosa
    const totalUsers = await User.countDocuments();
    const usersWithImageField = await User.countDocuments({ 
      imagenPerfil: { $exists: true } 
    });

    console.log(`📈 Resumen de migración:`);
    console.log(`   - Total de usuarios: ${totalUsers}`);
    console.log(`   - Usuarios con campo imagenPerfil: ${usersWithImageField}`);
    
    if (totalUsers === usersWithImageField) {
      console.log('🎉 Migración completada exitosamente');
    } else {
      console.log('⚠️  Algunos usuarios aún no tienen el campo imagenPerfil');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔐 Desconectado de MongoDB');
  }
};

// Ejecutar la migración si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runImageProfileMigration()
    .then(() => {
      console.log('✅ Proceso de migración finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falló la migración:', error);
      process.exit(1);
    });
}

export default runImageProfileMigration;

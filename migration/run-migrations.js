#!/usr/bin/env node

/**
 * Script para ejecutar todas las migraciones necesarias
 */

import migrateHistorialAuth from './historial-auth-migration.js';

async function runMigrations() {
  console.log('🔄 Ejecutando migraciones...\n');
  
  try {
    // Ejecutar migración de historial de autenticación
    console.log('1️⃣ Migración de historial de autenticación...');
    await migrateHistorialAuth();
    
    console.log('\n✅ Todas las migraciones completadas exitosamente');
  } catch (error) {
    console.error('\n❌ Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

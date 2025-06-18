#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const createEnvFile = () => {
  const envContent = `# Configuración del Proyecto Backend Grupo 06
PORT=3000
NODE_ENV=development

# Database configuration
DB_URI=mongodb://localhost:27017/proybackendgrupo06

# JWT configuration
JWT_SECRET=YourVerySecretKeyChangeThisInProduction

# Test Database (opcional)
MONGODB_TEST_URI=mongodb://localhost:27017/proybackendgrupo06_test

# Logging Level (error, warn, info, debug)
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  const envPath = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  El archivo .env ya existe. No se sobrescribirá.');
    console.log('💡 Revisa ejemplo.env para ver las variables necesarias.');
    return;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado exitosamente');
  console.log('🔧 Recuerda cambiar JWT_SECRET en producción');
};

createEnvFile();

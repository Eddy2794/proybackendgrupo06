import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = ['DB_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Función helper para obtener URL del frontend basada en el entorno
function getFrontendUrl() {
  // Si está definida explícitamente, usarla
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  
  // Si estamos en producción, usar URL de producción por defecto
  if (process.env.NODE_ENV === 'production') {
    return 'https://proyfrontendgrupo06.onrender.com';
  }
  
  // En desarrollo, usar localhost
  return 'http://localhost:4200';
}

// Función helper para obtener callback URL de Google basada en el entorno
function getGoogleCallbackUrl() {
  // Si está definida explícitamente, usarla
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL;
  }
  
  // Si estamos en producción, usar URL de producción por defecto
  if (process.env.NODE_ENV === 'production') {
    return 'https://trabajo-final-psw.onrender.com/api/auth/google/callback';
  }
  
  // En desarrollo, usar localhost
  return 'http://localhost:3000/api/auth/google/callback';
}

const config = {
  port: parseInt(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  dbUri: process.env.DB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES || '24h',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: getGoogleCallbackUrl(),
  // URL de la aplicación frontend Angular para redirecciones OAuth
  frontendUrl: getFrontendUrl(),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100 // límite de requests por ventana
  }
};

export default config;
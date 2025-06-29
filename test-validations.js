#!/usr/bin/env node

/**
 * Script de prueba rápida para verificar validaciones
 * Ejecutar: node test-validations.js
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';

// Función helper para hacer requests
const makeRequest = (path, data) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: jsonResponse
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Función para colorear la consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Tests de validación
const runTests = async () => {
  console.log('🧪 Iniciando pruebas de validación...\n');

  const tests = [
    {
      name: 'Username muy corto',
      path: '/api/auth/dev/register',
      data: { username: 'ab', password: '123456' },
      expectedStatus: 400,
      expectedType: 'validation'
    },
    {
      name: 'Password muy corta',
      path: '/api/auth/dev/register',
      data: { username: 'usuario123', password: '123' },
      expectedStatus: 400,
      expectedType: 'validation'
    },
    {
      name: 'Username con caracteres especiales',
      path: '/api/auth/dev/register',
      data: { username: 'user@123', password: '123456' },
      expectedStatus: 400,
      expectedType: 'validation'
    },
    {
      name: 'Registro exitoso',
      path: '/api/auth/dev/register',
      data: { username: 'testuser123', password: '123456' },
      expectedStatus: 201,
      expectedType: 'success'
    },
    {
      name: 'Username duplicado',
      path: '/api/auth/dev/register',
      data: { username: 'testuser123', password: '654321' },
      expectedStatus: 400,
      expectedType: 'business'
    }
  ];

  for (const test of tests) {
    try {
      log('blue', `📝 Probando: ${test.name}`);
      const response = await makeRequest(test.path, test.data);
      
      if (response.status === test.expectedStatus) {
        log('green', `   ✅ Status correcto: ${response.status}`);
        
        if (test.expectedType === 'validation' && response.data.errors) {
          log('green', `   ✅ Errores de validación presentes`);
          console.log(`   📋 Errores:`, response.data.errors.map(e => `${e.field}: ${e.message}`).join(', '));
        } else if (test.expectedType === 'business' && response.data.error) {
          log('green', `   ✅ Error de negocio: ${response.data.error}`);
        } else if (test.expectedType === 'success' && response.data.success) {
          log('green', `   ✅ Registro exitoso`);
        }
      } else {
        log('red', `   ❌ Status incorrecto. Esperado: ${test.expectedStatus}, Recibido: ${response.status}`);
        console.log('   📋 Respuesta:', JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      log('red', `   ❌ Error en request: ${error.message}`);
    }
    
    console.log(''); // Línea en blanco
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  log('yellow', '🎯 Pruebas completadas. Verifica que:');
  console.log('   - Los errores 400 muestren mensajes específicos');
  console.log('   - Los errores de validación incluyan el campo y descripción');
  console.log('   - Los registros exitosos devuelvan 201 con token');
  console.log('   - No se hayan creado registros huérfanos en la BD');
};

// Verificar que el servidor esté corriendo
const checkServer = async () => {
  try {
    const response = await makeRequest('/api/', {});
    if (response.status === 200) {
      log('green', '✅ Servidor funcionando correctamente');
      return true;
    } else {
      log('red', '❌ Servidor responde pero con error');
      return false;
    }
  } catch (error) {
    log('red', '❌ No se puede conectar al servidor. ¿Está ejecutándose en http://localhost:3000?');
    log('yellow', '💡 Ejecuta: npm run dev:simple');
    return false;
  }
};

// Ejecutar
const main = async () => {
  console.log('🚀 Verificador de Validaciones - Auth Dev API\n');
  
  const serverOk = await checkServer();
  if (serverOk) {
    console.log('');
    await runTests();
  }
};

main().catch(console.error);

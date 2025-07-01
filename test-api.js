const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Datos de prueba
const personaData = {
  nombres: 'Juan Carlos',
  apellidos: 'Pérez González',
  tipoDocumento: 'DNI',
  numeroDocumento: '12345678',
  fechaNacimiento: '1990-05-15',
  genero: 'MASCULINO',
  email: 'juan.perez@example.com',
  telefono: '+54 11 1234-5678',
  direccion: {
    calle: 'Av. Corrientes 1234',
    ciudad: 'Buenos Aires',
    departamento: 'Buenos Aires',
    codigoPostal: '1000',
    pais: 'Argentina'
  }
};

const userData = {
  username: 'juanperez',
  password: '123456',
  rol: 'USER',
  estado: 'ACTIVO',
  emailVerificado: true
};

async function testAPI() {
  try {
    console.log('🧪 Iniciando pruebas de API...');
    
    // 1. Crear persona
    console.log('\n1️⃣ Creando persona...');
    const personaResponse = await axios.post(`${API_BASE}/personas`, personaData);
    console.log('✅ Persona creada:', personaResponse.data.data._id);
    
    // 2. Crear usuario con la persona
    console.log('\n2️⃣ Creando usuario...');
    const userDataWithPersona = {
      ...userData,
      persona: personaResponse.data.data._id
    };
    
    const userResponse = await axios.post(`${API_BASE}/users`, userDataWithPersona);
    console.log('✅ Usuario creado:', userResponse.data.data._id);
    
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    
  } catch (error) {
    console.error('\n❌ Error en la prueba:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAPI();

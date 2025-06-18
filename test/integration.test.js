import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { connectTestDB, closeTestDB, clearTestDB } from './setup.js';

// Configurar environment para tests
process.env.NODE_ENV = 'test';

describe('Integration Tests - Persona + Usuario', () => {
  before(async () => {
    await connectTestDB();
  });

  after(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('User Registration with Persona', () => {
    it('should register a new user with persona data', async () => {
      const userData = {
        // Datos de Persona
        nombres: 'Juan Carlos',
        apellidos: 'García López',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        fechaNacimiento: '1990-05-15',
        genero: 'MASCULINO',
        telefono: '+51987654321',
        email: 'juan.garcia@test.com',
        direccion: {
          calle: 'Av. Principal 123',
          ciudad: 'Lima',
          departamento: 'Lima',
          pais: 'Perú'
        },
        
        // Datos de Usuario
        username: 'juangarcia',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(res.body).to.have.property('userId');
      expect(res.body).to.have.property('personaId');
      expect(res.body).to.have.property('username', 'juangarcia');
      expect(res.body).to.have.property('nombreCompleto', 'Juan Carlos García López');
    });

    it('should not register user with existing email', async () => {
      const userData = {
        nombres: 'Juan Carlos',
        apellidos: 'García López',
        numeroDocumento: '12345678',
        fechaNacimiento: '1990-05-15',
        genero: 'MASCULINO',
        email: 'juan.garcia@test.com',
        username: 'juangarcia',
        password: 'password123'
      };

      // Primer registro
      await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Segundo registro con mismo email
      const userData2 = {
        ...userData,
        numeroDocumento: '87654321',
        username: 'juangarcia2'
      };

      await request(app)
        .post('/api/users/register')
        .send(userData2)
        .expect(500); // Error porque el email ya existe
    });

    it('should not register user with existing username', async () => {
      const userData = {
        nombres: 'Juan Carlos',
        apellidos: 'García López',
        numeroDocumento: '12345678',
        fechaNacimiento: '1990-05-15',
        genero: 'MASCULINO',
        email: 'juan.garcia@test.com',
        username: 'juangarcia',
        password: 'password123'
      };

      // Primer registro
      await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Segundo registro con mismo username
      const userData2 = {
        ...userData,
        numeroDocumento: '87654321',
        email: 'juan.garcia2@test.com'
      };

      await request(app)
        .post('/api/users/register')
        .send(userData2)
        .expect(500); // Error porque el username ya existe
    });
  });

  describe('User Login', () => {
    let testUser;

    beforeEach(async () => {
      // Crear usuario de prueba
      const userData = {
        nombres: 'Test',
        apellidos: 'User',
        numeroDocumento: '12345678',
        fechaNacimiento: '1990-01-01',
        genero: 'MASCULINO',
        email: 'test@test.com',
        username: 'testuser',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(userData);

      testUser = res.body;
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('username', 'testuser');
    });    it('should not login with invalid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpass123' // Debe contener letra y número
      };

      await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(500);
    });
  });
  describe('Persona CRUD', () => {
    let authToken;

    beforeEach(async () => {
      // Crear y autenticar usuario
      const userData = {
        nombres: 'Admin',
        apellidos: 'User',
        numeroDocumento: '87654321',
        fechaNacimiento: '1985-01-01',
        genero: 'MASCULINO',
        email: 'admin@test.com',
        username: 'admin',
        password: 'admin123' // Debe contener letra y número
      };

      await request(app)
        .post('/api/users/register')
        .send(userData);

      const loginRes = await request(app)
        .post('/api/users/login')
        .send({ username: 'admin', password: 'admin123' });

      authToken = loginRes.body.token;
    });

    it('should create a new persona', async () => {
      const personaData = {
        nombres: 'María',
        apellidos: 'González',
        tipoDocumento: 'DNI',
        numeroDocumento: '11111111',
        fechaNacimiento: '1992-03-10',
        genero: 'FEMENINO',
        email: 'maria.gonzalez@test.com'
      };

      const res = await request(app)
        .post('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .send(personaData)
        .expect(201);

      expect(res.body).to.have.property('persona');
      expect(res.body.persona).to.have.property('nombreCompleto', 'María González');
    });

    it('should get all personas', async () => {
      const res = await request(app)
        .get('/api/personas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).to.have.property('personas');
      expect(res.body).to.have.property('pagination');
    });
  });
});

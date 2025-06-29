import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { connectTestDB, closeTestDB, clearTestDB } from './setup.js';

process.env.NODE_ENV = 'test';

describe('Auth API', () => {
  before(async () => {
    await connectTestDB();
  });

  after(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Registro', () => {
    it('debe registrar un usuario nuevo', async () => {
      const userData = {
        nombres: 'Juan',
        apellidos: 'Pérez',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        fechaNacimiento: '1990-01-01',
        genero: 'MASCULINO',
        email: 'juan.perez@test.com',
        username: 'juanperez',
        password: 'password123'
      };
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      expect(res.body).to.have.property('userId');
      expect(res.body).to.have.property('personaId');
      expect(res.body).to.have.property('username', 'juanperez');
      expect(res.body).to.have.property('nombreCompleto');
    });
    it('no debe registrar usuario con username repetido', async () => {
      const userData = {
        nombres: 'Juan',
        apellidos: 'Pérez',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        fechaNacimiento: '1990-01-01',
        genero: 'MASCULINO',
        email: 'juan.perez@test.com',
        username: 'juanperez',
        password: 'password123'
      };
      await request(app).post('/api/auth/register').send(userData).expect(201);
      await request(app).post('/api/auth/register').send({ ...userData, email: 'otro@test.com', numeroDocumento: '87654321' }).expect(500);
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      const userData = {
        nombres: 'Ana',
        apellidos: 'Gómez',
        tipoDocumento: 'DNI',
        numeroDocumento: '22222222',
        fechaNacimiento: '1992-02-02',
        genero: 'FEMENINO',
        email: 'ana.gomez@test.com',
        username: 'anagomez',
        password: 'password123'
      };
      await request(app).post('/api/auth/register').send(userData);
    });
    it('debe loguear con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'anagomez', password: 'password123' })
        .expect(200);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('username', 'anagomez');
    });
    it('no debe loguear con credenciales inválidas', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'anagomez', password: 'wrongpass' })
        .expect(500);
    });
  });
  describe('Cambio de contraseña', () => {
    let token;
    beforeEach(async () => {
      const userData = {
        nombres: 'Carlos',
        apellidos: 'Ruiz',
        tipoDocumento: 'DNI',
        numeroDocumento: '33333333',
        fechaNacimiento: '1993-03-03',
        genero: 'MASCULINO',
        email: 'carlos.ruiz@test.com',
        username: 'carlosruiz',
        password: 'password123'
      };
      await request(app).post('/api/auth/register').send(userData);
      const res = await request(app).post('/api/auth/login').send({ username: 'carlosruiz', password: 'password123' });
      token = res.body.token;
    });
    it('debe cambiar la contraseña correctamente', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'password123', newPassword: 'nuevaPass456', confirmPassword: 'nuevaPass456' })
        .expect(200);
    });
    it('no debe cambiar la contraseña si la actual es incorrecta', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'incorrecta', newPassword: 'nuevaPass456', confirmPassword: 'nuevaPass456' })
        .expect(500);
    });
  });

  describe('Logout', () => {
    let token;
    
    beforeEach(async () => {
      const userData = {
        nombres: 'María',
        apellidos: 'López',
        tipoDocumento: 'DNI',
        numeroDocumento: '44444444',
        fechaNacimiento: '1992-04-04',
        genero: 'FEMENINO',
        email: 'maria.lopez@test.com',
        username: 'marialopez',
        password: 'password123'
      };
      await request(app).post('/api/auth/register').send(userData);
      const res = await request(app).post('/api/auth/login').send({ username: 'marialopez', password: 'password123' });
      token = res.body.token;
    });

    it('debe hacer logout exitosamente con token válido', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message', 'Logout exitoso');
    });

    it('debe invalidar el token después del logout', async () => {
      // Hacer logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Intentar usar el token invalidado
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'password123', newPassword: 'nuevaPass456', confirmPassword: 'nuevaPass456' })
        .expect(401);
    });

    it('debe fallar logout sin token de autorización', async () => {
      await request(app)
        .post('/api/auth/logout')
        .expect(401);
    });

    it('debe fallar logout con token inválido', async () => {
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('debe permitir logout múltiple (idempotente)', async () => {
      // Primer logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Segundo logout con el mismo token (debería ser exitoso pero sin efecto)
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(401); // El token ya está en la lista negra
    });
  });
});

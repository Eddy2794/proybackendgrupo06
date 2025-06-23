/**
 * Pruebas para verificar el comportamiento de transacciones en registro
 * Estas pruebas verifican que no se creen registros huérfanos cuando fallan las validaciones
 */

import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import mongoose from 'mongoose';
import Persona from '../src/modules/persona/model/persona.model.js';
import User from '../src/modules/user/model/user.model.js';

describe('🔒 Pruebas de Transacciones - Registro de Usuario', () => {
  before(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    // Limpiar las colecciones antes de cada prueba
    await User.deleteMany({});
    await Persona.deleteMany({});
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/dev/register - Control de Transacciones', () => {
    
    it('✅ Debe crear PERSONA y USUARIO cuando todos los datos son válidos', async () => {
      const userData = {
        username: 'usuario123',
        password: '123456',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        email: 'juan@example.com'
      };

      const response = await request(app)
        .post('/api/auth/dev/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.data.username).to.equal('usuario123');

      // Verificar que SE CREARON ambos registros
      const personaCount = await Persona.countDocuments();
      const userCount = await User.countDocuments();
      
      expect(personaCount).to.equal(1);
      expect(userCount).to.equal(1);
    });

    it('❌ NO debe crear PERSONA ni USUARIO cuando username es muy corto', async () => {
      const userData = {
        username: 'ab', // ¡MUY CORTO! (mínimo 3)
        password: '123456',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        email: 'juan@example.com'
      };

      const response = await request(app)
        .post('/api/auth/dev/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.include('username');

      // Verificar que NO SE CREÓ ningún registro
      const personaCount = await Persona.countDocuments();
      const userCount = await User.countDocuments();
      
      expect(personaCount).to.equal(0);
      expect(userCount).to.equal(0);
    });

    it('❌ NO debe crear PERSONA ni USUARIO cuando password es muy corta', async () => {
      const userData = {
        username: 'usuario123',
        password: '123', // ¡MUY CORTA! (mínimo 6)
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        email: 'juan@example.com'
      };

      const response = await request(app)
        .post('/api/auth/dev/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.include('password');

      // Verificar que NO SE CREÓ ningún registro
      const personaCount = await Persona.countDocuments();
      const userCount = await User.countDocuments();
      
      expect(personaCount).to.equal(0);
      expect(userCount).to.equal(0);
    });

    it('❌ NO debe crear PERSONA ni USUARIO cuando email ya existe', async () => {
      // Primero crear un usuario exitoso
      const firstUser = {
        username: 'usuario123',
        password: '123456',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        email: 'juan@example.com'
      };

      await request(app)
        .post('/api/auth/dev/register')
        .send(firstUser)
        .expect(201);

      // Intentar crear otro usuario con el mismo email
      const duplicateEmailUser = {
        username: 'usuario456',
        password: '123456',
        nombres: 'María',
        apellidos: 'González',
        email: 'juan@example.com' // ¡EMAIL DUPLICADO!
      };

      const response = await request(app)
        .post('/api/auth/dev/register')
        .send(duplicateEmailUser)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.include('email');

      // Verificar que solo hay 1 persona y 1 usuario (el primero)
      const personaCount = await Persona.countDocuments();
      const userCount = await User.countDocuments();
      
      expect(personaCount).to.equal(1);
      expect(userCount).to.equal(1);

      // Verificar que el primer usuario sigue siendo válido
      const existingUser = await User.findOne({ username: 'usuario123' });
      expect(existingUser).to.not.be.null;
    });

    it('❌ NO debe crear PERSONA ni USUARIO cuando username ya existe', async () => {
      // Primero crear un usuario exitoso
      const firstUser = {
        username: 'usuario123',
        password: '123456',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        email: 'juan@example.com'
      };

      await request(app)
        .post('/api/auth/dev/register')
        .send(firstUser)
        .expect(201);

      // Intentar crear otro usuario con el mismo username
      const duplicateUsernameUser = {
        username: 'usuario123', // ¡USERNAME DUPLICADO!
        password: '123456',
        nombres: 'María',
        apellidos: 'González',
        email: 'maria@example.com'
      };

      const response = await request(app)
        .post('/api/auth/dev/register')
        .send(duplicateUsernameUser)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.include('usuario ya existe');

      // Verificar que solo hay 1 persona y 1 usuario (el primero)
      const personaCount = await Persona.countDocuments();
      const userCount = await User.countDocuments();
      
      expect(personaCount).to.equal(1);
      expect(userCount).to.equal(1);
    });

    it('❌ NO debe crear PERSONA ni USUARIO cuando persona es menor de edad', async () => {
      const userData = {
        username: 'usuario123',
        password: '123456',
        nombres: 'Niño',
        apellidos: 'Menor',
        email: 'nino@example.com',
        fechaNacimiento: new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000) // 10 años
      };

      const response = await request(app)
        .post('/api/auth/dev/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).to.be.false;
      expect(response.body.error).to.include('mayor de 13 años');

      // Verificar que NO SE CREÓ ningún registro
      const personaCount = await Persona.countDocuments();
      const userCount = await User.countDocuments();
      
      expect(personaCount).to.equal(0);
      expect(userCount).to.equal(0);
    });

    it('✅ Debe manejar registro con datos mínimos (solo username y password)', async () => {
      const userData = {
        username: 'usuariomin',
        password: '123456'
        // Sin datos adicionales
      };

      const response = await request(app)
        .post('/api/auth/dev/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).to.be.true;
      expect(response.body.data.username).to.equal('usuariomin');

      // Verificar que SE CREARON ambos registros
      const personaCount = await Persona.countDocuments();
      const userCount = await User.countDocuments();
      
      expect(personaCount).to.equal(1);
      expect(userCount).to.equal(1);

      // Verificar que se usaron datos por defecto para persona
      const persona = await Persona.findOne();
      expect(persona.nombres).to.equal('Usuario');
      expect(persona.apellidos).to.equal('Desarrollo');
    });
  });
});

import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import mongoose from 'mongoose';

describe('API Tests', function() {
  let server;
  
  before(async function() {
    this.timeout(10000);
    // Conectar a base de datos de prueba
    process.env.DB_URI = 'mongodb://localhost:27017/proybackendgrupo06_test';
    await connectDB();
  });

  after(async function() {
    // Limpiar y cerrar conexión
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('User Registration', function() {
    it('should register a new user', async function() {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).to.have.property('userId');
    });

    it('should not register user with invalid email', async function() {
      const userData = {
        username: 'testuser2',
        email: 'invalid-email',
        password: 'password123'
      };

      await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
    });
  });

  describe('User Login', function() {
    it('should login with valid credentials', async function() {
      // Primero registrar usuario
      const userData = {
        username: 'logintest',
        email: 'login@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users')
        .send(userData);

      // Luego hacer login
      const loginData = {
        username: 'logintest',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body).to.have.property('token');
    });
  });
});

import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { connectTestDB, closeTestDB, clearTestDB } from './setup.js';

// Configurar environment para tests
process.env.NODE_ENV = 'test';

describe('API Tests', () => {
  before(async () => {
    await connectTestDB();
  });

  after(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Health Check', () => {
    it('should respond with 404 for root path', async () => {
      const res = await request(app)
        .get('/')
        .expect(404);
    });
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(res.body).to.have.property('userId');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({})
        .expect(400);

      expect(res.body).to.have.property('errors');
    });
  });

  describe('User Login', () => {
    it('should validate login fields', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({})
        .expect(400);

      expect(res.body).to.have.property('errors');
    });
  });
});

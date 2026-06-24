import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dbConnection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dbConnection = moduleFixture.get(getConnectionToken());
  });

  afterAll(async () => {
    await dbConnection.dropDatabase();
    await dbConnection.close();
    await app.close();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and return a JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'e2e-test@test.com',
          password: 'Password123',
          name: 'E2E Tester',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should return 409 Conflict if email already exists', async () => {
      await request(app.getHttpServer()).post('/auth/signup').send({
        email: 'duplicate@test.com',
        password: 'Password123',
        name: 'Duplicate',
      });

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'duplicate@test.com',
          password: 'Password123',
          name: 'Duplicate',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login an existing user and return a JWT token', async () => {
      await request(app.getHttpServer()).post('/auth/signup').send({
        email: 'login-test@test.com',
        password: 'Password123',
        name: 'Login Tester',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@test.com',
          password: 'Password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
    });

    it('should return 401 Unauthorized for invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });
});

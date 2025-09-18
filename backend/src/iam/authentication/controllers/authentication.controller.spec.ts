import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { AuthenticationController } from './authentication.controller';
import { User, UserSchema } from 'src/user/user.schema';
import { SignUpHandler } from '../handlers/sign-up.handler';
import { SignInHandler } from '../handlers/sign-in.handler';
import { RefreshTokensHandler } from '../handlers/refresh-tokens.handler';
import { HashingService } from '../services/hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/iam/config/jwt.config';
import { TokenService } from '../services/token/token.service';
import { setupApp } from 'src/setup-app';
import request from 'supertest';

describe('AuthenticationController (integration, e2e)', () => {
  let app: INestApplication;
  let userModel: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/nest-chat-test'),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      controllers: [AuthenticationController],
      providers: [
        SignUpHandler,
        SignInHandler,
        RefreshTokensHandler,
        HashingService,
        TokenService,
        JwtService,
        { provide: jwtConfig.KEY, useValue: {
          secret: 'test-secret',
          audience: 'test-audience',
          issuer: 'test-issuer',
          accessTokenTtl: 3600,
          refreshTokenTtl: 86400,
        } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await setupApp(app);
    await app.init();

    userModel = moduleFixture.get(getModelToken(User.name));
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await app.close();
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  describe('POST /authentication/sign-up', () => {
    it('should sign up a user', async () => {
      const userDto = { name: 'Test User', email: 'test@example.com', password: 'testpass' };
      const res = await request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send(userDto);
      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('email', userDto.email);
      expect(res.body.user).toHaveProperty('name', userDto.name);
    });

    it('should not sign up with already existing email', async () => {
    const userDto = { name: 'Test User', email: 'test@example.com', password: 'testpass' };
    await userModel.create(userDto);
    const res = await request(app.getHttpServer())
      .post('/authentication/sign-up')
      .send(userDto);
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('message', 'Email already exists');
    });
  });


  describe('POST /authentication/sign-in', () => {
    it('should sign in with valid credentials', async () => {
      const hashingService = app.get(HashingService);
      const hashedPassword = await hashingService.hash('testpass');
      await userModel.create({ name: 'Test User', email: 'test@example.com', password: hashedPassword });
      const res = await request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send({ email: 'test@example.com', password: 'testpass' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should not sign in with wrong credentials', async () => {
      const hashingService = app.get(HashingService);
      const hashedPassword = await hashingService.hash('testpass');
      await userModel.create({ name: 'Test User', email: 'test@example.com', password: hashedPassword });
      const res = await request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send({ email: 'test@example.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /authentication/refresh-token', () => {
    it('should refresh tokens', async () => {
      const hashingService = app.get(HashingService);
      const hashedPassword = await hashingService.hash('testpass');
      await userModel.create({ name: 'Test User', email: 'test@example.com', password: hashedPassword });
      const signInRes = await request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send({ email: 'test@example.com', password: 'testpass' });
      const refreshToken = signInRes.body.refreshToken;
      const res = await request(app.getHttpServer())
        .post('/authentication/refresh-token')
        .send({ refreshToken });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should not refresh for invalid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/authentication/refresh-token')
        .send({ refreshToken: 'invalidToken' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });
});
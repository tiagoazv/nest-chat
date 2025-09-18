import { Test, TestingModule } from '@nestjs/testing';
import { regularUser } from '../../../test/mocks/user.mock';
import { INestApplication } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { GetMessageHandler } from '../handlers/get-message.handler';
import { GetLastMessageHandler } from '../handlers/get-last-message.handler';
import { SendMessageHandler } from '../handlers/send-message.handler';
import { Message, MessageSchema } from '../message.schema';
import { setupApp } from 'src/setup-app';
import { AuthTestMiddleware } from '../../../test/utils/auth-test.middleware';
import request from 'supertest';
import { NatsProvider } from 'src/broker/broker-server';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from 'src/iam/authentication/guards/authentication.guard';
import { AccessTokenGuard } from 'src/iam/authentication/guards/access-token.guard';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/iam/config/jwt.config';

const mockUserId = regularUser._id;
const mockOtherUserId = 'other-user-id';

function withUserHeader(req, userId = mockUserId) {
  return req.set('user', JSON.stringify({ sub: userId }));
}

describe('ChatController (e2e)', () => {
  let app: INestApplication;
  let messageModel: any;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/nest-chat-test'),
        MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
      ],
      controllers: [ChatController],
      providers: [
        GetMessageHandler,
        GetLastMessageHandler,
        SendMessageHandler,
        {
          provide: NatsProvider,
          useValue: {
            publish: jest.fn(),
            subscribe: jest.fn(),
            onModuleInit: jest.fn(),
            onModuleDestroy: jest.fn(),
          },
        },
        JwtService,
        AccessTokenGuard,
        {
          provide: jwtConfig.KEY,
          useValue: {
            secret: 'test-secret',
            audience: 'test-audience',
            issuer: 'test-issuer',
            accessTokenTtl: 3600,
            refreshTokenTtl: 86400,
          },
        },
        {
          provide: APP_GUARD,
          useClass: AuthenticationGuard,
        },
      ],
    }).compile();

  app = moduleFixture.createNestApplication();
  await setupApp(app);
  app.use(new AuthTestMiddleware().use);
  await app.init();
    messageModel = moduleFixture.get(getModelToken(Message.name));
    const jwtService = app.get(require('@nestjs/jwt').JwtService);
    jwtToken = jwtService.sign(
      {
        sub: regularUser._id,
        email: regularUser.email,
        role: regularUser.role,
      },
      { secret: 'test-secret', audience: 'test-audience', issuer: 'test-issuer' }
    );
  });

  afterAll(async () => {
    await messageModel.deleteMany({});
    await app.close();
  });

  beforeEach(async () => {
    await messageModel.deleteMany({});
  });

  describe('POST /chat/messages', () => {
  it('should send a message', async () => {
    const dto = { from: regularUser._id, to: mockOtherUserId, content: 'Hello!' };
    const res = await request(app.getHttpServer())
      .post('/chat/messages')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(dto);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('from', regularUser._id);
    expect(res.body).toHaveProperty('to', mockOtherUserId);
    expect(res.body).toHaveProperty('content', 'Hello!');
  });

  it('should not send message without authentication', async () => {
    const dto = { from: regularUser._id, to: mockOtherUserId, content: 'Hello!' };
    const res = await request(app.getHttpServer())
      .post('/chat/messages')
      .send(dto);
    expect(res.status).toBe(401);
  });
  });

  describe('GET /chat/messages/:userId', () => {
    it('should get messages between users', async () => {
      await messageModel.create({ from: regularUser._id, to: mockOtherUserId, content: 'Hi!' });
      await messageModel.create({ from: mockOtherUserId, to: regularUser._id, content: 'Hey!' });
      const res = await request(app.getHttpServer())
        .get(`/chat/messages/${mockOtherUserId}`)
        .set('Authorization', `Bearer ${jwtToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('should not get messages without authentication', async () => {
      const res = await request(app.getHttpServer()).get(`/chat/messages/${mockOtherUserId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /chat/messages/last/:userId', () => {
    it('should get last message with user', async () => {
      await messageModel.create({ from: regularUser._id, to: mockOtherUserId, content: 'First' });
      await messageModel.create({ from: mockOtherUserId, to: regularUser._id, content: 'Second' });
      const res = await request(app.getHttpServer())
        .get(`/chat/messages/last/${mockOtherUserId}`)
        .set('Authorization', `Bearer ${jwtToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('content', 'Second');
    });
    
    it('should not get last message without authentication', async () => {
      const res = await request(app.getHttpServer()).get(`/chat/messages/last/${mockOtherUserId}`);
      expect(res.status).toBe(401);
    });
  });
});
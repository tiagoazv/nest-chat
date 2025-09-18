import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { User, UserSchema } from '../user.schema';
import { GetUsersHandler } from '../handlers/get-users.handler';
import { DeleteUsersHandler } from '../handlers/delete-users.handler';
import { setupApp } from '../../setup-app';
import { AuthTestMiddleware } from '../../../test/utils/auth-test.middleware';
import { RolesGuard } from '../../iam/authorization/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { adminUser, regularUser } from '../../../test/mocks/user.mock';
import request from 'supertest';


describe('UserController (integration, e2e style)', () => {
  let app: INestApplication;
  let userModel: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/nest-chat-test'),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      controllers: [UserController],
      providers: [
        GetUsersHandler,
        DeleteUsersHandler,
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await setupApp(app);
    app.use(new AuthTestMiddleware().use);
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

  it('should get users (GET /user)', async () => {
    await userModel.create({ name: 'Test User', email: 'test@example.com', password: 'testpass' });
    const res = await request(app.getHttpServer())
      .get('/user')
      .set('user', JSON.stringify(adminUser));
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toBe('Test User');
  });

  it('should only allow admin to delete users (DELETE /user)', async () => {
    await userModel.create({ name: 'ToDelete', email: 'delete@example.com', password: 'testpass' });

    const resNonAdmin = await request(app.getHttpServer())
      .delete('/user')
      .set('user', JSON.stringify(regularUser));
    expect(resNonAdmin.status).toBe(403);

    const resAdmin = await request(app.getHttpServer())
      .delete('/user')
      .set('user', JSON.stringify(adminUser));
    expect(resAdmin.status).toBe(200);

    const users = await userModel.find().exec();
    expect(users.length).toBe(0);
  });
});

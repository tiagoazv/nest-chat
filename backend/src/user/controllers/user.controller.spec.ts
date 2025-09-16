import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { GetUsersHandler } from '../handlers/get-users.handler';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../user.schema';
import { DeleteUsersHandler } from '../handlers/delete-users.handler';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        GetUsersHandler,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
        DeleteUsersHandler,
        {
          provide: getModelToken(User.name),
          useValue: {
            deleteMany: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

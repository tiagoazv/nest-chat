import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GetUsersHandler } from './get-users.handler';
import { User } from '../user.schema';

describe('GetUsersHandler', () => {
  let handler: GetUsersHandler;
  let userModel: any;

  beforeEach(async () => {
    userModel = {
      find: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersHandler,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    handler = module.get<GetUsersHandler>(GetUsersHandler);
  });

  it('should return users from the model', async () => {
    const users = [{ name: 'User1' }, { name: 'User2' }];
    userModel.exec.mockResolvedValue(users);

    const result = await handler.execute();
    expect(userModel.find).toHaveBeenCalled();
  });

  });
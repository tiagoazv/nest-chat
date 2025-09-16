import { getModelToken } from '@nestjs/mongoose';
import { User } from '../user.schema';
import { DeleteUsersHandler } from './delete-users.handler';
import { Test, TestingModule } from '@nestjs/testing';


describe('DeleteUsersHandler', () => {
  let handler: DeleteUsersHandler;
  let userModel: any;

  beforeEach(async () => {
    userModel = {
      deleteMany: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
        providers: [
            DeleteUsersHandler,
            {
              provide: getModelToken(User.name),
              useValue: userModel,
            },
        ],
    }).compile();

    handler = module.get<DeleteUsersHandler>(DeleteUsersHandler);
  });

  it('delete all users from the model', async () => {
    await handler.execute();
    expect(userModel.deleteMany).toHaveBeenCalled();
  });

  it('should handle model errors', async () => {
    userModel.deleteMany = jest.fn().mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    await expect(handler.execute()).rejects.toThrow('Database error');
  });
});
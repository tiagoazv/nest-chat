import { Test, TestingModule } from '@nestjs/testing';
import { SignInHandler } from './sign-in.handler';
import { HashingService } from '../services/hashing/hashing.service';
import { TokenService } from '../services/token/token.service';
import { User } from 'src/user/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnauthorizedException } from '@nestjs/common';
import { SignInDto } from '../dto/sign-in.dto';

const mockHashingService = {
  compare: jest.fn(),
};

const mockTokenService = {
  generateTokens: jest.fn(),
};

describe('SignInHandler', () => {
  let handler: SignInHandler;
  let userModel: Model<User>;
  let hashingService: HashingService;
  let tokenService: TokenService;

    beforeEach(async () => {
        userModel = {
            findOne: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SignInHandler,
                {
                    provide: getModelToken(User.name),
                    useValue: userModel,
                },
                {
                    provide: HashingService,
                    useValue: mockHashingService,
                },
                {
                    provide: TokenService,
                    useValue: mockTokenService,
                },
            ],
        }).compile();

        handler = module.get<SignInHandler>(SignInHandler);
        hashingService = module.get<HashingService>(HashingService);
        tokenService = module.get<TokenService>(TokenService);
    });


    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
        (userModel.findOne as jest.Mock).mockResolvedValue(null);
        const signInDto: SignInDto = { email: 'test@example.com', password: 'password' };

        await expect(handler.execute(signInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
        const mockUser = { email: 'test@example.com', password: 'hashedPassword' };
        (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
        (hashingService.compare as jest.Mock).mockResolvedValue(false);
        const signInDto: SignInDto = { email: 'test@example.com', password: 'password' };

        await expect(handler.execute(signInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return user and tokens on successful sign-in', async () => {
        const mockUser = { 
          _id: 'userId', 
          email: 'test@example.com', 
          password: 'hashedPassword' 
        };
        (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
        (hashingService.compare as jest.Mock).mockResolvedValue(true);
        (tokenService.generateTokens as jest.Mock).mockReturnValue({ accessToken: 'accessToken', refreshToken: 'refreshToken' });
        const signInDto: SignInDto = { email: 'test@example.com', password: 'password' };

        const result = await handler.execute(signInDto);

        expect(result).toEqual({
          user: { ...mockUser, password: undefined },
          token: 'accessToken',
          refreshToken: 'refreshToken',
        });
    });

});

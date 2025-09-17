import { SignInHandler } from './sign-in.handler';
import { HashingService } from '../services/hashing/hashing.service';
import { TokenService } from '../services/token/token.service';
import { UnauthorizedException } from '@nestjs/common';
import { SignInDto } from '../dto/sign-in.dto';

describe('SignInHandler', () => {
  let handler: SignInHandler;
  let userModel: any;
  let hashingService: HashingService;
  let tokenService: TokenService;

  beforeEach(() => {
      userModel = {
          findOne: jest.fn(),
      };
      hashingService = { compare: jest.fn() } as any;
      tokenService = { generateTokens: jest.fn() } as any;
      handler = new SignInHandler(userModel, hashingService, tokenService);
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

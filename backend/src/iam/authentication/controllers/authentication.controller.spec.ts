import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { SignUpHandler } from '../handlers/sign-up.handler';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/user/user.schema';
import { SignInHandler } from '../handlers/sign-in.handler';
import { RefreshTokensHandler } from '../handlers/refresh-tokens.handler';
import { HashingService } from '../services/hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/iam/config/jwt.config';
import { TokenService } from '../services/token/token.service';

const mockJwtConfig = {
  secret: 'test-secret',
  audience: 'test-audience',
  issuer: 'test-issuer',
  accessTokenTtl: 3600,
  refreshTokenTtl: 86400,
};

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        SignUpHandler,
        {
          provide: getModelToken(User.name),
          useValue: {
            execute: jest.fn(),
          },
        },
        SignInHandler,
        {
          provide: getModelToken(User.name),
          useValue: {
            execute: jest.fn(),
          },
        },
        RefreshTokensHandler,
        {
          provide: getModelToken(User.name),
          useValue: {
            execute: jest.fn(),
          },
        },
        HashingService,
        {
          provide: getModelToken(User.name),
          useValue: {
            compare: jest.fn(),
          },
        },
        TokenService,
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
          },
        },
        JwtService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        { provide: jwtConfig.KEY, useValue: mockJwtConfig },
      ],

    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
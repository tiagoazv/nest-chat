import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/iam/config/jwt.config';

const mockJwtConfig = {
  secret: 'test-secret',
  audience: 'test-audience',
  issuer: 'test-issuer',
  accessTokenTtl: 3600,
  refreshTokenTtl: 86400,
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('signed-token'),
};

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'jwtConfig', useValue: mockJwtConfig },
        { provide: jwtConfig.KEY, useValue: mockJwtConfig },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sign a token', async () => {
    const token = await service.signToken('userId', 3600, { foo: 'bar' });
    expect(token).toBe('signed-token');
    expect(mockJwtService.signAsync).toHaveBeenCalledWith(
      { sub: 'userId', foo: 'bar' },
      expect.objectContaining({ secret: mockJwtConfig.secret, expiresIn: 3600 })
    );
  });

  it('should generate tokens and store refreshTokenId', async () => {
    const user = { id: 'userId', email: 'test@test.com', role: 'admin'};
    const result = await service.generateTokens(user);
    expect(result).toHaveProperty('accessToken', 'signed-token');
    expect(result).toHaveProperty('refreshToken', 'signed-token');
  });

  it('should insert, validate, and invalidate refreshTokenId', async () => {
    await service.insertRefreshTokenId('userId', 'refreshId');
    expect(await service.validateRefreshTokenId('userId', 'refreshId')).toBe(true);
    await service.invalidateRefreshTokenId('userId');
    expect(await service.validateRefreshTokenId('userId', 'refreshId')).toBe(false);
  });
});
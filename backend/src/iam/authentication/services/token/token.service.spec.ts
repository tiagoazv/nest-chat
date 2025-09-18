import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import jwtConfig from 'src/iam/config/jwt.config';

describe('TokenService (integration)', () => {
  let app: INestApplication;
  let tokenService: TokenService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        JwtService,
        { provide: jwtConfig.KEY, useValue: {
          secret: 'test-secret',
          audience: 'test-audience',
          issuer: 'test-issuer',
          accessTokenTtl: 3600,
          refreshTokenTtl: 86400,
        }},
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    tokenService = app.get(TokenService);
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should generate and validate tokens', async () => {
    const user = { id: 'userId', email: 'test@test.com', role: 'admin' };
    const { accessToken, refreshToken } = await tokenService.generateTokens(user);

    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');

    const decoded = jwtService.verify(accessToken, { secret: 'test-secret' });
    expect(decoded.email).toBe(user.email);
    expect(decoded.role).toBe(user.role);
    expect(decoded.sub).toBe(user.id);
  });

  it('should insert, validate, and invalidate refreshTokenId', async () => {
    const userId = 'userId';
    const refreshId = 'refreshId';
    await tokenService.insertRefreshTokenId(userId, refreshId);
    expect(await tokenService.validateRefreshTokenId(userId, refreshId)).toBe(true);
    await tokenService.invalidateRefreshTokenId(userId);
    expect(await tokenService.validateRefreshTokenId(userId, refreshId)).toBe(false);
  });

  it('should generate different tokens for different users', async () => {
    const user1 = { id: 'user1', email: 'a@a.com', role: 'admin' };
    const user2 = { id: 'user2', email: 'b@b.com', role: 'regular' };
    const tokens1 = await tokenService.generateTokens(user1);
    const tokens2 = await tokenService.generateTokens(user2);
    expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
    expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
  });

  it('should throw if token is invalid', async () => {
    expect(() => jwtService.verify('invalid.token', { secret: 'test-secret' })).toThrow();
  });
});

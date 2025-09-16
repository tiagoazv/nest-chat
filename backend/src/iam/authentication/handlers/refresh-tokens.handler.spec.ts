import { UnauthorizedException } from "@nestjs/common";
import { RefreshTokensHandler } from "./refresh-tokens.handler";
import { Test, TestingModule } from "@nestjs/testing";
import { TokenService } from "../services/token/token.service";
import { JwtService } from "@nestjs/jwt";
import jwtConfig from "src/iam/config/jwt.config";

describe('RefreshTokensHandler', () => {
    let handler: RefreshTokensHandler;
    let tokenService: TokenService;
    let jwtService: JwtService;
    let jwtConfiguration: typeof jwtConfig;
    

    beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        providers: [
        RefreshTokensHandler,
        {
            provide: TokenService,
            useValue: {
            validateRefreshTokenId: jest.fn(),
            invalidateRefreshTokenId: jest.fn(),
            },
        },
        {
            provide: JwtService,
            useValue: {
            verifyAsync: jest.fn(),
            sign: jest.fn(),
            },
        },
        {
            provide: jwtConfig.KEY,
            useValue: {
            secret: 'test_secret',
            audience: 'test_audience',
            issuer: 'test_issuer',
            },
        },
        ],
    }).compile();
    
    handler = module.get<RefreshTokensHandler>(RefreshTokensHandler);
    tokenService = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    jwtConfiguration = module.get(jwtConfig.KEY);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    }
    );

    it('should refresh tokens successfully', async () => {
        const refreshTokenDto = { refreshToken: 'test_refresh_token' };
        (tokenService.validateRefreshTokenId as jest.Mock).mockResolvedValue(true);
        (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user_id' });
        (jwtService.sign as jest.Mock).mockReturnValue('new_access_token');

        const result = await handler.execute(refreshTokenDto);

        expect(result).toEqual({
            success: true,
        }); 
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
        const refreshTokenDto = { refreshToken: 'invalid_refresh_token' };
        (tokenService.validateRefreshTokenId as jest.Mock).mockResolvedValue(false);

        await expect(handler.execute(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
});
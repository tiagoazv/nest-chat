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

    beforeEach(() => {
        tokenService = {
            validateRefreshTokenId: jest.fn(),
            invalidateRefreshTokenId: jest.fn(),
        } as any;
        jwtService = {
            verifyAsync: jest.fn(),
            sign: jest.fn(),
        } as any;
        handler = new RefreshTokensHandler(
            tokenService,
            jwtService,
            { secret: 'test_secret', audience: 'test_audience', issuer: 'test_issuer' } as any
        );
    });


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
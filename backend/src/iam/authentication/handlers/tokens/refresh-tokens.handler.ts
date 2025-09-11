import { RefreshTokenDto } from "src/iam/authentication/dto/refresh-token.dto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenService } from "src/iam/authentication/services/token/token.service";
import { User } from "src/user/user.schema";
import jwtConfig from "src/iam/config/jwt.config";
import { Inject } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";

@Injectable()
export class RefreshTokensHandler {
  constructor(
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  @Inject(jwtConfig.KEY)
  private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async execute(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        { sub: string; refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = { id: sub } as User;
      const isValid = await this.tokenService.validateRefreshTokenId(
        user.id,
        refreshTokenId,
      );
      if (isValid) {
        await this.tokenService.invalidateRefreshTokenId(user.id);
      } else {
        throw new Error('Refresh token is invalid');
      }
      return { success: true };
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
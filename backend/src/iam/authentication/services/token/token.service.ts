import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { randomUUID } from 'crypto';
import jwtConfig from 'src/iam/config/jwt.config';

@Injectable()
export class TokenService {
	private refreshTokenIds = new Map<string, string>();

	constructor(
		private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY)
		private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
	) {}
	async generateTokens(user: any) {
		const refreshTokenId = randomUUID();
		const [accessToken, refreshToken] = await Promise.all([
			this.signToken(
				user.id,
				this.jwtConfiguration.accessTokenTtl,
				{
					email: user.email,
					role: user.role,
					permissions: user.permissions,
				},
			),
			this.signToken(
				user.id,
				this.jwtConfiguration.refreshTokenTtl,
				{ refreshTokenId },
			),
		]);
		await this.insertRefreshTokenId(user.id, refreshTokenId);
		return {
			accessToken,
			refreshToken,
		};
	}

	async signToken<T extends object>(
		userId: string,
		expiresIn: number,
		payload: T,
	): Promise<string> {
		return this.jwtService.signAsync(
			{
				sub: userId,
				...payload,
			},
			{
				secret: this.jwtConfiguration.secret,
				expiresIn,
				audience: this.jwtConfiguration.audience,
				issuer: this.jwtConfiguration.issuer,
			},
		);
	}

	async insertRefreshTokenId(userId: string, refreshTokenId: string) {
		this.refreshTokenIds.set(userId, refreshTokenId);
	}

	async validateRefreshTokenId(userId: string, refreshTokenId: string): Promise<boolean> {
		return this.refreshTokenIds.get(userId) === refreshTokenId;
	}

	async invalidateRefreshTokenId(userId: string) {
		this.refreshTokenIds.delete(userId);
	}
}

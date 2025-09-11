import { Injectable } from "@nestjs/common";
import { TokenService } from "src/iam/authentication/services/token/token.service";

@Injectable()
export class SignTokensHandler {
  constructor(private readonly tokenService: TokenService) {}

  async execute<T extends object>(userId: string, expiresIn: number, payload?: T) {
    const safePayload = (payload && typeof payload === 'object') ? payload : {};
    return this.tokenService.signToken(userId, expiresIn, safePayload);
  }
}
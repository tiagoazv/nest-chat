import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { User } from "src/user/user.schema";
import { TokenService } from "src/iam/authentication/services/token/token.service";

@Injectable()
export class GenerateTokensHandler {
    constructor(
      private readonly tokenService: TokenService,
    ) {}
    
    async execute(user: User) {
  return this.tokenService.generateTokens(user);
  }
}
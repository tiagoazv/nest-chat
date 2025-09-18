import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { SignInDto } from '../dto/sign-in.dto';
import { SignUpDto } from '../dto/sign-up.dto';
import { Auth } from '../../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SignUpHandler } from '../handlers/sign-up.handler';
import { SignInHandler } from '../handlers/sign-in.handler';
import { RefreshTokensHandler } from '../handlers/refresh-tokens.handler';

@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
    constructor(
        private readonly signUpHandler: SignUpHandler,
        private readonly signInHandler: SignInHandler,
        private readonly refreshTokenHandler: RefreshTokensHandler,
    ) {}

    @Post('sign-up')
    async signUp(@Body() signUpDto: SignUpDto) {
        return this.signUpHandler.execute(signUpDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    async signIn(@Body() signInDto: SignInDto) {
        return this.signInHandler.execute(signInDto);
    }

    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.refreshTokenHandler.execute(refreshTokenDto);
    }
}

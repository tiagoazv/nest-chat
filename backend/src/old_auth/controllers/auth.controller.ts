import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoginDto } from 'src/old_auth/dtos/login.dto';
import { RegisterDto } from 'src/old_auth/dtos/register.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginHandler } from '../handlers/login.handler';
import { RegisterHandler } from '../handlers/register.handler';

@Controller('auth')
export class AuthController {
    constructor(private readonly loginHandler: LoginHandler, private readonly registerHandler: RegisterHandler) { }

    @Public()
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.loginHandler.execute(loginDto);
    }

    @Public()
    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.registerHandler.execute(registerDto);
    }
}

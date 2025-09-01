import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/dto/login.dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('logout')
    logout() {
        return this.authService.logout();
    }
}

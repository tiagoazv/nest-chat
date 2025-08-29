import { Controller, Get, Post } from '@nestjs/common';
import { register } from 'module';

@Controller('user')
export class UserController {
    @Get()
    findAll() {
        // Get users logic
    }

    @Post('register')
    register() {
        // Registration logic
    }

    @Post('login')
    login() {
        // Login logic
    }

    @Post('logout')
    logout() {
        // Logout logic
    }
}

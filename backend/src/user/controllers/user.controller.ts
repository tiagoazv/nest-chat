import { Controller, Get, Post, Query } from '@nestjs/common';
import { register } from 'module';
import { UserService } from '../user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    findAll() {
        return this.userService.getUsers();
    }
}

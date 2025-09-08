import { Controller, Get, Post, Query } from '@nestjs/common';
import { register } from 'module';
import { GetUsersHandler } from '../handlers/get-users.handler';

@Controller('user')
export class UserController {
    constructor(
        private readonly getUsersHandler: GetUsersHandler,
    ) {}

    @Get()
    findAll() {
        return this.getUsersHandler.execute();
    }
}

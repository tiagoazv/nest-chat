import { Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { register } from 'module';
import { GetUsersHandler } from '../handlers/get-users.handler';
import { DeleteUsersHandler } from '../handlers/delete-users.handler';

@Controller('user')
export class UserController {
    constructor(
        private readonly getUsersHandler: GetUsersHandler,
        private readonly deleteUsersHandler: DeleteUsersHandler,
    ) {}

    @Get()
    findAll() {
        return this.getUsersHandler.execute();
    }

    @Delete()
    deleteAll() {
        return this.deleteUsersHandler.execute();
    }
}

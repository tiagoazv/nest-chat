import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { User, UserSchema } from 'src/user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { GetUsersHandler } from './handlers/get-users.handler';
import { DeleteUsersHandler } from './handlers/delete-users.handler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [UserController],
  providers: [GetUsersHandler, DeleteUsersHandler]
})
export class UserModule {}

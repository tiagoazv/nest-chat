import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NatsProvider } from './broker/broker-server';
import { AuthenticationService } from './iam/authentication/services/authentication/authentication.service';
import { IamModule } from './iam/iam.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ChatModule, 
    UserModule,
    MongooseModule.forRoot('mongodb://localhost:27017/nest-chat'),
    IamModule,
    ConfigModule.forRoot({ isGlobal: true })
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    NatsProvider,
    AuthenticationService,
  ],
  exports: [NatsProvider],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { GlobalAuthGuard } from './guards/global-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './modules/chat/chat.module';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { NatsProvider } from './modules/broker/broker-server';

@Module({
  imports: [
    ChatModule, 
    UserModule,
    MongooseModule.forRoot('mongodb://localhost:27017/nest-chat'),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,  
    },
    NatsProvider,
  ],
  exports: [NatsProvider],
})
export class AppModule {}

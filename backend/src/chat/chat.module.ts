import { Module } from '@nestjs/common';
import { ChatController } from './controllers/chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/chat/message.schema';
import { NatsProvider } from '../broker/broker-server';
import { GetMessageHandler } from './handlers/get-message.handler';
import { GetLastMessageHandler } from './handlers/get-last-message.handler';
import { SendMessageHandler } from './handlers/send-message.handler';
import { setOnlineUsersHandler } from './handlers/set-online-users.handler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])
  ],
  controllers: [ChatController], 
  providers: [
    NatsProvider,  
    GetMessageHandler, 
    GetLastMessageHandler, 
    SendMessageHandler,
    setOnlineUsersHandler
  ],
})
export class ChatModule {} 
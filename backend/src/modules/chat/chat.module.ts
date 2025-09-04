import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/schemas/message.schema';
import { NatsProvider } from '../broker/broker-server';
import { PresenceService } from './presence.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])
  ],
  controllers: [ChatController], 
  providers: [ChatService, NatsProvider, PresenceService],
})
export class ChatModule {} 
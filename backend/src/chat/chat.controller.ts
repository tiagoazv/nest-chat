import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from 'src/dto/send-message.dto/send-message.dto';

@Controller('chat')
export class ChatController {

    constructor(private chatService: ChatService) {}

    @Get('messages/:userId')
    getMessages(@Param('userId') userId: string) {
        return this.chatService.getMessages(userId);
    }

    @Get('last-message/:userId')
    getLastMessage(@Param('userId') userId: string) {
        return this.chatService.getLastMessage(userId);
    }

    @Post('messages')
    sendMessage(@Body() sendMessageDto: SendMessageDto) {
        return this.chatService.sendMessage(sendMessageDto);
    }
    
}

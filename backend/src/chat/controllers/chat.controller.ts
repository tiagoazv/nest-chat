import { Body, Controller, Get, Param, Post, Query, Request } from '@nestjs/common';
import express from 'express';
import { ChatService } from '../chat.service';
import { SendMessageDto } from 'src/chat/dtos/send-message.dto';

@Controller('chat')
export class ChatController {

    constructor(private chatService: ChatService) {}

    @Get('messages/:userId')
    getMessages(@Param('userId') userId: string, @Request() req: express.Request) {
        const myId = (req as any).user._id; 
        return this.chatService.getMessages(myId, userId);
    }

    @Get('messages/last/:otherId')
    getLastMessageWithUser(@Param('otherId') otherId: string, @Request() req: express.Request) {
        const userId = (req as any).user._id;
        return this.chatService.getLastMessage(userId, otherId);
    }

    @Post('messages')
    sendMessage(@Body() sendMessageDto: SendMessageDto) {
        console.log("Received sendMessage request:", sendMessageDto);
        return this.chatService.sendMessage(sendMessageDto);
    }
    
}

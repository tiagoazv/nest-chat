import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import express from 'express';
import { SendMessageDto } from '../dtos/send-message.dto';
import { GetMessageHandler } from '../handlers/get-message.handler';
import { GetLastMessageHandler } from '../handlers/get-last-message.handler';
import { SendMessageHandler } from '../handlers/send-message.handler';

@Controller('chat')
export class ChatController {

    constructor(
        private getMessageHandler: GetMessageHandler,
        private getLastMessageHandler: GetLastMessageHandler,
        private sendMessageHandler: SendMessageHandler,
    ) {}

    @Get('messages/:userId')
    getMessages(@Param('userId') userId: string, @Request() req: express.Request) {
        const myId = (req as any).user._id; 
        return this.getMessageHandler.execute(myId, userId);
    }

    @Get('messages/last/:otherId')
    getLastMessageWithUser(@Param('otherId') otherId: string, @Request() req: express.Request) {
        const userId = (req as any).user._id;
        return this.getLastMessageHandler.execute(userId, otherId);
    }

    @Post('messages')
    sendMessage(@Body() sendMessageDto: SendMessageDto) {
        return this.sendMessageHandler.execute(sendMessageDto);
    }
    
}

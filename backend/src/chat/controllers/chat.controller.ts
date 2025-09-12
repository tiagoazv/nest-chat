import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
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
    getMessages(
        @Param('userId') userId: string,
        @ActiveUser('sub') myId: string,
    ) {
        return this.getMessageHandler.execute(myId, userId);
    }

    @Get('messages/last/:userId')
    getLastMessageWithUser(
        @Param('userId') userId: string,
        @ActiveUser('sub') myId: string,
    ) {
        return this.getLastMessageHandler.execute(myId, userId);
    }

    @Post('messages')
    sendMessage(@Body() sendMessageDto: SendMessageDto) {
        return this.sendMessageHandler.execute(sendMessageDto);
    }
    
}

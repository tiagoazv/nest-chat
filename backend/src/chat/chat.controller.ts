import { Controller, Get, Post } from '@nestjs/common';

@Controller('chat')
export class ChatController {
    @Get('messages')
    getMessages() {
        // Get messages logic
    }

    @Get('last-message')
    getLastMessage() {
        // Get last message logic
    }

    @Post('messages')
    sendMessage() {
        // Send message logic
    }
    
}

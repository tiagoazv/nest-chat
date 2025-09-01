import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { SendMessageDto } from 'src/dto/send-message.dto/send-message.dto';
import { Chat } from 'src/entities/chat.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<Chat>,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    getMessages(chatId: string) {
        return this.chatModel.find({ chatId }).populate('from to');
    }

    getLastMessage(userId: string) {
        return this.chatModel.find({ from: userId }).populate('from to').sort({ timestamp: -1 }).limit(1);
    }

    async sendMessage(dto: SendMessageDto) {
        const message = new this.chatModel(dto);
        return message.save();
    }

}

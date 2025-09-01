
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { SendMessageDto } from 'src/modules/chat/dtos/send-message.dto';
import { Chat } from 'src/entities/chat.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<Chat>,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    getMessages(userId: string) {
        return this.chatModel.find({
            $or: [
                { from: userId, to: '_id' },
                { from: '_id', to: userId }
            ]
        }).populate('from to');
    }

    getLastMessage(userId: string, otherId: string) {
        return this.chatModel.find({
            $or: [
                { from: userId, to: otherId },
                { from: otherId, to: userId }
            ]
        }).populate('from to').sort({ timestamp: -1 }).limit(1);
    }

    async sendMessage(dto: SendMessageDto) {
        const messageData = {
            ...dto,
            timestamp: new Date()
        };
        const message = new this.chatModel(messageData);
        return message.save();
    }

}

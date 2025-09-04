
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { SendMessageDto } from 'src/modules/chat/dtos/send-message.dto';
import { Message } from 'src/schemas/message.schema';
import { NatsProvider } from '../broker/broker-server';


@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
        @InjectConnection() private readonly connection: Connection,
        private nats: NatsProvider,
    ) {}

    getMessages(userId: string, otherId: string) {
        return this.messageModel.find({
            $or: [
                { from: userId, to: otherId },
                { from: otherId, to: userId }
            ]
        }).populate('from to');
    }

    getLastMessage(userId: string, otherId: string) {
        return this.messageModel.findOne({
            $or: [
                { from: userId, to: otherId },
                { from: otherId, to: userId }
            ]
        }).populate('from to').sort({ timestamp: -1 });
    }

    async sendMessage(dto: SendMessageDto) {
        const subject = `chat.user.${dto.to}`;
        const message = new this.messageModel(dto);

        await message.save();
        this.nats.publish(`chat.user.${dto.to}`, {
            from: dto.from,
            to: dto.to,
            content: dto.content,
            timestamp: Date.now(),
        });
    }
}   

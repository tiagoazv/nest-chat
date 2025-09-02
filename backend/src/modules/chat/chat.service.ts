
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { SendMessageDto } from 'src/modules/chat/dtos/send-message.dto';
import { Message } from 'src/schemas/message.schema';
import { BrokerService } from '../broker/broker.service';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
        @InjectConnection() private readonly connection: Connection,
        private broker: BrokerService,
    ) {}

    getMessages(userId: string) {
        return this.messageModel.find({
            $or: [
                { from: userId, to: '_id' },
                { from: '_id', to: userId }
            ]
        }).populate('from to');
    }

    getLastMessage(userId: string, otherId: string) {
        return this.messageModel.find({
            $or: [
                { from: userId, to: otherId },
                { from: otherId, to: userId }
            ]
        }).populate('from to').sort({ timestamp: -1 }).limit(1);
    }

    async sendMessage(dto: SendMessageDto) {
        const subject = `chat.user.${dto.to}`;

        console.log(SendMessageDto)
        const message = new this.messageModel(dto);
        await message.save();

        await this.broker.emit(subject, dto.content);
    }   
}

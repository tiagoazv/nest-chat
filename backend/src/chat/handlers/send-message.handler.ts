import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model } from "mongoose";
import { Message } from "../message.schema";
import { SendMessageDto } from "src/chat/dtos/send-message.dto";
import { NatsProvider } from "src/broker/broker-server";

@Injectable()
export class SendMessageHandler {
    constructor(
            @InjectModel(Message.name) private messageModel: Model<Message>,
            @InjectConnection() private readonly connection: Connection,
            private nats: NatsProvider,
        ) {}
    
    async execute(dto: SendMessageDto) {
        const message = new this.messageModel(dto);
        await message.save();
        this.nats.publish(`chat.user.${dto.to}`, {
            from: dto.from,
            to: dto.to,
            content: dto.content,
            timestamp: Date.now(),
        });
        return message;
    }
}
import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model } from "mongoose";
import { Message } from "../message.schema";

@Injectable()
export class GetLastMessageHandler {
    constructor(
            @InjectModel(Message.name) private messageModel: Model<Message>,
            @InjectConnection() private readonly connection: Connection,
        ) {}
    
    async execute(userId: string, otherId: string) {
        return this.messageModel.findOne({
            $or: [
                { from: userId, to: otherId },
                { from: otherId, to: userId }
            ]
        }).populate('from to').sort({ timestamp: -1 }).exec();
    }   
}
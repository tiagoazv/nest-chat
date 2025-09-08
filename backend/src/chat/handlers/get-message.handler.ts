import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message } from "../message.schema";

@Injectable()
export class GetMessageHandler {
    constructor(
            @InjectModel(Message.name) private messageModel: Model<Message>,
        ) {}
    
    async execute(userId: string, otherId: string) {
        return this.messageModel.find({
            $or: [
                { from: userId, to: otherId },
                { from: otherId, to: userId }
            ]
        }).populate('from to').exec();
    }   
}
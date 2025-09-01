import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Chat extends Document {
    @Prop({ required: true })
    from: string;

    @Prop({ required: true })
    to: string;

    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    timestamp: string;
}


export const ChatSchema = SchemaFactory.createForClass(Chat);
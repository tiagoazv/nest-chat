import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message extends Document {
    @Prop({ required: true })
    from: string;

    @Prop({ required: true })
    to: string;

    @Prop({ required: true })
    content: string;

    @Prop({ default: () => new Date().toISOString() })
    timestamp: string;
}


export const MessageSchema = SchemaFactory.createForClass(Message);
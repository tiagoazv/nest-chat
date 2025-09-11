import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from './enums/role.enum';
import { Permission, PermissionType } from 'src/iam/authentication/permission.type';

@Schema()
export class User extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: false })
    online: boolean;

    @Prop({ type: String, enum: Role, default: null })
    role: Role;

    @Prop({ type: [String], enum: Permission, default: [] })
    permissions: PermissionType[];
}


export const UserSchema = SchemaFactory.createForClass(User);
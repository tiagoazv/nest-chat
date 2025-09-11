import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from "../user.schema";

@Injectable()
export class DeleteUsersHandler {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) {}

    async execute() {
        await this.userModel.deleteMany({});
        return { message: 'All users have been deleted.' };
    }
}
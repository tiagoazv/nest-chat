import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { User } from "../user.schema";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class GetUsersHandler {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    async execute() {
        return this.userModel.find().exec();
    }
}
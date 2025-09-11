import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/user/user.schema";
import { RegisterDto } from "../dtos/register.dto";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class RegisterHandler {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly jwtService: JwtService
    ) {}

    async execute(dto: RegisterDto) {
        const { email, password } = dto;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userModel.create({ email, password: hashedPassword });

        const payload = { sub: user._id, email: user.email };
        const token = this.jwtService.sign(payload);
        return { user, token };
    }
}
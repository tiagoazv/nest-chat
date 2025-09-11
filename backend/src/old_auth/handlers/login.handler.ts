import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import { User } from "src/user/user.schema";
import { LoginDto } from "../dtos/login.dto";
import * as bcrypt from 'bcrypt';
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class LoginHandler {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly jwtService: JwtService
    ) {}

    async execute(dto: LoginDto) {
        const { email, password } = dto;
        
        const user = await this.userModel.findOne({ email });
        if (!user) throw new Error('User not found');
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');
    
        const payload = { sub: user._id, email: user.email };
        const token = this.jwtService.sign(payload);
        return { user, token };
    }
}
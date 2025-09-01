import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from 'src/dto/login.dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto/register.dto';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    async login(dto: LoginDto) {
        const { email, password } = dto;
        const user = await this.userModel.findOne({ email });
        if (!user) throw new Error('User not found');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');
        return user;
    }

    async register(dto: RegisterDto) {
        const { name, email, password } = dto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new this.userModel({ name, email, password: hashedPassword });
        return user.save();
    }

    logout() {
    }
}

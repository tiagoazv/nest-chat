import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from 'src/modules/auth/dtos/login.dto';
import { RegisterDto } from 'src/modules/auth/dtos/register.dto';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) {}

    async login(dto: LoginDto) {
        const { email, password } = dto;
        const user = await this.userModel.findOne({ email });
        if (!user) throw new Error('User not found');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        const payload = { sub: user._id, email: user.email };
        const token = this.jwtService.sign(payload);
        return { user, token };
    }

    async register(dto: RegisterDto) {
        const { name, email, password } = dto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new this.userModel({ name, email, password: hashedPassword });
        await user.save();

        const payload = { sub: user._id, email: user.email };
        const token = this.jwtService.sign(payload);
        return { user, token };
    }

    logout() {
    }
}

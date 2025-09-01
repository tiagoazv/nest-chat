import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    
    getUsers() {
        return this.userModel.find();
    }

    getMe(userId: string) {
        return this.userModel.findById(userId);
    }
}

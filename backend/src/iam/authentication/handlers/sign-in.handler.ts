import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Model } from "mongoose";
import { User } from "src/user/user.schema";
import { SignInDto } from "../dto/sign-in.dto";
import { InjectModel } from "@nestjs/mongoose";
import { HashingService } from "src/iam/authentication/services/hashing/hashing.service";
import { TokenService } from "../services/token/token.service";

@Injectable()
export class SignInHandler {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly hashingService: HashingService,
        private readonly tokenService: TokenService,
    ) {}
    
    async execute(signInDto: SignInDto) {
        const user = await this.userModel.findOne({ email: signInDto.email });
        if (!user) throw new UnauthorizedException('User does not exists');
        const isEqual = await this.hashingService.compare(
            signInDto.password,
            user.password,
        );
        
        if (!isEqual) {
            throw new UnauthorizedException('Password does not match');
        }

        const tokens = await this.tokenService.generateTokens(user);
        const { password, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
        return {
            user: userWithoutPassword,
            token: tokens.accessToken,
        };
    }
}
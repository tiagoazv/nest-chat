import { ConflictException, Injectable, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/user/user.schema";
import { SignUpDto } from "../dto/sign-up.dto";
import { JwtService } from "@nestjs/jwt";
import jwtConfig from "src/iam/config/jwt.config";
import type { ConfigType } from "@nestjs/config";
import { HashingService } from "src/iam/authentication/services/hashing/hashing.service";

@Injectable()
export class SignUpHandler {
  constructor(
      @InjectModel(User.name) private readonly userModel: Model<User>,
      private readonly hashingService: HashingService,
      private readonly jwtService: JwtService,
      @Inject(jwtConfig.KEY)
      private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async execute(signUpDto: SignUpDto) {
    try {
      const hashedPassword = await this.hashingService.hash(signUpDto.password);
      const role = signUpDto.role === 'admin' ? 'admin' : 'regular';
      const user = await this.userModel.create({
        name: signUpDto.name,
        email: signUpDto.email,
        password: hashedPassword,
        role,
      });
      const payload = { sub: user._id, email: user.email };
      const token = this.jwtService.sign(payload, { secret: this.jwtConfiguration.secret });
      return { user, token };
    } catch (err) {
      if (err && err.code === 11000 && err.keyPattern && err.keyPattern.email) {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }
}
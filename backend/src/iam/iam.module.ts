import { Module } from '@nestjs/common';
import { HashingService } from './authentication/services/hashing/hashing.service';
import { BcryptService } from './authentication/services/hashing/bcrypt.service';
import { AuthenticationController } from './authentication/controllers/authentication.controller';
import { User, UserSchema } from 'src/user/user.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { TokenService } from './authentication/services/token/token.service';
import { SignUpHandler } from './authentication/handlers/sign-up.handler';
import { MongooseModule } from '@nestjs/mongoose';
import { SignInHandler } from './authentication/handlers/sign-in.handler';
import { RolesGuard } from './authorization/guards/roles.guard';
import { RefreshTokensHandler } from './authentication/handlers/refresh-tokens.handler';
//import { RefreshTokenIdsStorage } from './authentication/wrefresh-token-ids.storage';
//import { PermissionsGuard } from './authorization/guards/permission.guard';
//import { ApiKeysService } from './authentication/api-keys.service';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
    BcryptService, 
    AccessTokenGuard,
    AuthenticationGuard,
    JwtService,
    TokenService,
    SignUpHandler,
    SignInHandler,
    RefreshTokensHandler
  ],
  exports: [
    HashingService, 
    BcryptService,
    JwtService,
    TokenService
  ],
  controllers: [AuthenticationController]
})
export class IamModule { }

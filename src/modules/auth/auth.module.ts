import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthToken } from './entities/token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailModule } from '../mail/mail.module';
import { AuthTokenService } from './auth-token.service';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthTokenService, LocalStrategy, JwtStrategy],
  imports: [
    MailModule,
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([AuthToken, User]),
    UserModule,
  ],
})
export class AuthModule {}

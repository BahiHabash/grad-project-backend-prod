import { Module } from '@nestjs/common';
import { AuthTokenConfig } from '../../core/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [AuthTokenConfig],
      useFactory: (authTokenConfig: AuthTokenConfig) => ({
        global: true,
        signOptions: {
          expiresIn: authTokenConfig.accessTtl,
        },
        secret: authTokenConfig.accessSecret,
      }),
    }),
  ],
  exports: [JwtModule],
})
export class AppJwtModule {}

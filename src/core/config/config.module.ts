import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envValidationSchema } from './env-validation.schema';
import {
  AppConfig,
  DatabaseConfig,
  AuthTokenConfig,
  MailConfig,
} from './configrations/index';

/**
 * Global module for application configuration.
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}.local`,
      validationSchema: envValidationSchema,
    }),
  ],
  providers: [AppConfig, DatabaseConfig, AuthTokenConfig, MailConfig],
  exports: [AppConfig, DatabaseConfig, AuthTokenConfig, MailConfig],
})
export class ConfigModule {}

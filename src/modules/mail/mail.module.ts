import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailConfig, AppConfig } from '../../core/config';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
import { MailListener } from './mail.listener';

@Module({
  providers: [MailService, MailListener],
  imports: [
    MailerModule.forRootAsync({
      inject: [MailConfig, AppConfig],
      useFactory: (mailConfig: MailConfig) => ({
        transport: {
          host: mailConfig.host,
          port: mailConfig.port,
          secure: mailConfig.port === 465,
          auth: {
            user: mailConfig.user,
            pass: mailConfig.password,
          },
          tls: {
            ciphers: 'SSLv3', // Helps with some older servers
            rejectUnauthorized: false,
          },
        },

        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        defaults: {
          from: mailConfig.fromAddress,
        },

        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  exports: [MailService],
})
export class MailModule {}

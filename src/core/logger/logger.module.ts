import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { Request, Response } from 'express';

/**
 * Provides and configures the application-wide logger using `nestjs-pino`.
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logLevel =
          configService.get<string>('NODE_ENV') === 'production'
            ? 'info'
            : 'debug';

        return {
          pinoHttp: {
            level: logLevel,
            serializers: {
              req: (req: Request) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                headers: {
                  'user-agent': req.headers['user-agent'],
                },
              }),
              res: (res: Response) => ({
                statusCode: res.statusCode,
              }),
            },
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
              },
            },
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}

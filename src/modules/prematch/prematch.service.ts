import { Injectable } from '@nestjs/common';
import { PreMatchDto } from './dto/prematch-dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadGatewayException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PrematchService {
  constructor(private readonly logger: PinoLogger) {}
  async preMatchData() {
    let requestedData: any;

    try {
      requestedData = require('./../../../final_json.json');
    } catch (error) {
      this.logger.error('External API request failed', error?.message);

      if (error?.response) {
        throw new BadGatewayException(
          `External API error: ${error.response.status} - ${error.response.statusText}`,
        );
      }

      throw new BadGatewayException('External API is unreachable');
    }

    const instance = plainToInstance(PreMatchDto, requestedData);

    const errors = await validate(instance);

    if (errors.length > 0) {
      const messages = errors.map((err) => ({
        field: err.property,
        constraints: err.constraints,
        children: err.children,
      }));

      throw new BadGatewayException({
        message: 'External API returned invalid data',
        errors: messages,
      });
    }

    return instance;
  }
}

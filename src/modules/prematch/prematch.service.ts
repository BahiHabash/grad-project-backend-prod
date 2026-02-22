import { Injectable } from '@nestjs/common';
import { PreMatchResDto } from './dto/prematch-dto';
import { BadGatewayException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { validateData } from 'src/utils/data-validation';
import * as requestedData from '../../../final_json.json';
@Injectable()
export class PrematchService {
  constructor(private readonly logger: PinoLogger) {}
  /**
   * Fetches and validates pre-match data from the external API.
   *
   * @returns {Promise<PreMatchResDto>} Validated pre-match data including meta,
   * training plan, team selection, and opponent analysis.
   * @throws {BadGatewayException} If the external API is unreachable or returns invalid data.
   */
  async preMatchData(): Promise<PreMatchResDto> {
    try {
    } catch (error) {
      this.logger.error('External API request failed', error?.message);

      if (error?.response) {
        throw new BadGatewayException(
          `External API error: ${error.response.status} - ${error.response.statusText}`,
        );
      }

      throw new BadGatewayException('External API is unreachable');
    }

    const instance = await validateData(PreMatchResDto, requestedData);

    return instance;
  }
}

import { Injectable } from '@nestjs/common';
import { PreMatchResDto } from './dto/prematch-dto';
import { PinoLogger } from 'nestjs-pino';
import { validateData } from 'src/utils/data-validation';
import * as requestedData from '../../../final_json.json';
import { ApiErrorException } from 'src/utils/exceptions/http-error-exception';
@Injectable()
export class PrematchService {
  constructor(private readonly logger: PinoLogger) {}
  /**
   * Fetches and validates pre-match data from the external API.
   *
   * @returns {Promise<PreMatchResDto>} Validated pre-match data including meta,
   * training plan, team selection, and opponent analysis.
   * @throws {ApiErrorException} If the external API is unreachable or returns invalid data.
   */
  async preMatchData(): Promise<PreMatchResDto> {
    try {
    } catch (error) {
      this.logger.error('External API request failed', error?.message);

      if (error?.response) {
        throw new ApiErrorException(
          'External Api Error',
          `External API error: ${error.response.status} - ${error.response.statusText}`,
        );
      }

      throw new ApiErrorException(
        'External API is unreachable',
        'Could not connect to the external API',
      );
    }

    const instance = await validateData(PreMatchResDto, requestedData);

    return instance;
  }
}

import { Injectable, BadGatewayException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import axios, { AxiosInstance } from 'axios';
import { AI_CLIENT_TIMEOUT_MS } from '../constants/postmatch.constants';
import { ConfigService } from '@nestjs/config';

/**
 * HTTP client for the AI analysis.
 *
 * Reads AI_SERVICE_URL from configuration and sends analysis requests.
 * All failures are surfaced as BadGatewayException (HTTP 502).
 */
@Injectable()
export class AiModelClient {
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.baseUrl = this.configService.get<string>('AI_SERVICE_URL')!;

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: AI_CLIENT_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    });

    this.logger.info(`AiModelClient initialized → ${this.baseUrl}`);
  }

  /**
   * Requests a post-match analysis from the AI service.
   *
   * @param eventId - SofaScore event/match ID.
   * @param teamId - SofaScore team ID to analyze for.
   * @returns The raw analysis JSON from the AI service.
   * @throws BadGatewayException if the AI service is unreachable, times out,
   *         or returns a non-2xx status code.
   */
  async analyze(eventId: string, teamId: string): Promise<object> {
    this.logger.info(
      `Requesting AI analysis: event=${eventId}, team=${teamId}`,
    );

    try {
      const response = await this.httpClient.post<unknown>('/post_match', {
        event_id: eventId,
        team_id: teamId,
      });

      if (!this.isObjectPayload(response.data)) {
        this.logger.error('AI service returned a non-object payload.');
        throw new BadGatewayException(
          'AI analysis service returned invalid data format.',
        );
      }

      this.logger.info('AI service responded successfully.');
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  /**
   * Translates axios/unknown errors into BadGatewayException.
   *
   * @param error - The caught error from the HTTP call.
   * @throws BadGatewayException always (return type is `never`).
   */
  private handleError(error: unknown): never {
    if (error instanceof BadGatewayException) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const code = error.code;

      if (code === 'ECONNABORTED') {
        this.logger.error('AI service timeout.');
        throw new BadGatewayException(
          'AI analysis service timed out. Please try again later.',
        );
      }

      if (code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
        this.logger.error(`AI service unreachable: ${code}`);
        throw new BadGatewayException(
          'Cannot connect to the AI analysis service.',
        );
      }

      const status = error.response?.status;
      if (typeof status === 'number') {
        this.logger.error(`AI service returned HTTP ${status}`);
        throw new BadGatewayException(
          `AI analysis service returned an error (HTTP ${status}).`,
        );
      }

      this.logger.error(`AI service axios error: ${error.message}`);
      throw new BadGatewayException(
        'An unexpected error occurred while contacting the AI service.',
      );
    }

    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`AI service unknown error: ${message}`);
    throw new BadGatewayException(
      'An unexpected error occurred while contacting the AI service.',
    );
  }

  /**
   * Type guard that checks if a value is a non-null, non-array object.
   *
   * @param value - The value to check.
   * @returns True if value is a plain object.
   */
  private isObjectPayload(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}

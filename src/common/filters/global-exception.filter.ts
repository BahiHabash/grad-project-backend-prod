import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Define the shape of the Standard NestJS Exception Response
interface IHttpExceptionResponse {
  statusCode: number;
  error: string;
  message: string | string[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getStatus(exception);
    const errorType = this.getErrorType(exception);
    const messages = this.getErrorMessages(exception);

    // Log internal server errors for debugging purposes
    if (status === (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      this.logger.error(
        `End Request for ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const responseBody = {
      success: false,
      statusCode: status,
      errorType: errorType,
      messages: messages,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(responseBody);
  }

  /**
   * Extracts the HTTP Status Code.
   * Defaults to 500 if the exception is not an HTTP exception.
   */
  private getStatus(exception: unknown): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Extracts the Error Name (e.g., 'BadRequestException', 'InternalServerError').
   */
  private getErrorType(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      // If the response is an object with an 'error' field (standard NestJS), use it
      if (
        typeof response === 'object' &&
        response !== null &&
        'error' in response
      ) {
        return (response as IHttpExceptionResponse).error;
      }
      return exception.constructor.name;
    }
    return 'InternalServerError';
  }

  /**
   * Extracts and normalizes error messages into an array of strings.
   */
  private getErrorMessages(exception: unknown): string[] {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      // Case 1: Exception thrown with a simple string -> new HttpException('Error', 400)
      if (typeof response === 'string') {
        return [response];
      }

      // Case 2: Exception thrown with an object (Standard NestJS or Class Validator)
      if (typeof response === 'object' && response !== null) {
        const message = (response as IHttpExceptionResponse).message;

        // Normalize to array (Class Validator returns array, others might return string)
        if (Array.isArray(message)) {
          return message;
        }
        if (typeof message === 'string') {
          return [message];
        }
      }
    }

    // Case 3: Non-HTTP Exception (System Error)
    return exception instanceof Error
      ? [exception.message]
      : ['Internal Server Error'];
  }
}

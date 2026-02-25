import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorResponse } from '../interfaces/api-error-response';

export class ApiErrorException extends HttpException {
  constructor(
    error: string,
    message: unknown,
    status: HttpStatus = HttpStatus.BAD_GATEWAY,
  ) {
    const response: ApiErrorResponse = { error, message };
    super(response, status);
  }
}

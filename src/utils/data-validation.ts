import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadGatewayException } from '@nestjs/common';
import type { ApiErrorResponse } from './interfaces/api-error-response';

export async function validateData<T>(dto: new () => T, data: any): Promise<T> {
  const instance = plainToInstance(dto, data);

  const errors = await validate(instance as object);

  if (errors.length > 0) {
    const messages = errors.map((err) => ({
      field: err.property,
      constraints: err.constraints,
      children: err.children,
    }));

    const errorResponse: ApiErrorResponse = {
      error: 'External API returned invalid data',
      message: messages,
    };

    throw new BadGatewayException(errorResponse);
  }

  return instance;
}

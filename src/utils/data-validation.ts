import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiErrorException } from './exceptions/http-error-exception';

export async function validateData<T>(dto: new () => T, data: any): Promise<T> {
  const instance = plainToInstance(dto, data);

  const errors = await validate(instance as object);

  if (errors.length > 0) {
    const messages = errors.map((err) => ({
      field: err.property,
      constraints: err.constraints,
      children: err.children,
    }));

    throw new ApiErrorException('External API returned invalid data', messages);
  }

  return instance;
}

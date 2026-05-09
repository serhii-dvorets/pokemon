import { BadRequestException } from '@nestjs/common';

interface IValidationException {
  field: string;
  messages: string;
}

export class ValidationException extends BadRequestException {
  constructor(errors: IValidationException[]) {
    super({
      statusCode: 400,
      errors,
    });
  }
}

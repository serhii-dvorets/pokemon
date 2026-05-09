import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationException } from '../exceptions/validation.exception';
import { ValidationError } from 'class-validator';

@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ValidationException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse() as any;

      response.status(status).json({
        statusCode: status,
        code: 'VALIDATION_ERROR',
        fields: errorResponse.errors,
      });
    } else if (
      Array.isArray(exception) &&
      exception[0] instanceof ValidationException
    ) {
      const validationErrors = exception as ValidationError[];
      const formattedErrors = validationErrors.map((err) => ({
        field: err.property,
        message: Object.values(err.constraints).join(', '),
        code: 'VALIDATION_ERROR',
      }));

      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        fields: formattedErrors,
      });
    } else if (exception.code === 'ER_DUP_ENTRY') {
      const { sqlMessage } = exception;
      const [, value] = sqlMessage.match(
        /Duplicate entry '([^']+)' for key '([^']+)'/,
      );

      const [field] = Object.entries(request.body).find(
        (entry) => entry[1] === value,
      );

      const status = HttpStatus.BAD_REQUEST;

      response.status(status).json({
        statusCode: status,
        fields: {
          field,
          messages: `${value} is not unique`,
        },
      });
    } else {
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status).json({
        statusCode: status,
        message: exception.message || 'Server error',
      });
    }
  }
}

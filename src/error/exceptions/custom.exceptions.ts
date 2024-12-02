import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ERROR_CODES, ERROR_MESSAGES } from '../error.constants';

export class ValidationException extends BaseException {
  constructor(details?: any) {
    super(
      ERROR_MESSAGES.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      details,
    );
  }
}

export class ResourceNotFoundException extends BaseException {
  constructor(resource?: string) {
    super(
      `${resource ? `${resource}을(를)` : '리소스를'} 찾을 수 없습니다`,
      HttpStatus.NOT_FOUND,
      ERROR_CODES.RESOURCE_NOT_FOUND,
    );
  }
}

export class CustomInternalServerErrorException extends BaseException {
  constructor(message?: string) {
    super(
      message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
} 
import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ERROR_CODES, ERROR_MESSAGES } from '../error.constants';

/**
 * [400 Bad Request] - 유효성 검사 실패 예외
 * 주로 DTO 검증 외에 비즈니스 로직 상의 중복(아이디 중복, 제목 중복 등)이 발생했을 때 던집니다.
 */
export class ValidationException extends BaseException {
  constructor(details?: any) {
    super(
      ERROR_MESSAGES.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      details, // 💡 에러가 발생한 필드(field)와 입력값(value)을 객체로 전달받아 클라이언트에 노출합니다.
    );
  }
}

/**
 * [404 Not Found] - 리소스 미존재 예외
 * DB 조회 시 타겟 데이터가 없을 경우 던지며, 어떤 리소스인지 이름을 동적으로 받아 메시지를 구성합니다.
 * @example throw new ResourceNotFoundException('할일'); // -> 할일을(를) 찾을 수 없습니다
 */
export class ResourceNotFoundException extends BaseException {
  constructor(resource?: string) {
    super(
      `${resource ? `${resource}을(를)` : '리소스를'} 찾을 수 없습니다`,
      HttpStatus.NOT_FOUND,
      ERROR_CODES.RESOURCE_NOT_FOUND,
    );
  }
}

/**
 * [500 Internal Server Error] - 서버 내부 시스템 에러 예외
 * 예측하지 못한 서버 에러가 발생했거나 외부 API 연동 실패 등 시스템 장애 시 로그를 남기기 위해 인위적으로 제어합니다.
 */
export class CustomInternalServerErrorException extends BaseException {
  constructor(message?: string) {
    super(
      message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    );
  }
}
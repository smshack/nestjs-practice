export const ERROR_MESSAGES = {
  VALIDATION_ERROR: '유효성 검사 실패',
  NOT_FOUND: '리소스를 찾을 수 없습니다',
  UNAUTHORIZED: '인증되지 않은 접근입니다',
  FORBIDDEN: '접근 권한이 없습니다',
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다',
  BAD_REQUEST: '잘못된 요청입니다',
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const; 
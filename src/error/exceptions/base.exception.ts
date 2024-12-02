import { HttpException } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    status: number,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(
      {
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
} 
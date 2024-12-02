import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || '서버 내부 오류가 발생했습니다.',
      error: exception.name || 'Internal Server Error',
    };

    // 에러 로깅
    this.logger.error('Exception occurred', {
      context: 'ExceptionFilter',
      ...errorResponse,
      stack: exception.stack,
      body: request.body,
      params: request.params,
      query: request.query,
    });

    // 클라이언트에게 보낼 응답에서는 민감한 정보 제외
    const clientResponse = {
      statusCode: errorResponse.statusCode,
      timestamp: errorResponse.timestamp,
      path: errorResponse.path,
      message: errorResponse.message,
    };

    response
      .status(status)
      .json(clientResponse);
  }
} 
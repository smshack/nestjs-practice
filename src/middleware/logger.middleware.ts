import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // 요청 로깅
    this.logger.info('Incoming Request', {
      context: 'HTTP',
      method,
      originalUrl,
      ip,
      userAgent,
    });

    // 응답 로깅
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const responseTime = Date.now() - startTime;

      if (statusCode >= 400) {
        this.logger.error('Request failed', {
          context: 'HTTP',
          method,
          originalUrl,
          statusCode,
          contentLength,
          responseTime: `${responseTime}ms`,
        });
      } else {
        this.logger.info('Request completed', {
          context: 'HTTP',
          method,
          originalUrl,
          statusCode,
          contentLength,
          responseTime: `${responseTime}ms`,
        });
      }
    });

    next();
  }
} 
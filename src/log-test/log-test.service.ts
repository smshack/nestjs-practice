import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';

@Injectable()
export class LogTestService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger
  ) {}

  async logInfo() {
    this.logger.info('INFO 레벨 로그 테스트', {
      context: 'LogTestService',
      additionalInfo: {
        timestamp: new Date().toISOString(),
        testData: '테스트 데이터',
      },
    });
    return { message: 'Info 로그가 생성되었습니다.' };
  }

  async logError() {
    this.logger.error('ERROR 레벨 로그 테스트', {
      context: 'LogTestService',
      error: new Error('테스트 에러'),
      additionalInfo: {
        timestamp: new Date().toISOString(),
        testData: '에러 테스트 데이터',
      },
    });
    return { message: 'Error 로그가 생성되었습니다.' };
  }

  async logCustom(message: string, level: string) {
    this.logger.log(level, message, {
      context: 'LogTestService',
      additionalInfo: {
        timestamp: new Date().toISOString(),
        customField: '커스텀 데이터',
      },
    });
    return { message: `${level} 레벨의 로그가 생성되었습니다.` };
  }
} 
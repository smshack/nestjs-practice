import { Injectable, Logger } from '@nestjs/common';
import { 
  ResourceNotFoundException, 
  ValidationException, 
  CustomInternalServerErrorException 
} from '../error/exceptions/custom.exceptions';
import { DbConnectionDto, DbQueryDto } from './dto/log-test.dto';

@Injectable()
export class LogTestService {
  private readonly logger = new Logger(LogTestService.name);

  async logInfo() {
    try {
      this.logger.log('Info 로그 테스트');
      return {
        message: 'Info 로그가 생성되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new CustomInternalServerErrorException('로그 생성 중 오류가 발생했습니다.');
    }
  }

  async logError() {
    try {
      this.logger.error('Error 로그 테스트');
      return {
        message: 'Error 로그가 생성되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new CustomInternalServerErrorException('로그 생성 중 오류가 발생했습니다.');
    }
  }

  async logCustom(message: string, level: string) {
    try {
      switch (level) {
        case 'info':
          this.logger.log(message);
          break;
        case 'warn':
          this.logger.warn(message);
          break;
        case 'error':
          this.logger.error(message);
          break;
        case 'debug':
          this.logger.debug(message);
          break;
        default:
          throw new ValidationException({
            message: '지원하지 않는 로그 레벨입니다.',
            level
          });
      }

      return {
        message: '커스텀 로그가 생성되었습니다.',
        level,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new CustomInternalServerErrorException('로그 생성 중 오류가 발생했습니다.');
    }
  }

  async handleDatabaseConnection(config: DbConnectionDto) {
    try {
      // DB 연결 시도
      if (!this.isValidConnection(config)) {
        throw new ValidationException({
          message: 'DB 연결 정보가 올바르지 않습니다.',
          config
        });
      }

      return {
        message: '데이터베이스 연결 성공',
        config
      };
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new CustomInternalServerErrorException('데이터베이스 연결 중 오류가 발생했습니다.');
    }
  }

  async handleDatabaseQuery(query: string, params: any) {
    try {
      // 쿼리 실행 전 검증
      if (!query) {
        throw new ValidationException({
          message: '쿼리문이 비어있습니다.',
          query,
          params
        });
      }

      // 리소스 존재 여부 확인
      const resourceExists = await this.checkResourceExists(params);
      if (!resourceExists) {
        throw new ResourceNotFoundException('요청한 데이터');
      }

      return {
        message: '쿼리 실행 성공',
        query,
        params
      };
    } catch (error) {
      if (error instanceof ResourceNotFoundException || 
          error instanceof ValidationException) {
        throw error;
      }
      throw new CustomInternalServerErrorException('쿼리 실행 중 오류가 발생했습니다.');
    }
  }

  private isValidConnection(config: DbConnectionDto): boolean {
    return !!(config.host && config.port && config.database);
  }

  private async checkResourceExists(params: any): Promise<boolean> {
    // 실제 리소스 존재 여부 확인 로직
    return true; // 예시를 위해 항상 true 반환
  }
} 
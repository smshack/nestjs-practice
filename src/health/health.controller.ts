import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { 
  HealthCheck, 
  HealthCheckService, 
  TypeOrmHealthIndicator 
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @InjectConnection() private defaultConnection: Connection,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ 
    summary: '시스템 헬스 체크',
    description: '데이터베이스 연결 상태와 메모리 사용량을 체크합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '시스템이 정상적으로 동작 중입니다.',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: {
            status: 'up'
          },
          memory_heap: {
            status: 'up',
            details: {
              used: 123456,
              total: 789012
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: '시스템에 문제가 발생했습니다.',
    schema: {
      example: {
        statusCode: 503,
        message: 'Health check failed',
        error: 'Service Unavailable'
      }
    }
  })
  async check() {
    try {
      this.logger.log('헬스 체크 시작');
      
      const result = await this.health.check([
        async () => {
          try {
            return await this.db.pingCheck('database', { connection: this.defaultConnection });
          } catch (error) {
            this.logger.error(`데이터베이스 연결 체크 실패: ${error.message}`);
            throw error;
          }
        },
        async () => {
          try {
            const memoryUsage = process.memoryUsage();
            return {
              memory_heap: {
                status: 'up',
                details: {
                  used: memoryUsage.heapUsed,
                  total: memoryUsage.heapTotal,
                },
              },
            };
          } catch (error) {
            this.logger.error(`메모리 체크 실패: ${error.message}`);
            throw error;
          }
        },
      ]);

      this.logger.log('헬스 체크 완료');
      return result;
    } catch (error) {
      this.logger.error(`헬스 체크 실패: ${error.message}`);
      throw new ServiceUnavailableException('Health check failed');
    }
  }
} 
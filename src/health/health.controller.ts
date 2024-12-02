import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import { 
  HealthCheck, 
  HealthCheckService, 
  TypeOrmHealthIndicator 
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

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
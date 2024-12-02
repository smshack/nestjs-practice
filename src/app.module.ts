import { Module, OnModuleInit, MiddlewareConsumer, NestModule, Inject } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogTestModule } from './log-test/log-test.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './configs/winston.config';
import { typeOrmModuleOptions } from './configs/typeorm.config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { HealthModule } from './health/health.module';
import { TodoModule } from './todo/todo.module';
import { Todo } from './todo/entities/todo.entity';
import { UploadModule } from './upload/upload.module';
import { ErrorModule } from './error/error.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV || 'development'}.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...typeOrmModuleOptions(configService),
        entities: [Todo],
      }),
    }),
    WinstonModule.forRoot(winstonConfig),
    LogTestModule,
    HealthModule,
    TodoModule,
    UploadModule,
    ErrorModule,
  ],
})
export class AppModule implements OnModuleInit, NestModule {
  constructor(
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }

  async onModuleInit() {
    this.logger.info('AppModule이 초기화되었습니다.');
    this.logger.info(`데이터베이스 연결 정보: ${this.configService.get('DB_HOST')}:${this.configService.get('DB_PORT')}`);
  }
}


import { Module, OnModuleInit, MiddlewareConsumer, NestModule, Inject } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogTestModule } from './log-test/log-test.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { WinstonModule, WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { winstonConfig } from './configs/winston.config';
import { typeOrmModuleOptions } from './configs/typeorm.config';
import { Logger } from 'winston';
import { HealthModule } from './health/health.module';
import { TodoModule } from './todo/todo.module';
import { UploadModule } from './upload/upload.module';
import { ErrorModule } from './error/error.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // 1. 글로벌 환경 변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV || 'development'}.env`,
    }),

    // 2. 비동기 데이터베이스 연결 설정
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...typeOrmModuleOptions(configService),
        // 💡 핵심 해결책: 엔티티를 배열에 일일이 적는 대신 autoLoadEntities를 활성화합니다.
        // 이를 통해 각 모듈(TodoModule, UserModule 등)의 forFeature에 등록된 모든 엔티티를 자동으로 수집합니다.
        autoLoadEntities: true,
      }),
    }),

    // 3. 윈스턴 로깅 및 도메인 기능 모듈 탑재
    WinstonModule.forRoot(winstonConfig),
    LogTestModule,
    HealthModule,
    TodoModule,
    UploadModule,
    ErrorModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule implements OnModuleInit, NestModule {
  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  // 글로벌 로그 미들웨어 바인딩
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

  // 모듈 초기화 직후 로깅 라이프사이클 훅
  async onModuleInit() {
    this.logger.info('AppModule이 초기화되었습니다.');
    this.logger.info(`데이터베이스 연결 정보: ${this.configService.get('DB_HOST')}:${this.configService.get('DB_PORT')}`);
  }
}
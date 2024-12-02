import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './configs/winston.config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

/**
 * 애플리케이션 부트스트랩 함수
 * NestJS 애플리케이션을 초기화하고 필요한 미들웨어, 파이프, 필터 등을 설정
 */
async function bootstrap() {
  // Winston 로거를 사용하여 NestJS 애플리케이션 생성
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  
  // Winston 로거 인스턴스 가져오기
  const logger = app.get(WINSTON_MODULE_PROVIDER);
  
  // 전역 예외 필터 설정 - 모든 HTTP 예외를 잡아서 일관된 형식으로 처리
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // 전역 ValidationPipe 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // DTO에 정의되지 않은 속성은 자동으로 제거
    transform: true,        // 요청 데이터를 DTO 클래스의 인스턴스로 자동 형변환
    forbidNonWhitelisted: true,  // DTO에 정의되지 않은 속성이 있으면 요청 자체를 거부
    validationError: {
      target: false,  // 에러 응답에서 검증 대상이 된 원본 객체를 제외
      value: false    // 에러 응답에서 잘못된 값 정보를 제외
    }
  }));
  
  // Swagger API 문서 설정
  const config = new DocumentBuilder()
    .setTitle('API 문서')
    .setDescription('API에 대한 설명입니다.')
    .setVersion('1.0')
    .build();

  // Swagger 문서 생성 및 엔드포인트 설정
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 환경변수에서 포트를 가져오거나 기본값 3000 사용
  const port = process.env.PORT || 3000;
  
  // 애플리케이션 시작
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// 애플리케이션 부트스트랩 실행
bootstrap();

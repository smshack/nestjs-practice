import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './configs/winston.config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  
  const logger = app.get(WINSTON_MODULE_PROVIDER);
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  // 전역 파이프 설정 추가
  app.useGlobalPipes(new ValidationPipe({
    // DTO에 정의되지 않은 속성은 제거
    whitelist: true,
    // 요청 데이터를 DTO 클래스의 인스턴스로 자동 변환
    transform: true,
    // DTO에 정의되지 않은 속성이 있으면 요청 자체를 거부
    forbidNonWhitelisted: true,
    // 에러 응답에서 민감한 정보 제외
    validationError: {
    target: false,  // 원본 객체 제외
    value: false    // 잘못된 값 제외
  }
  }));
  
  const config = new DocumentBuilder()
    .setTitle('API 문서')
    .setDescription('API에 대한 설명입니다.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

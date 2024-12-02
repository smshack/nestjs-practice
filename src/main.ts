import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './configs/winston.config';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  
  const logger = app.get(WINSTON_MODULE_PROVIDER);
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

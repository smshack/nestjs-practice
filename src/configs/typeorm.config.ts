import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const  typeOrmModuleOptions  = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: configService.get<string>('DB_TYPE') as 'mysql' | 'postgres' | 'mariadb' | 'sqlite',
  host: configService.get<string>('DB_HOST'), // 환경 변수에서 가져옴
  port: configService.get<number>('DB_PORT'), // 환경 변수에서 가져옴
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [__dirname + '/../**/*.entity.{js,ts}'], // 엔터티 경로
  synchronize: configService.get<boolean>('DB_SYNCHRONIZE'), // 테이블 동기화 여부
});
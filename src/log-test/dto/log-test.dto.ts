import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CustomLogDto {
  @ApiProperty({
    example: '테스트 메시지입니다.',
    description: '로그에 기록할 메시지'
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    example: 'info',
    description: '로그 레벨',
    enum: ['info', 'warn', 'error', 'debug']
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['info', 'warn', 'error', 'debug'])
  level: string;
}

export class DbConnectionDto {
  @ApiProperty({
    example: 'localhost',
    description: '데이터베이스 호스트'
  })
  @IsNotEmpty()
  @IsString()
  host: string;

  @ApiProperty({
    example: 5432,
    description: '데이터베이스 포트'
  })
  @IsNotEmpty()
  port: number;

  @ApiProperty({
    example: 'mydb',
    description: '데이터베이스 이름'
  })
  @IsNotEmpty()
  @IsString()
  database: string;
}

export class DbQueryDto {
  @ApiProperty({
    example: 'SELECT * FROM users WHERE id = $1',
    description: 'SQL 쿼리문'
  })
  @IsNotEmpty()
  @IsString()
  query: string;

  @ApiProperty({
    example: { id: 1 },
    description: '쿼리 파라미터'
  })
  params: any;
} 
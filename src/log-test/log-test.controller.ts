import { Controller, Get, Post, Body, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { LogTestService } from './log-test.service';
import { CustomLogDto, DbConnectionDto, DbQueryDto } from './dto/log-test.dto';

@ApiTags('로그 테스트')
@Controller('log-test')
export class LogTestController {
  constructor(private readonly logTestService: LogTestService) {}

  @Get('info')
  @ApiOperation({
    summary: 'Info 로그 테스트',
    description: 'Info 레벨의 로그를 생성합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '로그 생성 성공',
    schema: {
      example: {
        message: 'Info 로그가 생성되었습니다.',
        timestamp: '2024-03-02T12:00:00.000Z'
      }
    }
  })
  async testInfoLog() {
    return this.logTestService.logInfo();
  }

  @Get('error')
  @ApiOperation({
    summary: 'Error 로그 테스트',
    description: 'Error 레벨의 로그를 생성합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '로그 생성 성공',
    schema: {
      example: {
        message: 'Error 로그가 생성되었습니다.',
        timestamp: '2024-03-02T12:00:00.000Z'
      }
    }
  })
  async testErrorLog() {
    return this.logTestService.logError();
  }

  @Post('custom')
  @ApiOperation({
    summary: '커스텀 로그 테스트',
    description: '사용자가 지정한 메시지와 레벨로 로그를 생성합니다.'
  })
  @ApiBody({ type: CustomLogDto })
  @ApiResponse({
    status: 200,
    description: '로그 생성 성공',
    schema: {
      example: {
        message: '커스텀 로그가 생성되었습니다.',
        level: 'info',
        timestamp: '2024-03-02T12:00:00.000Z'
      }
    }
  })
  async testCustomLog(@Body() body: CustomLogDto) {
    return this.logTestService.logCustom(body.message, body.level);
  }

  @Get('exception')
  @ApiOperation({
    summary: '예외 발생 테스트',
    description: '의도적으로 500 에러를 발생시킵니다.'
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
    schema: {
      example: {
        statusCode: 500,
        message: '의도적으로 발생시킨 에러',
        error: 'Internal Server Error'
      }
    }
  })
  async testException() {
    throw new InternalServerErrorException('의도적으로 발생시킨 에러');
  }

  @Get('error/400')
  @ApiOperation({
    summary: '400 에러 테스트',
    description: '의도적으로 400 Bad Request 에러를 발생시킵니다.'
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청입니다.',
        error: 'Bad Request'
      }
    }
  })
  async testBadRequest() {
    throw new BadRequestException('잘못된 요청입니다.');
  }

  @Get('error/404')
  @ApiOperation({
    summary: '404 에러 테스트',
    description: '의도적으로 404 Not Found 에러를 발생시킵니다.'
  })
  @ApiResponse({
    status: 404,
    description: '리소스를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '리소스를 찾을 수 없습니다.',
        error: 'Not Found'
      }
    }
  })
  async testNotFound() {
    throw new NotFoundException('리소스를 찾을 수 없습니다.');
  }

  @Get('error/500')
  @ApiOperation({
    summary: '500 에러 테스트',
    description: '의도적으로 500 Internal Server Error를 발생시킵니다.'
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
    schema: {
      example: {
        statusCode: 500,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'Internal Server Error'
      }
    }
  })
  async testInternalError() {
    throw new InternalServerErrorException('서버 내부 오류가 발생했습니다.');
  }

  @Get('error/unhandled')
  @ApiOperation({
    summary: '처리되지 않은 예외 테스트',
    description: '의도적으로 처리되지 않은 예외를 발생시킵니다.'
  })
  @ApiResponse({
    status: 500,
    description: '처리되지 않은 예외',
    schema: {
      example: {
        statusCode: 500,
        message: '처리되지 않은 예외가 발생했습니다.',
        error: 'Internal Server Error'
      }
    }
  })
  async testUnhandledException() {
    throw new Error('처리되지 않은 예외가 발생했습니다.');
  }

  @Post('db/connect')
  @ApiOperation({
    summary: 'DB 연결 테스트',
    description: '데이터베이스 연결을 테스트합니다.'
  })
  @ApiBody({ type: DbConnectionDto })
  @ApiResponse({
    status: 200,
    description: 'DB 연결 성공',
    schema: {
      example: {
        message: '데이터베이스 연결 성공',
        config: {
          host: 'localhost',
          port: 5432,
          database: 'mydb'
        }
      }
    }
  })
  async testDbConnection(@Body() connectionConfig: DbConnectionDto) {
    return this.logTestService.handleDatabaseConnection(connectionConfig);
  }

  @Post('db/query')
  @ApiOperation({
    summary: 'DB 쿼리 테스트',
    description: '데이터베이스 쿼리를 테스트합니다.'
  })
  @ApiBody({ type: DbQueryDto })
  @ApiResponse({
    status: 200,
    description: '쿼리 실행 성공',
    schema: {
      example: {
        message: '쿼리 실행 성공',
        query: 'SELECT * FROM users WHERE id = $1',
        params: { id: 1 }
      }
    }
  })
  async testDbQuery(@Body() body: DbQueryDto) {
    return this.logTestService.handleDatabaseQuery(body.query, body.params);
  }
} 
import { Controller, Get, Post, Body, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { LogTestService } from './log-test.service';

@Controller('log-test')
export class LogTestController {
  constructor(private readonly logTestService: LogTestService) {}

  @Get('info')
  async testInfoLog() {
    return this.logTestService.logInfo();
  }

  @Get('error')
  async testErrorLog() {
    return this.logTestService.logError();
  }

  @Post('custom')
  async testCustomLog(@Body() body: { message: string; level: string }) {
    return this.logTestService.logCustom(body.message, body.level);
  }

  @Get('exception')
  async testException() {
    throw new InternalServerErrorException('의도적으로 발생시킨 에러');
  }

  @Get('error/400')
  async testBadRequest() {
    throw new BadRequestException('잘못된 요청입니다.');
  }

  @Get('error/404')
  async testNotFound() {
    throw new NotFoundException('리소스를 찾을 수 없습니다.');
  }

  @Get('error/500')
  async testInternalError() {
    throw new InternalServerErrorException('서버 내부 오류가 발생했습니다.');
  }

  @Get('error/unhandled')
  async testUnhandledException() {
    throw new Error('처리되지 않은 예외가 발생했습니다.');
  }

  @Post('db/connect')
  async testDbConnection(@Body() connectionConfig: any) {
    return this.logTestService.handleDatabaseConnection(connectionConfig);
  }

  @Post('db/query')
  async testDbQuery(@Body() body: { query: string; params: any }) {
    return this.logTestService.handleDatabaseQuery(body.query, body.params);
  }
} 
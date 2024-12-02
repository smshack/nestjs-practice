import { Controller, Get, Post, Body, InternalServerErrorException } from '@nestjs/common';
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
} 
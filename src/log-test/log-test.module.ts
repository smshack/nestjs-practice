import { Module } from '@nestjs/common';
import { LogTestController } from './log-test.controller';
import { LogTestService } from './log-test.service';

@Module({
  controllers: [LogTestController],
  providers: [LogTestService],
})
export class LogTestModule {} 
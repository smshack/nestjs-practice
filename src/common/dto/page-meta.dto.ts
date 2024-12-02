import { ApiProperty } from '@nestjs/swagger';
import { PageOptionsDto } from './page-options.dto';

export class PageMetaDto {
  @ApiProperty({ description: '현재 페이지' })
  readonly page: number;

  @ApiProperty({ description: '페이지당 항목 수' })
  readonly take: number;

  @ApiProperty({ description: '전체 항목 수' })
  readonly total: number;

  @ApiProperty({ description: '전체 페이지 수' })
  readonly pageCount: number;

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  readonly hasNextPage: boolean;

  @ApiProperty({ description: '이전 페이지 존재 여부' })
  readonly hasPreviousPage: boolean;

  constructor(pageOptionsDto: PageOptionsDto, total: number) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.total = total;
    this.pageCount = Math.ceil(this.total / this.take);
    this.hasNextPage = this.page < this.pageCount;
    this.hasPreviousPage = this.page > 1;
  }
} 
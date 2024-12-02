import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  Get,
  Param,
  Res,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({ summary: '파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({
          maxSize: 500 * 1024 * 1024, // 500MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    this.logger.log(`파일 업로드 요청: ${file.originalname}`);
    const result = await this.uploadService.uploadFile(file);
    return {
      message: '파일이 성공적으로 업로드되었습니다.',
      fileInfo: result,
    };
  }

  @Get(':filename')
  @ApiOperation({ summary: '업로드된 파일 조회' })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = await this.uploadService.getFile(filename);
    res.sendFile(file);
  }
} 
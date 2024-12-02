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
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiConsumes, 
  ApiBody, 
  ApiOperation, 
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { FileUploadDto, FileResponseDto } from './dto/file-upload.dto';

@ApiTags('파일 업로드')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({ 
    summary: '파일 업로드',
    description: '이미지 파일(jpg, jpeg, png, gif)을 업로드합니다. 최대 파일 크기는 5MB입니다.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ 
    type: FileUploadDto,
    description: '업로드할 이미지 파일'
  })
  @ApiResponse({ 
    status: 201,
    description: '파일 업로드 성공',
    type: FileResponseDto
  })
  @ApiResponse({ 
    status: 422,
    description: '잘못된 파일 형식 또는 크기 초과',
    schema: {
      example: {
        statusCode: 422,
        message: '파일 형식이 올바르지 않거나 크기가 5MB를 초과합니다.',
        error: 'Unprocessable Entity'
      }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
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
  @ApiOperation({ 
    summary: '업로드된 파일 조회',
    description: '업로드된 파일을 파일명으로 조회합니다.'
  })
  @ApiParam({ 
    name: 'filename',
    description: '조회할 파일명 (예: 1709436789-example.jpg)',
    type: 'string'
  })
  @ApiResponse({ 
    status: 200,
    description: '파일 조회 성공',
    content: {
      'image/jpeg': {},
      'image/png': {},
      'image/gif': {},
    }
  })
  @ApiResponse({ 
    status: 404,
    description: '파일을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '파일을 찾을 수 없습니다.',
        error: 'Not Found'
      }
    }
  })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = await this.uploadService.getFile(filename);
    res.sendFile(file);
  }
} 
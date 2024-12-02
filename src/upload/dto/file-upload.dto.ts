import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({ 
    type: 'string',
    format: 'binary',
    description: '업로드할 파일 (이미지 파일만 가능: jpg, jpeg, png, gif)',
  })
  file: any;
}

export class FileResponseDto {
  @ApiProperty({ example: '파일이 성공적으로 업로드되었습니다.' })
  message: string;

  @ApiProperty({
    example: {
      originalname: 'example.jpg',
      filename: '1709436789-example.jpg',
      mimetype: 'image/jpeg',
      size: 1234567
    }
  })
  fileInfo: {
    originalname: string;
    filename: string;
    mimetype: string;
    size: number;
  };
} 
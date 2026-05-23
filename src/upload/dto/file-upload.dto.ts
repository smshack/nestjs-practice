import { ApiProperty } from '@nestjs/swagger';

/**
 * [파일 업로드 요청 DTO]
 * 멀티파트(Multipart/form-data) 요청에서 파일 필드를 파싱하고 Swagger에 바이너리 폼을 노출합니다.
 */
export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '업로드할 파일 객체 (허용 확장자: jpg, jpeg, png, gif)',
  })
  file: any;
}

/**
 * [파일 상세 정보 서브 DTO]
 * Swagger 응답 스키마가 익명 객체로 무거워지는 것을 방지하기 위해 단독 클래스로 명시 분리합니다.
 */
export class FileInfoData {
  @ApiProperty({ description: '클라이언트가 업로드한 원본 파일명', example: 'avatar_profile.jpg' })
  originalname: string;

  @ApiProperty({ description: '서버 스토리지에 중복 방지 처리되어 저장된 물리 파일명', example: '1709436789-avatar_profile.jpg' })
  filename: string;

  @ApiProperty({ description: '파일의 미디어 타입 (MIME)', example: 'image/jpeg' })
  mimetype: string;

  @ApiProperty({ description: '파일 크기 (단위: Byte)', example: 1234567 })
  size: number;
}

/**
 * [파일 업로드 최종 응답 DTO]
 * 컨트롤러 계층의 @ApiResponse({ type: FileResponseDto }) 매핑용 표준 규격입니다.
 */
export class FileResponseDto {
  @ApiProperty({ description: '처리 상태 메시지', example: '파일이 성공적으로 업로드되었습니다.' })
  message: string;

  // 💡 구조화된 클래스를 타입으로 매핑하여 Swagger 스케일러빌리티와 가독성을 모두 챙깁니다.
  @ApiProperty({ description: '업로드 완료된 파일의 메타데이터', type: FileInfoData })
  fileInfo: FileInfoData;
}
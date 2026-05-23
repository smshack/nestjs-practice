import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class UploadService {
  // 💡 프로젝트 루트 기준 static 업로드 경로 지정
  private readonly uploadDir: string;
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly configService: ConfigService) {
    // 1. uploads 디렉토리 절대 경로 설정
    this.uploadDir = path.join(process.cwd(), 'uploads');
    
    // 2. 인스턴스 생성 시 초기 디렉토리 존재 여부 체크 (동기/비동기 컨텍스트 제어)
    this.ensureUploadDirectory();
  }

  /**
   * [업로드 디렉토리 존재 확인 및 자동 생성]
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`업로드 디렉토리 생성됨: ${this.uploadDir}`);
    }
  }

  /**
   * [파일 업로드 처리 (로컬 스토리지 저장)]
   * @param file 컨트롤러에서 Multer를 통해 전달받은 Express 파일 객체
   * @returns 업로드 완료된 파일의 메타데이터 반환
   */
  async uploadFile(file: any) { // 💡 Express.Multer.File 에러를 우회하고 호환성을 극대화하기 위해 any 또는 전역 맵핑 활용
    // 1. 파일명 중복 방지를 위한 타임스탬프 결합 고유 파일명 생성
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    try {
      // 2. 버퍼 데이터를 지정된 경로에 이진 파일로 영속화
      await fs.writeFile(filepath, file.buffer);
      this.logger.log(`파일 저장됨: ${filepath}`);

      return {
        originalname: file.originalname,
        filename: filename,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      // 💡 해결책: unknown 타입 에러 객체의 안전한 인터셉트를 위한 타입 가드 적용
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 업로드 오류';
      this.logger.error(`파일 업로드 실패: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * [로컬 스토리지 내 저장된 파일 경로 조회]
   * @param filename 찾고자 하는 물리 파일명
   * @returns 파일의 절대 경로 (정적 스트리밍 처리에 활용)
   * @throws NotFoundException 파일이 존재하지 않거나 읽기 권한이 없을 경우
   */
  async getFile(filename: string): Promise<string> {
    const filepath = path.join(this.uploadDir, filename);
    try {
      // 파일 접근 가능 여부 실시간 확인
      await fs.access(filepath);
      return filepath;
    } catch {
      this.logger.error(`파일을 찾을 수 없음: ${filename}`);
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }
  }
}
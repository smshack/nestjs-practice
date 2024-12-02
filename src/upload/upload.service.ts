import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {
    // uploads 디렉토리 경로 설정
    this.uploadDir = path.join(process.cwd(), 'uploads');
    // 디렉토리 생성 확인
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`업로드 디렉토리 생성됨: ${this.uploadDir}`);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    try {
      await fs.writeFile(filepath, file.buffer);
      this.logger.log(`파일 저장됨: ${filepath}`);

      return {
        originalname: file.originalname,
        filename: filename,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      this.logger.error(`파일 업로드 실패: ${error.message}`);
      throw error;
    }
  }

  async getFile(filename: string): Promise<string> {
    const filepath = path.join(this.uploadDir, filename);
    try {
      await fs.access(filepath);
      return filepath;
    } catch {
      this.logger.error(`파일을 찾을 수 없음: ${filename}`);
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }
  }
} 
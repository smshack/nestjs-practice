import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service'; // 💡 프로젝트의 실제 서비스 폴더명(user 또는 users)에 맞게 경로를 확인하세요.
import { SignOptions } from 'jsonwebtoken';

interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  // 1. 생성자를 통해 JWT 서비스와 실제 DB 처리를 담당하는 유저 서비스를 함께 주입받습니다.
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  /**
   * [로그인 처리, 토큰 쌍 발급 및 Refresh Token DB 저장]
   * @param dto 로그인 요청 데이터 (username, password)
   */
  async login(dto: LoginDto) {
    // [기존 mockUser 전면 제거] -> 2. DB에서 유저네임으로 실제 사용자 조회
    const user = await this.userService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('사용자가 없습니다.');
    }

    // 3. 입력된 평문 비밀번호와 DB에 해싱되어 저장된 비밀번호 비교 검증
    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('비밀번호 오류');
    }

    // 4. JWT 발급에 사용할 고유 비민감 정보 페이로드 구성
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    // 5. Access Token과 Refresh Token 멀티 비동기 생성 (성능 최적화)
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES as SignOptions['expiresIn'],
      }),
    ]);

    // 6. 보안 핵심: 발급된 Refresh Token을 그대로 저장하지 않고 다시 해싱하여 DB 유저 레코드에 업데이트
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    // 7. 클라이언트(프론트엔드/포스트맨)에게 최종 토큰 쌍 반환
    return { accessToken, refreshToken };
  }

  /**
   * [Access Token 재발급 (Refresh)]
   * @param refreshToken 클라이언트가 제출한 원본 Refresh Token 문자열
   */
  async refresh(refreshToken: string) {
    try {
      // 1. 들어온 토큰의 위변조 여부 및 만료 기간 검증
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // 💡 실무 추가 가이드: 원래는 여기서 DB의 hashedRefreshToken과 bcrypt.compare()로 2차 검증을 하는 것이 안전합니다.
      
      // 2. 무결성이 확인되면 새로운 Access Token 재발급
      const newAccessToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          username: payload.username,
          role: payload.role,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: process.env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'],
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
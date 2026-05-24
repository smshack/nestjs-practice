import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service'; 
import { SignOptions } from 'jsonwebtoken';

interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  /**
   * [로그인 처리 및 토큰 데이터 반환]
   * 컨트롤러가 쿠키를 직접 구울 수 있도록 원본 토큰 쌍을 유연하게 리턴합니다.
   */
  async login(dto: LoginDto) {
    // 1. DB에서 유저네임으로 실제 사용자 조회
    const user = await this.userService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('사용자가 없습니다.');
    }

    // 2. 입력된 평문 비밀번호와 DB의 해시 비밀번호 비교
    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('비밀번호 오류');
    }

    // 3. JWT 페이로드 구성
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    // 4. Access Token과 Refresh Token 멀티 비동기 생성
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

    // 5. 발급된 Refresh Token을 해싱하여 DB에 기록 (보안 강화)
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    // =========================================================================
    // 🔑 컨트롤러가 브라우저에 쿠키를 정교하게 세팅(Max-Age 등)할 수 있도록
    // 토큰 정보와 함께 해당 유저 객체 정보까지 포함하여 유연하게 구조를 반환합니다.
    // =========================================================================
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      }
    };
  }

  /**
   * [Access Token 재발급 (Refresh)]
   * 쿠키 전략에서 추출되어 전달된 원본 refreshToken 문자열을 받아 검증 및 갱신합니다.
   */
  async refresh(refreshToken: string) {
    try {
      // 1. 들어온 토큰의 위변조 여부 및 만료 기간 검증
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // 2. 🔑 [수정 완료] 엔티티 스펙에 맞춰 hashedRefreshToken을전부 'refreshToken'으로 변경
      const user = await this.userService.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access Denied');
      }

      // 🔑 [수정 완료] bcrypt 비교 대상도 엔티티 규격인 user.refreshToken으로 일치화
      const isRefreshTokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isRefreshTokenMatch) {
        throw new UnauthorizedException('Invalid Token String');
      }
      
      // 3. 무결성이 확인되면 새로운 Access Token 발급
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

      // 컨트롤러에서 AccessToken 쿠키만 교체해줄 수 있도록 깔끔한 객체로 전달합니다.
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
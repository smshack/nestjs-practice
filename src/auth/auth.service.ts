import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
// 💡 외부 라이브러리(jsonwebtoken)의 엄격한 SignOptions 타입을 가져옵니다.
import { SignOptions } from 'jsonwebtoken';

interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * [로그인 처리 및 최초 토큰 발급]
   */
  async login(dto: LoginDto) {
    const mockUser = {
      id: 1,
      username: 'admin',
      password: await bcrypt.hash('1234', 10),
      role: 'ADMIN',
    };

    const isPasswordMatch = await bcrypt.compare(dto.password, mockUser.password);
    if (dto.username !== mockUser.username || !isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: mockUser.id,
      username: mockUser.username,
      role: mockUser.role,
    };

    // 💡 해결 방법: expiresIn에 들어가는 환경변수가 확실히 존재하며, 
    // SignOptions['expiresIn'] 규격에 맞는 형식임을 'as' 키워드로 단언합니다.
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

    return { accessToken, refreshToken };
  }

  /**
   * [Access Token 재발급 (Refresh)]
   */
  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const newAccessToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          username: payload.username,
          role: payload.role,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          // 💡 여기도 마찬가지로 타입을 안전하게 묶어줍니다.
          expiresIn: process.env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'],
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { ValidationException } from '../error/exceptions/custom.exceptions'; 

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 💡 [추가] PK(ID)로 유저 단일 조회 
   * auth.service.ts의 refresh() 검증 로직에서 사용하기 위해 추가되었습니다.
   * @param id 유저 고유 Primary Key
   * @returns 유저 엔티티 객체 또는 null
   */
  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  /**
   * [유저네임(아이디)으로 유저 단일 조회]
   * @param username 조회할 유저의 로그인 ID
   * @returns 유저 엔티티 객체 또는 null
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
    });
  }

  /**
   * [신규 회원 가입 (유저 생성)]
   * @param data 생성할 유저 데이터 (Partial<User>)
   * @throws ValidationException 이미 존재하는 유저네임일 경우 예외 발생
   * @returns 생성 및 저장 완료된 User 엔티티 객체
   */
  async create(data: Partial<User>): Promise<User> {
    // 1. 가입 여부 사전 검증 (중복 아이디 체크)
    if (data.username) {
      const existingUser = await this.findByUsername(data.username);
      if (existingUser) {
        throw new ValidationException({
          message: '이미 존재하는 사용자 아이디입니다.',
          field: 'username',
          value: data.username,
        });
      }
    }

    // 2. 엔티티 생성 및 DB 영속화
    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }

  /**
   * [Refresh Token 업데이트]
   * @param id 유저의 고유 ID (PK)
   * @param hashedRefreshToken 암호화(해시)된 Refresh Token 문자열
   * @returns TypeORM UpdateResult 반환 객체
   */
  async updateRefreshToken(id: number, hashedRefreshToken: string): Promise<UpdateResult> {
    // 💡 팁: auth.service에서 'hashedRefreshToken' 속성명으로 사용하더라도 
    // DB 컬럼명이 'refreshToken'이라면 매핑 구조를 아래처럼 맞춰 유연함을 보장합니다.
    return await this.userRepository.update(id, {
      refreshToken: hashedRefreshToken,
    } as Partial<User>);
  }
}
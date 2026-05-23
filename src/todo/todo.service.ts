import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PageOptionsDto } from '../common/dto/page-options.dto';
import { PageDto } from '../common/dto/page.dto';
import { PageMetaDto } from '../common/dto/page-meta.dto';
import { ValidationException, ResourceNotFoundException } from '../error/exceptions/custom.exceptions';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  /**
   * [할 일(Todo) 생성]
   * @param createTodoDto 생성할 할 일 데이터
   * @throws ValidationException 이미 같은 제목이 존재할 경우 예외 발생
   */
  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    // 1. 중복 제목 검사
    const existingTodo = await this.todoRepository.findOne({
      where: { title: createTodoDto.title },
    });

    if (existingTodo) {
      throw new ValidationException({
        message: '이미 존재하는 제목입니다.',
        field: 'title',
        value: createTodoDto.title,
      });
    }

    // 2. 엔티티 인스턴스 생성 및 DB 저장
    const todo = this.todoRepository.create(createTodoDto);
    return await this.todoRepository.save(todo);
  }

  /**
   * [할 일 목록 조회 (페이지네이션 적용)]
   * @param pageOptionsDto 페이지 번호, 페이지당 데이터 수 등의 옵션
   * @returns 데이터 목록(items)과 메타 정보(meta)가 결합된 PageDto 반환
   */
  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Todo>> {
    const queryBuilder = this.todoRepository.createQueryBuilder('todo');

    // 1. 최신순 정렬 및 오프셋 기반 페이징 쿼리 빌드
    queryBuilder
      .orderBy('todo.createdAt', 'DESC')
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    // 2. 전체 카운트와 조건에 맞는 아이템 리스트를 단일 트랜잭션 범위 내에서 동시 조회
    const [items, total] = await queryBuilder.getManyAndCount();

    // 3. 메타 데이터 생성 및 최종 응답 객체 래핑
    const meta = new PageMetaDto(pageOptionsDto, total);
    return new PageDto(items, meta);
  }

  /**
   * [단일 할 일 조회]
   * @param id 조회할 할 일의 고유 ID (PK)
   * @throws ResourceNotFoundException 해당 ID의 할 일이 존재하지 않을 경우 예외 발생
   */
  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) {
      throw new ResourceNotFoundException('할일');
    }
    return todo;
  }

  /**
   * [할 일 수정]
   * @param id 수정할 할 일의 고유 ID (PK)
   * @param updateTodoDto 수정할 데이터 조각
   */
  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    // 1. 데이터 존재 여부 먼저 확인 (실패 시 findOne 내부에서 404 예외 발생)
    const todo = await this.findOne(id);
    
    // 2. 엔티티 객체에 수정 항목을 매핑한 후 영속성 컨텍스트를 통해 DB 업데이트
    Object.assign(todo, updateTodoDto);
    return await this.todoRepository.save(todo);
  }

  /**
   * [할 일 삭제]
   * @param id 삭제할 할 일의 고유 ID (PK)
   */
  async remove(id: number): Promise<void> {
    // 1. 데이터 존재 여부 확인
    const todo = await this.findOne(id);
    
    // 2. 레코드 삭제 진행
    await this.todoRepository.remove(todo);
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    // 중복 제목 검사
    const existingTodo = await this.todoRepository.findOne({
      where: { title: createTodoDto.title }
    });

    if (existingTodo) {
      throw new ValidationException({
        message: '이미 존재하는 제목입니다.',
        field: 'title',
        value: createTodoDto.title
      });
    }

    const todo = this.todoRepository.create(createTodoDto);
    return await this.todoRepository.save(todo);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Todo>> {
    const queryBuilder = this.todoRepository.createQueryBuilder('todo');
    
    queryBuilder
      .orderBy('todo.createdAt', 'DESC')
      .skip((pageOptionsDto.page - 1) * pageOptionsDto.take)
      .take(pageOptionsDto.take);

    const [items, total] = await queryBuilder.getManyAndCount();

    const meta = new PageMetaDto(pageOptionsDto, total);
    
    return new PageDto(items, meta);
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) {
      throw new ResourceNotFoundException('할일');
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);
    Object.assign(todo, updateTodoDto);
    return await this.todoRepository.save(todo);
  }

  async remove(id: number): Promise<void> {
    const todo = await this.findOne(id);
    await this.todoRepository.remove(todo);
  }
} 
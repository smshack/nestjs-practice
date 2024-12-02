import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';
import { PageOptionsDto } from '../common/dto/page-options.dto';
import { PageDto } from '../common/dto/page.dto';

@ApiTags('Todo')
@Controller('todos')
export class TodoController {
  private readonly logger = new Logger(TodoController.name);

  constructor(private readonly todoService: TodoService) {}

  @Post()
  @ApiOperation({ summary: '할일 생성' })
  @ApiResponse({ status: 201, type: Todo })
  async create(@Body() createTodoDto: CreateTodoDto) {
    this.logger.log(`Creating todo: ${JSON.stringify(createTodoDto)}`);
    return await this.todoService.create(createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: '할일 목록 조회' })
  @ApiResponse({ 
    status: 200,
    description: '페이징된 할일 목록',
    type: PageDto
  })
  async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<Todo>> {
    return await this.todoService.findAll(pageOptionsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '할일 상세 조회' })
  @ApiResponse({ status: 200, type: Todo })
  @ApiResponse({ status: 404, description: '할일을 찾을 수 없음' })
  async findOne(@Param('id') id: number) {
    const todo = await this.todoService.findOne(id);
    if (!todo) {
      throw new NotFoundException(`Todo #${id} not found`);
    }
    return todo;
  }

  @Put(':id')
  @ApiOperation({ summary: '할일 수정' })
  @ApiResponse({ status: 200, type: Todo })
  @ApiResponse({ status: 404, description: '할일을 찾을 수 없음' })
  async update(@Param('id') id: number, @Body() updateTodoDto: UpdateTodoDto) {
    this.logger.log(`Updating todo #${id}: ${JSON.stringify(updateTodoDto)}`);
    return await this.todoService.update(id, updateTodoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '할일 삭제' })
  @ApiResponse({ status: 200, description: '할일이 삭제됨' })
  @ApiResponse({ status: 404, description: '할일을 찾을 수 없음' })
  async remove(@Param('id') id: number) {
    this.logger.log(`Removing todo #${id}`);
    return await this.todoService.remove(id);
  }
} 
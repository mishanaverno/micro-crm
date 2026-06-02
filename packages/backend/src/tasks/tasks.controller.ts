import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { JwtUserPayload } from '../auth/interfaces/jwt-user-payload.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { hasPaginationParams, parsePaginationParams } from '../common/pagination';

interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task for the current user client' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: Task })
  create(@Body() createTaskDto: CreateTaskDto, @Req() request: AuthenticatedRequest) {
    return this.tasksService.create(createTaskDto, request.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks for the current user' })
  @ApiQuery({ name: 'client_id', required: false, description: 'Filter tasks by client ID' })
  @ApiQuery({ name: 'order_id', required: false, description: 'Filter tasks by order ID' })
  @ApiResponse({ status: 200, description: 'List of tasks', type: [Task] })
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('client_id') clientId?: string,
    @Query('order_id') orderId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    if (hasPaginationParams(page, pageSize)) {
      return this.tasksService.findAllPaginated(
        request.user.sub,
        parsePaginationParams(page, pageSize),
        clientId,
        orderId ? Number(orderId) : undefined,
      );
    }

    return this.tasksService.findAll(request.user.sub, clientId, orderId ? Number(orderId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID for the current user' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Task found', type: Task })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.tasksService.findOne(id, request.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task for the current user' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Task updated successfully', type: Task })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tasksService.update(id, request.user.sub, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task for the current user' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully', type: Task })
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.tasksService.remove(id, request.user.sub);
  }
}

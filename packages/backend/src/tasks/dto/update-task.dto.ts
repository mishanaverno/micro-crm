import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ example: '22222222-2222-4222-8222-222222222222', description: 'Client ID' })
  @IsUUID()
  @IsOptional()
  client_id?: string;

  @ApiPropertyOptional({ example: 'Follow up after legal review.', description: 'Task content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 2001, nullable: true, description: 'Optional order ID linked to the task' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  order_id?: number | null;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.COMPLETE,
    description: 'Task status',
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}

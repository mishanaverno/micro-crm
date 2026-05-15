import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { CreateReminderDto } from './create-reminder.dto';

export class UpdateReminderDto extends PartialType(CreateReminderDto) {
  @ApiPropertyOptional({ example: '22222222-2222-4222-8222-222222222222', description: 'Client ID' })
  @IsUUID()
  @IsOptional()
  client_id?: string;

  @ApiPropertyOptional({ example: 'Follow up after pricing review.', description: 'Reminder content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: '2026-05-21T09:00:00.000Z', description: 'Reminder timestamp' })
  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @ApiPropertyOptional({ example: 2001, nullable: true, description: 'Optional order ID linked to the reminder' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  order_id?: number | null;
}

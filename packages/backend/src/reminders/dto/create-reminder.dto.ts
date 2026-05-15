import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateReminderDto {
  @ApiProperty({ example: '22222222-2222-4222-8222-222222222221', description: 'Client ID' })
  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({ example: 'Send follow-up before the contract review.', description: 'Reminder content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: '2026-05-20T10:30:00.000Z', description: 'Reminder timestamp' })
  @IsDateString()
  timestamp: string;

  @ApiPropertyOptional({ example: 2001, description: 'Optional order ID linked to the reminder' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  order_id?: number | null;
}

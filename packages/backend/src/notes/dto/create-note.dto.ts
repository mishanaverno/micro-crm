import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ example: '22222222-2222-4222-8222-222222222221', description: 'Client ID' })
  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({ example: 'Client prefers Telegram and evening calls.', description: 'Note content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 2001, description: 'Optional order ID linked to the note' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  order_id?: number | null;
}

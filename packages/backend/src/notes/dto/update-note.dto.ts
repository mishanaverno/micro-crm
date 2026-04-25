import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateNoteDto } from './create-note.dto';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @ApiPropertyOptional({ example: '22222222-2222-4222-8222-222222222222', description: 'Client ID' })
  @IsUUID()
  @IsOptional()
  client_id?: string;

  @ApiPropertyOptional({ example: 'Client asked to review the proposal on Monday.', description: 'Note content' })
  @IsString()
  @IsOptional()
  content?: string;
}

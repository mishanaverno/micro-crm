import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ example: '22222222-2222-4222-8222-222222222221', description: 'Client ID' })
  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({ example: 'Client prefers Telegram and evening calls.', description: 'Note content' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

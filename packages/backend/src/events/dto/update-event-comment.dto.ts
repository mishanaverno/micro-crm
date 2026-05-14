import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEventCommentDto {
  @ApiPropertyOptional({
    example: 'Follow up next week after reviewing the change.',
    description: 'Optional comment attached to the event',
    nullable: true,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  comment?: string | null;
}

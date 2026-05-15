import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateSpentDto {
  @ApiPropertyOptional({
    example: '22222222-2222-4222-8222-222222222222',
    description: 'Client ID',
  })
  @IsUUID()
  @IsOptional()
  client_id?: string;

  @ApiPropertyOptional({
    example: 2001,
    description: 'Order ID',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  order_id?: number;

  @ApiPropertyOptional({
    example: 1500,
    description: 'Spent value. Must be greater than zero.',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsOptional()
  value?: number;
}

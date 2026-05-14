import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdatePaidDto {
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
    example: -1500,
    description: 'Paid value. Can be positive or negative.',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  value?: number;
}

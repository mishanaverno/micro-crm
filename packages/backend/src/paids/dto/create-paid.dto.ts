import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsUUID, Min } from 'class-validator';

export class CreatePaidDto {
  @ApiProperty({
    example: '22222222-2222-4222-8222-222222222222',
    description: 'Client ID',
  })
  @IsUUID()
  client_id: string;

  @ApiProperty({
    example: 2001,
    description: 'Order ID',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order_id: number;

  @ApiProperty({
    example: 15000,
    description: 'Paid value. Can be positive or negative.',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  value: number;
}

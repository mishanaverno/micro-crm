import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({
    example: '22222222-2222-4222-8222-222222222222',
    description: 'Client ID',
  })
  @IsUUID()
  client_id: string;

  @ApiProperty({
    example: 15000,
    description: 'Order price',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({
    example: 'Landing page redesign and CRM integration setup',
    description: 'Order content',
  })
  @IsString()
  @MaxLength(255)
  content: string;

  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.CREATED,
    description: 'Order status',
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}

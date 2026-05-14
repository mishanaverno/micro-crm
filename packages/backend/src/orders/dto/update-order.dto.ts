import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    example: 'CRM onboarding',
    description: 'Order title',
    default: 'order',
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string | null;

  @ApiPropertyOptional({
    example: 15000,
    description: 'Order price',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    example: 'Landing page redesign and CRM integration setup',
    description: 'Order content',
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.CREATED,
    description: 'Order status',
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}

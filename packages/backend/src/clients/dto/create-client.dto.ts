import { IsEmail, IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClientStatus } from '../entities/client.entity';

export class CreateClientDto {
  @ApiProperty({ example: 'Jane Smith', description: 'Client name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Client email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Client phone number' })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({ example: 'Acme Corp', description: 'Client company' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ enum: ClientStatus, example: ClientStatus.INDIVIDUAL, description: 'Client legal status' })
  @IsEnum(ClientStatus)
  status: ClientStatus;
}

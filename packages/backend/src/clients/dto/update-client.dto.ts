import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ClientStatus } from '../entities/client.entity';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @ApiPropertyOptional({ example: 'Jane Smith', description: 'Client name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'jane@example.com', description: 'Client email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Client phone number' })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({ example: 'Acme Corp', description: 'Client company' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ enum: ClientStatus, example: ClientStatus.LEGAL_ENTITY, description: 'Client legal status' })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;
}

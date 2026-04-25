import { IsEmail, IsString, IsNotEmpty, IsPhoneNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {

  @ApiProperty({ example: '3529e0aa-794e-4edd-ab0e-07cce6e7f3eb', description: 'User UUID'})
  @IsString()
  @IsNotEmpty()
  user_id: string

  @ApiProperty({ example: 'Jane', description: 'Client first name' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Smith', description: 'Client last name' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

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
}

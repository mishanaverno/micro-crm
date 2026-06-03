import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { JwtUserPayload } from '../auth/interfaces/jwt-user-payload.interface';
import { hasPaginationParams, parsePaginationParams } from '../common/pagination';

interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Client created successfully', type: Client })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createClientDto: CreateClientDto, @Req() request: AuthenticatedRequest) {
    return this.clientsService.create(createClientDto, request.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', required: false, type: 'number' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field: created_at, updated_at, name, or company' })
  @ApiQuery({ name: 'sortDirection', required: false, description: 'Sort direction: asc or desc' })
  @ApiResponse({ status: 200, description: 'List of clients', type: [Client] })
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: string,
  ) {
    if (hasPaginationParams(page, pageSize)) {
      return this.clientsService.findAllPaginated(
        request.user.sub,
        parsePaginationParams(page, pageSize),
        sortBy,
        sortDirection,
      );
    }

    return this.clientsService.findAll(request.user.sub, sortBy, sortDirection);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Client found', type: Client })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update client' })
  @ApiParam({ name: 'id', description: 'Client ID', type: 'string' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Client updated successfully', type: Client })
  @ApiResponse({ status: 404, description: 'Client not found' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete client' })
  @ApiParam({ name: 'id', description: 'Client ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully', type: Client })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.clientsService.remove(id, request.user.sub);
  }
}

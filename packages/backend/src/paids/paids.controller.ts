import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { JwtUserPayload } from '../auth/interfaces/jwt-user-payload.interface';
import { CreatePaidDto } from './dto/create-paid.dto';
import { UpdatePaidDto } from './dto/update-paid.dto';
import { Paid } from './entities/paid.entity';
import { PaidsService } from './paids.service';

interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}

@ApiTags('paids')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('paids')
export class PaidsController {
  constructor(private readonly paidsService: PaidsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new paid record for the current user client' })
  @ApiBody({ type: CreatePaidDto })
  @ApiResponse({ status: 201, description: 'Paid created successfully', type: Paid })
  create(@Body() createPaidDto: CreatePaidDto, @Req() request: AuthenticatedRequest) {
    return this.paidsService.create(createPaidDto, request.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get paid records for the current user' })
  @ApiQuery({ name: 'client_id', required: false, description: 'Filter paids by client ID' })
  @ApiResponse({ status: 200, description: 'List of paids', type: [Paid] })
  findAll(@Req() request: AuthenticatedRequest, @Query('client_id') clientId?: string) {
    return this.paidsService.findAll(request.user.sub, clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get paid record by ID for the current user' })
  @ApiParam({ name: 'id', description: 'Paid ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Paid found', type: Paid })
  @ApiResponse({ status: 404, description: 'Paid not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.paidsService.findOne(id, request.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update paid record for the current user' })
  @ApiParam({ name: 'id', description: 'Paid ID', type: 'number' })
  @ApiBody({ type: UpdatePaidDto })
  @ApiResponse({ status: 200, description: 'Paid updated successfully', type: Paid })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaidDto: UpdatePaidDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.paidsService.update(id, request.user.sub, updatePaidDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete paid record for the current user' })
  @ApiParam({ name: 'id', description: 'Paid ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Paid deleted successfully', type: Paid })
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.paidsService.remove(id, request.user.sub);
  }
}

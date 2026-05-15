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
import { CreateSpentDto } from './dto/create-spent.dto';
import { UpdateSpentDto } from './dto/update-spent.dto';
import { Spent } from './entities/spent.entity';
import { SpentsService } from './spents.service';

interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}

@ApiTags('spents')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('spents')
export class SpentsController {
  constructor(private readonly spentsService: SpentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new spent record for the current user client' })
  @ApiBody({ type: CreateSpentDto })
  @ApiResponse({ status: 201, description: 'Spent created successfully', type: Spent })
  create(@Body() createSpentDto: CreateSpentDto, @Req() request: AuthenticatedRequest) {
    return this.spentsService.create(createSpentDto, request.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get spent records for the current user' })
  @ApiQuery({ name: 'client_id', required: false, description: 'Filter spents by client ID' })
  @ApiResponse({ status: 200, description: 'List of spents', type: [Spent] })
  findAll(@Req() request: AuthenticatedRequest, @Query('client_id') clientId?: string) {
    return this.spentsService.findAll(request.user.sub, clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get spent record by ID for the current user' })
  @ApiParam({ name: 'id', description: 'Spent ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Spent found', type: Spent })
  @ApiResponse({ status: 404, description: 'Spent not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.spentsService.findOne(id, request.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update spent record for the current user' })
  @ApiParam({ name: 'id', description: 'Spent ID', type: 'number' })
  @ApiBody({ type: UpdateSpentDto })
  @ApiResponse({ status: 200, description: 'Spent updated successfully', type: Spent })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpentDto: UpdateSpentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.spentsService.update(id, request.user.sub, updateSpentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete spent record for the current user' })
  @ApiParam({ name: 'id', description: 'Spent ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Spent deleted successfully', type: Spent })
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.spentsService.remove(id, request.user.sub);
  }
}

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
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';
import { RemindersService } from './reminders.service';

interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}

@ApiTags('reminders')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reminder for the current user client' })
  @ApiBody({ type: CreateReminderDto })
  @ApiResponse({ status: 201, description: 'Reminder created successfully', type: Reminder })
  create(
    @Body() createReminderDto: CreateReminderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.remindersService.create(createReminderDto, request.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get reminders for the current user' })
  @ApiQuery({ name: 'client_id', required: false, description: 'Filter reminders by client ID' })
  @ApiResponse({ status: 200, description: 'List of reminders', type: [Reminder] })
  findAll(@Req() request: AuthenticatedRequest, @Query('client_id') clientId?: string) {
    return this.remindersService.findAll(request.user.sub, clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reminder by ID for the current user' })
  @ApiParam({ name: 'id', description: 'Reminder ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Reminder found', type: Reminder })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.remindersService.findOne(id, request.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update reminder for the current user' })
  @ApiParam({ name: 'id', description: 'Reminder ID', type: 'number' })
  @ApiBody({ type: UpdateReminderDto })
  @ApiResponse({ status: 200, description: 'Reminder updated successfully', type: Reminder })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReminderDto: UpdateReminderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.remindersService.update(id, request.user.sub, updateReminderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete reminder for the current user' })
  @ApiParam({ name: 'id', description: 'Reminder ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Reminder deleted successfully', type: Reminder })
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.remindersService.remove(id, request.user.sub);
  }
}

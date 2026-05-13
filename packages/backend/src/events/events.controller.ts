import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { JwtUserPayload } from '../auth/interfaces/jwt-user-payload.interface';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';

interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent events for the current user' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of events to return',
    example: 50,
  })
  @ApiResponse({ status: 200, description: 'List of recent events', type: [Event] })
  findRecent(
    @Req() request: AuthenticatedRequest,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = Number.parseInt(limit ?? '50', 10);
    const safeLimit = Number.isNaN(parsedLimit)
      ? 50
      : Math.min(Math.max(parsedLimit, 1), 100);

    return this.eventsService.findRecentByUser(request.user.sub, safeLimit);
  }
}

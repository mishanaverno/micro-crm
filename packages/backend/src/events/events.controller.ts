import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Req, UseGuards } from '@nestjs/common';
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
import { UpdateEventCommentDto } from './dto/update-event-comment.dto';

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

  @Patch(':id/comment')
  @ApiOperation({ summary: 'Add or update comment for an event' })
  @ApiResponse({ status: 200, description: 'Event comment updated', type: Event })
  @ApiResponse({ status: 404, description: 'Event not found' })
  updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventCommentDto: UpdateEventCommentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.eventsService.updateComment(
      id,
      request.user.sub,
      updateEventCommentDto.comment ?? null,
    );
  }
}

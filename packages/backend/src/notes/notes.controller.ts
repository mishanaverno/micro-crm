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
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
import { NotesService } from './notes.service';
import { hasPaginationParams, parsePaginationParams } from '../common/pagination';

interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note for the current user client' })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({ status: 201, description: 'Note created successfully', type: Note })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  create(@Body() createNoteDto: CreateNoteDto, @Req() request: AuthenticatedRequest) {
    return this.notesService.create(createNoteDto, request.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get notes for the current user' })
  @ApiQuery({ name: 'client_id', required: false, description: 'Filter notes by client ID' })
  @ApiQuery({ name: 'order_id', required: false, description: 'Filter notes by order ID' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field: created_at or updated_at' })
  @ApiQuery({ name: 'sortDirection', required: false, description: 'Sort direction: asc or desc' })
  @ApiResponse({ status: 200, description: 'List of notes', type: [Note] })
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('client_id') clientId?: string,
    @Query('order_id') orderId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: string,
  ) {
    if (hasPaginationParams(page, pageSize)) {
      return this.notesService.findAllPaginated(
        request.user.sub,
        parsePaginationParams(page, pageSize),
        clientId,
        orderId ? Number(orderId) : undefined,
        sortBy,
        sortDirection,
      );
    }

    return this.notesService.findAll(
      request.user.sub,
      clientId,
      orderId ? Number(orderId) : undefined,
      sortBy,
      sortDirection,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get note by ID for the current user' })
  @ApiParam({ name: 'id', description: 'Note ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Note found', type: Note })
  @ApiResponse({ status: 404, description: 'Note not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notesService.findOne(id, request.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update note for the current user' })
  @ApiParam({ name: 'id', description: 'Note ID', type: 'number' })
  @ApiBody({ type: UpdateNoteDto })
  @ApiResponse({ status: 200, description: 'Note updated successfully', type: Note })
  @ApiResponse({ status: 404, description: 'Note or client not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoteDto: UpdateNoteDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notesService.update(id, request.user.sub, updateNoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete note for the current user' })
  @ApiParam({ name: 'id', description: 'Note ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Note deleted successfully', type: Note })
  @ApiResponse({ status: 404, description: 'Note not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notesService.remove(id, request.user.sub);
  }
}

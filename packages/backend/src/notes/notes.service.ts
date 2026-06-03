import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, Repository } from 'typeorm';
import { parseSortDirection } from '../common/sorting';
import { ClientsService } from '../clients/clients.service';
import { EventsService } from '../events/events.service';
import { OrdersService } from '../orders/orders.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
import { EventType } from '../events/entities/event.entity';
import { Client } from '../clients/entities/client.entity';
import { Order } from '../orders/entities/order.entity';
import {
  createPaginatedResponse,
  getPaginationSkip,
  PaginatedResponse,
  PaginationOptions,
} from '../common/pagination';

@Injectable()
export class NotesService {
  private resolveOrder(sortBy?: string, sortDirection?: string): FindOptionsOrder<Note> {
    const direction = parseSortDirection(sortDirection);

    if (sortBy === 'updated_at') {
      return { updated_at: direction, created_at: 'DESC' };
    }

    return { created_at: direction };
  }

  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    private readonly clientsService: ClientsService,
    private readonly eventsService: EventsService,
    private readonly ordersService: OrdersService,
  ) {}

  private createEventSnapshot(client: Client, order: Order | null) {
    return {
      client_name: client.name ?? null,
      client_status: client.status ?? null,
      client_company: client.company ?? null,
      order_title: order?.title ?? null,
      order_status: order?.status ?? null,
    };
  }

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    const client = await this.ensureClientOwnership(createNoteDto.client_id, userId);
    const order = await this.ensureOrderOwnership(createNoteDto.order_id, userId, createNoteDto.client_id);

    const note = this.notesRepository.create({
      ...createNoteDto,
      user_id: userId,
    });

    const createdNote = await this.notesRepository.save(note);
    await this.eventsService.createEvent(
      EventType.NOTE_CREATED,
      createdNote,
      this.createEventSnapshot(client, order),
      createdNote.id,
    );
    await this.clientsService.touchClientActivity(createdNote.client_id, userId);
    await this.ordersService.touchOrderActivity(createdNote.order_id, userId);
    return createdNote;
  }

  findAll(
    userId: string,
    clientId?: string,
    orderId?: number,
    sortBy?: string,
    sortDirection?: string,
  ): Promise<Note[]> {
    const where = {
      user_id: userId,
      ...(clientId ? { client_id: clientId } : {}),
      ...(orderId !== undefined ? { order_id: orderId } : {}),
    };

    return this.notesRepository.find({
      where,
      order: this.resolveOrder(sortBy, sortDirection),
    });
  }

  async findAllPaginated(
    userId: string,
    pagination: PaginationOptions,
    clientId?: string,
    orderId?: number,
    sortBy?: string,
    sortDirection?: string,
  ): Promise<PaginatedResponse<Note>> {
    const [items, total] = await this.notesRepository.findAndCount({
      where: {
        user_id: userId,
        ...(clientId ? { client_id: clientId } : {}),
        ...(orderId !== undefined ? { order_id: orderId } : {}),
      },
      order: this.resolveOrder(sortBy, sortDirection),
      skip: getPaginationSkip(pagination),
      take: pagination.pageSize,
    });

    return createPaginatedResponse(items, total, pagination);
  }

  findOne(id: number, userId: string): Promise<Note | null> {
    return this.notesRepository.findOneBy({ id, user_id: userId });
  }

  async update(id: number, userId: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id, userId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const nextClientId = updateNoteDto.client_id ?? note.client_id;
    const nextOrderId =
      updateNoteDto.order_id !== undefined ? updateNoteDto.order_id : note.order_id;

    const client = await this.ensureClientOwnership(nextClientId, userId);
    const order = await this.ensureOrderOwnership(nextOrderId, userId, nextClientId);

    const updatedNote = this.notesRepository.merge(note, updateNoteDto);
    const savedNote = await this.notesRepository.save(updatedNote);
    await this.eventsService.createEvent(
      EventType.NOTE_UPDATED,
      savedNote,
      this.createEventSnapshot(client, order),
      savedNote.id,
    );
    await Promise.all([
      this.clientsService.touchClientActivity(note.client_id, userId),
      this.clientsService.touchClientActivity(savedNote.client_id, userId),
      this.ordersService.touchOrderActivity(note.order_id, userId),
      this.ordersService.touchOrderActivity(savedNote.order_id, userId),
    ]);
    return savedNote;
  }

  async remove(id: number, userId: string): Promise<Note> {
    const note = await this.findOne(id, userId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const client = await this.ensureClientOwnership(note.client_id, userId);
    const order = await this.ensureOrderOwnership(note.order_id, userId, note.client_id);

    await this.eventsService.createEvent(
      EventType.NOTE_DELETED,
      note,
      this.createEventSnapshot(client, order),
      note.id,
    );
    await this.notesRepository.delete({ id, user_id: userId });
    return note;
  }

  private async ensureClientOwnership(clientId: string, userId: string): Promise<Client> {
    const client = await this.clientsService.findOneOwnedByUser(clientId, userId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  private async ensureOrderOwnership(
    orderId: number | null | undefined,
    userId: string,
    clientId: string,
  ): Promise<Order | null> {
    if (orderId === null || orderId === undefined) {
      return null;
    }

    const order = await this.ordersService.findOneOwnedByUser(orderId, userId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.client_id !== clientId) {
      throw new NotFoundException('Order does not belong to the selected client');
    }

    return order;
  }
}

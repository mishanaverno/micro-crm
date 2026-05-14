import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../clients/clients.service';
import { EventsService } from '../events/events.service';
import { OrdersService } from '../orders/orders.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
import { EventType } from '../events/entities/event.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    private readonly clientsService: ClientsService,
    private readonly eventsService: EventsService,
    private readonly ordersService: OrdersService,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    await this.ensureClientOwnership(createNoteDto.client_id, userId);
    await this.ensureOrderOwnership(createNoteDto.order_id, userId, createNoteDto.client_id);

    const note = this.notesRepository.create({
      ...createNoteDto,
      user_id: userId,
    });

    const createdNote = await this.notesRepository.save(note);
    await this.eventsService.createEvent(EventType.NOTE, createdNote);
    return createdNote;
  }

  findAll(userId: string, clientId?: string): Promise<Note[]> {
    if (clientId) {
      return this.notesRepository.find({
        where: { user_id: userId, client_id: clientId },
        order: { created_at: 'DESC' },
      });
    }

    return this.notesRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  findOne(id: number, userId: string): Promise<Note | null> {
    return this.notesRepository.findOneBy({ id, user_id: userId });
  }

  async update(id: number, userId: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const note = await this.findOne(id, userId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (updateNoteDto.client_id && updateNoteDto.client_id !== note.client_id) {
      await this.ensureClientOwnership(updateNoteDto.client_id, userId);
    }

    const nextClientId = updateNoteDto.client_id ?? note.client_id;
    const nextOrderId =
      updateNoteDto.order_id !== undefined ? updateNoteDto.order_id : note.order_id;

    await this.ensureOrderOwnership(nextOrderId, userId, nextClientId);

    const updatedNote = this.notesRepository.merge(note, updateNoteDto);
    return this.notesRepository.save(updatedNote);
  }

  async remove(id: number, userId: string): Promise<Note> {
    const note = await this.findOne(id, userId);

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.notesRepository.delete({ id, user_id: userId });
    return note;
  }

  private async ensureClientOwnership(clientId: string, userId: string): Promise<void> {
    const client = await this.clientsService.findOneOwnedByUser(clientId, userId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }
  }

  private async ensureOrderOwnership(
    orderId: number | null | undefined,
    userId: string,
    clientId: string,
  ): Promise<void> {
    if (orderId === null || orderId === undefined) {
      return;
    }

    const order = await this.ordersService.findOneOwnedByUser(orderId, userId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.client_id !== clientId) {
      throw new NotFoundException('Order does not belong to the selected client');
    }
  }
}

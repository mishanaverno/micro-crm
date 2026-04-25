import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { Note } from '../notes/entities/note.entity';
import { Event, EventType } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  createClientCreatedEvent(client: Client): Promise<Event> {
    const event = this.eventsRepository.create({
      user_id: client.user_id,
      client_id: client.id,
      type: EventType.CLIENT_CREATED,
      comment: 'Client created',
      payload: {
        client_id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone_number: client.phone_number ?? null,
        company: client.company ?? null,
      },
    });

    return this.eventsRepository.save(event);
  }

  createNoteCreatedEvent(note: Note): Promise<Event> {
    const event = this.eventsRepository.create({
      user_id: note.user_id,
      client_id: note.client_id,
      type: EventType.NOTE,
      comment: 'Note created',
      payload: {
        note_id: note.id,
        content: note.content,
      },
    });

    return this.eventsRepository.save(event);
  }
}

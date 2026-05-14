import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventType } from './entities/event.entity';
import { EventReady } from './interfaces/event-ready.interface';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}
  createEvent<T extends EventType>(
    type: T,
    instance: EventReady,
    payloadOverrides?: Record<string, unknown>,
  ) {
    const event = this.eventsRepository.create({
      user_id: instance.user_id,
      client_id: instance.client_id,
      type,
      payload: {
        ...instance.getPayload(),
        ...payloadOverrides,
      },
    });

    return this.eventsRepository.save(event);
  }

  findRecentByUser(userId: string, limit = 50) {
    return this.eventsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}

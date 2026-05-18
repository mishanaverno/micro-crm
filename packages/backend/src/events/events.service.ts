import { Injectable, NotFoundException } from '@nestjs/common';
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

  private resolveOrderId(instance: EventReady, payload: Record<string, unknown>): number | null {
    if (typeof instance.order_id === 'number') {
      return instance.order_id;
    }

    if (typeof payload.order_id === 'number') {
      return payload.order_id;
    }

    return null;
  }

  createEvent<T extends EventType>(
    type: T,
    instance: EventReady,
    payloadOverrides?: Record<string, unknown>,
    originalId?: number | null,
  ) {
    const payload = {
      ...instance.getPayload(),
      ...payloadOverrides,
    };
    const event = this.eventsRepository.create({
      original_id: originalId ?? null,
      user_id: instance.user_id,
      client_id: instance.client_id,
      order_id: this.resolveOrderId(instance, payload),
      type,
      payload,
    });

    return this.eventsRepository.save(event);
  }

  async updateEventPayload<T extends EventType>(
    type: T,
    userId: string,
    originalId: number,
    instance: EventReady,
    payloadOverrides?: Record<string, unknown>,
  ) {
    const event = await this.eventsRepository.findOneBy({
      user_id: userId,
      type,
      original_id: originalId,
    });

    if (!event) {
      return null;
    }

    const payload = {
      ...instance.getPayload(),
      ...payloadOverrides,
    };
    event.client_id = instance.client_id;
    event.order_id = this.resolveOrderId(instance, payload);
    event.payload = payload;

    return this.eventsRepository.save(event);
  }

  findRecentByUser(userId: string, limit = 50) {
    return this.eventsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async updateComment(eventId: number, userId: string, comment: string | null | undefined) {
    const event = await this.eventsRepository.findOneBy({ id: eventId, user_id: userId });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.comment = comment?.trim() ? comment.trim() : null;
    return this.eventsRepository.save(event);
  }
}

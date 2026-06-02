import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../clients/clients.service';
import { EventType } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { OrdersService } from '../orders/orders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';
import { Client } from '../clients/entities/client.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly remindersRepository: Repository<Reminder>,
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

  async create(createReminderDto: CreateReminderDto, userId: string): Promise<Reminder> {
    const client = await this.ensureClientOwnership(createReminderDto.client_id, userId);
    const order = await this.ensureOrderOwnership(
      createReminderDto.order_id,
      userId,
      createReminderDto.client_id,
    );

    const reminder = this.remindersRepository.create({
      ...createReminderDto,
      user_id: userId,
      timestamp: new Date(createReminderDto.timestamp),
    });

    const createdReminder = await this.remindersRepository.save(reminder);
    await this.eventsService.createEvent(
      EventType.REMINDER_CREATED,
      createdReminder,
      this.createEventSnapshot(client, order),
      createdReminder.id,
    );
    return createdReminder;
  }

  findAll(userId: string, clientId?: string, orderId?: number): Promise<Reminder[]> {
    const where = {
      user_id: userId,
      ...(clientId ? { client_id: clientId } : {}),
      ...(orderId !== undefined ? { order_id: orderId } : {}),
    };

    return this.remindersRepository.find({
      where,
      order: { timestamp: 'ASC', created_at: 'DESC' },
    });
  }

  findOne(id: number, userId: string): Promise<Reminder | null> {
    return this.remindersRepository.findOneBy({ id, user_id: userId });
  }

  async update(
    id: number,
    userId: string,
    updateReminderDto: UpdateReminderDto,
  ): Promise<Reminder> {
    const reminder = await this.findOne(id, userId);

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    const nextClientId = updateReminderDto.client_id ?? reminder.client_id;
    const nextOrderId =
      updateReminderDto.order_id !== undefined ? updateReminderDto.order_id : reminder.order_id;

    const client = await this.ensureClientOwnership(nextClientId, userId);
    const order = await this.ensureOrderOwnership(nextOrderId, userId, nextClientId);

    const payload = {
      ...updateReminderDto,
      timestamp:
        updateReminderDto.timestamp !== undefined
          ? new Date(updateReminderDto.timestamp)
          : undefined,
    };
    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    ) as Partial<Reminder>;

    const updatedReminder = this.remindersRepository.merge(reminder, sanitizedPayload);
    const savedReminder = await this.remindersRepository.save(updatedReminder);
    await this.eventsService.createEvent(
      EventType.REMINDER_UPDATED,
      savedReminder,
      this.createEventSnapshot(client, order),
      savedReminder.id,
    );
    return savedReminder;
  }

  async remove(id: number, userId: string): Promise<Reminder> {
    const reminder = await this.findOne(id, userId);

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    const client = await this.ensureClientOwnership(reminder.client_id, userId);
    const order = await this.ensureOrderOwnership(reminder.order_id, userId, reminder.client_id);

    await this.eventsService.createEvent(
      EventType.REMINDER_DELETED,
      reminder,
      this.createEventSnapshot(client, order),
      reminder.id,
    );
    await this.remindersRepository.delete({ id, user_id: userId });
    return reminder;
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../clients/clients.service';
import { EventType } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { OrdersService } from '../orders/orders.service';
import { CreateSpentDto } from './dto/create-spent.dto';
import { UpdateSpentDto } from './dto/update-spent.dto';
import { Spent } from './entities/spent.entity';

@Injectable()
export class SpentsService {
  constructor(
    @InjectRepository(Spent)
    private readonly spentsRepository: Repository<Spent>,
    private readonly clientsService: ClientsService,
    private readonly ordersService: OrdersService,
    private readonly eventsService: EventsService,
  ) {}

  async create(createSpentDto: CreateSpentDto, userId: string): Promise<Spent> {
    await this.ensureClientOwnership(createSpentDto.client_id, userId);
    await this.ensureOrderOwnership(createSpentDto.order_id, userId, createSpentDto.client_id);

    const spent = this.spentsRepository.create({
      ...createSpentDto,
      user_id: userId,
      value: createSpentDto.value.toFixed(2),
    });

    const createdSpent = await this.spentsRepository.save(spent);
    await this.eventsService.createEvent(EventType.SPENT, createdSpent, undefined, createdSpent.id);
    return createdSpent;
  }

  findAll(userId: string, clientId?: string): Promise<Spent[]> {
    if (clientId) {
      return this.spentsRepository.find({
        where: { user_id: userId, client_id: clientId },
        order: { created_at: 'DESC' },
      });
    }

    return this.spentsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  findOne(id: number, userId: string): Promise<Spent | null> {
    return this.spentsRepository.findOneBy({ id, user_id: userId });
  }

  async update(id: number, userId: string, updateSpentDto: UpdateSpentDto): Promise<Spent> {
    const spent = await this.findOne(id, userId);

    if (!spent) {
      throw new NotFoundException('Spent not found');
    }

    const nextClientId = updateSpentDto.client_id ?? spent.client_id;
    const nextOrderId = updateSpentDto.order_id ?? spent.order_id;

    if (updateSpentDto.client_id && updateSpentDto.client_id !== spent.client_id) {
      await this.ensureClientOwnership(updateSpentDto.client_id, userId);
    }

    await this.ensureOrderOwnership(nextOrderId, userId, nextClientId);

    const payload = {
      ...updateSpentDto,
      value:
        typeof updateSpentDto.value === 'number' ? updateSpentDto.value.toFixed(2) : undefined,
    };
    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    ) as Partial<Spent>;

    const updatedSpent = this.spentsRepository.merge(spent, sanitizedPayload);
    const savedSpent = await this.spentsRepository.save(updatedSpent);
    await this.eventsService.updateEventPayload(EventType.SPENT, userId, savedSpent.id, savedSpent);
    return savedSpent;
  }

  async remove(id: number, userId: string): Promise<Spent> {
    const spent = await this.findOne(id, userId);

    if (!spent) {
      throw new NotFoundException('Spent not found');
    }

    await this.spentsRepository.softDelete({ id, user_id: userId });
    return spent;
  }

  private async ensureClientOwnership(clientId: string, userId: string): Promise<void> {
    const client = await this.clientsService.findOneOwnedByUser(clientId, userId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }
  }

  private async ensureOrderOwnership(
    orderId: number,
    userId: string,
    clientId: string,
  ): Promise<void> {
    const order = await this.ordersService.findOneOwnedByUser(orderId, userId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.client_id !== clientId) {
      throw new NotFoundException('Order does not belong to the selected client');
    }
  }
}

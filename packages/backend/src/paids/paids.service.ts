import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../clients/clients.service';
import { EventType } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { OrdersService } from '../orders/orders.service';
import { CreatePaidDto } from './dto/create-paid.dto';
import { UpdatePaidDto } from './dto/update-paid.dto';
import { Paid } from './entities/paid.entity';

@Injectable()
export class PaidsService {
  constructor(
    @InjectRepository(Paid)
    private readonly paidsRepository: Repository<Paid>,
    private readonly clientsService: ClientsService,
    private readonly ordersService: OrdersService,
    private readonly eventsService: EventsService,
  ) {}

  async create(createPaidDto: CreatePaidDto, userId: string): Promise<Paid> {
    await this.ensureClientOwnership(createPaidDto.client_id, userId);
    await this.ensureOrderOwnership(createPaidDto.order_id, userId, createPaidDto.client_id);

    const paid = this.paidsRepository.create({
      ...createPaidDto,
      user_id: userId,
      value: createPaidDto.value.toFixed(2),
    });

    const createdPaid = await this.paidsRepository.save(paid);
    await this.eventsService.createEvent(EventType.PAID, createdPaid);
    return createdPaid;
  }

  findAll(userId: string, clientId?: string): Promise<Paid[]> {
    if (clientId) {
      return this.paidsRepository.find({
        where: { user_id: userId, client_id: clientId },
        order: { created_at: 'DESC' },
      });
    }

    return this.paidsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  findOne(id: number, userId: string): Promise<Paid | null> {
    return this.paidsRepository.findOneBy({ id, user_id: userId });
  }

  async update(id: number, userId: string, updatePaidDto: UpdatePaidDto): Promise<Paid> {
    const paid = await this.findOne(id, userId);

    if (!paid) {
      throw new NotFoundException('Paid not found');
    }

    const nextClientId = updatePaidDto.client_id ?? paid.client_id;
    const nextOrderId = updatePaidDto.order_id ?? paid.order_id;

    if (updatePaidDto.client_id && updatePaidDto.client_id !== paid.client_id) {
      await this.ensureClientOwnership(updatePaidDto.client_id, userId);
    }

    await this.ensureOrderOwnership(nextOrderId, userId, nextClientId);

    const payload = {
      ...updatePaidDto,
      value:
        typeof updatePaidDto.value === 'number' ? updatePaidDto.value.toFixed(2) : undefined,
    };
    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    ) as Partial<Paid>;

    const updatedPaid = this.paidsRepository.merge(paid, sanitizedPayload);
    return this.paidsRepository.save(updatedPaid);
  }

  async remove(id: number, userId: string): Promise<Paid> {
    const paid = await this.findOne(id, userId);

    if (!paid) {
      throw new NotFoundException('Paid not found');
    }

    await this.paidsRepository.softDelete({ id, user_id: userId });
    return paid;
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

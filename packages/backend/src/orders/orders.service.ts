import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../clients/clients.service';
import { EventType } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly clientsService: ClientsService,
    private readonly eventsService: EventsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    await this.ensureClientOwnership(createOrderDto.client_id, userId);

    const order = this.ordersRepository.create({
      ...createOrderDto,
      user_id: userId,
      price: createOrderDto.price.toFixed(2),
    });

    const createdOrder = await this.ordersRepository.save(order);
    await this.eventsService.createEvent(EventType.ORDER_CREATED, createdOrder);
    return createdOrder;
  }

  findAll(userId: string, clientId?: string): Promise<Order[]> {
    if (clientId) {
      return this.ordersRepository.find({
        where: { user_id: userId, client_id: clientId },
        order: { created_at: 'DESC' },
      });
    }

    return this.ordersRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  findOne(id: number, userId: string): Promise<Order | null> {
    return this.ordersRepository.findOneBy({ id, user_id: userId });
  }

  findOneOwnedByUser(id: number, userId: string): Promise<Order | null> {
    return this.findOne(id, userId);
  }

  async update(id: number, userId: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id, userId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const { client_id: _clientId, ...restPayload } = updateOrderDto as UpdateOrderDto & {
      client_id?: string;
    };

    const payload = {
      ...restPayload,
      price:
        typeof updateOrderDto.price === 'number'
          ? updateOrderDto.price.toFixed(2)
          : undefined,
    };

    const updatedOrder = this.ordersRepository.merge(order, payload);
    const savedOrder = await this.ordersRepository.save(updatedOrder);
    await this.eventsService.createEvent(EventType.ORDER_UPDATED, savedOrder);
    return savedOrder;
  }

  async remove(id: number, userId: string): Promise<Order> {
    const order = await this.findOne(id, userId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.ordersRepository.softDelete({ id, user_id: userId });
    return order;
  }

  private async ensureClientOwnership(clientId: string, userId: string): Promise<void> {
    const client = await this.clientsService.findOneOwnedByUser(clientId, userId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }
  }
}

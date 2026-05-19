import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../clients/clients.service';
import { EventType } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { Client } from '../clients/entities/client.entity';
import {
  createPaginatedResponse,
  getPaginationSkip,
  PaginatedResponse,
  PaginationOptions,
} from '../common/pagination';

interface OrderFieldChange {
  field: 'title' | 'price' | 'content' | 'status';
  from: string | null;
  to: string | null;
}

type OrderSnapshot = Pick<Order, 'title' | 'price' | 'content' | 'status'>;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly clientsService: ClientsService,
    private readonly eventsService: EventsService,
  ) {}

  private createEventSnapshot(client: Client, order?: Order) {
    return {
      client_name: client.name ?? null,
      client_status: client.status ?? null,
      client_company: client.company ?? null,
      order_title: order?.title ?? null,
      order_status: order?.status ?? null,
    };
  }

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    const client = await this.ensureClientOwnership(createOrderDto.client_id, userId);

    const order = this.ordersRepository.create({
      ...createOrderDto,
      user_id: userId,
      price: createOrderDto.price.toFixed(2),
    });

    const createdOrder = await this.ordersRepository.save(order);
    await this.eventsService.createEvent(
      EventType.ORDER_CREATED,
      createdOrder,
      this.createEventSnapshot(client, createdOrder),
    );
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

  async findAllPaginated(
    userId: string,
    pagination: PaginationOptions,
    clientId?: string,
  ): Promise<PaginatedResponse<Order>> {
    const [items, total] = await this.ordersRepository.findAndCount({
      where: clientId
        ? { user_id: userId, client_id: clientId }
        : { user_id: userId },
      order: { created_at: 'DESC' },
      skip: getPaginationSkip(pagination),
      take: pagination.pageSize,
    });

    return createPaginatedResponse(items, total, pagination);
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
    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    ) as Partial<OrderSnapshot>;

    const previousOrderSnapshot = this.createOrderSnapshot(order);
    const updatedOrder = this.ordersRepository.merge(order, sanitizedPayload);
    const savedOrder = await this.ordersRepository.save(updatedOrder);
    const client = await this.ensureClientOwnership(savedOrder.client_id, userId);
    const changed_fields = this.collectChangedFields(previousOrderSnapshot, savedOrder);
    const eventType = this.resolveOrderUpdateEventType(previousOrderSnapshot, savedOrder);

    await this.eventsService.createEvent(eventType, savedOrder, {
      changed_fields,
      ...this.createEventSnapshot(client, savedOrder),
    });
    return savedOrder;
  }

  async remove(id: number, userId: string): Promise<Order> {
    const order = await this.findOne(id, userId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const client = await this.ensureClientOwnership(order.client_id, userId);

    await this.eventsService.createEvent(
      EventType.ORDER_DELETED,
      order,
      this.createEventSnapshot(client, order),
      order.id,
    );
    await this.ordersRepository.softDelete({ id, user_id: userId });
    return order;
  }

  private async ensureClientOwnership(clientId: string, userId: string): Promise<Client> {
    const client = await this.clientsService.findOneOwnedByUser(clientId, userId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  private createOrderSnapshot(order: Order): OrderSnapshot {
    return {
      title: order.title,
      price: order.price,
      content: order.content,
      status: order.status,
    };
  }

  private shouldCreateOrderCompleteEvent(previousOrder: OrderSnapshot, nextOrder: Order): boolean {
    return previousOrder.status !== OrderStatus.DONE && nextOrder.status === OrderStatus.DONE;
  }

  private shouldCreateOrderReopenedEvent(previousOrder: OrderSnapshot, nextOrder: Order): boolean {
    return previousOrder.status === OrderStatus.DONE && nextOrder.status !== OrderStatus.DONE;
  }

  private resolveOrderUpdateEventType(previousOrder: OrderSnapshot, nextOrder: Order): EventType {
    if (this.shouldCreateOrderCompleteEvent(previousOrder, nextOrder)) {
      return EventType.ORDER_COMPLETE;
    }

    if (this.shouldCreateOrderReopenedEvent(previousOrder, nextOrder)) {
      return EventType.ORDER_REOPENED;
    }

    return EventType.ORDER_UPDATED;
  }

  private collectChangedFields(previousOrder: OrderSnapshot, nextOrder: Order): OrderFieldChange[] {
    const trackedFields: OrderFieldChange['field'][] = ['title', 'price', 'content', 'status'];

    return trackedFields.flatMap((field) => {
      const previousValue = this.normalizeComparableValue(previousOrder[field]);
      const nextValue = this.normalizeComparableValue(nextOrder[field]);

      if (previousValue === nextValue) {
        return [];
      }

      return [
        {
          field,
          from: previousValue,
          to: nextValue,
        },
      ];
    });
  }

  private normalizeComparableValue(value: string | null | undefined): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    return String(value);
  }
}

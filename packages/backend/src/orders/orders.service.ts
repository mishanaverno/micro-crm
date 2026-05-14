import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../clients/clients.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly clientsService: ClientsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    await this.ensureClientOwnership(createOrderDto.client_id, userId);

    const order = this.ordersRepository.create({
      ...createOrderDto,
      user_id: userId,
      price: createOrderDto.price.toFixed(2),
    });

    return this.ordersRepository.save(order);
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

  async update(id: number, userId: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id, userId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (updateOrderDto.client_id && updateOrderDto.client_id !== order.client_id) {
      await this.ensureClientOwnership(updateOrderDto.client_id, userId);
    }

    const payload = {
      ...updateOrderDto,
      price:
        typeof updateOrderDto.price === 'number'
          ? updateOrderDto.price.toFixed(2)
          : undefined,
    };

    const updatedOrder = this.ordersRepository.merge(order, payload);
    return this.ordersRepository.save(updatedOrder);
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

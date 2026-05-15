import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../clients/clients.service';
import { EventType } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { OrdersService } from '../orders/orders.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly clientsService: ClientsService,
    private readonly eventsService: EventsService,
    private readonly ordersService: OrdersService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    await this.ensureClientOwnership(createTaskDto.client_id, userId);
    await this.ensureOrderOwnership(createTaskDto.order_id, userId, createTaskDto.client_id);

    const task = this.tasksRepository.create({
      ...createTaskDto,
      user_id: userId,
      status: createTaskDto.status ?? TaskStatus.PENDING,
    });

    const createdTask = await this.tasksRepository.save(task);
    await this.eventsService.createEvent(EventType.TASK, createdTask, { content: createdTask.content, status: createdTask.status });
    return createdTask;
  }

  findAll(userId: string, clientId?: string): Promise<Task[]> {
    if (clientId) {
      return this.tasksRepository.find({
        where: { user_id: userId, client_id: clientId },
        order: { created_at: 'DESC' },
      });
    }

    return this.tasksRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  findOne(id: number, userId: string): Promise<Task | null> {
    return this.tasksRepository.findOneBy({ id, user_id: userId });
  }

  async update(id: number, userId: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id, userId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (updateTaskDto.client_id && updateTaskDto.client_id !== task.client_id) {
      await this.ensureClientOwnership(updateTaskDto.client_id, userId);
    }

    const nextClientId = updateTaskDto.client_id ?? task.client_id;
    const nextOrderId =
      updateTaskDto.order_id !== undefined ? updateTaskDto.order_id : task.order_id;

    await this.ensureOrderOwnership(nextOrderId, userId, nextClientId);

    const updatedTask = this.tasksRepository.merge(task, updateTaskDto);
    return this.tasksRepository.save(updatedTask);
  }

  async remove(id: number, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.tasksRepository.delete({ id, user_id: userId });
    return task;
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

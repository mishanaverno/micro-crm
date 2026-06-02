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
import { Client } from '../clients/entities/client.entity';
import { Order } from '../orders/entities/order.entity';
import {
  createPaginatedResponse,
  getPaginationSkip,
  PaginatedResponse,
  PaginationOptions,
} from '../common/pagination';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
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

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const client = await this.ensureClientOwnership(createTaskDto.client_id, userId);
    const order = await this.ensureOrderOwnership(createTaskDto.order_id, userId, createTaskDto.client_id);

    const task = this.tasksRepository.create({
      ...createTaskDto,
      user_id: userId,
      status: createTaskDto.status ?? TaskStatus.PENDING,
      deadline: createTaskDto.deadline ? new Date(createTaskDto.deadline) : null,
    });

    const createdTask = await this.tasksRepository.save(task);
    await this.eventsService.createEvent(
      EventType.TASK_CREATED,
      createdTask,
      {
        content: createdTask.content,
        status: createdTask.status,
        ...this.createEventSnapshot(client, order),
      },
      createdTask.id,
    );
    return createdTask;
  }

  findAll(userId: string, clientId?: string, orderId?: number): Promise<Task[]> {
    const where = {
      user_id: userId,
      ...(clientId ? { client_id: clientId } : {}),
      ...(orderId !== undefined ? { order_id: orderId } : {}),
    };

    return this.tasksRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async findAllPaginated(
    userId: string,
    pagination: PaginationOptions,
    clientId?: string,
    orderId?: number,
  ): Promise<PaginatedResponse<Task>> {
    const [items, total] = await this.tasksRepository.findAndCount({
      where: {
        user_id: userId,
        ...(clientId ? { client_id: clientId } : {}),
        ...(orderId !== undefined ? { order_id: orderId } : {}),
      },
      order: { created_at: 'DESC' },
      skip: getPaginationSkip(pagination),
      take: pagination.pageSize,
    });

    return createPaginatedResponse(items, total, pagination);
  }

  findOne(id: number, userId: string): Promise<Task | null> {
    return this.tasksRepository.findOneBy({ id, user_id: userId });
  }

  async update(id: number, userId: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id, userId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const nextClientId = updateTaskDto.client_id ?? task.client_id;
    const nextOrderId =
      updateTaskDto.order_id !== undefined ? updateTaskDto.order_id : task.order_id;

    const client = await this.ensureClientOwnership(nextClientId, userId);
    const order = await this.ensureOrderOwnership(nextOrderId, userId, nextClientId);

    const payload = {
      ...updateTaskDto,
      deadline:
        updateTaskDto.deadline !== undefined
          ? updateTaskDto.deadline
            ? new Date(updateTaskDto.deadline)
            : null
          : undefined,
    };
    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    ) as Partial<Task>;

    const updatedTask = this.tasksRepository.merge(task, sanitizedPayload);
    const savedTask = await this.tasksRepository.save(updatedTask);
    await this.eventsService.createEvent(
      EventType.TASK_UPDATED,
      savedTask,
      {
        content: savedTask.content,
        status: savedTask.status,
        ...this.createEventSnapshot(client, order),
      },
      savedTask.id,
    );
    return savedTask;
  }

  async remove(id: number, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const client = await this.ensureClientOwnership(task.client_id, userId);
    const order = await this.ensureOrderOwnership(task.order_id, userId, task.client_id);

    await this.eventsService.createEvent(
      EventType.TASK_DELETED,
      task,
      {
        content: task.content,
        status: task.status,
        ...this.createEventSnapshot(client, order),
      },
      task.id,
    );
    await this.tasksRepository.delete({ id, user_id: userId });
    return task;
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

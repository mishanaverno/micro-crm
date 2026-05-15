import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { ClientsService } from '../clients/clients.service';
import { EventType } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './entities/task.entity';
import { TasksService } from './tasks.service';

type MockRepository<T> = {
  create: jest.Mock<T, [Partial<T>]>;
  save: jest.Mock<Promise<T>, [T]>;
  find: jest.Mock<Promise<T[]>, [unknown?]>;
  findOneBy: jest.Mock<Promise<T | null>, [Partial<T>]>;
  merge: jest.Mock<T, [T, Partial<T>]>;
  delete: jest.Mock<Promise<unknown>, [Partial<T>]>;
};

type MockClientsService = {
  findOneOwnedByUser: jest.Mock<Promise<Client | null>, [string, string]>;
};

type MockOrdersService = {
  findOneOwnedByUser: jest.Mock<Promise<Order | null>, [number, string]>;
};

type MockEventsService = {
  createEvent: jest.Mock<Promise<unknown>, [unknown, unknown]>;
};

const createRepositoryMock = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let service: TasksService;
  let repository: MockRepository<Task>;
  let clientsService: MockClientsService;
  let eventsService: MockEventsService;
  let ordersService: MockOrdersService;

  beforeEach(() => {
    repository = createRepositoryMock<Task>();
    clientsService = { findOneOwnedByUser: jest.fn() };
    eventsService = { createEvent: jest.fn() };
    ordersService = { findOneOwnedByUser: jest.fn() };
    eventsService.createEvent.mockResolvedValue(undefined);

    service = new TasksService(
      repository as unknown as Repository<Task>,
      clientsService as unknown as ClientsService,
      eventsService as unknown as EventsService,
      ordersService as unknown as OrdersService,
    );
  });

  it('creates and saves a task for an owned client', async () => {
    const dto: CreateTaskDto = {
      client_id: 'client-1',
      content: 'Prepare the next proposal',
    };
    const createdTask = {
      id: 1,
      user_id: 'user-1',
      ...dto,
      status: TaskStatus.PENDING,
    } as Task;

    clientsService.findOneOwnedByUser.mockResolvedValue({ id: 'client-1' } as Client);
    repository.create.mockReturnValue(createdTask);
    repository.save.mockResolvedValue(createdTask);

    await expect(service.create(dto, 'user-1')).resolves.toEqual(createdTask);
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      user_id: 'user-1',
      status: TaskStatus.PENDING,
    });
    expect(eventsService.createEvent).toHaveBeenCalledWith(EventType.TASK, createdTask);
  });

  it('validates owned order when task is linked to an order', async () => {
    const dto: CreateTaskDto = {
      client_id: 'client-1',
      content: 'Follow up on order',
      order_id: 2001,
      status: TaskStatus.COMPLETE,
    };
    const createdTask = {
      id: 1,
      user_id: 'user-1',
      ...dto,
    } as Task;

    clientsService.findOneOwnedByUser.mockResolvedValue({ id: 'client-1' } as Client);
    ordersService.findOneOwnedByUser.mockResolvedValue({
      id: 2001,
      client_id: 'client-1',
    } as Order);
    repository.create.mockReturnValue(createdTask);
    repository.save.mockResolvedValue(createdTask);

    await expect(service.create(dto, 'user-1')).resolves.toEqual(createdTask);
    expect(ordersService.findOneOwnedByUser).toHaveBeenCalledWith(2001, 'user-1');
  });

  it('returns all tasks for the user', async () => {
    const tasks = [{ id: 1 }, { id: 2 }] as Task[];
    repository.find.mockResolvedValue(tasks);

    await expect(service.findAll('user-1')).resolves.toEqual(tasks);
    expect(repository.find).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      order: { created_at: 'DESC' },
    });
  });

  it('updates an existing task', async () => {
    const existingTask = {
      id: 1,
      user_id: 'user-1',
      client_id: 'client-1',
      content: 'Old',
      order_id: null,
      status: TaskStatus.PENDING,
    } as Task;
    const dto: UpdateTaskDto = { content: 'Updated', status: TaskStatus.COMPLETE };
    const mergedTask = { ...existingTask, ...dto } as Task;

    repository.findOneBy.mockResolvedValue(existingTask);
    repository.merge.mockReturnValue(mergedTask);
    repository.save.mockResolvedValue(mergedTask);

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedTask);
    expect(repository.merge).toHaveBeenCalledWith(existingTask, dto);
  });

  it('throws when updating a missing task', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.update(999, 'user-1', { content: 'Updated' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deletes a task when it exists', async () => {
    const task = { id: 1, user_id: 'user-1' } as Task;
    repository.findOneBy.mockResolvedValue(task);
    repository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1, 'user-1')).resolves.toEqual(task);
    expect(repository.delete).toHaveBeenCalledWith({ id: 1, user_id: 'user-1' });
  });
});

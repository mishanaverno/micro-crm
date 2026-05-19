import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { ClientsService } from '../clients/clients.service';
import { EventType } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { CreateSpentDto } from './dto/create-spent.dto';
import { UpdateSpentDto } from './dto/update-spent.dto';
import { Spent } from './entities/spent.entity';
import { SpentsService } from './spents.service';

type MockRepository<T> = {
  create: jest.Mock<T, [Partial<T>]>;
  save: jest.Mock<Promise<T>, [T]>;
  find: jest.Mock<Promise<T[]>, [unknown?]>;
  findOneBy: jest.Mock<Promise<T | null>, [Partial<T>]>;
  merge: jest.Mock<T, [T, Partial<T>]>;
  softDelete: jest.Mock<Promise<unknown>, [Partial<T>]>;
};

type MockClientsService = {
  findOneOwnedByUser: jest.Mock<Promise<Client | null>, [string, string]>;
};

type MockOrdersService = {
  findOneOwnedByUser: jest.Mock<Promise<Order | null>, [number, string]>;
};

type MockEventsService = {
  createEvent: jest.Mock<Promise<unknown>, [EventType, Spent, Record<string, unknown> | undefined, number | null | undefined]>;
  updateEventPayload: jest.Mock<Promise<unknown>, [EventType, string, number, Spent, Record<string, unknown> | undefined]>;
};

const createRepositoryMock = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  merge: jest.fn(),
  softDelete: jest.fn(),
});

describe('SpentsService', () => {
  let service: SpentsService;
  let repository: MockRepository<Spent>;
  let clientsService: MockClientsService;
  let ordersService: MockOrdersService;
  let eventsService: MockEventsService;

  beforeEach(() => {
    repository = createRepositoryMock<Spent>();
    clientsService = { findOneOwnedByUser: jest.fn() };
    ordersService = { findOneOwnedByUser: jest.fn() };
    eventsService = { createEvent: jest.fn(), updateEventPayload: jest.fn() };
    clientsService.findOneOwnedByUser.mockResolvedValue({
      id: 'client-1',
      name: 'Client One',
      status: 'individual',
      company: null,
    } as Client);

    service = new SpentsService(
      repository as unknown as Repository<Spent>,
      clientsService as unknown as ClientsService,
      ordersService as unknown as OrdersService,
      eventsService as unknown as EventsService,
    );
  });

  it('creates and saves a spent record for an owned client and order', async () => {
    const dto: CreateSpentDto = {
      client_id: 'client-1',
      order_id: 2001,
      value: 1500,
    };
    const createdSpent = {
      id: 1,
      user_id: 'user-1',
      ...dto,
      value: '1500.00',
    } as unknown as Spent;

    ordersService.findOneOwnedByUser.mockResolvedValue({
      id: 2001,
      client_id: 'client-1',
      title: 'Order One',
      status: 'created',
    } as Order);
    repository.create.mockReturnValue(createdSpent);
    repository.save.mockResolvedValue(createdSpent);
    eventsService.createEvent.mockResolvedValue({ id: 101 });

    await expect(service.create(dto, 'user-1')).resolves.toEqual(createdSpent);
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      user_id: 'user-1',
      value: '1500.00',
    });
    expect(eventsService.createEvent).toHaveBeenCalledWith(
      EventType.SPENT_CREATED,
      createdSpent,
      {
        client_name: 'Client One',
        client_status: 'individual',
        client_company: null,
        order_title: 'Order One',
        order_status: 'created',
      },
      createdSpent.id,
    );
  });

  it('rejects spent creation when order belongs to another client', async () => {
    clientsService.findOneOwnedByUser.mockResolvedValue({ id: 'client-1' } as Client);
    ordersService.findOneOwnedByUser.mockResolvedValue({
      id: 2001,
      client_id: 'client-2',
    } as Order);

    await expect(
      service.create(
        {
          client_id: 'client-1',
          order_id: 2001,
          value: 100,
        },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns all spent records for the user', async () => {
    const spents = [{ id: 1 }, { id: 2 }] as Spent[];
    repository.find.mockResolvedValue(spents);

    await expect(service.findAll('user-1')).resolves.toEqual(spents);
    expect(repository.find).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      order: { created_at: 'DESC' },
    });
  });

  it('updates an existing spent record', async () => {
    const existingSpent = {
      id: 1,
      user_id: 'user-1',
      client_id: 'client-1',
      order_id: 2001,
      value: '1000.00',
    } as Spent;
    const dto: UpdateSpentDto = { value: 500 };
    const mergedSpent = { ...existingSpent, value: '500.00' } as unknown as Spent;

    repository.findOneBy.mockResolvedValue(existingSpent);
    ordersService.findOneOwnedByUser.mockResolvedValue({
      id: 2001,
      client_id: 'client-1',
    } as Order);
    repository.merge.mockReturnValue(mergedSpent);
    repository.save.mockResolvedValue(mergedSpent);
    eventsService.updateEventPayload.mockResolvedValue(mergedSpent);

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedSpent);
    expect(repository.merge).toHaveBeenCalledWith(existingSpent, {
      value: '500.00',
    });
    expect(eventsService.createEvent).toHaveBeenCalledWith(
      EventType.SPENT_UPDATED,
      mergedSpent,
      {
        client_name: 'Client One',
        client_status: 'individual',
        client_company: null,
        order_title: null,
        order_status: null,
      },
      mergedSpent.id,
    );
  });

  it('soft deletes a spent record when it exists', async () => {
    const spent = { id: 1, user_id: 'user-1', client_id: 'client-1', order_id: 2001 } as Spent;
    repository.findOneBy.mockResolvedValue(spent);
    ordersService.findOneOwnedByUser.mockResolvedValue({
      id: 2001,
      client_id: 'client-1',
    } as Order);
    repository.softDelete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1, 'user-1')).resolves.toEqual(spent);
    expect(repository.softDelete).toHaveBeenCalledWith({ id: 1, user_id: 'user-1' });
  });
});

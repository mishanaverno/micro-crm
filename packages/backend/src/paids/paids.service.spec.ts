import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { ClientsService } from '../clients/clients.service';
import { EventType } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { CreatePaidDto } from './dto/create-paid.dto';
import { UpdatePaidDto } from './dto/update-paid.dto';
import { Paid } from './entities/paid.entity';
import { PaidsService } from './paids.service';

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
  createEvent: jest.Mock<Promise<unknown>, [unknown, unknown, (Record<string, unknown> | undefined)?]>;
  updateEventPayload: jest.Mock<Promise<unknown>, [unknown, string, number, unknown]>;
};

const createRepositoryMock = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  merge: jest.fn(),
  softDelete: jest.fn(),
});

describe('PaidsService', () => {
  let service: PaidsService;
  let repository: MockRepository<Paid>;
  let clientsService: MockClientsService;
  let ordersService: MockOrdersService;
  let eventsService: MockEventsService;

  beforeEach(() => {
    repository = createRepositoryMock<Paid>();
    clientsService = { findOneOwnedByUser: jest.fn() };
    ordersService = { findOneOwnedByUser: jest.fn() };
    eventsService = { createEvent: jest.fn(), updateEventPayload: jest.fn() };
    eventsService.createEvent.mockResolvedValue(undefined);

    service = new PaidsService(
      repository as unknown as Repository<Paid>,
      clientsService as unknown as ClientsService,
      ordersService as unknown as OrdersService,
      eventsService as unknown as EventsService,
    );
  });

  it('creates and saves a paid record for an owned client and order', async () => {
    const dto: CreatePaidDto = {
      client_id: 'client-1',
      order_id: 2001,
      value: 1500,
    };
    const createdPaid = {
      id: 1,
      user_id: 'user-1',
      ...dto,
      value: '1500.00',
    } as unknown as Paid;

    clientsService.findOneOwnedByUser.mockResolvedValue({ id: 'client-1' } as Client);
    ordersService.findOneOwnedByUser.mockResolvedValue({
      id: 2001,
      client_id: 'client-1',
    } as Order);
    repository.create.mockReturnValue(createdPaid);
    repository.save.mockResolvedValue(createdPaid);

    await expect(service.create(dto, 'user-1')).resolves.toEqual(createdPaid);
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      user_id: 'user-1',
      value: '1500.00',
    });
    expect(eventsService.createEvent).toHaveBeenCalledWith(
      EventType.PAID,
      createdPaid,
      undefined,
      createdPaid.id,
    );
  });

  it('rejects paid creation when order belongs to another client', async () => {
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

  it('returns all paid records for the user', async () => {
    const paids = [{ id: 1 }, { id: 2 }] as Paid[];
    repository.find.mockResolvedValue(paids);

    await expect(service.findAll('user-1')).resolves.toEqual(paids);
    expect(repository.find).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      order: { created_at: 'DESC' },
    });
  });

  it('updates an existing paid record', async () => {
    const existingPaid = {
      id: 1,
      user_id: 'user-1',
      client_id: 'client-1',
      order_id: 2001,
      value: '1000.00',
    } as Paid;
    const dto: UpdatePaidDto = { value: 500 };
    const mergedPaid = { ...existingPaid, value: '500.00' } as unknown as Paid;

    repository.findOneBy.mockResolvedValue(existingPaid);
    ordersService.findOneOwnedByUser.mockResolvedValue({
      id: 2001,
      client_id: 'client-1',
    } as Order);
    repository.merge.mockReturnValue(mergedPaid);
    repository.save.mockResolvedValue(mergedPaid);
    eventsService.updateEventPayload.mockResolvedValue(undefined);

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedPaid);
    expect(repository.merge).toHaveBeenCalledWith(existingPaid, {
      value: '500.00',
    });
    expect(eventsService.updateEventPayload).toHaveBeenCalledWith(
      EventType.PAID,
      'user-1',
      mergedPaid.id,
      mergedPaid,
    );
  });

  it('soft deletes a paid record when it exists', async () => {
    const paid = { id: 1, user_id: 'user-1' } as Paid;
    repository.findOneBy.mockResolvedValue(paid);
    repository.softDelete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1, 'user-1')).resolves.toEqual(paid);
    expect(repository.softDelete).toHaveBeenCalledWith({ id: 1, user_id: 'user-1' });
  });
});

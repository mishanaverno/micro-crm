import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { ClientsService } from '../clients/clients.service';
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

  beforeEach(() => {
    repository = createRepositoryMock<Spent>();
    clientsService = { findOneOwnedByUser: jest.fn() };
    ordersService = { findOneOwnedByUser: jest.fn() };

    service = new SpentsService(
      repository as unknown as Repository<Spent>,
      clientsService as unknown as ClientsService,
      ordersService as unknown as OrdersService,
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

    clientsService.findOneOwnedByUser.mockResolvedValue({ id: 'client-1' } as Client);
    ordersService.findOneOwnedByUser.mockResolvedValue({
      id: 2001,
      client_id: 'client-1',
    } as Order);
    repository.create.mockReturnValue(createdSpent);
    repository.save.mockResolvedValue(createdSpent);

    await expect(service.create(dto, 'user-1')).resolves.toEqual(createdSpent);
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      user_id: 'user-1',
      value: '1500.00',
    });
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

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedSpent);
    expect(repository.merge).toHaveBeenCalledWith(existingSpent, {
      value: '500.00',
    });
  });

  it('soft deletes a spent record when it exists', async () => {
    const spent = { id: 1, user_id: 'user-1' } as Spent;
    repository.findOneBy.mockResolvedValue(spent);
    repository.softDelete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1, 'user-1')).resolves.toEqual(spent);
    expect(repository.softDelete).toHaveBeenCalledWith({ id: 1, user_id: 'user-1' });
  });
});

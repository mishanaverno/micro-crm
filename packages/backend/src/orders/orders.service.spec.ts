import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { ClientsService } from '../clients/clients.service';
import { EventType } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrdersService } from './orders.service';

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

type MockEventsService = {
  createEvent: jest.Mock<Promise<unknown>, [unknown, unknown]>;
};

const createRepositoryMock = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  merge: jest.fn(),
  softDelete: jest.fn(),
});

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: MockRepository<Order>;
  let clientsService: MockClientsService;
  let eventsService: MockEventsService;

  beforeEach(() => {
    repository = createRepositoryMock<Order>();
    clientsService = {
      findOneOwnedByUser: jest.fn(),
    };
    eventsService = {
      createEvent: jest.fn(),
    };
    eventsService.createEvent.mockResolvedValue(undefined);

    service = new OrdersService(
      repository as unknown as Repository<Order>,
      clientsService as unknown as ClientsService,
      eventsService as unknown as EventsService,
    );
  });

  it('creates and saves an order for an owned client', async () => {
    const dto: CreateOrderDto = {
      client_id: 'client-1',
      price: 15000,
      content: 'Landing page redesign',
      status: OrderStatus.CREATED,
    };
    const createdOrder = {
      id: 1,
      user_id: 'user-1',
      ...dto,
      price: '15000.00',
    } as unknown as Order;

    clientsService.findOneOwnedByUser.mockResolvedValue({ id: 'client-1' } as Client);
    repository.create.mockReturnValue(createdOrder);
    repository.save.mockResolvedValue(createdOrder);

    await expect(service.create(dto, 'user-1')).resolves.toEqual(createdOrder);
    expect(clientsService.findOneOwnedByUser).toHaveBeenCalledWith('client-1', 'user-1');
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      user_id: 'user-1',
      price: '15000.00',
    });
    expect(repository.save).toHaveBeenCalledWith(createdOrder);
    expect(eventsService.createEvent).toHaveBeenCalledWith(EventType.ORDER_CREATED, createdOrder);
  });

  it('rejects order creation when client does not belong to the user', async () => {
    clientsService.findOneOwnedByUser.mockResolvedValue(null);

    await expect(
      service.create(
        {
          client_id: 'client-1',
          price: 1200,
          content: 'Setup',
        },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns all orders for the user', async () => {
    const orders = [{ id: 1 }, { id: 2 }] as Order[];
    repository.find.mockResolvedValue(orders);

    await expect(service.findAll('user-1')).resolves.toEqual(orders);
    expect(repository.find).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      order: { created_at: 'DESC' },
    });
  });

  it('returns orders filtered by client', async () => {
    const orders = [{ id: 1, client_id: 'client-1' }] as Order[];
    repository.find.mockResolvedValue(orders);

    await expect(service.findAll('user-1', 'client-1')).resolves.toEqual(orders);
    expect(repository.find).toHaveBeenCalledWith({
      where: { user_id: 'user-1', client_id: 'client-1' },
      order: { created_at: 'DESC' },
    });
  });

  it('returns one order by id and user', async () => {
    const order = { id: 1, user_id: 'user-1' } as Order;
    repository.findOneBy.mockResolvedValue(order);

    await expect(service.findOne(1, 'user-1')).resolves.toEqual(order);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1, user_id: 'user-1' });
  });

  it('updates an existing order', async () => {
    const existingOrder = {
      id: 1,
      user_id: 'user-1',
      client_id: 'client-1',
      price: '1000.00',
      content: 'Old',
      status: OrderStatus.CREATED,
    } as Order;
    const dto: UpdateOrderDto = { content: 'Updated', price: 2000 };
    const mergedOrder = { ...existingOrder, ...dto, price: '2000.00' } as unknown as Order;

    repository.findOneBy.mockResolvedValue(existingOrder);
    repository.merge.mockReturnValue(mergedOrder);
    repository.save.mockResolvedValue(mergedOrder);

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedOrder);
    expect(repository.merge).toHaveBeenCalledWith(existingOrder, {
      ...dto,
      price: '2000.00',
    });
    expect(repository.save).toHaveBeenCalledWith(mergedOrder);
    expect(eventsService.createEvent).toHaveBeenCalledWith(EventType.ORDER_UPDATED, mergedOrder);
  });

  it('validates client ownership when moving an order to another client', async () => {
    const existingOrder = {
      id: 1,
      user_id: 'user-1',
      client_id: 'client-1',
      price: '1000.00',
      content: 'Old',
      status: OrderStatus.CREATED,
    } as Order;
    const dto: UpdateOrderDto = { client_id: 'client-2' };
    const mergedOrder = { ...existingOrder, ...dto } as Order;

    repository.findOneBy.mockResolvedValue(existingOrder);
    clientsService.findOneOwnedByUser.mockResolvedValue({ id: 'client-2' } as Client);
    repository.merge.mockReturnValue(mergedOrder);
    repository.save.mockResolvedValue(mergedOrder);

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedOrder);
    expect(clientsService.findOneOwnedByUser).toHaveBeenCalledWith('client-2', 'user-1');
  });

  it('throws when updating a missing order', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(
      service.update(999, 'user-1', { content: 'Updated' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('soft deletes an order when it exists', async () => {
    const order = { id: 1, user_id: 'user-1' } as Order;
    repository.findOneBy.mockResolvedValue(order);
    repository.softDelete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1, 'user-1')).resolves.toEqual(order);
    expect(repository.softDelete).toHaveBeenCalledWith({ id: 1, user_id: 'user-1' });
  });

  it('throws when deleting a missing order', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.remove(999, 'user-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.softDelete).not.toHaveBeenCalled();
  });
});

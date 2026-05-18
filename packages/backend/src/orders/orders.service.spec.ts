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
  createEvent: jest.Mock<Promise<unknown>, [unknown, unknown, (Record<string, unknown> | undefined)?]>;
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
    clientsService.findOneOwnedByUser.mockResolvedValue({
      id: 'client-1',
      name: 'Client One',
      status: 'individual',
      company: null,
    } as Client);

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
    expect(eventsService.createEvent).toHaveBeenCalledWith(
      EventType.ORDER_CREATED,
      createdOrder,
      {
        client_name: 'Client One',
        client_status: 'individual',
        client_company: null,
      },
    );
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
      price: '2000.00',
      content: 'Updated',
    });
    expect(repository.save).toHaveBeenCalledWith(mergedOrder);
    expect(eventsService.createEvent).toHaveBeenCalledWith(
      EventType.ORDER_UPDATED,
      mergedOrder,
      {
        client_name: 'Client One',
        client_status: 'individual',
        client_company: null,
        changed_fields: [
          {
            field: 'price',
            from: '1000.00',
            to: '2000.00',
          },
          {
            field: 'content',
            from: 'Old',
            to: 'Updated',
          },
        ],
      },
    );
  });

  it('tracks changed fields even when repository.merge mutates the source order', async () => {
    const existingOrder = {
      id: 1,
      user_id: 'user-1',
      client_id: 'client-1',
      title: 'Initial title',
      price: '1000.00',
      content: 'Old',
      status: OrderStatus.CREATED,
    } as Order;
    const dto: UpdateOrderDto = { title: 'New title', status: OrderStatus.DONE };

    repository.findOneBy.mockResolvedValue(existingOrder);
    repository.merge.mockImplementation((target, patch) => Object.assign(target, patch));
    repository.save.mockImplementation(async (value) => value);

    await service.update(1, 'user-1', dto);

    expect(eventsService.createEvent).toHaveBeenCalledWith(
      EventType.ORDER_COMPLETE,
      existingOrder,
      {
        client_name: 'Client One',
        client_status: 'individual',
        client_company: null,
        changed_fields: [
          {
            field: 'title',
            from: 'Initial title',
            to: 'New title',
          },
          {
            field: 'status',
            from: OrderStatus.CREATED,
            to: OrderStatus.DONE,
          },
        ],
      },
    );
  });

  it('creates an order_complete event when status transitions to done', async () => {
    const existingOrder = {
      id: 1,
      user_id: 'user-1',
      client_id: 'client-1',
      title: 'Initial title',
      price: '1000.00',
      content: 'Old',
      status: OrderStatus.INPROGRESS,
    } as Order;
    const dto: UpdateOrderDto = { status: OrderStatus.DONE };
    const mergedOrder = { ...existingOrder, status: OrderStatus.DONE } as Order;

    repository.findOneBy.mockResolvedValue(existingOrder);
    repository.merge.mockReturnValue(mergedOrder);
    repository.save.mockResolvedValue(mergedOrder);

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedOrder);
    expect(eventsService.createEvent).toHaveBeenCalledWith(
      EventType.ORDER_COMPLETE,
      mergedOrder,
      {
        client_name: 'Client One',
        client_status: 'individual',
        client_company: null,
        changed_fields: [
          {
            field: 'status',
            from: OrderStatus.INPROGRESS,
            to: OrderStatus.DONE,
          },
        ],
      },
    );
  });

  it('creates an order_reopened event when status changes from done to another value', async () => {
    const existingOrder = {
      id: 1,
      user_id: 'user-1',
      client_id: 'client-1',
      title: 'Initial title',
      price: '1000.00',
      content: 'Old',
      status: OrderStatus.DONE,
    } as Order;
    const dto: UpdateOrderDto = { status: OrderStatus.INPROGRESS };
    const mergedOrder = { ...existingOrder, status: OrderStatus.INPROGRESS } as Order;

    repository.findOneBy.mockResolvedValue(existingOrder);
    repository.merge.mockReturnValue(mergedOrder);
    repository.save.mockResolvedValue(mergedOrder);

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedOrder);
    expect(eventsService.createEvent).toHaveBeenCalledWith(
      EventType.ORDER_REOPENED,
      mergedOrder,
      {
        client_name: 'Client One',
        client_status: 'individual',
        client_company: null,
        changed_fields: [
          {
            field: 'status',
            from: OrderStatus.DONE,
            to: OrderStatus.INPROGRESS,
          },
        ],
      },
    );
  });

  it('ignores client changes on update', async () => {
    const existingOrder = {
      id: 1,
      user_id: 'user-1',
      client_id: 'client-1',
      price: '1000.00',
      content: 'Old',
      status: OrderStatus.CREATED,
    } as Order;
    const dto = { client_id: 'client-2' } as unknown as UpdateOrderDto;

    repository.findOneBy.mockResolvedValue(existingOrder);

    const mergedOrder = { ...existingOrder } as Order;

    repository.merge.mockReturnValue(mergedOrder);
    repository.save.mockResolvedValue(mergedOrder);

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedOrder);
    expect(repository.merge).toHaveBeenCalledWith(existingOrder, {});
    expect(repository.save).toHaveBeenCalledWith(mergedOrder);
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

import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { ClientsService } from '../clients/clients.service';
import { EventType } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Reminder } from './entities/reminder.entity';
import { RemindersService } from './reminders.service';

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
  updateEventPayload: jest.Mock<Promise<unknown>, [unknown, string, number, unknown]>;
};

const createRepositoryMock = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
});

describe('RemindersService', () => {
  let service: RemindersService;
  let repository: MockRepository<Reminder>;
  let clientsService: MockClientsService;
  let eventsService: MockEventsService;
  let ordersService: MockOrdersService;

  beforeEach(() => {
    repository = createRepositoryMock<Reminder>();
    clientsService = { findOneOwnedByUser: jest.fn() };
    eventsService = { createEvent: jest.fn(), updateEventPayload: jest.fn() };
    ordersService = { findOneOwnedByUser: jest.fn() };
    eventsService.createEvent.mockResolvedValue(undefined);
    clientsService.findOneOwnedByUser.mockResolvedValue({
      id: 'client-1',
      name: 'Client One',
      status: 'individual',
      company: null,
    } as Client);

    service = new RemindersService(
      repository as unknown as Repository<Reminder>,
      clientsService as unknown as ClientsService,
      eventsService as unknown as EventsService,
      ordersService as unknown as OrdersService,
    );
  });

  it('creates and saves a reminder for an owned client', async () => {
    const dto: CreateReminderDto = {
      client_id: 'client-1',
      content: 'Ping the client in the morning',
      timestamp: '2026-05-20T10:30:00.000Z',
    };
    const createdReminder = {
      id: 1,
      user_id: 'user-1',
      client_id: dto.client_id,
      content: dto.content,
      timestamp: new Date(dto.timestamp),
    } as Reminder;

    repository.create.mockReturnValue(createdReminder);
    repository.save.mockResolvedValue(createdReminder);

    await expect(service.create(dto, 'user-1')).resolves.toEqual(createdReminder);
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      user_id: 'user-1',
      timestamp: new Date(dto.timestamp),
    });
    expect(eventsService.createEvent).toHaveBeenCalledWith(
      EventType.REMINDER,
      createdReminder,
      {
        client_name: 'Client One',
        client_status: 'individual',
        client_company: null,
        order_title: null,
        order_status: null,
      },
      createdReminder.id,
    );
  });

  it('validates owned order when reminder is linked to an order', async () => {
    const dto: CreateReminderDto = {
      client_id: 'client-1',
      content: 'Follow up after the order review',
      timestamp: '2026-05-20T10:30:00.000Z',
      order_id: 2001,
    };
    const createdReminder = {
      id: 1,
      user_id: 'user-1',
      ...dto,
      timestamp: new Date(dto.timestamp),
    } as unknown as Reminder;

    ordersService.findOneOwnedByUser.mockResolvedValue({
      id: 2001,
      client_id: 'client-1',
    } as Order);
    repository.create.mockReturnValue(createdReminder);
    repository.save.mockResolvedValue(createdReminder);

    await expect(service.create(dto, 'user-1')).resolves.toEqual(createdReminder);
    expect(ordersService.findOneOwnedByUser).toHaveBeenCalledWith(2001, 'user-1');
  });

  it('returns all reminders for the user', async () => {
    const reminders = [{ id: 1 }, { id: 2 }] as Reminder[];
    repository.find.mockResolvedValue(reminders);

    await expect(service.findAll('user-1')).resolves.toEqual(reminders);
    expect(repository.find).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      order: { timestamp: 'ASC', created_at: 'DESC' },
    });
  });

  it('updates an existing reminder', async () => {
    const existingReminder = {
      id: 1,
      user_id: 'user-1',
      client_id: 'client-1',
      content: 'Old',
      order_id: null,
      timestamp: new Date('2026-05-20T10:30:00.000Z'),
    } as Reminder;
    const dto: UpdateReminderDto = {
      content: 'Updated',
      timestamp: '2026-05-21T09:00:00.000Z',
    };
    const mergedReminder = {
      ...existingReminder,
      content: 'Updated',
      timestamp: new Date('2026-05-21T09:00:00.000Z'),
    } as Reminder;

    repository.findOneBy.mockResolvedValue(existingReminder);
    repository.merge.mockReturnValue(mergedReminder);
    repository.save.mockResolvedValue(mergedReminder);
    eventsService.updateEventPayload.mockResolvedValue(undefined);

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedReminder);
    expect(repository.merge).toHaveBeenCalledWith(existingReminder, {
      ...dto,
      timestamp: new Date('2026-05-21T09:00:00.000Z'),
    });
    expect(eventsService.updateEventPayload).toHaveBeenCalledWith(
      EventType.REMINDER,
      'user-1',
      mergedReminder.id,
      mergedReminder,
      {
        client_name: 'Client One',
        client_status: 'individual',
        client_company: null,
        order_title: null,
        order_status: null,
      },
    );
  });

  it('throws when deleting a missing reminder', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.remove(999, 'user-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});

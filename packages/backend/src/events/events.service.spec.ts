import { Repository } from 'typeorm';
import { Event, EventType } from './entities/event.entity';
import { EventsService } from './events.service';

type MockRepository<T> = {
  create: jest.Mock<T, [Partial<T>]>;
  save: jest.Mock<Promise<T>, [T]>;
  find: jest.Mock<Promise<T[]>, [unknown?]>;
};

const createRepositoryMock = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

describe('EventsService', () => {
  let service: EventsService;
  let repository: MockRepository<Event>;

  beforeEach(() => {
    repository = createRepositoryMock<Event>();
    service = new EventsService(repository as unknown as Repository<Event>);
  });

  it('creates a client_created event snapshot', async () => {
    const instance = {
      user_id: 'user-1',
      client_id: 'client-1',
      getPayload: () => ({
        client_id: 'client-1',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        phone_number: '+1234567890',
        company: 'Acme Corp',
      }),
    };
    const event = { id: 1 } as Event;

    repository.create.mockReturnValue(event);
    repository.save.mockResolvedValue(event);

    await expect(service.createEvent(EventType.CLIENT_CREATED, instance)).resolves.toEqual(event);
    expect(repository.create).toHaveBeenCalledWith({
      user_id: 'user-1',
      client_id: 'client-1',
      type: EventType.CLIENT_CREATED,
      payload: {
        client_id: 'client-1',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        phone_number: '+1234567890',
        company: 'Acme Corp',
      },
    });
  });

  it('creates a note event with content in payload', async () => {
    const instance = {
      user_id: 'user-1',
      client_id: 'client-1',
      getPayload: () => ({
        note_id: 1,
        content: 'Important note',
      }),
    };
    const event = { id: 2 } as Event;

    repository.create.mockReturnValue(event);
    repository.save.mockResolvedValue(event);

    await expect(service.createEvent(EventType.NOTE, instance)).resolves.toEqual(event);
    expect(repository.create).toHaveBeenCalledWith({
      user_id: 'user-1',
      client_id: 'client-1',
      type: EventType.NOTE,
      payload: {
        note_id: 1,
        content: 'Important note',
      },
    });
  });

  it('creates an order_updated event with order payload', async () => {
    const instance = {
      user_id: 'user-1',
      client_id: 'client-1',
      getPayload: () => ({
        order_id: 1,
        price: '12000.00',
        content: 'Landing redesign',
        status: 'inprogress',
      }),
    };
    const event = { id: 3 } as Event;

    repository.create.mockReturnValue(event);
    repository.save.mockResolvedValue(event);

    await expect(
      service.createEvent(EventType.ORDER_UPDATED, instance, {
        changed_fields: [
          {
            field: 'status',
            from: 'created',
            to: 'inprogress',
          },
        ],
      }),
    ).resolves.toEqual(event);
    expect(repository.create).toHaveBeenCalledWith({
      user_id: 'user-1',
      client_id: 'client-1',
      type: EventType.ORDER_UPDATED,
      payload: {
        order_id: 1,
        price: '12000.00',
        content: 'Landing redesign',
        status: 'inprogress',
        changed_fields: [
          {
            field: 'status',
            from: 'created',
            to: 'inprogress',
          },
        ],
      },
    });
  });

  it('creates an order_complete event with order payload', async () => {
    const instance = {
      user_id: 'user-1',
      client_id: 'client-1',
      getPayload: () => ({
        order_id: 1,
        title: 'CRM onboarding',
        price: '12000.00',
        content: 'Landing redesign',
        status: 'done',
      }),
    };
    const event = { id: 5 } as Event;

    repository.create.mockReturnValue(event);
    repository.save.mockResolvedValue(event);

    await expect(
      service.createEvent(EventType.ORDER_COMPLETE, instance, {
        changed_fields: [
          {
            field: 'status',
            from: 'inprogress',
            to: 'done',
          },
        ],
      }),
    ).resolves.toEqual(event);
    expect(repository.create).toHaveBeenCalledWith({
      user_id: 'user-1',
      client_id: 'client-1',
      type: EventType.ORDER_COMPLETE,
      payload: {
        order_id: 1,
        title: 'CRM onboarding',
        price: '12000.00',
        content: 'Landing redesign',
        status: 'done',
        changed_fields: [
          {
            field: 'status',
            from: 'inprogress',
            to: 'done',
          },
        ],
      },
    });
  });

  it('creates an order_reopened event with order payload', async () => {
    const instance = {
      user_id: 'user-1',
      client_id: 'client-1',
      getPayload: () => ({
        order_id: 1,
        title: 'CRM onboarding',
        price: '12000.00',
        content: 'Landing redesign',
        status: 'inprogress',
      }),
    };
    const event = { id: 6 } as Event;

    repository.create.mockReturnValue(event);
    repository.save.mockResolvedValue(event);

    await expect(
      service.createEvent(EventType.ORDER_REOPENED, instance, {
        changed_fields: [
          {
            field: 'status',
            from: 'done',
            to: 'inprogress',
          },
        ],
      }),
    ).resolves.toEqual(event);
    expect(repository.create).toHaveBeenCalledWith({
      user_id: 'user-1',
      client_id: 'client-1',
      type: EventType.ORDER_REOPENED,
      payload: {
        order_id: 1,
        title: 'CRM onboarding',
        price: '12000.00',
        content: 'Landing redesign',
        status: 'inprogress',
        changed_fields: [
          {
            field: 'status',
            from: 'done',
            to: 'inprogress',
          },
        ],
      },
    });
  });

  it('returns recent events for the current user', async () => {
    const events = [{ id: 1 }, { id: 2 }] as Event[];
    repository.find.mockResolvedValue(events);

    await expect(service.findRecentByUser('user-1')).resolves.toEqual(events);
    expect(repository.find).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      order: { created_at: 'DESC' },
      take: 50,
    });
  });

  it('creates a paid event with value in payload', async () => {
    const instance = {
      user_id: 'user-1',
      client_id: 'client-1',
      getPayload: () => ({
        paid_id: 1,
        order_id: 2001,
        value: '-1500.00',
      }),
    };
    const event = { id: 4 } as Event;

    repository.create.mockReturnValue(event);
    repository.save.mockResolvedValue(event);

    await expect(service.createEvent(EventType.PAID, instance)).resolves.toEqual(event);
    expect(repository.create).toHaveBeenCalledWith({
      user_id: 'user-1',
      client_id: 'client-1',
      type: EventType.PAID,
      payload: {
        paid_id: 1,
        order_id: 2001,
        value: '-1500.00',
      },
    });
  });
});

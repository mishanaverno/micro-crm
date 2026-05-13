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
});

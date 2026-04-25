import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { Note } from '../notes/entities/note.entity';
import { Event, EventType } from './entities/event.entity';
import { EventsService } from './events.service';

type MockRepository<T> = {
  create: jest.Mock<T, [Partial<T>]>;
  save: jest.Mock<Promise<T>, [T]>;
};

const createRepositoryMock = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
});

describe('EventsService', () => {
  let service: EventsService;
  let repository: MockRepository<Event>;

  beforeEach(() => {
    repository = createRepositoryMock<Event>();
    service = new EventsService(repository as unknown as Repository<Event>);
  });

  it('creates a client_created event snapshot', async () => {
    const client = {
      id: 'client-1',
      user_id: 'user-1',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone_number: '+1234567890',
      company: 'Acme Corp',
    } as Client;
    const event = { id: 1 } as Event;

    repository.create.mockReturnValue(event);
    repository.save.mockResolvedValue(event);

    await expect(service.createClientCreatedEvent(client)).resolves.toEqual(event);
    expect(repository.create).toHaveBeenCalledWith({
      user_id: 'user-1',
      client_id: 'client-1',
      type: EventType.CLIENT_CREATED,
      comment: 'Client created',
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
    const note = {
      id: 1,
      user_id: 'user-1',
      client_id: 'client-1',
      content: 'Important note',
    } as Note;
    const event = { id: 2 } as Event;

    repository.create.mockReturnValue(event);
    repository.save.mockResolvedValue(event);

    await expect(service.createNoteCreatedEvent(note)).resolves.toEqual(event);
    expect(repository.create).toHaveBeenCalledWith({
      user_id: 'user-1',
      client_id: 'client-1',
      type: EventType.NOTE,
      comment: 'Note created',
      payload: {
        note_id: 1,
        content: 'Important note',
      },
    });
  });
});

import { Repository } from 'typeorm';
import { EventsService } from '../events/events.service';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

type MockRepository<T> = {
  create: jest.Mock<T, [Partial<T>]>;
  save: jest.Mock<Promise<T>, [T]>;
  find: jest.Mock<Promise<T[]>, []>;
  findOneBy: jest.Mock<Promise<T | null>, [Partial<T>]>;
  update: jest.Mock<Promise<unknown>, [string, Partial<T>]>;
  softDelete: jest.Mock<Promise<unknown>, [Partial<T>]>;
};

const createRepositoryMock = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

type MockEventsService = {
  createEvent: jest.Mock<Promise<unknown>, [unknown, unknown]>;
};

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: MockRepository<Client>;
  let eventsService: MockEventsService;

  beforeEach(() => {
    repository = createRepositoryMock<Client>();
    eventsService = {
      createEvent: jest.fn(),
    };
    eventsService.createEvent.mockResolvedValue(undefined);
    service = new ClientsService(
      repository as unknown as Repository<Client>,
      eventsService as unknown as EventsService,
    );
  });

  it('creates and saves a client', async () => {
    const dto: CreateClientDto = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone_number: '+1234567890',
      company: 'Acme Corp',
    };
    const createdClient = {
      id: 'client-1',
      user_id: 'user-1',
      ...dto,
    } as unknown as Client;

    repository.create.mockReturnValue(createdClient);
    repository.save.mockResolvedValue(createdClient);

    await expect(service.create(dto, 'user-1')).resolves.toEqual(createdClient);
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      user_id: 'user-1',
    });
    expect(repository.save).toHaveBeenCalledWith(createdClient);
    expect(eventsService.createEvent).toHaveBeenCalledTimes(1);
  });

  it('returns all clients', async () => {
    const clients = [{ id: 'client-1' }, { id: 'client-2' }] as Client[];
    repository.find.mockResolvedValue(clients);

    await expect(service.findAll()).resolves.toEqual(clients);
    expect(repository.find).toHaveBeenCalledTimes(1);
  });

  it('returns one client by id', async () => {
    const client = { id: 'client-1' } as Client;
    repository.findOneBy.mockResolvedValue(client);

    await expect(service.findOne('client-1')).resolves.toEqual(client);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'client-1' });
  });

  it('returns one client by id and owner', async () => {
    const client = { id: 'client-1', user_id: 'user-1' } as Client;
    repository.findOneBy.mockResolvedValue(client);

    await expect(service.findOneOwnedByUser('client-1', 'user-1')).resolves.toEqual(client);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'client-1', user_id: 'user-1' });
  });

  it('updates a client and returns the fresh record', async () => {
    const dto = { company: 'Updated Corp' } as UpdateClientDto;
    const updatedClient = { id: 'client-1', company: 'Updated Corp' } as Client;
    repository.update.mockResolvedValue({ affected: 1 });
    repository.findOneBy.mockResolvedValue(updatedClient);

    await expect(service.update('client-1', dto)).resolves.toEqual(updatedClient);
    expect(repository.update).toHaveBeenCalledWith('client-1', dto);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'client-1' });
  });

  it('deletes a client when it exists', async () => {
    const client = { id: 'client-1', user_id: 'user-1' } as Client;
    repository.findOneBy.mockResolvedValue(client);
    repository.softDelete.mockResolvedValue({ affected: 1 });

    await expect(service.remove('client-1', 'user-1')).resolves.toEqual(client);
    expect(repository.softDelete).toHaveBeenCalledWith({ id: 'client-1', user_id: 'user-1' });
  });

  it('does not delete a client when it does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.remove('missing-client', 'user-1')).resolves.toBeNull();
    expect(repository.softDelete).not.toHaveBeenCalled();
  });
});

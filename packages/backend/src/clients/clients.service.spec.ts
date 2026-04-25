import { Repository } from 'typeorm';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

type MockRepository<T> = {
  create: jest.Mock<T, [Partial<T>]>;
  save: jest.Mock<Promise<T>, [T]>;
  find: jest.Mock<Promise<T[]>, []>;
  findOneBy: jest.Mock<Promise<T | null>, [{ id: string }]>;
  update: jest.Mock<Promise<unknown>, [string, Partial<T>]>;
  delete: jest.Mock<Promise<unknown>, [string]>;
};

const createRepositoryMock = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: MockRepository<Client>;

  beforeEach(() => {
    repository = createRepositoryMock<Client>();
    service = new ClientsService(repository as unknown as Repository<Client>);
  });

  it('creates and saves a client', async () => {
    const dto: CreateClientDto = {
      user_id: '3529e0aa-794e-4edd-ab0e-07cce6e7f3eb',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone_number: '+1234567890',
      company: 'Acme Corp',
    };
    const createdClient = { id: 'client-1', ...dto } as unknown as Client;

    repository.create.mockReturnValue(createdClient);
    repository.save.mockResolvedValue(createdClient);

    await expect(service.create(dto)).resolves.toEqual(createdClient);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(createdClient);
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
    const client = { id: 'client-1' } as Client;
    repository.findOneBy.mockResolvedValue(client);
    repository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove('client-1')).resolves.toEqual(client);
    expect(repository.delete).toHaveBeenCalledWith('client-1');
  });

  it('does not delete a client when it does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.remove('missing-client')).resolves.toBeNull();
    expect(repository.delete).not.toHaveBeenCalled();
  });
});

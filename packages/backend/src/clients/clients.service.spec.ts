import { Repository } from 'typeorm';
import { EventsService } from '../events/events.service';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, ClientStatus } from './entities/client.entity';

type MockRepository<T> = {
  create: jest.Mock<T, [Partial<T>]>;
  save: jest.Mock<Promise<T>, [T]>;
  find: jest.Mock<Promise<T[]>, [unknown?]>;
  findAndCount: jest.Mock<Promise<[T[], number]>, [unknown?]>;
  findOneBy: jest.Mock<Promise<T | null>, [Partial<T>]>;
  update: jest.Mock<Promise<unknown>, [string, Partial<T>]>;
  softDelete: jest.Mock<Promise<unknown>, [Partial<T>]>;
  createQueryBuilder: jest.Mock;
};

const createRepositoryMock = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

type MockEventsService = {
  createEvent: jest.Mock<Promise<unknown>, [unknown, unknown]>;
};

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: MockRepository<Client>;
  let eventsService: MockEventsService;
  let queryBuilder: {
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getMany: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  beforeEach(() => {
    repository = createRepositoryMock<Client>();
    eventsService = {
      createEvent: jest.fn(),
    };
    queryBuilder = {
      where: jest.fn(),
      andWhere: jest.fn(),
      orderBy: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      getMany: jest.fn(),
      getManyAndCount: jest.fn(),
    };
    queryBuilder.where.mockReturnValue(queryBuilder);
    queryBuilder.andWhere.mockReturnValue(queryBuilder);
    queryBuilder.orderBy.mockReturnValue(queryBuilder);
    queryBuilder.skip.mockReturnValue(queryBuilder);
    queryBuilder.take.mockReturnValue(queryBuilder);
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
    eventsService.createEvent.mockResolvedValue(undefined);
    service = new ClientsService(
      repository as unknown as Repository<Client>,
      eventsService as unknown as EventsService,
    );
  });

  it('creates and saves a client', async () => {
    const dto: CreateClientDto = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone_number: '+1234567890',
      company: 'Acme Corp',
      status: ClientStatus.LEGAL_ENTITY,
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
    expect(eventsService.createEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        user_id: 'user-1',
        client_id: 'client-1',
      }),
    );
  });

  it('returns all clients for the user', async () => {
    const clients = [{ id: 'client-1' }, { id: 'client-2' }] as Client[];
    queryBuilder.getMany.mockResolvedValue(clients);

    await expect(service.findAll('user-1')).resolves.toEqual(clients);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('client');
    expect(queryBuilder.where).toHaveBeenCalledWith('client.user_id = :userId', { userId: 'user-1' });
    expect(queryBuilder.orderBy).toHaveBeenCalledWith({ 'client.created_at': 'DESC' });
    expect(queryBuilder.getMany).toHaveBeenCalled();
  });

  it('returns paginated clients for the user', async () => {
    const clients = [{ id: 'client-1' }, { id: 'client-2' }] as Client[];
    queryBuilder.getManyAndCount.mockResolvedValue([clients, 12]);

    await expect(
      service.findAllPaginated('user-1', { page: 2, pageSize: 10 }),
    ).resolves.toEqual({
      items: clients,
      total: 12,
      page: 2,
      pageSize: 10,
    });
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('client');
    expect(queryBuilder.where).toHaveBeenCalledWith('client.user_id = :userId', { userId: 'user-1' });
    expect(queryBuilder.orderBy).toHaveBeenCalledWith({ 'client.created_at': 'DESC' });
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
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

import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

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

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository<User>;

  beforeEach(() => {
    repository = createRepositoryMock<User>();
    service = new UsersService(repository as unknown as Repository<User>);
  });

  it('creates and saves a user', async () => {
    const dto: CreateUserDto = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };
    const createdUser = { id: 'user-1', ...dto } as User;

    repository.create.mockReturnValue(createdUser);
    repository.save.mockResolvedValue(createdUser);

    await expect(service.create(dto)).resolves.toEqual(createdUser);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(createdUser);
  });

  it('returns all users', async () => {
    const users = [{ id: 'user-1' }, { id: 'user-2' }] as User[];
    repository.find.mockResolvedValue(users);

    await expect(service.findAll()).resolves.toEqual(users);
    expect(repository.find).toHaveBeenCalledTimes(1);
  });

  it('returns one user by id', async () => {
    const user = { id: 'user-1' } as User;
    repository.findOneBy.mockResolvedValue(user);

    await expect(service.findOne('user-1')).resolves.toEqual(user);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('updates a user and returns the fresh record', async () => {
    const dto: UpdateUserDto = { last_name: 'Updated' };
    const updatedUser = { id: 'user-1', last_name: 'Updated' } as User;
    repository.update.mockResolvedValue({ affected: 1 });
    repository.findOneBy.mockResolvedValue(updatedUser);

    await expect(service.update('user-1', dto)).resolves.toEqual(updatedUser);
    expect(repository.update).toHaveBeenCalledWith('user-1', dto);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('deletes a user when it exists', async () => {
    const user = { id: 'user-1' } as User;
    repository.findOneBy.mockResolvedValue(user);
    repository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove('user-1')).resolves.toEqual(user);
    expect(repository.delete).toHaveBeenCalledWith('user-1');
  });

  it('does not delete a user when it does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.remove('missing-user')).resolves.toBeNull();
    expect(repository.delete).not.toHaveBeenCalled();
  });
});

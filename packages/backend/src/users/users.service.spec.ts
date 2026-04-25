import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PasswordService } from './password.service';

type MockRepository<T> = {
  create: jest.Mock<T, [Partial<T>]>;
  save: jest.Mock<Promise<T>, [T]>;
  find: jest.Mock<Promise<T[]>, []>;
  findOneBy: jest.Mock<Promise<T | null>, [Partial<T>]>;
  update: jest.Mock<Promise<unknown>, [string, Partial<T>]>;
  delete: jest.Mock<Promise<unknown>, [string]>;
};

type MockPasswordService = {
  hash: jest.Mock<Promise<string>, [string]>;
  verify: jest.Mock<Promise<boolean>, [string, string]>;
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
  let passwordService: MockPasswordService;

  beforeEach(() => {
    repository = createRepositoryMock<User>();
    passwordService = {
      hash: jest.fn(),
      verify: jest.fn(),
    };
    service = new UsersService(
      repository as unknown as Repository<User>,
      passwordService as unknown as PasswordService,
    );
  });

  it('creates and saves a user', async () => {
    const dto: CreateUserDto = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };
    const createdUser = { id: 'user-1', ...dto, password: 'hashed-password' } as User;

    passwordService.hash.mockResolvedValue('hashed-password');
    repository.create.mockReturnValue(createdUser);
    repository.save.mockResolvedValue(createdUser);

    await expect(service.create(dto)).resolves.toEqual(createdUser);
    expect(passwordService.hash).toHaveBeenCalledWith(dto.password);
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      password: 'hashed-password',
    });
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

  it('hashes password during update when password is present', async () => {
    const dto: UpdateUserDto = { password: 'new-password' };
    const updatedUser = { id: 'user-1' } as User;

    passwordService.hash.mockResolvedValue('hashed-new-password');
    repository.update.mockResolvedValue({ affected: 1 });
    repository.findOneBy.mockResolvedValue(updatedUser);

    await expect(service.update('user-1', dto)).resolves.toEqual(updatedUser);
    expect(repository.update).toHaveBeenCalledWith('user-1', {
      password: 'hashed-new-password',
    });
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

  it('finds a user by email', async () => {
    const user = { id: 'user-1', email: 'john@example.com' } as User;
    repository.findOneBy.mockResolvedValue(user);

    await expect(service.findByEmail('john@example.com')).resolves.toEqual(user);
    expect(repository.findOneBy).toHaveBeenCalledWith({ email: 'john@example.com' });
  });

  it('stores hashed refresh token', async () => {
    passwordService.hash.mockResolvedValue('hashed-refresh-token');
    repository.update.mockResolvedValue({ affected: 1 });

    await service.storeRefreshToken('user-1', 'refresh-token');
    expect(passwordService.hash).toHaveBeenCalledWith('refresh-token');
    expect(repository.update).toHaveBeenCalledWith('user-1', {
      hashed_refresh_token: 'hashed-refresh-token',
    });
  });

  it('verifies password via password service', async () => {
    const user = { id: 'user-1', password: 'hashed-password' } as User;
    passwordService.verify.mockResolvedValue(true);

    await expect(service.verifyPassword(user, 'password123')).resolves.toBe(true);
    expect(passwordService.verify).toHaveBeenCalledWith('password123', 'hashed-password');
  });

  it('verifies refresh token via password service', async () => {
    const user = { id: 'user-1', hashed_refresh_token: 'hashed-token' } as User;
    passwordService.verify.mockResolvedValue(true);

    await expect(service.verifyRefreshToken(user, 'refresh-token')).resolves.toBe(true);
    expect(passwordService.verify).toHaveBeenCalledWith('refresh-token', 'hashed-token');
  });

  it('clears refresh token', async () => {
    repository.update.mockResolvedValue({ affected: 1 });

    await service.clearRefreshToken('user-1');
    expect(repository.update).toHaveBeenCalledWith('user-1', {
      hashed_refresh_token: null,
    });
  });
});

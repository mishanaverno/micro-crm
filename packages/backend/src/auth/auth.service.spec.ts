import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

type MockUsersService = {
  create: jest.Mock;
  findByEmail: jest.Mock;
  findOne: jest.Mock;
  verifyPassword: jest.Mock;
  storeRefreshToken: jest.Mock;
  verifyRefreshToken: jest.Mock;
  clearRefreshToken: jest.Mock;
};

type MockJwtService = {
  signAsync: jest.Mock;
  verifyAsync: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: MockUsersService;
  let jwtService: MockJwtService;

  const user = {
    id: 'user-1',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    password: 'hashed-password',
    hashed_refresh_token: 'hashed-refresh-token',
  } as User;

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findOne: jest.fn(),
      verifyPassword: jest.fn(),
      storeRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      clearRefreshToken: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it('registers a new user and returns tokens', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
    usersService.storeRefreshToken.mockResolvedValue(undefined);

    await expect(
      service.register({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      }),
    ).resolves.toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user,
    });
  });

  it('logs in a valid user', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    usersService.verifyPassword.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
    usersService.storeRefreshToken.mockResolvedValue(undefined);

    await expect(
      service.login({
        email: 'john@example.com',
        password: 'password123',
      }),
    ).resolves.toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user,
    });
  });

  it('rejects invalid login credentials', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    usersService.verifyPassword.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'john@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshes tokens for a valid refresh token', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: user.id, email: user.email });
    usersService.findOne.mockResolvedValue(user);
    usersService.verifyRefreshToken.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValueOnce('new-access-token').mockResolvedValueOnce('new-refresh-token');
    usersService.storeRefreshToken.mockResolvedValue(undefined);

    await expect(service.refreshTokens('refresh-token')).resolves.toEqual({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      user,
    });
  });

  it('logs out user by clearing refresh token', async () => {
    usersService.clearRefreshToken.mockResolvedValue(undefined);

    await expect(service.logout(user.id)).resolves.toEqual({ success: true });
    expect(usersService.clearRefreshToken).toHaveBeenCalledWith(user.id);
  });
});

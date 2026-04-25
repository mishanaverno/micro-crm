import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

describe('CreateUserDto', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreateUserDto, {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects empty and invalid fields', async () => {
    const dto = plainToInstance(CreateUserDto, {
      first_name: '',
      last_name: '',
      email: 'not-an-email',
      password: '123',
    });

    const errors = await validate(dto);
    const fields = errors.map((error) => error.property);

    expect(fields).toEqual(
      expect.arrayContaining(['first_name', 'last_name', 'email', 'password']),
    );
  });
});

describe('UpdateUserDto', () => {
  it('allows partial updates', async () => {
    const dto = plainToInstance(UpdateUserDto, {
      email: 'updated@example.com',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});

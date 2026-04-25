import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateClientDto } from './create-client.dto';
import { UpdateClientDto } from './update-client.dto';

describe('CreateClientDto', () => {
  it('accepts a valid payload with optional fields', async () => {
    const dto = plainToInstance(CreateClientDto, {
      user_id: '3529e0aa-794e-4edd-ab0e-07cce6e7f3eb',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone_number: '+1234567890',
      company: 'Acme Corp',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('accepts a valid payload without optional fields', async () => {
    const dto = plainToInstance(CreateClientDto, {
      user_id: '3529e0aa-794e-4edd-ab0e-07cce6e7f3eb',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects invalid required fields', async () => {
    const dto = plainToInstance(CreateClientDto, {
      user_id: '',
      first_name: '',
      last_name: '',
      email: 'not-an-email',
    });

    const errors = await validate(dto);
    const fields = errors.map((error) => error.property);

    expect(fields).toEqual(
      expect.arrayContaining(['user_id', 'first_name', 'last_name', 'email']),
    );
  });
});

describe('UpdateClientDto', () => {
  it('allows partial updates', async () => {
    const dto = plainToInstance(UpdateClientDto, {
      company: 'Updated Corp',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});

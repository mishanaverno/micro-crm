import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateClientDto } from './create-client.dto';
import { UpdateClientDto } from './update-client.dto';
import { ClientStatus } from '../entities/client.entity';

describe('CreateClientDto', () => {
  it('accepts a valid payload with optional fields', async () => {
    const dto = plainToInstance(CreateClientDto, {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone_number: '+1234567890',
      company: 'Acme Corp',
      status: ClientStatus.LEGAL_ENTITY,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('accepts a valid payload without optional fields', async () => {
    const dto = plainToInstance(CreateClientDto, {
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: ClientStatus.INDIVIDUAL,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects invalid required fields', async () => {
    const dto = plainToInstance(CreateClientDto, {
      name: '',
      email: 'not-an-email',
      status: 'wrong',
    });

    const errors = await validate(dto);
    const fields = errors.map((error) => error.property);

    expect(fields).toEqual(
      expect.arrayContaining(['name', 'email', 'status']),
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

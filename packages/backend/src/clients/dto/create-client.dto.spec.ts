import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateClientDto } from './create-client.dto';
import { UpdateClientDto } from './update-client.dto';

describe('CreateClientDto', () => {
  it('accepts a valid payload with optional fields', async () => {
    const dto = plainToInstance(CreateClientDto, {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phoneNumber: '+1234567890',
      company: 'Acme Corp',
      address: 'Main street',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('accepts a valid payload without optional fields', async () => {
    const dto = plainToInstance(CreateClientDto, {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects invalid required fields', async () => {
    const dto = plainToInstance(CreateClientDto, {
      firstName: '',
      lastName: '',
      email: 'not-an-email',
    });

    const errors = await validate(dto);
    const fields = errors.map((error) => error.property);

    expect(fields).toEqual(expect.arrayContaining(['firstName', 'lastName', 'email']));
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

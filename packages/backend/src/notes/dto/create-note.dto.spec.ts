import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateNoteDto } from './create-note.dto';
import { UpdateNoteDto } from './update-note.dto';

describe('CreateNoteDto', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreateNoteDto, {
      client_id: '22222222-2222-4222-8222-222222222221',
      content: 'Follow up next week',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects invalid required fields', async () => {
    const dto = plainToInstance(CreateNoteDto, {
      client_id: 'not-a-uuid',
      content: '',
    });

    const errors = await validate(dto);
    const fields = errors.map((error) => error.property);

    expect(fields).toEqual(expect.arrayContaining(['client_id', 'content']));
  });
});

describe('UpdateNoteDto', () => {
  it('allows partial updates', async () => {
    const dto = plainToInstance(UpdateNoteDto, {
      content: 'Updated note',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});

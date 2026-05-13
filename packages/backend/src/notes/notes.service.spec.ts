import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { ClientsService } from '../clients/clients.service';
import { EventsService } from '../events/events.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
import { NotesService } from './notes.service';

type MockRepository<T> = {
  create: jest.Mock<T, [Partial<T>]>;
  save: jest.Mock<Promise<T>, [T]>;
  find: jest.Mock<Promise<T[]>, [unknown?]>;
  findOneBy: jest.Mock<Promise<T | null>, [Partial<T>]>;
  merge: jest.Mock<T, [T, Partial<T>]>;
  delete: jest.Mock<Promise<unknown>, [Partial<T>]>;
};

type MockClientsService = {
  findOneOwnedByUser: jest.Mock<Promise<Client | null>, [string, string]>;
};

type MockEventsService = {
  createEvent: jest.Mock<Promise<unknown>, [unknown, unknown]>;
};

const createRepositoryMock = <T>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
});

describe('NotesService', () => {
  let service: NotesService;
  let repository: MockRepository<Note>;
  let clientsService: MockClientsService;
  let eventsService: MockEventsService;

  beforeEach(() => {
    repository = createRepositoryMock<Note>();
    clientsService = {
      findOneOwnedByUser: jest.fn(),
    };
    eventsService = {
      createEvent: jest.fn(),
    };
    eventsService.createEvent.mockResolvedValue(undefined);

    service = new NotesService(
      repository as unknown as Repository<Note>,
      clientsService as unknown as ClientsService,
      eventsService as unknown as EventsService,
    );
  });

  it('creates and saves a note for an owned client', async () => {
    const dto: CreateNoteDto = {
      client_id: 'client-1',
      content: 'Client asked to call tomorrow',
    };
    const createdNote = {
      id: 1,
      user_id: 'user-1',
      ...dto,
    } as Note;

    clientsService.findOneOwnedByUser.mockResolvedValue({ id: 'client-1' } as Client);
    repository.create.mockReturnValue(createdNote);
    repository.save.mockResolvedValue(createdNote);

    await expect(service.create(dto, 'user-1')).resolves.toEqual(createdNote);
    expect(clientsService.findOneOwnedByUser).toHaveBeenCalledWith('client-1', 'user-1');
    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      user_id: 'user-1',
    });
    expect(repository.save).toHaveBeenCalledWith(createdNote);
    expect(eventsService.createEvent).toHaveBeenCalledTimes(1);
  });

  it('rejects note creation when client does not belong to the user', async () => {
    clientsService.findOneOwnedByUser.mockResolvedValue(null);

    await expect(
      service.create({ client_id: 'client-1', content: 'Hidden note' }, 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns all notes for the user', async () => {
    const notes = [{ id: 1 }, { id: 2 }] as Note[];
    repository.find.mockResolvedValue(notes);

    await expect(service.findAll('user-1')).resolves.toEqual(notes);
    expect(repository.find).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      order: { created_at: 'DESC' },
    });
  });

  it('returns notes filtered by client', async () => {
    const notes = [{ id: 1, client_id: 'client-1' }] as Note[];
    repository.find.mockResolvedValue(notes);

    await expect(service.findAll('user-1', 'client-1')).resolves.toEqual(notes);
    expect(repository.find).toHaveBeenCalledWith({
      where: { user_id: 'user-1', client_id: 'client-1' },
      order: { created_at: 'DESC' },
    });
  });

  it('returns one note by id and user', async () => {
    const note = { id: 1, user_id: 'user-1' } as Note;
    repository.findOneBy.mockResolvedValue(note);

    await expect(service.findOne(1, 'user-1')).resolves.toEqual(note);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1, user_id: 'user-1' });
  });

  it('updates an existing note', async () => {
    const existingNote = { id: 1, user_id: 'user-1', client_id: 'client-1', content: 'Old' } as Note;
    const dto: UpdateNoteDto = { content: 'Updated' };
    const mergedNote = { ...existingNote, ...dto } as Note;

    repository.findOneBy.mockResolvedValue(existingNote);
    repository.merge.mockReturnValue(mergedNote);
    repository.save.mockResolvedValue(mergedNote);

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedNote);
    expect(repository.merge).toHaveBeenCalledWith(existingNote, dto);
    expect(repository.save).toHaveBeenCalledWith(mergedNote);
  });

  it('validates client ownership when moving a note to another client', async () => {
    const existingNote = { id: 1, user_id: 'user-1', client_id: 'client-1', content: 'Old' } as Note;
    const dto: UpdateNoteDto = { client_id: 'client-2' };
    const mergedNote = { ...existingNote, ...dto } as Note;

    repository.findOneBy.mockResolvedValue(existingNote);
    clientsService.findOneOwnedByUser.mockResolvedValue({ id: 'client-2' } as Client);
    repository.merge.mockReturnValue(mergedNote);
    repository.save.mockResolvedValue(mergedNote);

    await expect(service.update(1, 'user-1', dto)).resolves.toEqual(mergedNote);
    expect(clientsService.findOneOwnedByUser).toHaveBeenCalledWith('client-2', 'user-1');
  });

  it('throws when updating a missing note', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.update(999, 'user-1', { content: 'Updated' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('deletes a note when it exists', async () => {
    const note = { id: 1, user_id: 'user-1' } as Note;
    repository.findOneBy.mockResolvedValue(note);
    repository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1, 'user-1')).resolves.toEqual(note);
    expect(repository.delete).toHaveBeenCalledWith({ id: 1, user_id: 'user-1' });
  });

  it('throws when deleting a missing note', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.remove(999, 'user-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});

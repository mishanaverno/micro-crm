import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../clients/clients.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    private readonly clientsService: ClientsService,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    await this.ensureClientOwnership(createNoteDto.client_id, userId);

    const note = this.notesRepository.create({
      ...createNoteDto,
      user_id: userId,
    });

    return this.notesRepository.save(note);
  }

  findAll(userId: string, clientId?: string): Promise<Note[]> {
    if (clientId) {
      return this.notesRepository.find({
        where: { user_id: userId, client_id: clientId },
        order: { created_at: 'DESC' },
      });
    }

    return this.notesRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  findOne(id: number, userId: string): Promise<Note | null> {
    return this.notesRepository.findOneBy({ id, user_id: userId });
  }

  async update(id: number, userId: string, updateNoteDto: UpdateNoteDto): Promise<Note | null> {
    const note = await this.findOne(id, userId);

    if (!note) {
      return null;
    }

    if (updateNoteDto.client_id && updateNoteDto.client_id !== note.client_id) {
      await this.ensureClientOwnership(updateNoteDto.client_id, userId);
    }

    const updatedNote = this.notesRepository.merge(note, updateNoteDto);
    return this.notesRepository.save(updatedNote);
  }

  async remove(id: number, userId: string): Promise<Note | null> {
    const note = await this.findOne(id, userId);

    if (!note) {
      return null;
    }

    await this.notesRepository.delete({ id, user_id: userId });
    return note;
  }

  private async ensureClientOwnership(clientId: string, userId: string): Promise<void> {
    const client = await this.clientsService.findOneOwnedByUser(clientId, userId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }
  }
}

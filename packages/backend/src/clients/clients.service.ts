import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsService } from '../events/events.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { EventType } from '../events/entities/event.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private readonly eventsService: EventsService,
  ) {}

  async create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    const client = this.clientsRepository.create({
      ...createClientDto,
      user_id: userId,
    });
    const createdClient = await this.clientsRepository.save(client);
    await this.eventsService.createEvent(EventType.CLIENT_CREATED, {
        user_id: createdClient.user_id,
        client_id: createdClient.id,
        getPayload: () => { return {...createClientDto}}
    });
    return createdClient;
  }

  findAll(): Promise<Client[]> {
    return this.clientsRepository.find();
  }

  findOne(id: string): Promise<Client | null> {
    return this.clientsRepository.findOneBy({ id });
  }

  findOneOwnedByUser(id: string, userId: string): Promise<Client | null> {
    return this.clientsRepository.findOneBy({ id, user_id: userId });
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client | null> {
    await this.clientsRepository.update(id, updateClientDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<Client | null> {
    const client = await this.findOne(id);
    if (client) {
      await this.clientsRepository.delete(id);
    }
    return client;
  }
}

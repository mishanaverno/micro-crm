import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PasswordService } from './password.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.passwordService.hash(createUserDto.password);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const payload = { ...updateUserDto };

    if (payload.password) {
      payload.password = await this.passwordService.hash(payload.password);
    }

    await this.usersRepository.update(id, payload);
    return this.findOne(id);
  }

  async remove(id: string): Promise<User | null> {
    const user = await this.findOne(id);
    if (user) {
      await this.usersRepository.delete(id);
    }
    return user;
  }

  verifyPassword(user: User, password: string): Promise<boolean> {
    return this.passwordService.verify(password, user.password);
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await this.passwordService.hash(refreshToken);

    await this.usersRepository.update(userId, {
      hashed_refresh_token: hashedRefreshToken,
    });
  }

  verifyRefreshToken(user: User, refreshToken: string): Promise<boolean> {
    if (!user.hashed_refresh_token) {
      return Promise.resolve(false);
    }

    return this.passwordService.verify(refreshToken, user.hashed_refresh_token);
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      hashed_refresh_token: null,
    });
  }
}

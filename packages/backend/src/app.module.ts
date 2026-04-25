import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './config/typeorm.config';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeormConfig), UsersModule, ClientsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}


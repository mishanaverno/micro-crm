import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './config/typeorm.config';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { EventsModule } from './events/events.module';
import { OrdersModule } from './orders/orders.module';
import { PaidsModule } from './paids/paids.module';
import { SpentsModule } from './spents/spents.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    UsersModule,
    ClientsModule,
    AuthModule,
    NotesModule,
    EventsModule,
    OrdersModule,
    PaidsModule,
    SpentsModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

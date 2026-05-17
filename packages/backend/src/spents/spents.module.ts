import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';
import { EventsModule } from '../events/events.module';
import { OrdersModule } from '../orders/orders.module';
import { Spent } from './entities/spent.entity';
import { SpentsController } from './spents.controller';
import { SpentsService } from './spents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Spent]),
    AuthModule,
    ClientsModule,
    EventsModule,
    OrdersModule,
  ],
  controllers: [SpentsController],
  providers: [SpentsService],
  exports: [SpentsService],
})
export class SpentsModule {}

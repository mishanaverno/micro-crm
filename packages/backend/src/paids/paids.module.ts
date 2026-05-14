import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';
import { EventsModule } from '../events/events.module';
import { OrdersModule } from '../orders/orders.module';
import { Paid } from './entities/paid.entity';
import { PaidsController } from './paids.controller';
import { PaidsService } from './paids.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paid]),
    AuthModule,
    ClientsModule,
    OrdersModule,
    EventsModule,
  ],
  controllers: [PaidsController],
  providers: [PaidsService],
  exports: [PaidsService],
})
export class PaidsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Paid } from '../paids/entities/paid.entity';
import { Spent } from '../spents/entities/spent.entity';
import { FinancesController } from './finances.controller';
import { FinancesService } from './finances.service';

@Module({
  imports: [TypeOrmModule.forFeature([Paid, Spent]), AuthModule],
  controllers: [FinancesController],
  providers: [FinancesService],
})
export class FinancesModule {}

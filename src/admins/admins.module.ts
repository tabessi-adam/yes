import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { UsersModule } from '../users/users.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { ReservationsModule } from 'src/reservations/reservations.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    UsersModule,
    VehiclesModule,
    ReservationsModule,
    ReviewsModule,
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {} 
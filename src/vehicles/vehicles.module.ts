import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { Location } from './entities/location.entity';
import { VehicleSpecs } from './entities/vehicle-specs.entity';
import { VehicleFeatures } from './entities/vehicle-features.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Review } from '../reviews/entities/review.entity';
import { Agent } from '../agents/entities/agent.entity';
import { Office } from '../offices/entities/office.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      Location,
      VehicleSpecs,
      VehicleFeatures,
      User,
      Reservation,
      Review,
      Agent,
      Office,
    ]),
    UsersModule,
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {} 
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { FuelType } from '../enums/fuel-type.enum';
import { Transmission } from '../enums/transmission.enum';

@Entity('vehicle_specs')
export class VehicleSpecs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  color: string;

  @Column()
  seats: number;

  @Column()
  doors: number;

  @Column()
  luggageCapacity: number;

  @Column({
    type: 'enum',
    enum: FuelType,
  })
  fuelType: FuelType;

  @Column({
    type: 'enum',
    enum: Transmission,
  })
  transmission: Transmission;

  @Column()
  engineSize: number;

  @Column()
  power: number;

  @Column()
  torque: number;

  @Column()
  acceleration: number;

  @Column()
  topSpeed: number;
} 
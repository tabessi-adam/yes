import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vehicle_features')
export class VehicleFeatures {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  airConditioning: boolean;

  @Column({ default: false })
  bluetooth: boolean;

  @Column({ default: false })
  cruiseControl: boolean;

  @Column({ default: false })
  gps: boolean;

  @Column({ default: false })
  heatedSeats: boolean;

  @Column({ default: false })
  parkingSensors: boolean;

  @Column({ default: false })
  sunroof: boolean;

  @Column({ default: false })
  usbPort: boolean;

  @Column({ default: false })
  wifi: boolean;
} 
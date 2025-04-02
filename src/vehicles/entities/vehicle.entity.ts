import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { VehicleStatus } from '../enums/vehicle-status.enum';
import { VehicleSpecs } from './vehicle-specs.entity';
import { VehicleFeatures } from './vehicle-features.entity';
import { Location } from './location.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Agent } from '../../agents/entities/agent.entity';
import { VehicleType } from './vehicle-type.enum';
import { Office } from '../../offices/entities/office.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Office, office => office.vehicles)
  office: Office;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerDay: number;

  @Column()
  availableFrom: Date;

  @Column()
  availableTo: Date;

  @Column('simple-array')
  images: string[];

  @OneToOne(() => Location)
  @JoinColumn()
  currentLocation: Location;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  status: VehicleStatus;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  type: VehicleType;

  @OneToOne(() => VehicleSpecs)
  @JoinColumn()
  specs: VehicleSpecs;

  @OneToOne(() => VehicleFeatures)
  @JoinColumn()
  features: VehicleFeatures;

  @OneToMany(() => Review, review => review.vehicle)
  reviews: Review[];

  @ManyToOne(() => Agent, agent => agent.vehicles)
  agent: Agent;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
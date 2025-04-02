import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Agent } from '../../agents/entities/agent.entity';
import { ReservationStatus } from '../enums/reservation-status.enum';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  client: User;

  @ManyToOne(() => Vehicle)
  @JoinColumn()
  vehicle: Vehicle;

  @ManyToOne(() => Agent, agent => agent.reservations)
  agent: Agent;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ nullable: true })
  pickupLocation: string;

  @Column({ nullable: true })
  dropoffLocation: string;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  approvedBy: User;

  @Column({ nullable: true })
  approvalDate: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
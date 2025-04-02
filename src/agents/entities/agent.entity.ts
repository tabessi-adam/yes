import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity()
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.agent)
  user: User;

  @OneToMany(() => Vehicle, vehicle => vehicle.agent)
  vehicles: Vehicle[];

  @OneToMany(() => Reservation, reservation => reservation.agent)
  reservations: Reservation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
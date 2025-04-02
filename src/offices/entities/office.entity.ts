import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('offices')
export class Office {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  workingHours?: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => User, user => user.office)
  agents: User[];

  @OneToMany(() => Vehicle, vehicle => vehicle.office)
  vehicles: Vehicle[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
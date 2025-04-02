import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { UserRole } from './user-role.enum';
import { Agent } from '../../agents/entities/agent.entity';
import { Office } from '../../offices/entities/office.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @OneToOne(() => Agent, agent => agent.user)
  @JoinColumn()
  agent?: Agent;

  @ManyToOne(() => Office, office => office.agents)
  office?: Office;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
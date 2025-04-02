import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from './entities/agent.entity';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { UsersService } from '../users/users.service';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/user-role.enum';
import { User } from '../users/entities/user.entity';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';
import { UpdateVehicleDto } from '../vehicles/dto/update-vehicle.dto'; // Import UpdateVehicleDto

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private usersService: UsersService,
  ) {}

  async create(createAgentDto: CreateAgentDto): Promise<{ message: string; agent: Agent }> {
    const hashedPassword = await bcrypt.hash(createAgentDto.password, 10);
    const user = new User();
    Object.assign(user, {
      ...createAgentDto,
      password: hashedPassword,
      role: UserRole.AGENT,
    });
    const savedUser = await this.userRepository.save(user);

    const agent = new Agent();
    agent.user = savedUser;

    const savedAgent = await this.agentRepository.save(agent);
    return {
      message: 'Agent created successfully',
      agent: savedAgent,
    };
  }

  async findAll(): Promise<Agent[]> {
    return this.agentRepository.find({
      relations: ['user', 'vehicles', 'reservations'],
    });
  }

  async findOne(id: number): Promise<Agent> {
    const agent = await this.agentRepository.findOne({
      where: { id },
      relations: ['user', 'vehicles', 'reservations'],
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    return agent;
  }

  async update(id: number, updateAgentDto: UpdateAgentDto, currentUser: User): Promise<{ message: string; agent: Agent }> {
    const agent = await this.findOne(id);

    if (currentUser.id !== agent.user.id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (updateAgentDto.password) {
      updateAgentDto.password = await bcrypt.hash(updateAgentDto.password, 10);
    }

    const { password, ...userData } = updateAgentDto;
    await this.usersService.update(agent.user.id, { ...userData, password }, currentUser);

    const updatedAgent = await this.agentRepository.save(agent);
    return {
      message: 'Agent updated successfully',
      agent: updatedAgent,
    };
  }

  async remove(id: number, currentUser: User): Promise<{ message: string }> {
    const agent = await this.findOne(id);

    if (currentUser.id !== agent.user.id) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    await this.usersService.remove(agent.user.id, currentUser);
    return { message: 'Agent deleted successfully' };
  }

  // Vehicle Management
  async addVehicle(agentId: number, vehicleData: any, currentUser: User): Promise<Vehicle> {
    const agent = await this.findOne(agentId);

    if (currentUser.id !== agent.user.id) {
      throw new ForbiddenException('You can only add vehicles to your office');
    }

    const vehicle = new Vehicle();
    Object.assign(vehicle, {
      ...vehicleData,
      agent,
    });

    return this.vehicleRepository.save(vehicle);
  }

  async updateVehicle(agentId: number, vehicleId: string, vehicleData: UpdateVehicleDto, currentUser: User): Promise<Vehicle> {
    const agent = await this.findOne(agentId);

    if (currentUser.id !== agent.user.id) {
      throw new ForbiddenException('You can only update vehicles in your office');
    }

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, agent: { id: agentId } },
      relations: ['agent'],
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found in your office');
    }

    Object.assign(vehicle, vehicleData);
    return this.vehicleRepository.save(vehicle);
  }

  async removeVehicle(agentId: number, vehicleId: string, currentUser: User): Promise<{ message: string }> {
    const agent = await this.findOne(agentId);

    if (currentUser.id !== agent.user.id) {
      throw new ForbiddenException('You can only remove vehicles from your office');
    }

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, agent: { id: agentId } },
      relations: ['agent'],
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found in your office');
    }

    await this.vehicleRepository.remove(vehicle);
    return { message: 'Vehicle removed successfully' };
  }

  // Reservation Management
  async updateReservationStatus(
    agentId: number,
    reservationId: string,
    status: ReservationStatus, // Changed to ReservationStatus enum
    currentUser: User,
  ): Promise<Reservation> {
    const agent = await this.findOne(agentId);

    if (currentUser.id !== agent.user.id) {
      throw new ForbiddenException('You can only manage reservations for your office');
    }

    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId, agent: { id: agentId } },
      relations: ['vehicle', 'vehicle.agent'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found for your office');
    }

    if (reservation.vehicle.agent.id !== agentId) {
      throw new ForbiddenException('This reservation is not for a vehicle in your office');
    }

    reservation.status = status;
    return this.reservationRepository.save(reservation);
  }
}
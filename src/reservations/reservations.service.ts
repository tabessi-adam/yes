import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { ReservationStatus } from './enums/reservation-status.enum';
import { UserRole } from '../users/entities/user-role.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createReservationDto: CreateReservationDto, client: User): Promise<Reservation> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createReservationDto.vehicleId },
      relations: ['agent'], // Changed from 'agency' to 'agent'
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${createReservationDto.vehicleId} not found`);
    }

    if (vehicle.status !== 'available') {
      throw new BadRequestException('Vehicle is not available for reservation');
    }

    if (createReservationDto.startDate >= createReservationDto.endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (createReservationDto.startDate < new Date()) {
      throw new BadRequestException('Start date must be in the future');
    }

    const reservation = this.reservationRepository.create({
      ...createReservationDto,
      client,
      vehicle,
      status: ReservationStatus.PENDING,
    });

    return this.reservationRepository.save(reservation);
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find({
      relations: ['client', 'vehicle', 'approvedBy'],
    });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['client', 'vehicle', 'approvedBy'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async update(id: string, updateReservationDto: UpdateReservationDto, currentUser: User): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (currentUser.id !== reservation.client.id) {
      throw new ForbiddenException('You can only update your own reservations');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be updated');
    }

    Object.assign(reservation, updateReservationDto);
    return this.reservationRepository.save(reservation);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const reservation = await this.findOne(id);

    if (currentUser.id !== reservation.client.id) {
      throw new ForbiddenException('You can only delete your own reservations');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be deleted');
    }

    await this.reservationRepository.remove(reservation);
  }

  async findByClient(clientId: number): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { client: { id: clientId } },
      relations: ['vehicle', 'approvedBy'],
    });
  }

  async findByVehicle(vehicleId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { vehicle: { id: vehicleId } },
      relations: ['client', 'approvedBy'],
    });
  }

  async updateStatus(
    id: string,
    status: ReservationStatus,
    currentUser: User,
    rejectionReason?: string,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    // Check if user is admin or the agent that owns the vehicle
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== reservation.vehicle.agent.user.id // Fixed from agency to agent.user
    ) {
      throw new ForbiddenException('You are not authorized to update this reservation');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be updated');
    }

    reservation.status = status;
    reservation.approvedBy = currentUser;
    reservation.approvalDate = new Date();

    if (status === ReservationStatus.DECLINED && rejectionReason) {
      reservation.rejectionReason = rejectionReason;
    }

    return this.reservationRepository.save(reservation);
  }
}
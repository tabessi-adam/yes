import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Review } from '../reviews/entities/review.entity';
import { CreateReservationDto } from '../reservations/dto/create-reservation.dto';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';
import { UserRole } from '../users/entities/user-role.enum';
import { Agent } from '../agents/entities/agent.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>, // Added Agent repository
  ) {}

  async searchVehicles(filters: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    startDate?: Date;
    endDate?: Date;
    brand?: string;
    model?: string;
  }) {
    const query = this.vehicleRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.currentLocation', 'location')
      .where('vehicle.status = :status', { status: 'available' });

    if (filters.location) {
      query.andWhere('location.address LIKE :location', { location: `%${filters.location}%` });
    }

    if (filters.minPrice) {
      query.andWhere('vehicle.pricePerDay >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice) {
      query.andWhere('vehicle.pricePerDay <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.brand) {
      query.andWhere('vehicle.brand LIKE :brand', { brand: `%${filters.brand}%` });
    }

    if (filters.model) {
      query.andWhere('vehicle.model LIKE :model', { model: `%${filters.model}%` });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere(
        'NOT EXISTS (SELECT 1 FROM reservation r WHERE r.vehicleId = vehicle.id AND r.status != :declined AND ((r.startDate <= :endDate AND r.endDate >= :startDate)))',
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
          declined: ReservationStatus.DECLINED,
        },
      );
    }

    return query.getMany();
  }

  async makeReservation(clientId: number, createReservationDto: CreateReservationDto): Promise<Reservation> {
    const client = await this.userRepository.findOne({ where: { id: clientId } });
    if (!client || client.role !== UserRole.CLIENT) {
      throw new NotFoundException('Client not found');
    }

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createReservationDto.vehicleId },
      relations: ['agent', 'office'],
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.status !== 'available') {
      throw new ForbiddenException('Vehicle is not available for reservation');
    }

    const reservation = new Reservation();
    Object.assign(reservation, {
      ...createReservationDto,
      client,
      vehicle,
      status: ReservationStatus.PENDING,
    });

    return this.reservationRepository.save(reservation);
  }

  async submitReview(clientId: number, vehicleId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const client = await this.userRepository.findOne({ where: { id: clientId } });
    if (!client || client.role !== UserRole.CLIENT) {
      throw new NotFoundException('Client not found');
    }

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
      relations: ['agent', 'office'],
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const hasRented = await this.reservationRepository.findOne({
      where: {
        client: { id: clientId },
        vehicle: { id: vehicleId },
        status: ReservationStatus.APPROVED,
      },
    });

    if (!hasRented) {
      throw new ForbiddenException('You can only review vehicles you have rented');
    }

    const review = new Review();
    Object.assign(review, {
      ...createReviewDto,
      user: client,
      vehicle,
    });

    return this.reviewRepository.save(review);
  }

  async updateProfile(clientId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const client = await this.userRepository.findOne({ where: { id: clientId } });
    if (!client || client.role !== UserRole.CLIENT) {
      throw new NotFoundException('Client not found');
    }

    Object.assign(client, updateUserDto);
    return this.userRepository.save(client);
  }

  async deleteAccount(clientId: number): Promise<void> {
    const client = await this.userRepository.findOne({ where: { id: clientId } });
    if (!client || client.role !== UserRole.CLIENT) {
      throw new NotFoundException('Client not found');
    }

    await this.userRepository.remove(client);
  }

  async getAgentsByOffice(officeId: number): Promise<Agent[]> { // Changed return type to Agent[]
    const agents = await this.agentRepository.find({
      where: { 
        user: { role: UserRole.AGENT }, // Ensure we get agents
        vehicles: { office: { id: officeId } }, // Filter by office through vehicles
      },
      relations: ['user', 'vehicles', 'vehicles.office'],
    });

    if (!agents.length) {
      throw new NotFoundException(`No agents found for office ID ${officeId}`);
    }

    return agents;
  }

  async getClientReservations(clientId: number): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { client: { id: clientId } },
      relations: ['vehicle', 'vehicle.agent', 'vehicle.office'],
    });
  }

  async getClientReviews(clientId: number): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { user: { id: clientId } },
      relations: ['vehicle', 'vehicle.agent', 'vehicle.office'],
    });
  }
}
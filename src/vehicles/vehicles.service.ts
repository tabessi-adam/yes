import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Location } from './entities/location.entity';
import { VehicleSpecs } from './entities/vehicle-specs.entity';
import { VehicleFeatures } from './entities/vehicle-features.entity';
import { User } from '../users/entities/user.entity';
import { Agent } from '../agents/entities/agent.entity';
import { Office } from '../offices/entities/office.entity';
import { VehicleStatus } from './enums/vehicle-status.enum';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(VehicleSpecs)
    private specsRepository: Repository<VehicleSpecs>,
    @InjectRepository(VehicleFeatures)
    private featuresRepository: Repository<VehicleFeatures>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(Office)
    private officeRepository: Repository<Office>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, currentUser: User): Promise<Vehicle> {
    const agent = await this.agentRepository.findOne({
      where: { user: { id: currentUser.id } },
      relations: ['user'],
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const office = await this.officeRepository.findOne({
      where: { id: createVehicleDto.officeId },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    const location = this.locationRepository.create(createVehicleDto.currentLocation);
    const savedLocation = await this.locationRepository.save(location);

    const specs = this.specsRepository.create(createVehicleDto.specs);
    const savedSpecs = await this.specsRepository.save(specs);

    const features = this.featuresRepository.create(createVehicleDto.features);
    const savedFeatures = await this.featuresRepository.save(features);

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      agent,
      office,
      currentLocation: savedLocation,
      specs: savedSpecs,
      features: savedFeatures,
      availableFrom: new Date(createVehicleDto.availableFrom), // Convert string to Date
      availableTo: new Date(createVehicleDto.availableTo), // Convert string to Date
    });

    return this.vehicleRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      relations: ['agent', 'office', 'specs', 'features', 'currentLocation', 'agent.user', 'reviews'],
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['agent', 'office', 'specs', 'features', 'currentLocation', 'agent.user', 'reviews'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, currentUser: User): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    if (currentUser.id !== vehicle.agent.user.id) {
      throw new ForbiddenException('You can only update vehicles in your office');
    }

    if (updateVehicleDto.officeId) {
      const office = await this.officeRepository.findOne({
        where: { id: updateVehicleDto.officeId },
      });

      if (!office) {
        throw new NotFoundException('Office not found');
      }

      vehicle.office = office;
    }

    if (updateVehicleDto.currentLocation) {
      const location = this.locationRepository.create(updateVehicleDto.currentLocation);
      vehicle.currentLocation = await this.locationRepository.save(location);
    }

    if (updateVehicleDto.specs) {
      const specs = this.specsRepository.create(updateVehicleDto.specs);
      vehicle.specs = await this.specsRepository.save(specs);
    }

    if (updateVehicleDto.features) {
      const features = this.featuresRepository.create(updateVehicleDto.features);
      vehicle.features = await this.featuresRepository.save(features);
    }

    if (updateVehicleDto.availableFrom) {
      vehicle.availableFrom = new Date(updateVehicleDto.availableFrom);
    }

    if (updateVehicleDto.availableTo) {
      vehicle.availableTo = new Date(updateVehicleDto.availableTo);
    }

    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: string, currentUser: User): Promise<{ message: string }> {
    const vehicle = await this.findOne(id);

    if (currentUser.id !== vehicle.agent.user.id) {
      throw new ForbiddenException('You can only remove vehicles from your office');
    }

    await this.vehicleRepository.remove(vehicle);
    return { message: 'Vehicle removed successfully' };
  }

  async findByOffice(officeId: number): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      where: { office: { id: officeId } },
      relations: ['agent', 'office', 'specs', 'features', 'currentLocation', 'agent.user', 'reviews'],
    });
  }

  async findByAgent(agentId: number): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      where: { agent: { id: agentId } },
      relations: ['agent', 'office', 'specs', 'features', 'currentLocation', 'agent.user', 'reviews'],
    });
  }

  async updateStatus(id: string, status: VehicleStatus, currentUser: User): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    if (currentUser.id !== vehicle.agent.user.id) {
      throw new ForbiddenException('You can only update vehicles in your office');
    }

    vehicle.status = status;
    return this.vehicleRepository.save(vehicle);
  }
}
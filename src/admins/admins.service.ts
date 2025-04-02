import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/user-role.enum';
import { User } from '../users/entities/user.entity';
import { Office } from '../offices/entities/office.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Office)
    private officeRepository: Repository<Office>,
    private usersService: UsersService,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<{ message: string; admin: Admin }> {
    // Create user first
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    const user = new User();
    Object.assign(user, {
      ...createAdminDto,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    const savedUser = await this.userRepository.save(user);

    // Create admin profile
    const admin = new Admin();
    Object.assign(admin, {
      user: savedUser,
    });

    const savedAdmin = await this.adminRepository.save(admin);
    return {
      message: 'Admin created successfully',
      admin: savedAdmin,
    };
  }

  async findAll(): Promise<Admin[]> {
    return this.adminRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return admin;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto, currentUser: any): Promise<{ message: string; admin: Admin }> {
    const admin = await this.findOne(id);

    // Only allow admins to update their own profile
    if (currentUser.id !== admin.user.id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // If password is being updated, hash it
    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    // Update user data
    const { password, ...userData } = updateAdminDto;
    await this.usersService.update(admin.user.id, { ...userData, password }, currentUser);

    const updatedAdmin = await this.adminRepository.save(admin);
    return {
      message: 'Admin updated successfully',
      admin: updatedAdmin,
    };
  }

  async remove(id: number, currentUser: any): Promise<{ message: string }> {
    const admin = await this.findOne(id);

    // Only allow admins to delete their own profile
    if (currentUser.id !== admin.user.id) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    await this.usersService.remove(admin.user.id, currentUser);
    return { message: 'Admin deleted successfully' };
  }

  async manageAgent(adminId: number, agentId: number, officeId: number, action: 'activate' | 'deactivate'): Promise<User> {
    const admin = await this.userRepository.findOne({
      where: { id: adminId, role: UserRole.ADMIN },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const agent = await this.userRepository.findOne({
      where: { id: agentId, role: UserRole.AGENT },
      relations: ['office'],
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const office = await this.officeRepository.findOne({
      where: { id: officeId },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    if (action === 'activate') {
      agent.office = office;
    } else {
      agent.office = undefined;
    }

    return this.userRepository.save(agent);
  }
} 
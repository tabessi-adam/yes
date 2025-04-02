import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './entities/user-role.enum';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ForbiddenException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new User();
    Object.assign(user, {
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    return this.mapToResponse(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      relations: ['agent', 'agent.user'], // Load agent and its user relation
    });
    return users.map(user => this.mapToResponse(user));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['agent', 'agent.user'], // Load agent and its user relation
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapToResponse(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUser: User): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['agent', 'agent.user'], // Load agent and its user relation
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    return this.mapToResponse(updatedUser);
  }

  async remove(id: number, currentUser: User): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }

    await this.userRepository.remove(user);
  }

  async deactivate(id: number, currentUser: User): Promise<{ message: string; user: UserResponseDto }> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can deactivate users');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['agent', 'agent.user'], // Load agent and its user relation
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.agent = undefined; // This might not work as intended due to ManyToOne relation
    const deactivatedUser = await this.userRepository.save(user);
    return {
      message: 'User deactivated successfully',
      user: this.mapToResponse(deactivatedUser),
    };
  }

  private mapToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      address: user.address,
      agent: user.agent
        ? {
            id: user.agent.id,
            name: `${user.firstName} ${user.lastName}`, // Using user's name since Agent has no name property
          }
        : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
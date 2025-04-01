import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ message: string; user: UserResponseDto }> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.CLIENT,
      isActive: true,
    });
    const savedUser = await this.userRepository.save(user);
    return {
      message: 'User registered successfully',
      user: this.mapToResponse(savedUser)
    };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map(user => this.mapToResponse(user));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToResponse(user);
  }

  async update(id: number, updateData: Partial<User>, currentUser: User): Promise<{ message: string; user: UserResponseDto }> {
    // Only allow users to update their own profile unless they're an admin
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if trying to update email to an existing one
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email }
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Only admin can update role
    if (updateData.role && currentUser.role !== UserRole.ADMIN) {
      delete updateData.role;
    }

    Object.assign(user, updateData);
    const updatedUser = await this.userRepository.save(user);
    return {
      message: 'User updated successfully',
      user: this.mapToResponse(updatedUser)
    };
  }

  async delete(id: number, currentUser: User): Promise<{ message: string }> {
    // Only allow users to delete their own account unless they're an admin
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async deactivate(id: number, currentUser: User): Promise<{ message: string; user: UserResponseDto }> {
    // Only admin can deactivate users
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can deactivate users');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.isActive = false;
    const deactivatedUser = await this.userRepository.save(user);
    return {
      message: 'User deactivated successfully',
      user: this.mapToResponse(deactivatedUser)
    };
  }

  private mapToResponse(user: User): UserResponseDto {
    const { password, ...response } = user;
    return response as UserResponseDto;
  }
} 
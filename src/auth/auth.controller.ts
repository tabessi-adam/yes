import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User, UserRole } from './entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get('test-db')
  async testDb() {
    try {
      const count = await this.userRepository.count();
      return {
        success: true,
        message: 'Database connection successful',
        userCount: count
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database connection failed',
        error: error.message
      };
    }
  }

  @Post('register')
  async register(
    @Body() createUserDto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role?: UserRole;
      phoneNumber?: string;
    },
  ) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
  ) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: User) {
    const { password, ...result } = user;
    return result;
  }
} 
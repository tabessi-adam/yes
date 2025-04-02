import { Controller, Post, Body, UseGuards, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../users/entities/user-role.enum';


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
    @Body()
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: UserRole;
    },
  ) {
    return this.authService.register(userData);
  }

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    const user = await this.authService.validateUser(loginData.email, loginData.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: User) {
    const { password, ...result } = user;
    return result;
  }
} 
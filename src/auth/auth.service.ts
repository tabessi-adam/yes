import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    console.log('Login user data:', { email: user.email, role: user.role });
    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
      role: user.role,
      email: user.email
    };
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
  }) {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User();
    Object.assign(user, {
      ...userData,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    console.log('Registered user:', { email: savedUser.email, role: savedUser.role });
    
    const { password, ...result } = savedUser;
    const access_token = this.jwtService.sign({ 
      email: savedUser.email, 
      sub: savedUser.id, 
      role: savedUser.role 
    });

    return {
      ...result,
      access_token,
      role: savedUser.role
    };
  }
}
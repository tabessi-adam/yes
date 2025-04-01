import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 
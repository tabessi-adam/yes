import { UserRole } from '../entities/user-role.enum';

export class UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  agent?: {
    id: number;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
} 
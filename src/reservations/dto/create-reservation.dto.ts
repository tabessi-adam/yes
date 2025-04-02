import { IsString, IsNumber, IsDate, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsUUID()
  vehicleId: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsNumber()
  totalPrice: number;

  @IsString()
  @IsOptional()
  pickupLocation?: string;

  @IsString()
  @IsOptional()
  dropoffLocation?: string;

  @IsString()
  @IsOptional()
  notes?: string;
} 
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateVehicleFeaturesDto {
  @IsBoolean()
  @IsOptional()
  airConditioning?: boolean;

  @IsBoolean()
  @IsOptional()
  bluetooth?: boolean;

  @IsBoolean()
  @IsOptional()
  cruiseControl?: boolean;

  @IsBoolean()
  @IsOptional()
  gps?: boolean;

  @IsBoolean()
  @IsOptional()
  heatedSeats?: boolean;

  @IsBoolean()
  @IsOptional()
  parkingSensors?: boolean;

  @IsBoolean()
  @IsOptional()
  sunroof?: boolean;

  @IsBoolean()
  @IsOptional()
  usbPort?: boolean;

  @IsBoolean()
  @IsOptional()
  wifi?: boolean;
} 
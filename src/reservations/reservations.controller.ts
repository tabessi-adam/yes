import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReservationStatus } from './enums/reservation-status.enum';
import { UserRole } from '../users/entities/user-role.enum';
import { Request } from 'express';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  create(@Body() createReservationDto: CreateReservationDto, @Req() req: Request) {
    return this.reservationsService.create(createReservationDto, req.user as any);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @Req() req: Request,
  ) {
    return this.reservationsService.update(id, updateReservationDto, req.user as any);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.reservationsService.remove(id, req.user as any);
  }

  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard)
  findByClient(@Param('clientId') clientId: string) {
    return this.reservationsService.findByClient(+clientId);
  }

  @Get('vehicle/:vehicleId')
  @UseGuards(JwtAuthGuard)
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.reservationsService.findByVehicle(vehicleId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  updateStatus(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('status') status: ReservationStatus,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.reservationsService.updateStatus(id, status, req.user as any, rejectionReason);
  }
} 
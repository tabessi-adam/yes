import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { UpdateVehicleDto } from '../vehicles/dto/update-vehicle.dto';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum'; // Import the enum

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.create(createAgentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.agentsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.agentsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
    @Req() req: Request & { user: User },
  ) {
    return this.agentsService.update(+id, updateAgentDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
    return this.agentsService.remove(+id, req.user);
  }

  // Vehicle Management
  @Post(':id/vehicles')
  @UseGuards(JwtAuthGuard)
  addVehicle(
    @Param('id') id: string,
    @Body() vehicleData: any, // Consider using CreateVehicleDto
    @Req() req: Request & { user: User },
  ) {
    return this.agentsService.addVehicle(+id, vehicleData, req.user);
  }

  @Patch(':id/vehicles/:vehicleId')
  @UseGuards(JwtAuthGuard)
  updateVehicle(
    @Param('id') id: string,
    @Param('vehicleId') vehicleId: string,
    @Body() vehicleData: UpdateVehicleDto,
    @Req() req: Request & { user: User },
  ) {
    return this.agentsService.updateVehicle(+id, vehicleId, vehicleData, req.user);
  }

  @Delete(':id/vehicles/:vehicleId')
  @UseGuards(JwtAuthGuard)
  removeVehicle(
    @Param('id') id: string,
    @Param('vehicleId') vehicleId: string,
    @Req() req: Request & { user: User },
  ) {
    return this.agentsService.removeVehicle(+id, vehicleId, req.user);
  }

  // Reservation Management
  @Patch(':id/reservations/:reservationId/status')
  @UseGuards(JwtAuthGuard)
  updateReservationStatus(
    @Param('id') id: string,
    @Param('reservationId') reservationId: string,
    @Body('status') status: ReservationStatus, // Use the enum type
    @Req() req: Request & { user: User },
  ) {
    return this.agentsService.updateReservationStatus(+id, reservationId, status, req.user);
  }
}
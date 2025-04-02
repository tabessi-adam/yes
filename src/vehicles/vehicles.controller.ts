import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { Request } from 'express';
import { VehicleStatus } from './enums/vehicle-status.enum';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  create(@Body() createVehicleDto: CreateVehicleDto, @Req() req: Request) {
    return this.vehiclesService.create(createVehicleDto, req.user as any);
  }

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @Req() req: Request,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, req.user as any);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.vehiclesService.remove(id, req.user as any);
  }

  @Get('office/:officeId')
  findByOffice(@Param('officeId') officeId: string) {
    return this.vehiclesService.findByOffice(+officeId);
  }

  @Get('agent/:agentId')
  findByAgent(@Param('agentId') agentId: string) {
    return this.vehiclesService.findByAgent(+agentId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: VehicleStatus,
    @Req() req: Request,
  ) {
    return this.vehiclesService.updateStatus(id, status, req.user as any);
  }
} 
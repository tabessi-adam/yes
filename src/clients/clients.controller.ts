import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateReservationDto } from '../reservations/dto/create-reservation.dto';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.enum';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('vehicles/search')
  @UseGuards(JwtAuthGuard)
  searchVehicles(
    @Query('location') location?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('brand') brand?: string,
    @Query('model') model?: string,
  ) {
    return this.clientsService.searchVehicles({
      location,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      brand,
      model,
    });
  }

  @Post('reservations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  makeReservation(@Body() createReservationDto: CreateReservationDto, @Req() req: RequestWithUser) {
    return this.clientsService.makeReservation(req.user.id, createReservationDto);
  }

  @Post('vehicles/:vehicleId/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  submitReview(
    @Param('vehicleId') vehicleId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Req() req: RequestWithUser,
  ) {
    return this.clientsService.submitReview(req.user.id, vehicleId, createReviewDto);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  updateProfile(@Body() updateUserDto: UpdateUserDto, @Req() req: RequestWithUser) {
    return this.clientsService.updateProfile(req.user.id, updateUserDto);
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  deleteAccount(@Req() req: RequestWithUser) {
    return this.clientsService.deleteAccount(req.user.id);
  }

  @Get('companies/:companyId/agencies')
  @UseGuards(JwtAuthGuard)
  getAgenciesByCompany(@Param('companyId') companyId: string) {
    return this.clientsService.getAgentsByOffice(+companyId); // Changed to getAgentsByOffice
  }

  @Get('reservations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  getClientReservations(@Req() req: RequestWithUser) {
    return this.clientsService.getClientReservations(req.user.id);
  }

  @Get('reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  getClientReviews(@Req() req: RequestWithUser) {
    return this.clientsService.getClientReviews(req.user.id);
  }
}
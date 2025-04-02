import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';
import { UserRole } from '../users/entities/user-role.enum';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.adminsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @Req() req: Request,
  ) {
    return this.adminsService.update(+id, updateAdminDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.adminsService.remove(+id, req.user);
  }

  @Patch(':id/agents/:agentId/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  addAgent(
    @Param('id') id: string,
    @Param('agentId') agentId: string,
    @Body('officeId') officeId: number,  // Added officeId parameter
  ) {
    return this.adminsService.manageAgent(+id, +agentId, officeId, 'activate');
  }

  @Patch(':id/agents/:agentId/remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  removeAgent(
    @Param('id') id: string,
    @Param('agentId') agentId: string,
    @Body('officeId') officeId: number,  // Added officeId parameter
  ) {
    return this.adminsService.manageAgent(+id, +agentId, officeId, 'deactivate');
  }
}
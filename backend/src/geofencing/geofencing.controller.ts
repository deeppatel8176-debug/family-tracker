import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GeofencingService } from './geofencing.service';
import { CreateGeofenceDto, UpdateGeofenceDto } from './dto/create-geofence.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('api/geofences')
@UseGuards(JwtAuthGuard)
export class GeofencingController {
  constructor(private readonly geofencingService: GeofencingService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createGeofence(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateGeofenceDto) {
    return this.geofencingService.createGeofence(user.familyId, dto);
  }

  @Get()
  async getGeofences(@CurrentUser() user: CurrentUserPayload) {
    return this.geofencingService.getGeofences(user.familyId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateGeofence(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateGeofenceDto,
  ) {
    return this.geofencingService.updateGeofence(user.familyId, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteGeofence(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.geofencingService.deleteGeofence(user.familyId, id);
  }

  @Get('events')
  async getEvents(@CurrentUser() user: CurrentUserPayload) {
    return this.geofencingService.getEvents(user.familyId);
  }
}

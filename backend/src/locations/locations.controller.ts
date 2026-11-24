import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationHistoryQueryDto } from './dto/location-history-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { SharingStatus } from '../schemas/current-location.schema';

@Controller('api/locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post('update')
  @HttpCode(HttpStatus.OK)
  async updateLocation(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateLocationDto) {
    return this.locationsService.updateLocation(user.userId, user.familyId, dto);
  }

  @Post('sharing/start')
  @HttpCode(HttpStatus.OK)
  async startSharing(@CurrentUser() user: CurrentUserPayload) {
    return this.locationsService.setSharingStatus(user.userId, user.familyId, SharingStatus.ACTIVE);
  }

  @Post('sharing/stop')
  @HttpCode(HttpStatus.OK)
  async stopSharing(@CurrentUser() user: CurrentUserPayload) {
    return this.locationsService.setSharingStatus(user.userId, user.familyId, SharingStatus.STOPPED);
  }

  @Post('sharing/pause')
  @HttpCode(HttpStatus.OK)
  async pauseSharing(@CurrentUser() user: CurrentUserPayload) {
    return this.locationsService.setSharingStatus(user.userId, user.familyId, SharingStatus.PAUSED);
  }

  @Get('current')
  async getCurrentLocations(@CurrentUser() user: CurrentUserPayload) {
    return this.locationsService.getCurrentLocations(user.familyId);
  }

  @Get('member/:id')
  async getMemberLocation(@CurrentUser() user: CurrentUserPayload, @Param('id') memberId: string) {
    return this.locationsService.getMemberLocation(user.familyId, memberId);
  }

  @Get('history')
  async getLocationHistory(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: LocationHistoryQueryDto,
  ) {
    return this.locationsService.getLocationHistory(user.familyId, query, user.userId, user.role);
  }
}

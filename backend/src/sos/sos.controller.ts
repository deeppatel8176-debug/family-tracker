import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SosService } from './sos.service';
import { TriggerSosDto } from './dto/trigger-sos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('api/sos')
@UseGuards(JwtAuthGuard)
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async triggerSos(@CurrentUser() user: CurrentUserPayload, @Body() dto: TriggerSosDto) {
    return this.sosService.triggerSos(user.userId, user.familyId, dto);
  }

  @Get('alerts')
  async getAlerts(@CurrentUser() user: CurrentUserPayload) {
    return this.sosService.getAlerts(user.familyId);
  }

  @Patch(':id/acknowledge')
  @HttpCode(HttpStatus.OK)
  async acknowledgeAlert(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.sosService.acknowledgeAlert(user.familyId, id, user.userId);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelAlert(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.sosService.cancelAlert(user.familyId, id, user.userId);
  }
}

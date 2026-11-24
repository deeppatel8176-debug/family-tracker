import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('api/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post('activate-account')
  async activateAccount(@Body() dto: ActivateAccountDto) {
    return this.membersService.activateAccount(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.membersService.getProfile(user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateProfileDto) {
    return this.membersService.updateProfile(user.userId, dto);
  }
}

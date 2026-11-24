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
import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('api/family')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post('create')
  @Roles(UserRole.ADMIN)
  async createFamily(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateFamilyDto) {
    return this.familyService.createFamily(user.userId, dto);
  }

  @Get('details')
  async getFamilyDetails(@CurrentUser() user: CurrentUserPayload) {
    return this.familyService.getFamilyDetails(user.familyId);
  }

  @Post('invite')
  @Roles(UserRole.ADMIN)
  async inviteMember(@CurrentUser() user: CurrentUserPayload, @Body() dto: InviteMemberDto) {
    return this.familyService.inviteMember(user.userId, user.familyId, dto);
  }

  @Get('members')
  async getFamilyMembers(@CurrentUser() user: CurrentUserPayload): Promise<any[]> {
    return this.familyService.getFamilyMembers(user.familyId);
  }

  @Patch('members/:id')
  @Roles(UserRole.ADMIN)
  async updateMember(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.familyService.updateMember(user.familyId, memberId, dto);
  }

  @Delete('members/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteMember(@CurrentUser() user: CurrentUserPayload, @Param('id') memberId: string) {
    return this.familyService.deleteMember(user.familyId, memberId);
  }
}

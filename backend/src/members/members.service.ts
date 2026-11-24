import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument, AccountStatus } from '../schemas/user.schema';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async activateAccount(dto: ActivateAccountDto) {
    const user = await this.userModel.findOne({
      invitationCode: dto.invitationCode.trim().toUpperCase(),
    });

    if (!user) {
      throw new NotFoundException('Invalid invitation code');
    }

    if (user.accountStatus === AccountStatus.ACTIVE) {
      throw new BadRequestException('Account has already been activated. Please log in.');
    }

    if (user.invitationExpiresAt && user.invitationExpiresAt < new Date()) {
      throw new BadRequestException('Invitation code has expired. Request a new invite from your family administrator.');
    }

    user.passwordHash = await bcrypt.hash(dto.password, 10);
    user.accountStatus = AccountStatus.ACTIVE;
    user.invitationCode = undefined;
    user.invitationExpiresAt = undefined;
    await user.save();

    // Auto log-in on successful activation
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      familyId: user.familyId ? user.familyId.toString() : undefined,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'super_secret_family_tracker_access_key_2026',
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user._id.toString() },
      {
        secret: this.configService.get<string>('REFRESH_SECRET') || 'super_secret_family_tracker_refresh_key_2026',
        expiresIn: this.configService.get<string>('REFRESH_EXPIRATION') || '7d',
      },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    return {
      message: 'Account successfully activated',
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        familyId: user.familyId ? user.familyId.toString() : null,
        accountStatus: user.accountStatus,
        profileImage: user.profileImage || null,
        relationship: user.relationship || null,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).populate('familyId', 'familyName settings');
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.relationship !== undefined) user.relationship = dto.relationship;
    if (dto.profileImage !== undefined) user.profileImage = dto.profileImage;

    await user.save();
    return user;
  }
}

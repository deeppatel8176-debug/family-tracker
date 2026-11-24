import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserDocument, UserRole, AccountStatus } from '../schemas/user.schema';
import { Family, FamilyDocument } from '../schemas/family.schema';
import { Device, DeviceDocument, DeviceType } from '../schemas/device.schema';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { MemberLoginDto } from './dto/member-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async generateTokens(user: UserDocument) {
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

    // Store hashed refresh token for rotation
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(user._id, { refreshTokenHash });

    return {
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

  async adminRegister(dto: AdminRegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const admin = new this.userModel({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: UserRole.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
    });
    await admin.save();

    const family = new this.familyModel({
      familyName: dto.familyName,
      adminId: admin._id,
      settings: {
        retentionDays: 30,
        staleThresholdMinutes: 5,
        allowHistoryViewByMembers: true,
        strictGeofenceNotifications: false,
      },
    });
    await family.save();

    admin.familyId = family._id as Types.ObjectId;
    await admin.save();

    return this.generateTokens(admin);
  }

  async adminLogin(dto: AdminLoginDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Access restricted to administrators');
    }

    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException('This administrator account has been suspended');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokens(user);
  }

  async memberLogin(dto: MemberLoginDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role !== UserRole.MEMBER) {
      throw new UnauthorizedException('Access restricted to family members');
    }

    if (user.accountStatus === AccountStatus.PENDING) {
      throw new UnauthorizedException('Account not yet activated. Please activate via invitation code.');
    }

    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException('Your family member account has been suspended');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Register or update device record
    if (dto.deviceType) {
      await this.deviceModel.findOneAndUpdate(
        { userId: user._id, deviceType: dto.deviceType as DeviceType },
        {
          deviceName: dto.deviceName || 'Mobile Device',
          lastSeen: new Date(),
        },
        { upsert: true, new: true },
      );
    }

    return this.generateTokens(user);
  }

  async refreshTokens(dto: RefreshTokenDto) {
    try {
      const decoded = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('REFRESH_SECRET') || 'super_secret_family_tracker_refresh_key_2026',
      });

      const user = await this.userModel.findById(decoded.sub).select('+refreshTokenHash');
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isMatch = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid or reused refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: null });
    return { message: 'Successfully logged out' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      // Do not disclose whether email exists for security
      return { message: 'If the email exists, a password reset code has been sent.' };
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // In a production environment, send via email service. We also return resetToken for direct testing/verification.
    return {
      message: 'If the email exists, a password reset code has been sent.',
      resetToken: token,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      resetPasswordToken: dto.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Password reset token is invalid or has expired');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password has been successfully updated' };
  }
}

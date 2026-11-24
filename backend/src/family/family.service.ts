import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { User, UserDocument, UserRole, AccountStatus } from '../schemas/user.schema';
import { Family, FamilyDocument } from '../schemas/family.schema';
import { CurrentLocation, CurrentLocationDocument } from '../schemas/current-location.schema';
import { Device, DeviceDocument } from '../schemas/device.schema';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class FamilyService {
  constructor(
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(CurrentLocation.name) private currentLocationModel: Model<CurrentLocationDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async createFamily(adminId: string, dto: CreateFamilyDto) {
    const existingAdmin = await this.userModel.findById(adminId);
    if (!existingAdmin) {
      throw new NotFoundException('Admin not found');
    }

    const family = new this.familyModel({
      familyName: dto.familyName,
      adminId: new Types.ObjectId(adminId),
      settings: dto.settings || {
        retentionDays: 30,
        staleThresholdMinutes: 5,
        allowHistoryViewByMembers: true,
        strictGeofenceNotifications: false,
      },
    });
    await family.save();

    existingAdmin.familyId = family._id as Types.ObjectId;
    await existingAdmin.save();

    return family;
  }

  async getFamilyDetails(familyId: string) {
    if (!familyId) {
      throw new BadRequestException('Family ID not associated with this account');
    }
    const family = await this.familyModel.findById(familyId).populate('adminId', 'name email');
    if (!family) {
      throw new NotFoundException('Family group not found');
    }
    return family;
  }

  async inviteMember(adminId: string, familyId: string, dto: InviteMemberDto) {
    if (!familyId) {
      throw new BadRequestException('Administrator does not have an active family group');
    }

    const existingUser = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists in the system');
    }

    const invitationCode = 'FT-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const member = new this.userModel({
      name: dto.name,
      email: dto.email.toLowerCase(),
      phone: dto.phone || null,
      relationship: dto.relationship || null,
      role: UserRole.MEMBER,
      accountStatus: AccountStatus.PENDING,
      familyId: new Types.ObjectId(familyId),
      invitationCode,
      invitationExpiresAt: expiresAt,
    });
    await member.save();

    return {
      message: 'Invitation generated successfully',
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        relationship: member.relationship,
        accountStatus: member.accountStatus,
        invitationCode,
        invitationExpiresAt: expiresAt,
      },
      invitationCode,
      invitationLink: `/activate?code=${invitationCode}`,
    };
  }

  async getFamilyMembers(familyId: string): Promise<any[]> {
    if (!familyId) {
      throw new BadRequestException('Family ID is required');
    }

    const members = await this.userModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .select('-passwordHash -refreshTokenHash')
      .lean();

    const memberIds = members.map((m) => m._id);

    // Fetch current location info for each member
    const locations = await this.currentLocationModel
      .find({ userId: { $in: memberIds } })
      .lean();

    const locationMap = new Map(locations.map((loc) => [loc.userId.toString(), loc]));

    // Fetch primary devices
    const devices = await this.deviceModel
      .find({ userId: { $in: memberIds } })
      .sort({ lastSeen: -1 })
      .lean();

    const deviceMap = new Map();
    for (const d of devices) {
      const uid = d.userId.toString();
      if (!deviceMap.has(uid)) {
        deviceMap.set(uid, d);
      }
    }

    return members.map((m) => {
      const uid = m._id.toString();
      const loc = locationMap.get(uid);
      const dev = deviceMap.get(uid);

      return {
        ...m,
        currentLocation: loc || null,
        device: dev || null,
      };
    });
  }

  async updateMember(familyId: string, memberId: string, dto: UpdateMemberDto) {
    const member = await this.userModel.findOne({
      _id: new Types.ObjectId(memberId),
      familyId: new Types.ObjectId(familyId),
    });

    if (!member) {
      throw new NotFoundException('Family member not found');
    }

    if (member.role === UserRole.ADMIN) {
      throw new ForbiddenException('Admin accounts cannot be modified via member update');
    }

    if (dto.name !== undefined) member.name = dto.name;
    if (dto.phone !== undefined) member.phone = dto.phone;
    if (dto.relationship !== undefined) member.relationship = dto.relationship;
    if (dto.accountStatus !== undefined) member.accountStatus = dto.accountStatus;
    if (dto.profileImage !== undefined) member.profileImage = dto.profileImage;

    await member.save();
    return member;
  }

  async deleteMember(familyId: string, memberId: string) {
    const member = await this.userModel.findOne({
      _id: new Types.ObjectId(memberId),
      familyId: new Types.ObjectId(familyId),
    });

    if (!member) {
      throw new NotFoundException('Family member not found');
    }

    if (member.role === UserRole.ADMIN) {
      throw new ForbiddenException('Family administrator account cannot be deleted');
    }

    await this.userModel.findByIdAndDelete(member._id);
    await this.currentLocationModel.deleteMany({ userId: member._id });
    await this.deviceModel.deleteMany({ userId: member._id });

    return { message: 'Family member removed successfully' };
  }
}

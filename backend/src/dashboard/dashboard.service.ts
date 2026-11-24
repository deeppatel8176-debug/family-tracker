import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { Family, FamilyDocument } from '../schemas/family.schema';
import { CurrentLocation, CurrentLocationDocument, SharingStatus } from '../schemas/current-location.schema';
import { SosAlert, SosAlertDocument, SosStatus } from '../schemas/sos-alert.schema';
import { Geofence, GeofenceDocument } from '../schemas/geofence.schema';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { Device, DeviceDocument } from '../schemas/device.schema';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(CurrentLocation.name) private currentLocationModel: Model<CurrentLocationDocument>,
    @InjectModel(SosAlert.name) private sosAlertModel: Model<SosAlertDocument>,
    @InjectModel(Geofence.name) private geofenceModel: Model<GeofenceDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    private socketGateway: SocketGateway,
    private configService: ConfigService,
  ) {}

  async getOverview(familyId: string) {
    if (!familyId) {
      throw new BadRequestException('Family ID required');
    }

    const family = await this.familyModel.findById(familyId);
    const staleThresholdMinutes =
      family?.settings?.staleThresholdMinutes ||
      this.configService.get<number>('STALE_LOCATION_THRESHOLD_MINUTES') ||
      5;
    const staleThresholdTime = new Date(Date.now() - staleThresholdMinutes * 60 * 1000);

    const members = await this.userModel.find({ familyId: new Types.ObjectId(familyId) }).lean();
    const memberIds = members.map((m) => m._id);

    const locations = await this.currentLocationModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .lean();

    const locationMap = new Map(locations.map((loc) => [loc.userId.toString(), loc]));

    let sharingCount = 0;
    let notSharingCount = 0;
    let staleCount = 0;

    for (const m of members) {
      const loc = locationMap.get(m._id.toString());
      if (!loc || loc.sharingStatus === SharingStatus.STOPPED) {
        notSharingCount++;
      } else if (loc.sharingStatus === SharingStatus.PAUSED) {
        notSharingCount++;
      } else if (loc.sharingStatus === SharingStatus.ACTIVE) {
        if (new Date(loc.recordedAt) < staleThresholdTime) {
          staleCount++;
        } else {
          sharingCount++;
        }
      }
    }

    const activeSosCount = await this.sosAlertModel.countDocuments({
      familyId: new Types.ObjectId(familyId),
      status: SosStatus.ACTIVE,
    });

    const safeZonesCount = await this.geofenceModel.countDocuments({
      familyId: new Types.ObjectId(familyId),
      isActive: true,
    });

    const recentNotifications = await this.notificationModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return {
      totalFamilyMembers: members.length,
      membersCurrentlySharing: sharingCount,
      membersNotSharing: notSharingCount,
      membersWithStaleLocations: staleCount,
      activeSosAlerts: activeSosCount,
      totalSafeZones: safeZonesCount,
      recentActivity: recentNotifications,
    };
  }

  async getRecentActivity(familyId: string) {
    return this.notificationModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .populate('userId', 'name email profileImage')
      .sort({ createdAt: -1 })
      .limit(30);
  }

  async getMemberStatus(familyId: string) {
    const family = await this.familyModel.findById(familyId);
    const staleThresholdMinutes =
      family?.settings?.staleThresholdMinutes ||
      this.configService.get<number>('STALE_LOCATION_THRESHOLD_MINUTES') ||
      5;
    const staleThresholdTime = new Date(Date.now() - staleThresholdMinutes * 60 * 1000);

    const members = await this.userModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .select('-passwordHash -refreshTokenHash')
      .lean();

    const memberIds = members.map((m) => m._id);

    const locations = await this.currentLocationModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .lean();
    const locationMap = new Map(locations.map((l) => [l.userId.toString(), l]));

    const devices = await this.deviceModel
      .find({ userId: { $in: memberIds } })
      .sort({ lastSeen: -1 })
      .lean();
    const deviceMap = new Map();
    for (const d of devices) {
      const uid = d.userId.toString();
      if (!deviceMap.has(uid)) deviceMap.set(uid, d);
    }

    return members.map((m) => {
      const uid = m._id.toString();
      const loc = locationMap.get(uid);
      const dev = deviceMap.get(uid);
      const isOnline = this.socketGateway.isUserOnline(uid);
      const isStale =
        loc && loc.sharingStatus === SharingStatus.ACTIVE && new Date(loc.recordedAt) < staleThresholdTime;

      return {
        userId: m._id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        role: m.role,
        relationship: m.relationship,
        profileImage: m.profileImage,
        accountStatus: m.accountStatus,
        isOnline,
        isStale: !!isStale,
        sharingStatus: loc ? loc.sharingStatus : SharingStatus.STOPPED,
        batteryPercentage: loc?.batteryPercentage ?? null,
        accuracy: loc?.accuracy ?? null,
        lastUpdated: loc?.recordedAt ?? null,
        latitude: loc?.latitude ?? null,
        longitude: loc?.longitude ?? null,
        device: dev
          ? {
              deviceType: dev.deviceType,
              deviceName: dev.deviceName,
              lastSeen: dev.lastSeen,
            }
          : null,
      };
    });
  }
}

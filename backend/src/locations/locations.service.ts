import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { CurrentLocation, CurrentLocationDocument, SharingStatus } from '../schemas/current-location.schema';
import { LocationHistory, LocationHistoryDocument } from '../schemas/location-history.schema';
import { Geofence, GeofenceDocument } from '../schemas/geofence.schema';
import { GeofenceEvent, GeofenceEventDocument, GeofenceEventType } from '../schemas/geofence-event.schema';
import { Notification, NotificationDocument, NotificationType } from '../schemas/notification.schema';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { Family, FamilyDocument } from '../schemas/family.schema';
import { SocketGateway } from '../socket/socket.gateway';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationHistoryQueryDto } from './dto/location-history-query.dto';

function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    @InjectModel(CurrentLocation.name) private currentLocationModel: Model<CurrentLocationDocument>,
    @InjectModel(LocationHistory.name) private locationHistoryModel: Model<LocationHistoryDocument>,
    @InjectModel(Geofence.name) private geofenceModel: Model<GeofenceDocument>,
    @InjectModel(GeofenceEvent.name) private geofenceEventModel: Model<GeofenceEventDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    private socketGateway: SocketGateway,
    private configService: ConfigService,
  ) {}

  async updateLocation(userId: string, familyId: string, dto: UpdateLocationDto) {
    if (!familyId) {
      throw new BadRequestException('User is not assigned to a family group');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const recordedDate = new Date(dto.recordedAt);
    if (isNaN(recordedDate.getTime())) {
      throw new BadRequestException('Invalid recordedAt date format');
    }

    // Check existing current location record
    let current = await this.currentLocationModel.findOne({ userId: new Types.ObjectId(userId) });

    if (current && current.sharingStatus === SharingStatus.STOPPED) {
      throw new ForbiddenException('Location sharing is currently stopped. Enable sharing to send updates.');
    }

    // Check for stationary duplicates within 10 seconds and < 2 meters
    let isStationaryDuplicate = false;
    if (current) {
      const dist = calculateDistanceInMeters(
        current.latitude,
        current.longitude,
        dto.latitude,
        dto.longitude,
      );
      const timeDiffMs = Math.abs(recordedDate.getTime() - current.recordedAt.getTime());
      if (dist < 2 && timeDiffMs < 10000) {
        isStationaryDuplicate = true;
      }
    }

    // Update current location
    if (!current) {
      current = new this.currentLocationModel({
        userId: new Types.ObjectId(userId),
        familyId: new Types.ObjectId(familyId),
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        altitude: dto.altitude,
        speed: dto.speed,
        batteryPercentage: dto.batteryPercentage,
        sharingStatus: SharingStatus.ACTIVE,
        recordedAt: recordedDate,
        receivedAt: new Date(),
      });
    } else {
      current.latitude = dto.latitude;
      current.longitude = dto.longitude;
      current.accuracy = dto.accuracy;
      if (dto.altitude !== undefined) current.altitude = dto.altitude;
      if (dto.speed !== undefined) current.speed = dto.speed;
      if (dto.batteryPercentage !== undefined) current.batteryPercentage = dto.batteryPercentage;
      current.sharingStatus = SharingStatus.ACTIVE;
      current.recordedAt = recordedDate;
      current.receivedAt = new Date();
    }
    await current.save();

    // Save to location history if not a stationary duplicate
    if (!isStationaryDuplicate) {
      const historyEntry = new this.locationHistoryModel({
        userId: new Types.ObjectId(userId),
        familyId: new Types.ObjectId(familyId),
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        speed: dto.speed,
        batteryPercentage: dto.batteryPercentage,
        recordedAt: recordedDate,
      });
      await historyEntry.save();
    }

    // Evaluate geofences
    await this.evaluateGeofences(user, dto.latitude, dto.longitude, recordedDate);

    // Broadcast realtime update to family room
    const broadcastPayload = {
      userId,
      name: user.name,
      profileImage: user.profileImage,
      relationship: user.relationship,
      latitude: dto.latitude,
      longitude: dto.longitude,
      accuracy: dto.accuracy,
      altitude: dto.altitude,
      speed: dto.speed,
      batteryPercentage: dto.batteryPercentage,
      sharingStatus: SharingStatus.ACTIVE,
      recordedAt: recordedDate,
      isStale: false,
    };

    this.socketGateway.broadcastToFamily(familyId, 'location:updated', broadcastPayload);

    return {
      message: 'Location updated successfully',
      location: broadcastPayload,
    };
  }

  async setSharingStatus(userId: string, familyId: string, status: SharingStatus) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let current = await this.currentLocationModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!current) {
      current = new this.currentLocationModel({
        userId: new Types.ObjectId(userId),
        familyId: new Types.ObjectId(familyId),
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        sharingStatus: status,
        recordedAt: new Date(),
        receivedAt: new Date(),
      });
    } else {
      current.sharingStatus = status;
    }
    await current.save();

    // Broadcast status change
    this.socketGateway.broadcastToFamily(familyId, 'member:sharing-status', {
      userId,
      name: user.name,
      status,
      timestamp: new Date(),
    });

    if (status === SharingStatus.STOPPED) {
      // Create notification
      const notification = new this.notificationModel({
        familyId: new Types.ObjectId(familyId),
        userId: new Types.ObjectId(userId),
        type: NotificationType.SHARING_STOPPED,
        title: 'Location Sharing Stopped',
        message: `${user.name} has stopped sharing their location.`,
      });
      await notification.save();

      this.socketGateway.broadcastToFamily(familyId, 'notification:new', notification);
    }

    return { message: `Location sharing status set to ${status}`, status };
  }

  async getCurrentLocations(familyId: string) {
    if (!familyId) {
      throw new BadRequestException('Family ID required');
    }

    const family = await this.familyModel.findById(familyId);
    const staleThresholdMinutes =
      family?.settings?.staleThresholdMinutes ||
      this.configService.get<number>('STALE_LOCATION_THRESHOLD_MINUTES') ||
      5;

    const staleThresholdTime = new Date(Date.now() - staleThresholdMinutes * 60 * 1000);

    const locations = await this.currentLocationModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .populate('userId', 'name email profileImage relationship accountStatus')
      .lean();

    return locations.map((loc) => {
      const user = loc.userId as any;
      const isStale = loc.sharingStatus === SharingStatus.ACTIVE && new Date(loc.recordedAt) < staleThresholdTime;
      const isOnline = this.socketGateway.isUserOnline(user?._id?.toString() || '');

      return {
        id: loc._id,
        userId: user?._id,
        name: user?.name,
        email: user?.email,
        profileImage: user?.profileImage,
        relationship: user?.relationship,
        accountStatus: user?.accountStatus,
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        altitude: loc.altitude,
        speed: loc.speed,
        batteryPercentage: loc.batteryPercentage,
        sharingStatus: loc.sharingStatus,
        recordedAt: loc.recordedAt,
        receivedAt: loc.receivedAt,
        isStale,
        isOnline,
      };
    });
  }

  async getMemberLocation(familyId: string, memberId: string) {
    const family = await this.familyModel.findById(familyId);
    const staleThresholdMinutes =
      family?.settings?.staleThresholdMinutes ||
      this.configService.get<number>('STALE_LOCATION_THRESHOLD_MINUTES') ||
      5;
    const staleThresholdTime = new Date(Date.now() - staleThresholdMinutes * 60 * 1000);

    const loc = await this.currentLocationModel
      .findOne({
        familyId: new Types.ObjectId(familyId),
        userId: new Types.ObjectId(memberId),
      })
      .populate('userId', 'name email profileImage relationship accountStatus')
      .lean();

    if (!loc) {
      throw new NotFoundException('No location records found for this member');
    }

    const user = loc.userId as any;
    const isStale = loc.sharingStatus === SharingStatus.ACTIVE && new Date(loc.recordedAt) < staleThresholdTime;
    const isOnline = this.socketGateway.isUserOnline(memberId);

    return {
      id: loc._id,
      userId: user?._id,
      name: user?.name,
      email: user?.email,
      profileImage: user?.profileImage,
      relationship: user?.relationship,
      accountStatus: user?.accountStatus,
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracy,
      altitude: loc.altitude,
      speed: loc.speed,
      batteryPercentage: loc.batteryPercentage,
      sharingStatus: loc.sharingStatus,
      recordedAt: loc.recordedAt,
      receivedAt: loc.receivedAt,
      isStale,
      isOnline,
    };
  }

  async getLocationHistory(
    familyId: string,
    query: LocationHistoryQueryDto,
    requestingUserId: string,
    requestingUserRole: string,
  ) {
    const targetUserId = query.userId || requestingUserId;

    // Privacy rule check: members can view their own history; admins can view all authorized members
    if (requestingUserRole === UserRole.MEMBER && targetUserId !== requestingUserId) {
      throw new ForbiddenException('Members are only authorized to view their own location history');
    }

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date range');
    }

    const history = await this.locationHistoryModel
      .find({
        familyId: new Types.ObjectId(familyId),
        userId: new Types.ObjectId(targetUserId),
        recordedAt: { $gte: startDate, $lte: endDate },
      })
      .sort({ recordedAt: 1 })
      .lean();

    return {
      userId: targetUserId,
      startDate,
      endDate,
      totalPoints: history.length,
      points: history.map((pt) => ({
        id: pt._id,
        latitude: pt.latitude,
        longitude: pt.longitude,
        accuracy: pt.accuracy,
        speed: pt.speed,
        batteryPercentage: pt.batteryPercentage,
        recordedAt: pt.recordedAt,
      })),
    };
  }

  private async evaluateGeofences(user: UserDocument, lat: number, lon: number, recordedAt: Date) {
    try {
      const geofences = await this.geofenceModel.find({
        familyId: user.familyId,
        isActive: true,
      });

      for (const fence of geofences) {
        const distance = calculateDistanceInMeters(lat, lon, fence.latitude, fence.longitude);
        const isInside = distance <= fence.radius;

        // Find last event for this user and fence
        const lastEvent = await this.geofenceEventModel
          .findOne({
            userId: user._id,
            geofenceId: fence._id,
          })
          .sort({ recordedAt: -1 });

        const lastState = lastEvent ? lastEvent.eventType : GeofenceEventType.EXIT;

        if (isInside && lastState === GeofenceEventType.EXIT) {
          // ENTER event
          const event = new this.geofenceEventModel({
            userId: user._id,
            familyId: user.familyId,
            geofenceId: fence._id,
            eventType: GeofenceEventType.ENTER,
            latitude: lat,
            longitude: lon,
            recordedAt,
          });
          await event.save();

          // Create notification
          const notif = new this.notificationModel({
            familyId: user.familyId,
            userId: user._id,
            type: NotificationType.GEOFENCE_ENTER,
            title: `Safe Zone Arrived: ${fence.name}`,
            message: `${user.name} has arrived at ${fence.name}.`,
          });
          await notif.save();

          this.socketGateway.broadcastToFamily(user.familyId.toString(), 'geofence:entered', {
            userId: user._id,
            userName: user.name,
            geofenceId: fence._id,
            geofenceName: fence.name,
            timestamp: recordedAt,
          });
        } else if (!isInside && lastState === GeofenceEventType.ENTER) {
          // EXIT event
          const event = new this.geofenceEventModel({
            userId: user._id,
            familyId: user.familyId,
            geofenceId: fence._id,
            eventType: GeofenceEventType.EXIT,
            latitude: lat,
            longitude: lon,
            recordedAt,
          });
          await event.save();

          // Create notification
          const notif = new this.notificationModel({
            familyId: user.familyId,
            userId: user._id,
            type: NotificationType.GEOFENCE_EXIT,
            title: `Safe Zone Left: ${fence.name}`,
            message: `${user.name} has left ${fence.name}.`,
          });
          await notif.save();

          this.socketGateway.broadcastToFamily(user.familyId.toString(), 'geofence:exited', {
            userId: user._id,
            userName: user.name,
            geofenceId: fence._id,
            geofenceName: fence.name,
            timestamp: recordedAt,
          });
        }
      }
    } catch (err) {
      this.logger.error(`Error evaluating geofences for user ${user._id}: ${err.message}`);
    }
  }
}

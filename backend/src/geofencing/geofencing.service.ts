import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Geofence, GeofenceDocument } from '../schemas/geofence.schema';
import { GeofenceEvent, GeofenceEventDocument } from '../schemas/geofence-event.schema';
import { CreateGeofenceDto, UpdateGeofenceDto } from './dto/create-geofence.dto';

@Injectable()
export class GeofencingService {
  constructor(
    @InjectModel(Geofence.name) private geofenceModel: Model<GeofenceDocument>,
    @InjectModel(GeofenceEvent.name) private geofenceEventModel: Model<GeofenceEventDocument>,
  ) {}

  async createGeofence(familyId: string, dto: CreateGeofenceDto) {
    if (!familyId) {
      throw new BadRequestException('Family ID required');
    }

    const fence = new this.geofenceModel({
      familyId: new Types.ObjectId(familyId),
      name: dto.name,
      latitude: dto.latitude,
      longitude: dto.longitude,
      radius: dto.radius,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
    await fence.save();
    return fence;
  }

  async getGeofences(familyId: string) {
    return this.geofenceModel.find({ familyId: new Types.ObjectId(familyId) }).sort({ createdAt: -1 });
  }

  async updateGeofence(familyId: string, id: string, dto: UpdateGeofenceDto) {
    const fence = await this.geofenceModel.findOne({
      _id: new Types.ObjectId(id),
      familyId: new Types.ObjectId(familyId),
    });

    if (!fence) {
      throw new NotFoundException('Safe zone / geofence not found');
    }

    if (dto.name !== undefined) fence.name = dto.name;
    if (dto.latitude !== undefined) fence.latitude = dto.latitude;
    if (dto.longitude !== undefined) fence.longitude = dto.longitude;
    if (dto.radius !== undefined) fence.radius = dto.radius;
    if (dto.isActive !== undefined) fence.isActive = dto.isActive;

    await fence.save();
    return fence;
  }

  async deleteGeofence(familyId: string, id: string) {
    const result = await this.geofenceModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      familyId: new Types.ObjectId(familyId),
    });

    if (!result) {
      throw new NotFoundException('Safe zone / geofence not found');
    }

    return { message: 'Safe zone removed successfully' };
  }

  async getEvents(familyId: string) {
    return this.geofenceEventModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .populate('userId', 'name email profileImage')
      .populate('geofenceId', 'name radius')
      .sort({ recordedAt: -1 })
      .limit(50);
  }
}

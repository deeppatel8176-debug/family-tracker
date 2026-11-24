import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SosAlert, SosAlertDocument, SosStatus } from '../schemas/sos-alert.schema';
import { Notification, NotificationDocument, NotificationType } from '../schemas/notification.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { SocketGateway } from '../socket/socket.gateway';
import { TriggerSosDto } from './dto/trigger-sos.dto';

@Injectable()
export class SosService {
  constructor(
    @InjectModel(SosAlert.name) private sosAlertModel: Model<SosAlertDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private socketGateway: SocketGateway,
  ) {}

  async triggerSos(userId: string, familyId: string, dto: TriggerSosDto) {
    if (!familyId) {
      throw new BadRequestException('User is not assigned to a family group');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const alert = new this.sosAlertModel({
      userId: new Types.ObjectId(userId),
      familyId: new Types.ObjectId(familyId),
      latitude: dto.latitude,
      longitude: dto.longitude,
      status: SosStatus.ACTIVE,
      message: dto.message || `Emergency SOS triggered by ${user.name}`,
      triggeredAt: new Date(),
    });
    await alert.save();

    // Create persistent notification
    const notification = new this.notificationModel({
      familyId: new Types.ObjectId(familyId),
      userId: new Types.ObjectId(userId),
      type: NotificationType.SOS,
      title: 'EMERGENCY SOS ALERT',
      message: `${user.name} has triggered an emergency SOS!`,
    });
    await notification.save();

    const broadcastPayload = {
      alertId: alert._id,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      latitude: dto.latitude,
      longitude: dto.longitude,
      message: alert.message,
      triggeredAt: alert.triggeredAt,
      status: alert.status,
    };

    // Broadcast to family room
    this.socketGateway.broadcastToFamily(familyId, 'sos:alert', broadcastPayload);

    return {
      message: 'SOS emergency alert sent to family members and administrators',
      alert: broadcastPayload,
    };
  }

  async getAlerts(familyId: string) {
    return this.sosAlertModel
      .find({ familyId: new Types.ObjectId(familyId) })
      .populate('userId', 'name email phone profileImage relationship')
      .populate('acknowledgedBy', 'name email')
      .sort({ triggeredAt: -1 })
      .limit(50);
  }

  async acknowledgeAlert(familyId: string, alertId: string, adminId: string) {
    const alert = await this.sosAlertModel.findOne({
      _id: new Types.ObjectId(alertId),
      familyId: new Types.ObjectId(familyId),
    });

    if (!alert) {
      throw new NotFoundException('SOS alert not found');
    }

    alert.status = SosStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = new Types.ObjectId(adminId);
    await alert.save();

    this.socketGateway.broadcastToFamily(familyId, 'sos:acknowledged', {
      alertId: alert._id,
      acknowledgedBy: adminId,
      acknowledgedAt: alert.acknowledgedAt,
    });

    return alert;
  }

  async cancelAlert(familyId: string, alertId: string, userId: string) {
    const alert = await this.sosAlertModel.findOne({
      _id: new Types.ObjectId(alertId),
      familyId: new Types.ObjectId(familyId),
    });

    if (!alert) {
      throw new NotFoundException('SOS alert not found');
    }

    alert.status = SosStatus.CANCELLED;
    alert.cancelledAt = new Date();
    await alert.save();

    this.socketGateway.broadcastToFamily(familyId, 'sos:cancelled', {
      alertId: alert._id,
      cancelledBy: userId,
      cancelledAt: alert.cancelledAt,
    });

    return alert;
  }
}

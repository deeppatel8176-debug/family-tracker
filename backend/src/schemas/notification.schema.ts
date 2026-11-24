import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  SOS = 'sos',
  GEOFENCE_ENTER = 'geofence_enter',
  GEOFENCE_EXIT = 'geofence_exit',
  SHARING_STOPPED = 'sharing_stopped',
  DEVICE_OFFLINE = 'device_offline',
  ACCOUNT = 'account',
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId: Types.ObjectId;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ familyId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

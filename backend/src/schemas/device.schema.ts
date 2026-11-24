import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceDocument = Device & Document;

export enum DeviceType {
  ANDROID = 'android',
  IOS_PWA = 'ios_pwa',
  WEB = 'web',
}

@Schema({ timestamps: true })
export class Device {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: DeviceType })
  deviceType: DeviceType;

  @Prop({ default: 'Unknown Device' })
  deviceName: string;

  @Prop({ default: null })
  deviceToken?: string;

  @Prop({ default: '1.0.0' })
  appVersion: string;

  @Prop({ default: Date.now })
  lastSeen: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
DeviceSchema.index({ userId: 1 });

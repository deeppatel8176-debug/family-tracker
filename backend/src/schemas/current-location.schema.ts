import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CurrentLocationDocument = CurrentLocation & Document;

export enum SharingStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

@Schema({ timestamps: true })
export class CurrentLocation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  latitude: number;

  @Prop({ required: true, type: Number })
  longitude: number;

  @Prop({ default: 0, type: Number })
  accuracy: number;

  @Prop({ default: null, type: Number })
  altitude?: number;

  @Prop({ default: null, type: Number })
  speed?: number;

  @Prop({ default: null, type: Number })
  batteryPercentage?: number;

  @Prop({ required: true, enum: SharingStatus, default: SharingStatus.ACTIVE })
  sharingStatus: SharingStatus;

  @Prop({ required: true, type: Date })
  recordedAt: Date;

  @Prop({ default: Date.now, type: Date })
  receivedAt: Date;
}

export const CurrentLocationSchema = SchemaFactory.createForClass(CurrentLocation);
CurrentLocationSchema.index({ familyId: 1 });
CurrentLocationSchema.index({ recordedAt: -1 });

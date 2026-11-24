import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SosAlertDocument = SosAlert & Document;

export enum SosStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class SosAlert {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  latitude: number;

  @Prop({ required: true, type: Number })
  longitude: number;

  @Prop({ required: true, enum: SosStatus, default: SosStatus.ACTIVE })
  status: SosStatus;

  @Prop({ default: 'Emergency SOS activated' })
  message: string;

  @Prop({ required: true, type: Date, default: Date.now })
  triggeredAt: Date;

  @Prop({ default: null })
  acknowledgedAt?: Date;

  @Prop({ default: null })
  acknowledgedBy?: Types.ObjectId;

  @Prop({ default: null })
  cancelledAt?: Date;
}

export const SosAlertSchema = SchemaFactory.createForClass(SosAlert);
SosAlertSchema.index({ familyId: 1, triggeredAt: -1 });
SosAlertSchema.index({ userId: 1, status: 1 });

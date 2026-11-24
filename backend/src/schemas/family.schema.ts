import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FamilyDocument = Family & Document;

@Schema({ _id: false })
export class FamilySettings {
  @Prop({ default: 30 })
  retentionDays: number;

  @Prop({ default: 5 })
  staleThresholdMinutes: number;

  @Prop({ default: true })
  allowHistoryViewByMembers: boolean;

  @Prop({ default: false })
  strictGeofenceNotifications: boolean;
}

@Schema({ timestamps: true })
export class Family {
  @Prop({ required: true, trim: true })
  familyName: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adminId: Types.ObjectId;

  @Prop({ type: FamilySettings, default: () => ({}) })
  settings: FamilySettings;
}

export const FamilySchema = SchemaFactory.createForClass(Family);
FamilySchema.index({ adminId: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LocationHistoryDocument = LocationHistory & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class LocationHistory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
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
  speed?: number;

  @Prop({ default: null, type: Number })
  batteryPercentage?: number;

  @Prop({ required: true, type: Date })
  recordedAt: Date;
}

export const LocationHistorySchema = SchemaFactory.createForClass(LocationHistory);
LocationHistorySchema.index({ userId: 1, recordedAt: -1 });
LocationHistorySchema.index({ familyId: 1, recordedAt: -1 });
LocationHistorySchema.index({ recordedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // Default 90 day TTL index fallback

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GeofenceEventDocument = GeofenceEvent & Document;

export enum GeofenceEventType {
  ENTER = 'enter',
  EXIT = 'exit',
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class GeofenceEvent {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Geofence', required: true })
  geofenceId: Types.ObjectId;

  @Prop({ required: true, enum: GeofenceEventType })
  eventType: GeofenceEventType;

  @Prop({ required: true, type: Number })
  latitude: number;

  @Prop({ required: true, type: Number })
  longitude: number;

  @Prop({ required: true, type: Date })
  recordedAt: Date;
}

export const GeofenceEventSchema = SchemaFactory.createForClass(GeofenceEvent);
GeofenceEventSchema.index({ userId: 1, recordedAt: -1 });
GeofenceEventSchema.index({ familyId: 1, recordedAt: -1 });

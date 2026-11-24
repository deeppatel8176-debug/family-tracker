import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GeofenceDocument = Geofence & Document;

@Schema({ timestamps: true })
export class Geofence {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true })
  familyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, type: Number })
  latitude: number;

  @Prop({ required: true, type: Number })
  longitude: number;

  @Prop({ required: true, type: Number, default: 200 }) // radius in meters
  radius: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const GeofenceSchema = SchemaFactory.createForClass(Geofence);
GeofenceSchema.index({ familyId: 1 });

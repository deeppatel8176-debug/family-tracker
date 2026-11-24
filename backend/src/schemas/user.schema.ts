import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum AccountStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId, ref: 'Family', default: null })
  familyId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: null })
  phone?: string;

  @Prop({ select: false })
  passwordHash?: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @Prop({ default: null })
  profileImage?: string;

  @Prop({ default: null })
  relationship?: string;

  @Prop({ required: true, enum: AccountStatus, default: AccountStatus.PENDING })
  accountStatus: AccountStatus;

  @Prop({ type: String, unique: true, sparse: true })
  invitationCode?: string;

  @Prop({ default: null })
  invitationExpiresAt?: Date;

  @Prop({ default: null })
  resetPasswordToken?: string;

  @Prop({ default: null })
  resetPasswordExpires?: Date;

  @Prop({ default: null })
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ familyId: 1 });

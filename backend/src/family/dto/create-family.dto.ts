import { IsNotEmpty, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FamilySettingsDto {
  @IsOptional()
  retentionDays?: number;

  @IsOptional()
  staleThresholdMinutes?: number;

  @IsOptional()
  allowHistoryViewByMembers?: boolean;

  @IsOptional()
  strictGeofenceNotifications?: boolean;
}

export class CreateFamilyDto {
  @IsString()
  @IsNotEmpty()
  familyName: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FamilySettingsDto)
  settings?: FamilySettingsDto;
}

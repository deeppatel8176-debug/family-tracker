import { IsEnum, IsNotEmpty } from 'class-validator';
import { SharingStatus } from '../../schemas/current-location.schema';

export class LocationSharingToggleDto {
  @IsEnum(SharingStatus)
  @IsNotEmpty()
  status: SharingStatus;
}

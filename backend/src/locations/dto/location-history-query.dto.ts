import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LocationHistoryQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

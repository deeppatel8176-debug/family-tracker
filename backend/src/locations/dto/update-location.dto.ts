import { IsNotEmpty, IsNumber, IsOptional, Min, Max, IsDateString } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @IsNotEmpty()
  accuracy: number;

  @IsOptional()
  @IsNumber()
  altitude?: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryPercentage?: number;

  @IsDateString()
  @IsNotEmpty()
  recordedAt: string;
}

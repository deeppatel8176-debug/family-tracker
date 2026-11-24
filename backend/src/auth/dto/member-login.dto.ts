import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class MemberLoginDto {
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  deviceName?: string;
}

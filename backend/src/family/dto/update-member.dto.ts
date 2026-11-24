import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountStatus } from '../../schemas/user.schema';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus?: AccountStatus;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

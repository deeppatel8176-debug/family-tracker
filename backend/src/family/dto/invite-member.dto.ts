import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InviteMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  relationship?: string;
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, AccountStatus } from '../../schemas/user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  familyId?: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super_secret_family_tracker_access_key_2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userModel.findById(payload.sub).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException('Account has been suspended');
    }
    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      familyId: user.familyId ? user.familyId.toString() : undefined,
      name: user.name,
    };
  }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { Family, FamilySchema } from '../schemas/family.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { CurrentLocation, CurrentLocationSchema } from '../schemas/current-location.schema';
import { Device, DeviceSchema } from '../schemas/device.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Family.name, schema: FamilySchema },
      { name: User.name, schema: UserSchema },
      { name: CurrentLocation.name, schema: CurrentLocationSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
})
export class FamilyModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { Family, FamilySchema } from '../schemas/family.schema';
import { CurrentLocation, CurrentLocationSchema } from '../schemas/current-location.schema';
import { SosAlert, SosAlertSchema } from '../schemas/sos-alert.schema';
import { Geofence, GeofenceSchema } from '../schemas/geofence.schema';
import { Notification, NotificationSchema } from '../schemas/notification.schema';
import { Device, DeviceSchema } from '../schemas/device.schema';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Family.name, schema: FamilySchema },
      { name: CurrentLocation.name, schema: CurrentLocationSchema },
      { name: SosAlert.name, schema: SosAlertSchema },
      { name: Geofence.name, schema: GeofenceSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
    SocketModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

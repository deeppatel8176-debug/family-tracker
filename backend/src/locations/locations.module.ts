import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { CurrentLocation, CurrentLocationSchema } from '../schemas/current-location.schema';
import { LocationHistory, LocationHistorySchema } from '../schemas/location-history.schema';
import { Geofence, GeofenceSchema } from '../schemas/geofence.schema';
import { GeofenceEvent, GeofenceEventSchema } from '../schemas/geofence-event.schema';
import { Notification, NotificationSchema } from '../schemas/notification.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Family, FamilySchema } from '../schemas/family.schema';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CurrentLocation.name, schema: CurrentLocationSchema },
      { name: LocationHistory.name, schema: LocationHistorySchema },
      { name: Geofence.name, schema: GeofenceSchema },
      { name: GeofenceEvent.name, schema: GeofenceEventSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Family.name, schema: FamilySchema },
    ]),
    SocketModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeofencingService } from './geofencing.service';
import { GeofencingController } from './geofencing.controller';
import { Geofence, GeofenceSchema } from '../schemas/geofence.schema';
import { GeofenceEvent, GeofenceEventSchema } from '../schemas/geofence-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Geofence.name, schema: GeofenceSchema },
      { name: GeofenceEvent.name, schema: GeofenceEventSchema },
    ]),
  ],
  controllers: [GeofencingController],
  providers: [GeofencingService],
  exports: [GeofencingService],
})
export class GeofencingModule {}

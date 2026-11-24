import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { FamilyModule } from './family/family.module';
import { MembersModule } from './members/members.module';
import { LocationsModule } from './locations/locations.module';
import { GeofencingModule } from './geofencing/geofencing.module';
import { SosModule } from './sos/sos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://127.0.0.1:27017/family_tracker',
      }),
      inject: [ConfigService],
    }),
    SocketModule,
    AuthModule,
    FamilyModule,
    MembersModule,
    LocationsModule,
    GeofencingModule,
    SosModule,
    DashboardModule,
  ],
})
export class AppModule {}

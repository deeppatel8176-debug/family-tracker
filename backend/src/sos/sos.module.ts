import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SosService } from './sos.service';
import { SosController } from './sos.controller';
import { SosAlert, SosAlertSchema } from '../schemas/sos-alert.schema';
import { Notification, NotificationSchema } from '../schemas/notification.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SosAlert.name, schema: SosAlertSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    SocketModule,
  ],
  controllers: [SosController],
  providers: [SosService],
  exports: [SosService],
})
export class SosModule {}

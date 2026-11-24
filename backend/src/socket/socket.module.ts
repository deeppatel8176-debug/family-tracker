import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { SocketGateway } from './socket.gateway';

@Global()
@Module({
  imports: [JwtModule, ConfigModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}

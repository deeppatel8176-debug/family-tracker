import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
    role: string;
    familyId?: string;
    name: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);
  private onlineUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        client.handshake.query?.token;

      if (!token || typeof token !== 'string') {
        this.logger.warn(`Socket connection rejected: No token provided (${client.id})`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'super_secret_family_tracker_access_key_2026',
      });

      client.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        familyId: payload.familyId,
        name: payload.name,
      };

      if (payload.familyId) {
        const familyRoom = `family:${payload.familyId}`;
        client.join(familyRoom);
        this.logger.log(`User ${payload.name} (${payload.sub}) joined room ${familyRoom}`);

        // Track online status
        if (!this.onlineUsers.has(payload.sub)) {
          this.onlineUsers.set(payload.sub, new Set());
        }
        this.onlineUsers.get(payload.sub).add(client.id);

        this.server.to(familyRoom).emit('member:online', {
          userId: payload.sub,
          name: payload.name,
          timestamp: new Date(),
        });
      }
    } catch (err) {
      this.logger.error(`Socket auth failed for ${client.id}: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user && client.user.familyId) {
      const { userId, familyId, name } = client.user;
      const userSockets = this.onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.onlineUsers.delete(userId);
          const familyRoom = `family:${familyId}`;
          this.server.to(familyRoom).emit('member:offline', {
            userId,
            name,
            timestamp: new Date(),
          });
        }
      }
      this.logger.log(`User ${name} disconnected (${client.id})`);
    }
  }

  isUserOnline(userId: string): boolean {
    const sockets = this.onlineUsers.get(userId);
    return !!(sockets && sockets.size > 0);
  }

  broadcastToFamily(familyId: string, event: string, data: any) {
    this.server.to(`family:${familyId}`).emit(event, data);
  }

  @SubscribeMessage('member:heartbeat')
  handleHeartbeat(@ConnectedSocket() client: AuthenticatedSocket) {
    return { status: 'acknowledged', timestamp: new Date() };
  }
}

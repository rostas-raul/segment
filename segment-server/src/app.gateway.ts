import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import config from './config';
import { User } from './schema/database/User';
import { CreateApiResponse } from './schema/dto/Api';
import { Models } from './schema/Models';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
@Injectable()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  connectedSockets: [Socket, { sub: string; username: string }][] = [];

  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(Models.User) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const accessToken = client.handshake.auth.token._value;
    const decoded = this.jwtService.verify(accessToken, {
      secret: config.jwtSecret,
    });

    if (decoded.sub && (await this.userModel.exists({ _id: decoded.sub }))) {
      client.emit(
        'ws.handshake',
        CreateApiResponse({
          status: 'OK',
        }),
      );
      this.connectedSockets.push([client, decoded]);
    } else {
      client.emit(
        'ws.handshake',
        CreateApiResponse({
          status: 'FAIL',
        }),
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedSockets = this.connectedSockets.filter(
      (s) => s[0].id !== client.id,
    );
  }

  async sendToUser(username: string, message: string, data: any) {
    const s = this.connectedSockets;
    const found = s.find((socket) => socket[1].username === username);
    found?.[0]?.emit(message, CreateApiResponse({ status: 'OK', data }));
  }
}

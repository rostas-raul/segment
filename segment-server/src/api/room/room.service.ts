import { Settings } from '@/main';
import { Room } from '@/schema/database/Room';
import { User } from '@/schema/database/User';
import { UserToken } from '@/schema/dto/User';
import { Models } from '@/schema/Models';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonArgonConfiguration, sha256 } from '@/util/Crypto';
import * as argon2 from 'argon2';
import * as moment from 'moment';
import { randomUUID } from 'crypto';
import { CreateRoomDto, JoinRoomDto, SendMessageDto } from './room.validation';
import { splitStringNth } from '@/util/Common';
import {
  CommonMessages,
  CreateApiResponse,
  MessageMessages,
  RoomMessages,
} from '@/schema/dto/Api';
import { RoomMessage } from '@/schema/database/RoomMessage';
import * as rsa from 'node-rsa';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Models.User) private readonly userModel: Model<User>,
    @InjectModel(Models.Room) private readonly roomModel: Model<Room>,
  ) {}

  public async getRooms(user: UserToken) {
    return CreateApiResponse({
      status: 'OK',
      data: await this.roomModel.find({
        participants: `${user.username}@${Settings.server.hostname}`,
      }),
    });
  }

  public async getRoom(roomId: string, user: UserToken) {
    return CreateApiResponse({
      status: 'OK',
      data: await this.roomModel.findOne({
        id: roomId,
        participants: `${user.username}@${Settings.server.hostname}`,
      }),
    });
  }

  public async createRoom(roomOptions: CreateRoomDto, user: UserToken) {
    const room = new this.roomModel({
      roomName: roomOptions.roomName,
      roomDescription: roomOptions.roomDescription,
      roomVisibility: roomOptions.roomVisibility || 'private',
      roomPassword: roomOptions.roomPassword
        ? await argon2.hash(roomOptions.roomPassword, CommonArgonConfiguration)
        : null,

      // Auto-generated
      id: randomUUID(),
      participants: [`${user.username}@${Settings.server.hostname}`],
      createdAt: moment().toISOString(),
    });

    await room.save();

    return CreateApiResponse({
      status: 'OK',
      data: room,
    });
  }

  public async joinRoom(joinRoom: JoinRoomDto, user: UserToken) {
    const [roomId, roomHost] = splitStringNth(joinRoom.roomId, ':', 1);
    const roomPassword = joinRoom.roomPassword || null;

    // check if the host is us
    if (Settings.server.hostname === roomHost) {
      // we can check the server locally
      return this.localJoinRoom(roomId, roomPassword, user);
    } else {
      // send a request to the host
      return this.remoteJoinRoom(roomId, roomHost, roomPassword, user);
    }
  }

  private async localJoinRoom(
    roomId: string,
    roomPassword: string | null,
    user: UserToken,
  ) {
    const room = await this.roomModel.findOne({ id: roomId });

    if (!room) {
      return CreateApiResponse({
        status: 'FAIL',
        message: RoomMessages.RoomNotFound,
      });
    }

    if (
      room.participants.includes(`${user.username}@${Settings.server.hostname}`)
    ) {
      return CreateApiResponse({
        status: 'FAIL',
        message: RoomMessages.UserAlreadyJoined,
      });
    }

    if (room.roomPassword && !roomPassword) {
      return CreateApiResponse({
        status: 'FAIL',
        message: RoomMessages.RoomPasswordRequired,
      });
    }

    if (
      room.roomPassword &&
      !argon2.verify(room.roomPassword, roomPassword, CommonArgonConfiguration)
    ) {
      return CreateApiResponse({
        status: 'FAIL',
        message: RoomMessages.RoomPasswordIncorrect,
      });
    }

    room.participants.push(`${user.username}@${Settings.server.hostname}`);
    await room.save();

    return CreateApiResponse({
      status: 'OK',
      data: room,
    });
  }

  private async remoteJoinRoom(
    roomId: string,
    roomHost: string,
    roomPassword: string | null,
    user: UserToken,
  ) {
    //
  }
}

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Models.User) private readonly userModel: Model<User>,
    @InjectModel(Models.Room) private readonly roomModel: Model<Room>,
    @InjectModel(Models.RoomMessage)
    private readonly messageModel: Model<RoomMessage>,
  ) {}

  public async getMessages(roomId: string, page: number, user: UserToken) {
    // Check if there is a room where the user is a participant
    if (
      !(await this.roomModel.exists({
        id: roomId,
        participants: `${user.username}@${Settings.server.hostname}`,
      }))
    ) {
      return CreateApiResponse({
        status: 'FAIL',
        message: CommonMessages.Unauthorized,
      });
    }

    return CreateApiResponse({
      status: 'OK',
      data: await this.messageModel
        .find({
          room: roomId,
        })
        .sort({ timestamp: -1 })
        .skip((page - 1) * 25)
        .limit(25),
    });
  }

  public async sendMessage(
    sendMessage: SendMessageDto,
    roomId: string,
    user: UserToken,
  ) {
    // check if the user has permission to post in the room
    if (
      !(await this.roomModel.exists({
        id: roomId,
        participants: `${user.username}@${Settings.server.hostname}`,
      }))
    ) {
      return CreateApiResponse({
        status: 'FAIL',
        message: CommonMessages.Unauthorized,
      });
    }

    // check if the message is empty or not
    if (!sendMessage.body.content) {
      return CreateApiResponse({
        status: 'FAIL',
        message: MessageMessages.EmptyMessage,
      });
    }

    const savedUser = await this.userModel.findOne({ _id: user._id });
    const deviceId = user.deviceId;
    const userPublicKey = savedUser.devices.find(
      (d) => d.deviceId === deviceId,
    ).publicKey;

    if (!userPublicKey) {
      return CreateApiResponse({
        status: 'FAIL',
        message: MessageMessages.PublicKeyNeeded,
      });
    }

    // check if the signature is valid
    const sig = sendMessage.body.signature;
    const key = new rsa({ b: 1024 }).importKey(userPublicKey.content, 'public');

    if (
      !key.verify(sha256(sendMessage.body.content), Buffer.from(sig, 'base64'))
    ) {
      return CreateApiResponse({
        status: 'FAIL',
        message: MessageMessages.InvalidSignature,
      });
    }

    // save the message to the database
    const message = new this.messageModel({
      room: roomId,
      id: randomUUID(),
      sender: `${user.username}@${Settings.server.hostname}`,
      body: {
        content: sendMessage.body.content,
        signature: sendMessage.body.signature,
      },
      timestamp: moment().toISOString(),
    });

    await message.save();

    return CreateApiResponse({
      status: 'OK',
      data: message,
    });
  }
}

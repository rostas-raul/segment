import { Settings } from '@/main';
import { Room } from '@/schema/database/Room';
import { User } from '@/schema/database/User';
import { UserToken } from '@/schema/dto/User';
import { Models } from '@/schema/Models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonArgonConfiguration, sha256 } from '@/util/Crypto';
import * as argon2 from 'argon2';
import * as moment from 'moment';
import { randomUUID } from 'crypto';
import {
  CreateRoomDto,
  ClientJoinRoomDto,
  SendMessageDto,
  ServerJoinRoomDto,
  ServerSyncRoomDto,
  SubmitDHKeyDto,
} from './room.validation';
import { splitStringNth, usernameToId } from '@/util/Common';
import {
  ApiResponse,
  CommonMessages,
  CreateApiResponse,
  CreateOutgoingRequest,
  getPayloadFromData,
  MessageMessages,
  OutgoingRequest,
  RoomMessages,
} from '@/schema/dto/Api';
import { RoomMessage } from '@/schema/database/RoomMessage';
import * as rsa from 'node-rsa';
import { AppGateway } from '@/app.gateway';
import {
  fetchKeysFromHost,
  fetchUserKeysFromHost,
  shouldBlockRequest,
} from '@/util/HTTP';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { importKey } from '@/util/Key';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Models.User) private readonly userModel: Model<User>,
    @InjectModel(Models.Room) private readonly roomModel: Model<Room>,
    @InjectModel(Models.RoomMessage)
    private readonly messageModel: Model<RoomMessage>,
    private readonly httpService: HttpService,
  ) {}

  public async getRooms(user: UserToken) {
    return CreateApiResponse({
      status: 'OK',
      data: await this.roomModel.find({
        participants: { sub: usernameToId(user.username) },
      }),
    });
  }

  public async getRoom(roomId: string, user: UserToken) {
    return CreateApiResponse({
      status: 'OK',
      data: await this.roomModel.findOne({
        id: roomId,
        participants: { sub: usernameToId(user.username) },
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
      id: roomOptions.dm === true ? randomUUID() : `dm!${randomUUID()}`,
      participants: [{ sub: usernameToId(user.username), status: 0 }, ...roomOptions.participants.map(x => ({sub: x, status: 1}))],
      createdAt: moment().toISOString(),
    });

    await room.save();

    return CreateApiResponse({
      status: 'OK',
      data: room,
    });
  }

  public async joinRoom(joinRoom: ClientJoinRoomDto, user: UserToken) {
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
    origin: string | null = null,
  ) {
    const room = await this.roomModel.findOne({ id: roomId });

    if (!room) {
      return CreateApiResponse({
        status: 'FAIL',
        message: RoomMessages.RoomNotFound,
      });
    }

    if (room.participants.some(x => x.sub === usernameToId(user.username))) {
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

    if (room.participants.some(x => x.sub === usernameToId(user.username, origin))) {
      room.participants[room.participants.findIndex(x => x.sub === usernameToId(user.username, origin))].status = 0;
    } else {
      room.participants.push({ sub: usernameToId(user.username, origin), status: 0 });
    }

    room.markModified('participants');
    await room.save();

    return CreateApiResponse(
      {
        status: 'OK',
        data: room,
      },
      origin ? 'server' : 'client',
    );
  }

  private async remoteJoinRoom(
    roomId: string,
    roomHost: string,
    roomPassword: string | null,
    user: UserToken,
  ) {
    // Check if we are allowed to send a request to the host
    if (shouldBlockRequest(roomHost))
      return CreateApiResponse({
        status: 'FAIL',
        message: RoomMessages.InvalidHost,
      });

    // Send the request through the HTTP service
    let requestError: null | ApiResponse = null;
    const { data } = await firstValueFrom(
      this.httpService
        .post<ApiResponse<Room>>(
          `http://${new URL('./server/rooms/join', roomHost)}`,
          CreateOutgoingRequest<ServerJoinRoomDto>({
            origin: Settings.server.hostname,
            destination: roomHost,
            roomId,
            roomPassword,
            user: usernameToId(user.username),
          }),
        )
        .pipe(
          catchError((_: AxiosError) => {
            requestError = CreateApiResponse({
              status: 'FAIL',
              message: RoomMessages.InvalidOrOfflineHost,
            });
            throw requestError;
          }),
        ),
    );

    if (requestError) return requestError;

    if (data.status === 'FAIL') {
      let errorMessage: RoomMessages = RoomMessages.UnknownError;

      switch (data.message) {
        case RoomMessages.RoomNotFound:
        case RoomMessages.RoomPasswordRequired:
        case RoomMessages.RoomPasswordIncorrect:
        case RoomMessages.UserAlreadyJoined:
          errorMessage = data.message;
      }

      return CreateApiResponse({
        status: 'FAIL',
        message: errorMessage,
      });
    } else {
      const defaultResponse = CreateApiResponse({
        status: 'FAIL',
        message: RoomMessages.UnknownError,
      });

      const serverKey = await fetchKeysFromHost(roomHost, this.httpService);
      if (!serverKey.data) return defaultResponse;

      // check if the room exists
      // if it does, check if the signature is valid
      try {
        if (
          !data.data ||
          !importKey(serverKey.data).verify(
            getPayloadFromData(data.data),
            Buffer.from(data.signature),
          )
        ) {
          return defaultResponse;
        }
      } catch {
        return defaultResponse;
      }

      const room = new this.roomModel({
        // the id is overwritten to prevent collision
        id: `${roomHost}:${data.data.id}`,
        ...data.data,
      });

      // attempt to save the room
      try {
        await room.save();
      } catch {
        // the room was invalid
        return defaultResponse;
      }

      // sync the room's messages
      await this.syncRoom(roomId, roomHost);

      // return the room to the user
      return CreateApiResponse({
        status: 'OK',
        data: room,
      });
    }
  }

  public async syncRoom(roomId: string, roomHost: string) {
    // Check if we are allowed to send a request to the host
    if (shouldBlockRequest(roomHost))
      return CreateApiResponse({
        status: 'FAIL',
        message: 'HOST_BLOCKED',
      });

    // Send the request through the HTTP service
    let requestError: null | ApiResponse = null;
    const { data } = await firstValueFrom(
      this.httpService
        .post<ApiResponse<RoomMessage[]>>(
          `http://${new URL('./server/rooms/sync', roomHost)}`,
          CreateOutgoingRequest<ServerSyncRoomDto>({
            origin: Settings.server.hostname,
            destination: roomHost,
            roomId,
          }),
        )
        .pipe(
          catchError((_: AxiosError) => {
            requestError = CreateApiResponse({
              status: 'FAIL',
              message: RoomMessages.InvalidOrOfflineHost,
            });
            throw requestError;
          }),
        ),
    );

    if (requestError) return requestError;

    if (data.status === 'FAIL') {
      let errorMessage: RoomMessages = RoomMessages.UnknownError;

      switch (data.message) {
        case RoomMessages.RoomNotFound:
        case RoomMessages.RoomPasswordRequired:
        case RoomMessages.RoomPasswordIncorrect:
        case RoomMessages.UserAlreadyJoined:
          errorMessage = data.message;
      }

      return CreateApiResponse({
        status: 'FAIL',
        message: errorMessage,
      });
    } else {
      const defaultResponse = CreateApiResponse({
        status: 'FAIL',
        message: RoomMessages.UnknownError,
      });

      const serverKey = await fetchKeysFromHost(roomHost, this.httpService);
      if (!serverKey.data) return defaultResponse;

      try {
        if (
          !data.data ||
          !importKey(serverKey.data).verify(
            getPayloadFromData(data.data),
            Buffer.from(data.signature),
          )
        ) {
          return defaultResponse;
        }
      } catch {
        return defaultResponse;
      }

      const keyCache: { [key: string]: rsa[] } = {};
      const msg: RoomMessage[] = [];

      // verify message signatures
      data.data.forEach(async (message) => {
        if (!keyCache[message.sender]) {
          const keys = await fetchUserKeysFromHost(
            roomHost,
            message.sender,
            true,
            null,
            this.httpService,
          );

          const keyStrings = [];
          keys.data.forEach((k) => {
            k.deprecated.forEach((d) => keyStrings.push(d.publicKey));
            keyStrings.push(k.publicKey.content);
          });

          const keyInstances = [];
          keyStrings.forEach((ks) => {
            try {
              keyInstances.push(importKey(ks, 'public'));
            } catch {}
          });

          keyCache[message.sender] = keyInstances;
        }

        let flag = false;
        try {
          keyCache[message.sender].forEach((k) => {
            const res = k.verify(
              getPayloadFromData(message.body.content),
              Buffer.from(message.body.signature),
            );

            if (res === true) flag = true;
          });
        } catch {
          message.verified = false;
        } finally {
          flag === false
            ? (message.verified = false)
            : (message.verified = true);
        }

        const roomMessage = new this.messageModel(message);

        try {
          roomMessage.save();
        } catch {}
      });
    }
  }

  public async serverSyncRoom(syncRoom: OutgoingRequest<ServerSyncRoomDto>) {
    // check if we are the destination
    if (syncRoom.data.destination !== Settings.server.hostname) {
      return CreateApiResponse({
        status: 'FAIL',
        message: RoomMessages.InvalidHost,
      });
    }

    const defaultResponse = CreateApiResponse({
      status: 'FAIL',
      message: CommonMessages.InvalidOrigin,
    });

    // verify the origin
    const serverKey = await fetchKeysFromHost(
      syncRoom.data.origin,
      this.httpService,
    );
    if (!serverKey.data) return defaultResponse;

    // check if the data exists
    // if it does, check if the signature is valid
    try {
      if (
        !syncRoom.data ||
        !importKey(serverKey.data).verify(
          getPayloadFromData(syncRoom.data),
          Buffer.from(syncRoom.signature),
        )
      ) {
        return defaultResponse;
      }
    } catch {
      return defaultResponse;
    }

    // check if the room exists
    const room = await this.roomModel.findOne({ id: syncRoom.data.roomId });

    if (!room) {
      return CreateApiResponse({
        status: 'FAIL',
        message: RoomMessages.RoomNotFound,
      });
    }

    // check if a member exists with the hostname
    if (
      !room.participants.some((x) => x.sub.split('@')[1] === syncRoom.data.origin)
    ) {
      return CreateApiResponse({
        status: 'FAIL',
        message: CommonMessages.Unauthorized,
      });
    }

    // send the messages
    const messages = await this.messageModel.find({ room: room.id });
    return CreateApiResponse(
      {
        status: 'OK',
        data: messages,
      },
      'server',
    );
  }

  public async serverJoinRoom(joinRoom: OutgoingRequest<ServerJoinRoomDto>) {
    // check if we are for sure the destination
    if (joinRoom.data.destination !== Settings.server.hostname) {
      return CreateApiResponse({
        status: 'FAIL',
        message: RoomMessages.InvalidHost,
      });
    }

    const defaultResponse = CreateApiResponse({
      status: 'FAIL',
      message: CommonMessages.InvalidOrigin,
    });

    // verify the origin
    const serverKey = await fetchKeysFromHost(
      joinRoom.data.origin,
      this.httpService,
    );
    if (!serverKey.data) return defaultResponse;

    // check if the data exists
    // if it does, check if the signature is valid
    try {
      if (
        !joinRoom.data ||
        !importKey(serverKey.data).verify(
          getPayloadFromData(joinRoom.data),
          Buffer.from(joinRoom.signature),
        )
      ) {
        return defaultResponse;
      }
    } catch {
      return defaultResponse;
    }

    // we can use localJoinRoom to try to join the room
    return this.localJoinRoom(
      joinRoom.data.roomId,
      joinRoom.data.roomPassword,
      {
        _id: null,
        deviceId: null,
        username: joinRoom.data.user,
      },
    );
  }

  public async submitDHKey(submitDHKey: SubmitDHKeyDto, roomId: string, user: UserToken) {
    // Check if there is a room where the user is a participant
    const room = await this.roomModel.findOne({
      id: roomId,
      participants: { sub: usernameToId(user.username) },
    });
    
    if (
      !room
    ) {
      return CreateApiResponse({
        status: 'FAIL',
        message: CommonMessages.Unauthorized,
      });
    }

    // Check if the room is a dm or not
    if (!room.id.startsWith('dm!')) {
      return CreateApiResponse({
        status: 'FAIL',
        message: CommonMessages.NotPossible,
      });
    }

    // Check if the user has already submitted an ephemeral key
    if (room._ephemeral.some(x => x.sub === usernameToId(user.username))) {
      // Replace it
      const i = room._ephemeral.findIndex(x => x.sub === usernameToId(user.username))
      room._ephemeral[i].key = submitDHKey.publicKey;
      room._ephemeral[i].rel = false;
      room._ephemeral[i].ts = moment().toISOString();
    }

    // Create it
    room._ephemeral.push({
      sub: usernameToId(user.username),
      key: submitDHKey.publicKey,
      rel: false,
      ts: moment().toISOString(),
    });

    room.markModified('_ephemeral');
    await room.save();

    // TODO: relay the key to the other participant

    return CreateApiResponse({ status: 'OK' });
  }
}

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Models.User) private readonly userModel: Model<User>,
    @InjectModel(Models.Room) private readonly roomModel: Model<Room>,
    @InjectModel(Models.RoomMessage)
    private readonly messageModel: Model<RoomMessage>,
    private readonly appGateway: AppGateway,
  ) {}

  public async getMessages(roomId: string, page: number, user: UserToken) {
    // Check if there is a room where the user is a participant
    if (
      !(await this.roomModel.exists({
        id: roomId,
        participants: { sub: usernameToId(user.username) },
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
    const room = await this.roomModel.findOne({
      id: roomId,
      participants: { sub: usernameToId(user.username) },
    });

    // check if the user has permission to post in the room
    if (!room) {
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
    const key = importKey(userPublicKey.content, 'public');

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
      sender: usernameToId(user.username),
      body: {
        content: sendMessage.body.content,
        signature: sendMessage.body.signature,
      },
      timestamp: moment().toISOString(),
    });

    await message.save();

    // Check if we need to send a notification to any of the participants
    const users = room.participants
      .filter((user) => user.sub.endsWith(Settings.server.hostname))
      .map((username) => username.sub.split('@')[0]);

    users.forEach((user) => {
      this.appGateway.sendToUser(user, 'ws.refresh', {
        channel: 'messages',
        id: room.id,
      });
    });

    return CreateApiResponse({
      status: 'OK',
      data: message,
    });
  }
}

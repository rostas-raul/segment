import { User } from '@/decorators/user.decorator';
import {
  CommonMessages,
  CreateApiResponse,
  OutgoingRequest,
} from '@/schema/dto/Api';
import { UserToken } from '@/schema/dto/User';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { MessageService, RoomService } from './room.service';
import {
  CreateRoomDto,
  ClientJoinRoomDto,
  SendMessageDto,
  ServerJoinRoomDto,
  ServerSyncRoomDto,
} from './room.validation';
import { validate } from 'class-validator';

@Controller('/client/rooms')
export class ClientRoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  public getRooms(@User() user: UserToken) {
    return this.roomService.getRooms(user);
  }

  @Get(':roomId')
  @UseGuards(JwtAuthGuard)
  public getRoom(@Param('roomId') roomId: string, @User() user: UserToken) {
    return this.roomService.getRoom(roomId, user);
  }

  @Get(':roomId/messages/:page')
  @UseGuards(JwtAuthGuard)
  public getMessages(
    @Param('roomId') roomId: string,
    @Param('page') page: number,
    @User() user: UserToken,
  ) {
    return this.messageService.getMessages(roomId, page, user);
  }

  @Post(':roomId/messages')
  @UseGuards(JwtAuthGuard)
  public sendMessage(
    @Body() sendMessage: SendMessageDto,
    @Param('roomId') roomId: string,
    @User() user: UserToken,
  ) {
    return this.messageService.sendMessage(sendMessage, roomId, user);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  public createRoom(
    @Body() createRoom: CreateRoomDto,
    @User() user: UserToken,
  ) {
    return this.roomService.createRoom(createRoom, user);
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  public joinRoom(
    @Body() joinRoom: ClientJoinRoomDto,
    @User() user: UserToken,
  ) {
    return this.roomService.joinRoom(joinRoom, user);
  }
}

@Controller('/server/rooms')
export class ServerRoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
  ) {}

  @Post('sync')
  public async syncRoom(@Body() syncRoom: OutgoingRequest<ServerSyncRoomDto>) {
    // manual validation
    const dto = new ServerSyncRoomDto();
    dto.destination = syncRoom.data.destination;
    dto.origin = syncRoom.data.origin;
    dto.roomId = syncRoom.data.roomId;

    if ((await validate(dto)).length > 0) {
      return CreateApiResponse({
        status: 'FAIL',
        message: CommonMessages.ValidationError,
      });
    }

    return this.roomService.serverSyncRoom(syncRoom);
  }

  @Post('join')
  public async joinRoom(@Body() joinRoom: OutgoingRequest<ServerJoinRoomDto>) {
    // manual validation
    const dto = new ServerJoinRoomDto();
    dto.destination = joinRoom.data.destination;
    dto.origin = joinRoom.data.origin;
    dto.roomId = joinRoom.data.roomId;
    dto.roomPassword = joinRoom.data.roomPassword;
    dto.user = joinRoom.data.user;

    if ((await validate(dto)).length > 0) {
      return CreateApiResponse({
        status: 'FAIL',
        message: CommonMessages.ValidationError,
      });
    }

    return this.roomService.serverJoinRoom(joinRoom);
  }
}

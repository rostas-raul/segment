import { User } from '@/decorators/user.decorator';
import { UserToken } from '@/schema/dto/User';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { MessageService, RoomService } from './room.service';
import { CreateRoomDto, JoinRoomDto, SendMessageDto } from './room.validation';

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
  public joinRoom(@Body() joinRoom: JoinRoomDto, @User() user: UserToken) {
    return this.roomService.joinRoom(joinRoom, user);
  }
}

import { AppGateway } from '@/app.gateway';
import config from '@/config';
import { RoomSchema } from '@/schema/database/Room';
import { RoomMessageSchema } from '@/schema/database/RoomMessage';
import { UserSchema } from '@/schema/database/User';
import { Models } from '@/schema/Models';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientRoomController } from './room.controller';
import { MessageService, RoomService } from './room.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Models.User, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Models.Room, schema: RoomSchema }]),
    MongooseModule.forFeature([
      { name: Models.RoomMessage, schema: RoomMessageSchema },
    ]),
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ClientRoomController],
  providers: [RoomService, MessageService, AppGateway],
})
export class RoomModule {}

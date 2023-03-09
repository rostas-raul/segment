import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './api/auth/auth.module';
import { RoomModule } from './api/room/room.module';
import { KeysModule } from './api/keys/keys.module';
import { AppGateway } from './app.gateway';
import { JwtModule } from '@nestjs/jwt';
import config from './config';
import { UserSchema } from './schema/database/User';
import { Models } from './schema/Models';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Models.User, schema: UserSchema }]),
    MongooseModule.forRoot('mongodb://127.0.0.1/segment'),
    AuthModule,
    RoomModule,
    KeysModule,
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}

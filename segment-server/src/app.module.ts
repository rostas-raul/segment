import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './api/auth/auth.module';
import { RoomModule } from './api/room/room.module';
import { KeysModule } from './api/keys/keys.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1/segment'),
    AuthModule,
    RoomModule,
    KeysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

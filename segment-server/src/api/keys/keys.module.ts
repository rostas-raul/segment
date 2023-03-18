import { UserSchema } from '@/schema/database/User';
import { Models } from '@/schema/Models';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientKeysController } from './keys.controller';
import { KeysService } from './keys.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Models.User, schema: UserSchema }]),
  ],
  controllers: [ClientKeysController],
  providers: [KeysService],
})
export class KeysModule {}

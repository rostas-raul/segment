import { User } from '@/decorators/user.decorator';
import { UserToken } from '@/schema/dto/User';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { KeysService } from './keys.service';
import { UploadKeyDto } from './keys.validation';

@Controller('/client/keys')
export class ClientKeysController {
  constructor(private readonly keysService: KeysService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  public getKeys(@User() user: UserToken) {
    return this.keysService.getKeys(user);
  }

  @Put('upload')
  @UseGuards(JwtAuthGuard)
  public uploadKey(@Body() uploadKey: UploadKeyDto, @User() user: UserToken) {
    return this.keysService.uploadKey(uploadKey, user);
  }

  @Delete(':keyId')
  @UseGuards(JwtAuthGuard)
  public deprecateKey(@Param('keyId') keyId: string, @User() user: UserToken) {
    return this.keysService.deprecateKey(keyId, user);
  }
}

@Controller('/server/keys')
export class ServerKeysController {
  constructor(private readonly keysService: KeysService) {}

  @Get()
  public getKeys() {
    return this.keysService.getServerKeys();
  }

  @Get(':userId')
  public getUserKeys(
    @Param('userId') userId: string,
    @Query('deprecated') deprecated: boolean,
    @Query('timestamp') timestamp: string,
  ) {
    return this.keysService.getUserKeys(userId, deprecated, timestamp);
  }
}

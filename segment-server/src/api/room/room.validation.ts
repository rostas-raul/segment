import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

const roomVisibility = ['public', 'private'] as const;
type TRoomVisibility = (typeof roomVisibility)[number];

export class CreateRoomDto {
  @IsString()
  @IsDefined()
  roomName: string;

  @IsOptional()
  @IsString()
  roomDescription?: string;

  @IsOptional()
  @IsString()
  @IsIn(roomVisibility)
  roomVisibility?: TRoomVisibility;

  @IsOptional()
  @IsString()
  roomPassword?: string;

  @IsOptional()
  @IsArray()
  participants?: string[];

  @IsOptional()
  @IsBoolean()
  dm?: boolean;
}

export class ClientJoinRoomDto {
  @IsString()
  @IsDefined()
  roomId: string;

  @IsOptional()
  @IsString()
  roomPassword?: string;
}

export class ServerSyncRoomDto {
  @IsString()
  @IsDefined()
  origin: string;

  @IsString()
  @IsDefined()
  destination: string;

  @IsString()
  @IsDefined()
  roomId: string;
}

export class ServerJoinRoomDto {
  @IsString()
  @IsDefined()
  origin: string;

  @IsString()
  @IsDefined()
  destination: string;

  @IsString()
  @IsDefined()
  roomId: string;

  @IsString()
  @IsDefined()
  user: string;

  @IsOptional()
  @IsString()
  roomPassword?: string;
}

export class SendMessageBodyDto {
  @IsString()
  @IsDefined()
  @MaxLength(1024)
  content: string;

  @IsString()
  @IsDefined()
  signature: string;
}

export class SendMessageDto {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => SendMessageBodyDto)
  body!: SendMessageBodyDto;
}

export class SubmitDHKeyDto {
  @IsString()
  @IsDefined()
  publicKey: string;
}

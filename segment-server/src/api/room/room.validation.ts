import { Type } from 'class-transformer';
import {
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
}

export class ClientJoinRoomDto {
  @IsString()
  @IsDefined()
  roomId: string;

  @IsOptional()
  @IsString()
  roomPassword?: string;
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

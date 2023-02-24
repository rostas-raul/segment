import { Type } from 'class-transformer';
import {
  IsDefined,
  IsIn,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
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

export class JoinRoomDto {
  @IsString()
  @IsDefined()
  roomId: string;

  @IsOptional()
  @IsString()
  roomPassword?: string;
}

export class SendMessageBodyDto {
  @IsString()
  @IsDefined()
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

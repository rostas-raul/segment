import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SettingsServerValidator {
  @IsString()
  @IsNotEmpty()
  hostname: string;

  @IsString()
  @IsNotEmpty()
  ip: string;

  @IsNumber()
  port: number;

  @IsNumber()
  keySize: number;
}

export class SettingsAuthValidator {
  @IsBoolean()
  allowRegistration?: boolean;
}

export class SettingsValidator {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => SettingsServerValidator)
  server!: SettingsServerValidator;

  @ValidateNested()
  auth: SettingsAuthValidator;
}

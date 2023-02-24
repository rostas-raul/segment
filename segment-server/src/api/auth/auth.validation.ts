import { AuthMessages } from '@/schema/dto/Api';
import {
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsStrongPassword,
  IsString,
  IsOptional,
  IsAlphanumeric,
} from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({
    message: AuthMessages.UsernameEmpty,
  })
  @MaxLength(16, {
    message: AuthMessages.UsernameLong,
  })
  @MinLength(3, {
    message: AuthMessages.UsernameShort,
  })
  @IsString({
    message: AuthMessages.UsernameText,
  })
  @IsAlphanumeric()
  username: string;

  @IsNotEmpty({
    message: AuthMessages.PasswordEmpty,
  })
  @MaxLength(256, {
    message: AuthMessages.PasswordLong,
  })
  @MinLength(8, {
    message: AuthMessages.PasswordShort,
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message: AuthMessages.PasswordNotStrong,
    },
  )
  @IsString({
    message: AuthMessages.PasswordText,
  })
  password: string;
}

export class LoginUserDto {
  @IsNotEmpty({
    message: AuthMessages.UsernameEmpty,
  })
  @MaxLength(16, {
    message: AuthMessages.UsernameLong,
  })
  @MinLength(3, {
    message: AuthMessages.UsernameShort,
  })
  @IsString({
    message: AuthMessages.UsernameText,
  })
  @IsAlphanumeric()
  username: string;

  @IsNotEmpty({
    message: AuthMessages.PasswordEmpty,
  })
  @MaxLength(256, {
    message: AuthMessages.PasswordLong,
  })
  @MinLength(8, {
    message: AuthMessages.PasswordShort,
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message: AuthMessages.PasswordNotStrong,
    },
  )
  @IsString({
    message: AuthMessages.PasswordText,
  })
  password: string;

  @IsOptional()
  @IsString({
    message: AuthMessages.DeviceIdText,
  })
  @MaxLength(128, {
    message: AuthMessages.DeviceIdLong,
  })
  deviceId?: string;
}

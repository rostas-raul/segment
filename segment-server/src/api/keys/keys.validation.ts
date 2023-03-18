import { IsDefined, IsString } from 'class-validator';

export class UploadKeyDto {
  @IsString()
  @IsDefined()
  publicKey: string;

  @IsString()
  @IsDefined()
  signature: string;
}

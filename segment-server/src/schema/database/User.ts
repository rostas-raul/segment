import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export interface IUserDevice {
  /** A unique UUID for their device (generated at first launch and kept until the user chooses to remove it) */
  deviceId: string;
  /** The user's custom name for the device. */
  deviceName?: string;
  /** The user's uploaded public key, stored in PEM format. */
  publicKey?: {
    id: string;
    content: string;
  };
  /** The user's previously uploaded public keys, now deprecated. */
  deprecated: Array<{ publicKey: string; deprecatedAt: string }>;
}

@Schema()
export class User {
  /** Max 16 character, alphanumerical username */
  @Prop({ index: { unique: true } }) username: string;
  @Prop() password: string;

  /** ISO timestamp for the registration date */
  @Prop() registerDate: string;
  /** ISO timestamp for the last login date */
  @Prop() loginDate: string;
  /** ISO timestamp for the last date the user connected to the userserver websocket. */
  @Prop() lastSeen: string;

  /**
   * Devices and their respective keys
   * See *Developer Documentation/Devices* in Obsidian for more info.
   */
  @Prop([
    {
      deviceId: String,
      deviceName: String,
      publicKey: {
        id: String,
        content: String,
      },
      deprecated: [{ publicKey: String, deprecatedAt: String }],
    },
  ])
  devices: IUserDevice[];
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

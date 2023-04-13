import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Room {
  /** Optional array for storing submitted ephemeral keys */
  @Prop() _ephemeral?: { sub: string; key: string; ts: string; rel: boolean; }[];

  /** A unique UUID created for the room. */
  @Prop({ index: { unique: true } }) id: string;

  /** A list of participants that are engaging in the conversation. */
  /** 
   * `status` `0` means active participant.
   * `status` `1` means invited participant.
   */
  @Prop() participants: { sub: string; status: number }[];

  /** A custom string users can provde for their room. */
  @Prop() roomName: string;
  /** A small description users can provide for their room. */
  @Prop() roomDescription?: string;
  /** Determines the visibility of the room. Visible rooms can be asked for by sending a request to a userserver. Direct and personal messages are automatically private, and they reserve a custom id. */
  @Prop({ type: String }) roomVisibility: 'public' | 'private';
  /** A password hashed by argon2id that users may have to provide before joining. */
  @Prop() roomPassword?: string;

  /** An ISO timestamp indicating when the room was created. */
  @Prop() createdAt: string;
}

export type RoomDocument = HydratedDocument<Room>;
export const RoomSchema = SchemaFactory.createForClass(Room);

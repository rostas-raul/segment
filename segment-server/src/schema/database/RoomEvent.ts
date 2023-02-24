import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TRoomEventType =
  | 'ROOM_CREATE'
  | 'USER_JOIN'
  | 'USER_LEAVE'
  | 'ROOM_UPDATE_NAME'
  | 'ROOM_UPDATE_DESCRIPTION'
  | 'ROOM_UPDATE_HANDLE'
  | 'ROOM_UPDATE_VISIBILITY'
  | 'ROOM_UPDATE_PASSWORD';

@Schema()
export class RoomEvent<T = unknown> {
  /** A unique UUID for the event */
  @Prop({ index: { unique: true } }) id: string;

  /** The event type, see type `TRoomEventType`. */
  @Prop({ type: String }) type: TRoomEventType;

  /** The name of who has initiated this action. `undefined` if it's a system event. */
  @Prop() initiator?: string;

  /** ISO timestamp when the event happened */
  @Prop() timestamp: string;

  /** Optional body field for additional information */
  @Prop({ type: Object }) body?: T;
}

export type RoomEventDocument = HydratedDocument<RoomEvent>;
export const RoomEventSchema = SchemaFactory.createForClass(RoomEvent);

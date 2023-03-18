import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export interface RoomMessageAttachment {
  /** The unique ID generated for the attachment. */
  attachmentId: string;
  /** The original file name of the attachment. */
  name: string;
  /** A Uint8Array of the attachment binary data. */
  blob: Uint8Array;
  /** A signature of the blob's hash */
  signature: string;
}

@Schema()
export class RoomMessage {
  /** The room the message has been sent to. */
  @Prop() room: string;

  /** A unique UUID for the message */
  @Prop({ index: { unique: true } }) id: string;

  /** The ID if the user who has sent the message. */
  @Prop() sender: string;

  /** The message data itself */
  @Prop({ type: Object }) body: {
    /** The text message itself. */
    content: string;
    /** A signature of the content's hash */
    signature: string;
    /** An array of attachments */
    attachments?: RoomMessageAttachment[];
  };

  /** True if the signature matches a publicly available key */
  @Prop() verified?: boolean;

  /** The time and date the message was sent */
  @Prop() timestamp: string;
}

export type RoomMessageDocument = HydratedDocument<RoomMessage>;
export const RoomMessageSchema = SchemaFactory.createForClass(RoomMessage);

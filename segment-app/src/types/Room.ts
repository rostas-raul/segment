export type TRoomEventType =
  | 'ROOM_CREATE'
  | 'USER_JOIN'
  | 'USER_LEAVE'
  | 'ROOM_UPDATE_NAME'
  | 'ROOM_UPDATE_DESCRIPTION'
  | 'ROOM_UPDATE_HANDLE'
  | 'ROOM_UPDATE_VISIBILITY'
  | 'ROOM_UPDATE_PASSWORD';

export interface Room {
  id: string;
  participants: { sub: string; status: number }[];

  roomName: string;
  roomDescription?: string;
  roomVisibility: 'public' | 'private';
  roomPassword?: string;
  createdAt: string;
  _ephemeral?: { sub: string; key: string; ts: string; rel: boolean }[];
}

export interface RoomEvent<T = unknown> {
  id: string;
  type: TRoomEventType;
  initiator?: string;
  timestamp: string;
  body?: T;
}

export interface RoomMessageAttachment {
  attachmentId: string;
  name: string;
  blob: Uint8Array;
  signature: string;
}

export interface RoomMessage {
  room: string;
  id: string;
  sender: string;
  body: {
    content: string;
    signature: string;
    attachments?: RoomMessageAttachment[];
  };
  timestamp: string;
}

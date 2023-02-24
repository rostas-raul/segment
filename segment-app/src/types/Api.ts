export type ApiMessages =
  | CommonMessages
  | MessageMessages
  | RoomMessages
  | KeyMessages
  | AuthMessages
  | MiscMessages;

export interface ApiResponse<T = unknown, K = ApiMessages> {
  /** The status of the request. */
  status: 'OK' | 'FAIL';
  /** A simple message about the action done. [optional if `status` is `OK`] */
  message?: K;
  /** Response data encoded in JSON [optional] */
  data?: T;
  /** RSA signature of the stringified data [optional if `data` is undefined/null] */
  signature?: string;
}

export enum CommonMessages {
  ValidationError = 'VALIDATION_ERROR',
  Unauthorized = 'UNAUTHORIZED',
}

export enum RoomMessages {
  RoomNotFound = 'ROOM_NOT_FOUND',
  RoomPasswordRequired = 'PASSWORD_REQUIRED',
  RoomPasswordIncorrect = 'PASSWORD_INCORRECT',
  UserAlreadyJoined = 'USER_ALREADY_JOINED',
}

export enum MessageMessages {
  PublicKeyNeeded = 'PUBLIC_KEY_REQUIRED',
  InvalidSignature = 'INVALID_SIGNATURE',
}

export enum KeyMessages {
  InvalidSignature = 'INVALID_SIGNATURE',
}

export enum AuthMessages {
  UsernameTaken = 'USERNAME_EXISTS',
  UserNotFound = 'USER_NOT_FOUND',
  PasswordIncorrect = 'PASSWORD_INCORRECT',
  RegistrationDisabled = 'REGISTRATION_DISABLED',

  // Validation Errors
  UsernameEmpty = 'USERNAME_CANNOT_BE_EMPTY',
  UsernameLong = 'USERNAME_TOO_LONG',
  UsernameShort = 'USERNAME_TOO_SHORT',
  UsernameText = 'USERNAME_MUST_BE_TEXT',
  PasswordEmpty = 'PASSWORD_CANNOT_BE_EMPTY',
  PasswordLong = 'PASSWORD_TOO_LONG',
  PasswordShort = 'PASSWORD_TOO_SHORT',
  PasswordNotStrong = 'PASSWORD_NOT_STRONG',
  PasswordText = 'PASSWORD_MUST_BE_TEXT',
  DeviceIdLong = 'DEVICEID_TOO_LONG',
  DeviceIdText = 'DEVICEID_MUST_BE_TEXT',
}

export enum MiscMessages {
  HelloWorld = 'HELLO_WORLD',
}

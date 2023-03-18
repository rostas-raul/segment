import { sha256 } from '@/util/Crypto';
import { getServerPrivateKey } from '@/util/Key';

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

export interface OutgoingRequest<T = unknown> {
  data: T;
  signature: string;
}

export enum CommonMessages {
  ValidationError = 'VALIDATION_ERROR',
  Unauthorized = 'UNAUTHORIZED',
  InvalidOrigin = 'INVALID_ORIGIN',
}

export enum RoomMessages {
  RoomNotFound = 'ROOM_NOT_FOUND',
  RoomPasswordRequired = 'PASSWORD_REQUIRED',
  RoomPasswordIncorrect = 'PASSWORD_INCORRECT',
  UserAlreadyJoined = 'USER_ALREADY_JOINED',
  InvalidHost = 'INVALID_HOST',
  InvalidOrOfflineHost = 'INVALID_OR_OFFLINE_HOST',
  UnknownError = 'UNKNOWN_ERROR_FROM_HOST',
}

export enum MessageMessages {
  PublicKeyNeeded = 'PUBLIC_KEY_REQUIRED',
  InvalidSignature = 'INVALID_SIGNATURE',
  EmptyMessage = 'EMPTY_MESSAGE',
}

export enum KeyMessages {
  UserNotFound = 'USER_NOT_FOUND',
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

export function CreateApiResponse<T = unknown, K = ApiMessages>(
  apiResponse: ApiResponse<T, K>,
  type: 'client' | 'server' = 'client',
): ApiResponse<T, K> {
  if (type === 'server' && !apiResponse.signature && !!apiResponse.data) {
    // Sign the data
    const payload = getPayloadFromData(apiResponse.data);
    const sig = getServerPrivateKey().sign(payload, 'base64');
    apiResponse.signature = sig;
  }

  return apiResponse;
}

export function CreateOutgoingRequest<T = string | number | boolean | object>(
  data: T,
): OutgoingRequest<T> {
  const payload = getPayloadFromData(data);
  const signature = getServerPrivateKey().sign(payload, 'base64');

  return {
    data,
    signature,
  };
}

export function getPayloadFromData<T = string | number | boolean | object>(
  data: T,
) {
  return sha256(JSON.stringify(data));
}

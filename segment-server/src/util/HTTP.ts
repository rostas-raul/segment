import { Injectable } from '@nestjs/common';
import { HttpModuleOptionsFactory, HttpModuleOptions } from '@nestjs/axios';
import { Settings } from '@/main';
import {
  ApiResponse,
  CreateApiResponse,
  getPayloadFromData,
} from '@/schema/dto/Api';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { importKey } from './Key';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  createHttpOptions(): HttpModuleOptions {
    return {
      timeout: 5000,
      maxRedirects: 2,
    };
  }
}

export function shouldBlockRequest(hostname: string): boolean {
  return Settings.server.disallowedHostnames.some(
    (hn) =>
      hn.startsWith('regex:')
        ? new RegExp(hn.substring(6)).test(hostname) // regex test
        : hn.includes(hostname), // check if it includes the hostname
  );
}

export async function fetchKeysFromHost<
  R = ApiResponse<string, 'HOST_BLOCKED' | 'HOST_OFFLINE' | 'INVALID_KEYS'>,
>(hostname: string, httpService: HttpService): Promise<R> {
  if (shouldBlockRequest(hostname))
    return CreateApiResponse({
      status: 'FAIL',
      message: 'HOST_BLOCKED',
    }) as R;

  let requestError: null | R = null;
  const { data } = await firstValueFrom(
    httpService
      .get<
        ApiResponse<{
          publicKey: string;
        }>
      >(`http://${new URL('./server/keys', hostname)}`)
      .pipe(
        catchError((_: AxiosError) => {
          requestError = CreateApiResponse({
            status: 'FAIL',
            message: 'HOST_OFFLINE',
          }) as R;
          throw requestError;
        }),
      ),
  );

  if (requestError) return requestError;

  if (!data.data || !data.data.publicKey || !data.signature)
    return CreateApiResponse({
      status: 'FAIL',
      message: 'INVALID_KEYS',
    }) as R;

  // validate the response
  try {
    const payload = getPayloadFromData(data.data);
    if (
      importKey(data.data.publicKey).verify(
        payload,
        Buffer.from(data.signature),
      )
    ) {
      return CreateApiResponse({
        status: 'OK',
        data: data.data.publicKey,
      }) as R;
    } else {
      CreateApiResponse({
        status: 'FAIL',
        message: 'INVALID_KEYS',
      }) as R;
    }
  } catch {
    return CreateApiResponse({
      status: 'FAIL',
      message: 'INVALID_KEYS',
    }) as R;
  }

  return CreateApiResponse({
    status: 'OK',
    data: data.data,
  }) as R;
}

export async function fetchUserKeysFromHost<
  R = ApiResponse<
    {
      publicKey: {
        id: string;
        content: string;
      };
      deprecated: {
        publicKey: string;
        deprecatedAt: string;
      }[];
    }[],
    'HOST_BLOCKED' | 'HOST_OFFLINE' | 'INVALID_KEYS' | 'USER_NOT_FOUND'
  >,
>(
  hostname: string,
  userId: string,
  deprecated: boolean,
  timestamp: string | null,
  httpService: HttpService,
): Promise<R> {
  if (shouldBlockRequest(hostname))
    return CreateApiResponse({
      status: 'FAIL',
      message: 'HOST_BLOCKED',
    }) as R;

  let requestError: null | R = null;
  const { data } = await firstValueFrom(
    httpService
      .get<
        ApiResponse<
          {
            publicKey: {
              id: string;
              content: string;
            };
            deprecated: {
              publicKey: string;
              deprecatedAt: string;
            }[];
          }[]
        >
      >(
        `http://${new URL(
          `./server/keys/${userId}`,
          hostname,
        )}?deprecated=${deprecated}&timestamp=${timestamp}`,
      )
      .pipe(
        catchError((_: AxiosError) => {
          requestError = CreateApiResponse({
            status: 'FAIL',
            message: 'HOST_OFFLINE',
          }) as R;
          throw requestError;
        }),
      ),
  );

  if (requestError) return requestError;

  if (!data.data || !data.signature)
    return CreateApiResponse({
      status: 'FAIL',
      message: 'INVALID_KEYS',
    }) as R;

  // verify the signature
  const serverKey = await fetchKeysFromHost(hostname, httpService);
  if (!serverKey.data)
    return CreateApiResponse({
      status: 'FAIL',
      message: 'INVALID_KEYS',
    }) as R;

  try {
    if (
      importKey(serverKey.data).verify(
        getPayloadFromData(data.data),
        Buffer.from(data.signature),
      )
    ) {
      return CreateApiResponse({
        status: 'FAIL',
        message: 'INVALID_KEYS',
      }) as R;
    }
  } catch {
    return CreateApiResponse({
      status: 'FAIL',
      message: 'INVALID_KEYS',
    }) as R;
  }

  return CreateApiResponse({
    status: 'OK',
    data: data.data,
  }) as R;
}

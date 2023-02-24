import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { IPCEvents } from '@/electron/ipc/IPC';
import { ipcRenderer } from 'electron';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types/Api';
import { Room, RoomMessage } from '@/types/Room';

/** Store used for settings and persistent things. */
export const useLocalStore = defineStore('local', () => {
  const theme = ref(useStorage<'light' | 'dark'>('theme', 'light'));
  const lastUserserver = ref(
    useStorage<{ host: string; username: string | null }>('lastUserserver', {
      host: 'https://segment.chat',
      username: null,
    }),
  );

  return { theme, lastUserserver };
});

/** Authentication related things */
export const useAuthStore = defineStore('auth', () => {
  const keypair = ref(
    useStorage<{ public: string | null; private: string | null }>('keypair', {
      public: null,
      private: null,
    }),
  );
  const userserver = ref(useStorage<string>('userserver', null));
  const deviceId = ref(useStorage<string>('deviceId', null));
  const accessToken = ref(useStorage<string>('accessToken', null));

  async function login(
    userserver: string,
    credentials: {
      username: string;
      password: string;
      deviceId?: string;
    },
    ct: (err: AxiosError) => unknown,
  ) {
    const res = await axios
      .post<ApiResponse<{ errors?: string[] }>>(
        `${userserver}client/auth/login`,
        {
          username: credentials.username,
          password: credentials.password,
          deviceId: credentials.deviceId || undefined,
        },
      )
      .catch((err: AxiosError) => ct(err));

    const data: ApiResponse<{
      errors?: string[];
      accessToken?: string;
      deviceId?: string;
    }> = (res as AxiosResponse).data || (res as AxiosError).response?.data;

    return data;
  }

  async function register(
    userserver: string,
    credentials: {
      username: string;
      password: string;
    },
    ct: (err: AxiosError) => unknown,
  ) {
    const res = await axios
      .post<ApiResponse<{ errors?: string[] }>>(
        `${userserver}client/auth/register`,
        {
          username: credentials.username,
          password: credentials.password,
        },
      )
      .catch((err: AxiosError) => ct(err));

    const data: ApiResponse<{
      errors?: string[];
    }> = (res as AxiosResponse).data || (res as AxiosError).response?.data;

    return data;
  }

  async function generateKeyPair() {
    keypair.value = ipcRenderer.sendSync(IPCEvents.GenerateRSAKeyPair);
  }

  async function checkKeys(
    userserver: string,
    ct: (err: AxiosError) => unknown,
  ) {
    const res = await axios
      .get(`${userserver}client/keys`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
      .catch((err: AxiosError) => ct(err));

    const data: ApiResponse<
      {
        id: string;
        content: string;
      }[]
    > = (res as AxiosResponse).data || (res as AxiosError).response?.data;

    if (
      data.data &&
      data.data.some((k) => k.content === keypair.value.public)
    ) {
      return true;
    } else {
      return false;
    }
  }

  async function uploadKeys(
    userserver: string,
    ct: (err: AxiosError) => unknown,
  ) {
    const uploaded = await checkKeys(userserver, ct);

    if (!uploaded) {
      const res = await axios
        .put(
          `${userserver}client/keys/upload`,
          {
            publicKey: keypair.value.public,
            signature: ipcRenderer.sendSync(
              IPCEvents.SignDataRSA,
              keypair.value.private,
              keypair.value.public,
            ),
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken.value}`,
            },
          },
        )
        .catch((err: AxiosError) => ct(err));
    }
  }

  return {
    keypair,
    userserver,
    deviceId,
    accessToken,
    login,
    register,
    generateKeyPair,
    uploadKeys,
  };
});

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore();

  async function fetchRooms(
    userserver: string,
    ct: (err: AxiosError) => unknown,
  ): Promise<ApiResponse<Room[]>> {
    const res = await axios
      .get<ApiResponse<RoomMessage>>(`${userserver}client/rooms`, {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      })
      .catch((err: AxiosError) => ct(err));

    const data: ApiResponse<Room[]> =
      (res as AxiosResponse).data || (res as AxiosError).response?.data;

    return data;
  }

  async function fetchRoom(
    userserver: string,
    roomId: string,
    ct: (err: AxiosError) => unknown,
  ): Promise<ApiResponse<Room>> {
    const res = await axios
      .get<ApiResponse<RoomMessage>>(`${userserver}client/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      })
      .catch((err: AxiosError) => ct(err));

    const data: ApiResponse<Room> =
      (res as AxiosResponse).data || (res as AxiosError).response?.data;

    return data;
  }

  async function fetchMessages(
    userserver: string,
    roomId: string,
    page: number,
    ct: (err: AxiosError) => unknown,
  ) {
    const res = await axios
      .get<ApiResponse<RoomMessage[]>>(
        `${userserver}client/rooms/${roomId}/messages/${page}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        },
      )
      .catch((err: AxiosError) => ct(err));

    const data: ApiResponse<RoomMessage[]> =
      (res as AxiosResponse).data || (res as AxiosError).response?.data;

    data.data = data.data?.reverse();

    return data;
  }

  async function sendMessage(
    userserver: string,
    roomId: string,
    message: string,
    ct: (err: AxiosError) => unknown,
  ) {
    const res = await axios
      .post<ApiResponse>(
        `${userserver}client/rooms/${roomId}/messages/`,
        {
          body: {
            content: message,
            signature: ipcRenderer.sendSync(
              IPCEvents.SignDataRSA,
              authStore.keypair.private,
              message,
            ),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        },
      )
      .catch((err: AxiosError) => ct(err));

    const data: ApiResponse<RoomMessage[]> =
      (res as AxiosResponse).data || (res as AxiosError).response?.data;

    return data;
  }

  return { fetchRooms, fetchRoom, fetchMessages, sendMessage };
});

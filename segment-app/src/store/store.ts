import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { IPCEvents } from '@/electron/ipc/IPC';
import { ipcRenderer } from 'electron';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types/Api';
import { Room, RoomMessage } from '@/types/Room';
import { io, Socket } from 'socket.io-client';

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
  const chatStore = useChatStore();

  const keypair = ref(
    useStorage<{ public: string | null; private: string | null }>('keypair', {
      public: null,
      private: null,
    }),
  );
  const userserver = ref(useStorage<string>('userserver', null));
  const deviceId = ref(useStorage<string>('deviceId', null));
  const accessToken = ref(useStorage<string>('accessToken', null));
  const username = ref(useStorage<string>('username', null));
  const socket = ref<null | Socket>(null);

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

    await postLogin(userserver);

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

  async function postLogin(userserver: string) {
    // fetch username
    const res = await axios
      .get<ApiResponse<{ username: string }>>(`${userserver}client/auth/self`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
      .catch((err: AxiosError) => err);

    const data: ApiResponse<{
      username: string;
    }> = (res as AxiosResponse).data || (res as AxiosError).response?.data;

    username.value = data.data?.username;

    socket.value = io(userserver, {
      auth: {
        token: accessToken,
      },
    });

    registerSocket();
  }

  async function generateKeyPair() {
    keypair.value = ipcRenderer.sendSync(IPCEvents.GenerateRSAKeyPair);
  }

  async function registerSocket() {
    const s = socket.value;

    // Handshake
    s?.on('ws.handshake', (msg: ApiResponse) => {
      if (msg.status === 'FAIL') {
        throw new Error('Failed to authenticate with the WebSocket server!');
      }
    });

    // Refresh the current chat
    s?.on(
      'ws.refresh',
      (msg: ApiResponse<{ channel: 'room' | 'messages'; id?: string }>) => {
        if (msg.data?.channel === 'messages') {
          // Refresh the current chat's messages
          if (chatStore.currentRoom !== null) {
            chatStore.currentRoom('refresh.messages');
          }
        }
      },
    );
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
    username,
    socket,
    login,
    register,
    postLogin,
    generateKeyPair,
    uploadKeys,
  };
});

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore();

  const rooms = ref<Room[]>([]);

  const currentRoom: (event: string) => unknown = () => null;

  async function createRoom(
    userserver: string,
    body: {
      roomName: string;
      roomDescription?: string;
      roomVisibility?: 'public' | 'private';
      roomPassword?: string;
    },
    ct: (err: AxiosError) => unknown,
  ): Promise<ApiResponse<Room>> {
    const res = await axios
      .post<ApiResponse<Room>>(`${userserver}client/rooms/create`, body, {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      })
      .catch((err: AxiosError) => ct(err));

    const data: ApiResponse<Room> =
      (res as AxiosResponse).data || (res as AxiosError).response?.data;

    return data;
  }

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

    if (data.data) {
      rooms.value = data.data;
    }

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

  return {
    createRoom,
    fetchRooms,
    fetchRoom,
    fetchMessages,
    sendMessage,
    currentRoom,
    rooms,
  };
});

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { IPCEvents } from '@/electron/ipc/IPC';
import { ipcRenderer } from 'electron';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types/Api';
import { Room, RoomMessage } from '@/types/Room';
import { io, Socket } from 'socket.io-client';
import { localUserId } from '@/util/Common';
import * as crypto from 'crypto';
import { KeyObject } from 'crypto';

/** Store used for settings and persistent things. */
export const useLocalStore = defineStore('local', () => {
  const theme = ref(useStorage<'light' | 'dark'>('theme', 'light'));
  const lastUserserver = ref(
    useStorage<{ host: string; username: string | null }>('lastUserserver', {
      host: 'https://segment.chat',
      username: null,
    }),
  );
  const ephemeralKeys = ref(
    useStorage<
      {
        sub: string;
        privateKey: string;
        publicKey: string;
        gen: string;
        prime: string;
      }[]
    >('ephemeralKeys', []),
  );
  const sharedSecrets = ref(
    useStorage<{ sub: string; key: string }[]>('sharedSecrets', []),
  );

  function toggleTheme() {
    theme.value === 'dark' ? (theme.value = 'light') : (theme.value = 'dark');
    document.documentElement.setAttribute('data-theme', theme.value);
  }

  return { theme, lastUserserver, ephemeralKeys, sharedSecrets, toggleTheme };
});

/** Authentication related things */
export const useAuthStore = defineStore('auth', () => {
  const chatStore = useChatStore();
  const localStore = useLocalStore();

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

    await postLogin(userserver, data.data?.accessToken || null);

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

  async function postLogin(userserver: string, accessToken: string | null) {
    if (!accessToken) return;

    // fetch username
    const res = await axios
      .get<ApiResponse<{ username: string }>>(`${userserver}client/auth/self`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
      (msg: ApiResponse<{ channel: 'rooms' | 'messages'; id?: string }>) => {
        switch (msg.data?.channel) {
          case 'messages': {
            if (chatStore.currentRoom !== null) {
              chatStore.currentRoom('refresh.messages');
            }
            return;
          }
          case 'rooms': {
            chatStore.fetchRooms(localStore.lastUserserver.host, () =>
              console.error('Failed to fetch rooms'),
            );
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

    // Failsaife in case keypair doesn't exist
    if (!keypair.value.public || !keypair.value.private) {
      await generateKeyPair();
    }

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
  const localStore = useLocalStore();

  const rooms = ref<Room[]>([]);
  let dhFlag = false;

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

    console.log('attempting to ferform dh...');
    if (!dhFlag) performDH(userserver);

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

    const data: ApiResponse<RoomMessage> =
      (res as AxiosResponse).data || (res as AxiosError).response?.data;

    return data;
  }

  /** Perform DH on dangling rooms */
  async function performDH(userserver: string) {
    // Turn on the DH flag.
    // This fixes a bug where the client will perform more requests than needed.
    dhFlag = true;

    // Find all DM rooms
    const r = rooms.value;
    const dmRooms = r.filter((room) => room.id.startsWith('dm!'));

    // Find rooms where we didn't send an ephemeral key yet
    const noEpheRooms = dmRooms.filter(
      (room) =>
        !(room._ephemeral || []).some(({ sub }) => sub === localUserId()),
    );

    // TODO: reinitalize shared secret if one side's keys go missing

    for await (const room of noEpheRooms) {
      // Create an ephemeral and publish it
      const dh = crypto.getDiffieHellman('modp14');
      dh.generateKeys();

      // Save all properties so we can reconstruct it later
      const dhPublicKey = dh.getPublicKey('base64');
      const dhPrivateKey = dh.getPrivateKey('base64');
      const dhGen = dh.getGenerator('base64');
      const dhPrime = dh.getPrime('base64');

      // Store the keys in case the shared secret is lost
      localStore.ephemeralKeys.push({
        sub: room.id,
        privateKey: dhPrivateKey,
        publicKey: dhPublicKey,
        gen: dhGen,
        prime: dhPrime,
      });

      // Send the DH request to the server
      await axios
        .put<ApiResponse>(
          `${userserver}client/rooms/${room.id}/dh/submit`,
          {
            publicKey: dhPublicKey,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
          },
        )
        .catch((err: AxiosError) => console.error('Failed to submit DH key'));
    }

    // Refresh the rooms
    await fetchRooms(userserver, () =>
      console.error('Failed to fetch rooms while performing DH'),
    );

    // Now find all the rooms where ther other participant submitted the key too
    const dhRooms = rooms.value.filter(
      (room) =>
        room.id.startsWith('dm!') &&
        room._ephemeral &&
        room._ephemeral.length === 2,
    );
    for await (const room of dhRooms) {
      // Check if the secret was already calculated
      if (localStore.sharedSecrets.some((ss) => ss.sub === room.id)) continue;

      // Check if the keys exist locally
      const ephe = localStore.ephemeralKeys.find((ek) => ek.sub === room.id);
      if (!ephe) continue;

      // Get the other participant's key
      const bEpheKey = room._ephemeral!.find(
        (p) => p.sub !== localUserId(),
      )?.key;

      // This shouldn't be possible but TypeScript keeps complaining
      if (!bEpheKey) continue;

      // Reconstruct our key
      const dh = crypto.createDiffieHellman(
        ephe.prime,
        'base64',
        ephe.gen,
        'base64',
      );
      dh.setPrivateKey(ephe.privateKey, 'base64');
      dh.generateKeys();

      const sharedSecret = dh.computeSecret(bEpheKey, 'base64', 'base64');

      // Save the shared secret
      localStore.sharedSecrets.push({
        sub: room.id,
        key: sharedSecret,
      });

      console.log('Established shared secret:', sharedSecret);
    }

    dhFlag = false;
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

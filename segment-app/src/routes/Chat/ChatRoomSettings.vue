<script lang="ts" setup>
import { useChatStore, useLocalStore } from '@/store/store';
import { localUserId, parseUserId, profilePictureColors } from '@/util/Common';
import { Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '@/components/Button/Button.vue';
import Icon from '@/components/Icon/Icon.vue';
import { deriveColor } from '@/util/Random';
import { Routes } from '@/main';

interface Params {
  roomId: string;
}

const route = useRoute();
const chatStore = useChatStore();
const localStore = useLocalStore();
const router = useRouter();

const params: Ref<Params> = ref(route.params as any);

const room = chatStore.rooms.find((r) => r.id === params.value.roomId)!;

async function leaveRoom() {
  await chatStore.leaveRoom(
    localStore.lastUserserver.host,
    params.value.roomId,
    (err) => {
      return err;
    },
  );
  router.push(Routes.ChatroomAdd);
}
</script>

<template>
  <div class="chat__settings">
    <h1>{{ room.roomName }}</h1>
    <p>You can find information about the room below.</p>

    <div class="settings__participants flex flex-col gap-2">
      <h2>Participants</h2>
      <div class="flex flex-col gap-2">
        <div class="participant" v-for="p in room.participants" :key="p.sub">
          <div
            class="avatar"
            :style="{
              background: `linear-gradient(to bottom right, ${
                profilePictureColors(parseUserId(p.sub).name).background[0]
              } 0%, ${
                profilePictureColors(parseUserId(p.sub).name).background[1]
              } 100%)`,
            }">
            <span class="avatar__letter">{{
              parseUserId(p.sub).name[0].toUpperCase()
            }}</span>
          </div>
          <div class="flex flex-col">
            <div class="name">{{ parseUserId(p.sub).name }}</div>
            <div class="status">
              Status:
              <i>{{
                p.status === 0
                  ? 'Participant'
                  : p.status === 1
                  ? 'Invited'
                  : 'Unknown'
              }}</i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2" v-if="room.id.startsWith('dm!')">
      <h2>Encryption</h2>

      <div
        class="flex flex-row items-center gap-2 text-yellow-500 text-sm"
        v-if="!localStore.sharedSecrets.find((ss) => ss.sub === room.id)">
        <Icon class="text-base">warning</Icon>
        A shared secret could not be established, so encryption is not enabled.
      </div>
      <div class="key_verification" v-else>
        <div
          class="flex flex-row items-center gap-2 text-secondary-600 text-sm mb-4">
          <Icon class="text-base">check_circle</Icon>
          A shared secret is established. Communication is encrypted.
        </div>

        <p>
          You can compare the following color combination to your partner over a
          secure channel (outside of segment) to verify the integrity of
          messages.
        </p>

        <div class="flex flex-row gap-4 mt-2">
          <div
            class="flex flex-col gap-2 text-center items-center justify-center"
            v-for="i in 4"
            :key="i">
            <div
              class="color rounded-lg w-16 h-12"
              :style="{
                backgroundColor: deriveColor(localStore.sharedSecrets.find((ss) => ss.sub === room.id)!.key.substring(i*4, i*4 + localStore.sharedSecrets.find((ss) => ss.sub === room.id)!.key.length / 4)).colorStr,
              }" />
            <span class="text-sm">{{
              deriveColor(
                localStore.sharedSecrets
                  .find((ss) => ss.sub === room.id)!
                  .key.substring(
                    i * 4,
                    i * 4 +
                      localStore.sharedSecrets.find((ss) => ss.sub === room.id)!
                        .key.length /
                        4,
                  ),
              ).colorName
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <h2>Danger Zone</h2>
      <p>
        You can leave this room if you'd like anytime by clicking the button
        below.

        <br />

        <span
          class="text-red-500 dark:text-red-400"
          v-if="room.roomVisibility === 'private'">
          You won't be able to join back after this.
        </span>
      </p>

      <Button
        type="danger"
        :style="{
          width: 'fit-content',
          fontSize: '14px',
        }"
        @click="leaveRoom()"
        >Leave Room</Button
      >
    </div>
  </div>
</template>

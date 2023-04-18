<script lang="ts" setup>
import { useChatStore, useLocalStore } from '@/store/store';
import { localUserId, parseUserId, profilePictureColors } from '@/util/Common';
import { Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '@/components/Button/Button.vue';
import Icon from '@/components/Icon/Icon.vue';
import { deriveColor } from '@/util/Random';
import { Routes, useTranslator } from '@/main';

interface Params {
  roomId: string;
}

const { t } = useTranslator();
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
    <p>{{ t('chat.chatroomSettingsDesc') }}</p>

    <div class="settings__participants flex flex-col gap-2">
      <h2>{{ t('chat.chatroomSettingsParticipants') }}</h2>
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
              {{ t('chat.chatroomSettingsStatus') }}
              <i>{{
                p.status === 0
                  ? t('chat.chatroomSettingsStatusParticipant')
                  : p.status === 1
                  ? t('chat.chatroomSettingsStatusInvited')
                  : t('chat.chatroomSettingsStatusUnknown')
              }}</i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2" v-if="room.id.startsWith('dm!')">
      <h2>{{ t('chat.chatroomSettingsEncryptionTitle') }}</h2>

      <div
        class="flex flex-row items-center gap-2 text-yellow-500 text-sm"
        v-if="!localStore.sharedSecrets.find((ss) => ss.sub === room.id)">
        <Icon class="text-base">warning</Icon>
        {{ t('chat.chatroomSettingsNoEncryption') }}
      </div>
      <div class="key_verification" v-else>
        <div
          class="flex flex-row items-center gap-2 text-secondary-600 text-sm mb-4">
          <Icon class="text-base">check_circle</Icon>
          {{ t('chat.chatroomSettingsEncryption') }}
        </div>

        <p>
          {{ t('chat.chatroomSettingsCompareDesc') }}
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
      <h2>{{ t('chat.chatroomSettingsDangerZoneTitle') }}</h2>
      <p>
        {{ t('chat.chatroomSettingsDangerZoneDescription') }}

        <br />

        <span
          class="text-red-500 dark:text-red-400"
          v-if="room.roomVisibility === 'private'">
          {{ t('chat.chatroomSettingsDangerZoneWarning') }}
        </span>
      </p>

      <Button
        type="danger"
        :style="{
          width: 'fit-content',
          fontSize: '14px',
        }"
        @click="leaveRoom()"
        >{{ t('chat.chatroomSettingsDangerZoneLeave') }}</Button
      >
    </div>
  </div>
</template>

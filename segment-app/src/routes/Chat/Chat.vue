<script lang="ts" setup>
import { Routes, useTranslator } from '@/main';
import { useChatStore, useLocalStore } from '@/store/store';
import { ref } from 'vue';

const { t } = useTranslator();
const chatStore = useChatStore();
const localStore = useLocalStore();

const error = ref<string | null>(null);
const rooms = ref(
  await chatStore.fetchRooms(localStore.lastUserserver.host, (err) => {
    error.value = t('chat.failedToFetchRooms');
    return err;
  }),
);
</script>

<template>
  <div class="page page__chat">
    <div class="chat__rooms">
      <RouterLink
        class="room"
        v-for="room in rooms.data"
        :key="room.id"
        :to="`${Routes.Chat}/${room.id}`">
        {{ room.roomName.substring(0, 1) }}
      </RouterLink>
    </div>

    <div class="chat__room">
      <RouterView :key="($route.params.roomId as string) || ''" />
    </div>
  </div>
</template>

<style lang="scss">
@import './Chat.scss';
</style>

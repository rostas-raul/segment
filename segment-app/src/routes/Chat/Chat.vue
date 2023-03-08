<script lang="ts" setup>
import { Routes, useTranslator } from '@/main';
import { useChatStore, useLocalStore } from '@/store/store';
import { ref, computed } from 'vue';

const { t } = useTranslator();
const chatStore = useChatStore();
const localStore = useLocalStore();

await chatStore.fetchRooms(localStore.lastUserserver.host, (err) => {
  error.value = t('chat.failedToFetchRooms');
  return err;
});

const error = ref<string | null>(null);
const rooms = computed(() => chatStore.rooms);
</script>

<template>
  <div class="page page__chat">
    <div class="chat__rooms">
      <div class="rooms_list">
        <RouterLink
          class="room"
          v-for="room in rooms"
          :key="room.id"
          :to="`${Routes.Chat}/${room.id}`">
          {{ room.roomName.substring(0, 1) }}
        </RouterLink>
      </div>
      <div class="rooms_separator" v-if="rooms?.length" />
      <div class="rooms_create">
        <RouterLink :to="Routes.ChatroomCreate" class="room room_create">
          +
        </RouterLink>
      </div>
    </div>

    <div class="chat__room">
      <RouterView :key="($route.params.roomId as string) || ''" />
    </div>
  </div>
</template>

<style lang="scss">
@import './Chat.scss';
</style>

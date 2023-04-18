<script lang="ts" setup>
import Button from '@/components/Button/Button.vue';
import Icon from '@/components/Icon/Icon.vue';
import { useTranslator } from '@/main';
import { useChatStore, useLocalStore } from '@/store/store';
import { localUserId } from '@/util/Common';
import { AxiosError } from 'axios';
import { ref } from 'vue';

const { t } = useTranslator();
const chatStore = useChatStore();
const localStore = useLocalStore();

const fetchError = ref<AxiosError | null>(null);
const fetch = await chatStore.fetchPublicRooms(
  localStore.lastUserserver.host,
  (err) => (fetchError.value = err),
);
const rooms = fetch.data!;

async function joinRoom(roomId: string) {
  chatStore.joinRoom(localStore.lastUserserver.host, roomId, (err) => {
    return err;
  });
}
</script>

<template>
  <div class="chatroom__public">
    <h1 class="header">{{ t('chat.chatroomPublicTitle') }}</h1>
    <p>{{ t('chat.chatroomPublicDesc') }}</p>

    <div class="rooms__grid" v-if="rooms && rooms.length > 0">
      <div class="room__card" v-for="room in rooms" :key="room.id">
        <div class="card__header">
          <h2>{{ room.roomName }}</h2>
        </div>

        <p v-if="room.roomDescription">{{ room.roomDescription }}</p>
        <p v-else>
          <i>{{ t('chat.chatroomPublicNoDesc') }}</i>
        </p>

        <div class="card__footer">
          <div class="info_row flex flex-row items-center gap-2">
            <Icon>people</Icon>
            {{ room.participants.length }}
            {{
              room.participants.length === 1
                ? t('chat.chatroomPublicParticipant')
                : t('chat.chatroomPublicParticipants')
            }}
          </div>
          <Button
            type="secondary"
            :disabled="room.participants.some((p) => p.sub === localUserId())"
            @click="joinRoom(room.id)"
            >{{
              room.participants.some((p) => p.sub === localUserId())
                ? t('chat.chatroomPublicAlreadyJoined')
                : t('chat.chatroomPublicJoin')
            }}</Button
          >
        </div>
      </div>
    </div>

    <div class="rooms__empty" v-else-if="rooms?.length === 0">
      <p>
        <i>{{ t('chat.chatroomPublicNoRooms') }}</i>
      </p>
    </div>

    <div class="rooms__error" v-else-if="!rooms || fetchError">
      <p>
        <i>{{ t('chat.chatroomPublicError') }}</i>
      </p>
    </div>
  </div>
</template>

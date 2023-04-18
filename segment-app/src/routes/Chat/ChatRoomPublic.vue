<script lang="ts" setup>
import Button from '@/components/Button/Button.vue';
import Icon from '@/components/Icon/Icon.vue';
import { useChatStore, useLocalStore } from '@/store/store';
import { localUserId } from '@/util/Common';
import { AxiosError } from 'axios';
import { ref } from 'vue';

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
    <h1 class="header">Public Chatrooms</h1>
    <p>You can find public rooms that are available on the userserver below.</p>

    <div class="rooms__grid" v-if="rooms && rooms.length > 0">
      <div class="room__card" v-for="room in rooms" :key="room.id">
        <div class="card__header">
          <h2>{{ room.roomName }}</h2>
        </div>

        <p v-if="room.roomDescription">{{ room.roomDescription }}</p>
        <p v-else><i>No description was specified for this room.</i></p>

        <div class="card__footer">
          <div class="info_row flex flex-row items-center gap-2">
            <Icon>people</Icon>
            {{ room.participants.length }}
            {{
              room.participants.length === 1 ? 'participant' : 'participants'
            }}
          </div>
          <Button
            type="secondary"
            :disabled="room.participants.some((p) => p.sub === localUserId())"
            @click="joinRoom(room.id)"
            >{{
              room.participants.some((p) => p.sub === localUserId())
                ? 'Already Joined'
                : 'Join'
            }}</Button
          >
        </div>
      </div>
    </div>

    <div class="rooms__empty" v-else-if="rooms?.length === 0">
      <p>
        <i>This userserver does not host any public rooms currently.</i>
      </p>
    </div>

    <div class="rooms__error" v-else-if="!rooms || fetchError">
      <p>
        <i
          >An error occured while attempting to fetch rooms. Please try again
          later.</i
        >
      </p>
    </div>
  </div>
</template>

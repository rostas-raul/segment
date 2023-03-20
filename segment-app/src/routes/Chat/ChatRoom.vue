<script lang="ts" setup>
import { useChatStore, useLocalStore, useAuthStore } from '@/store/store';
import { ref, Ref, watch, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { parseUserId, profilePictureColors } from '@/util/Common';
import moment from 'moment';
import TextInput from '@/components/Input/TextInput.vue';
import Icon from '@/components/Icon/Icon.vue';
import { RoomMessage } from '@/types/Room';
import { useTranslator } from '@/main';
import { randomUUID } from 'crypto';

interface Params {
  roomId: string;
}

const { t } = useTranslator();

const route = useRoute();
const authStore = useAuthStore();
const chatStore = useChatStore();
const localStore = useLocalStore();

const params: Ref<Params> = ref(route.params as any);
const page = 1;
const room = (
  await chatStore.fetchRoom(
    localStore.lastUserserver.host,
    params.value.roomId,
    (err) => {
      return err;
    },
  )
).data!;

const messages = ref<Array<RoomMessage & { pending?: boolean }>>([]);
const message = ref('');

async function sendMessage() {
  const id = randomUUID();

  // temporarily add the message as pending
  messages.value.push({
    id,
    body: {
      content: message.value,
      signature: 'null',
    },
    room: params.value.roomId,
    sender: authStore.username,
    timestamp: new Date().toISOString(),
    pending: true,
  });

  nextTick(() => {
    scroll();
  });

  const res = await chatStore.sendMessage(
    localStore.lastUserserver.host,
    params.value.roomId,
    message.value,
    (err) => {
      return err;
    },
  );

  message.value = '';

  if (res.data) {
    // replace the pending message
    messages.value[messages.value.findIndex((msg) => msg.id === id)] = res.data;
  }
}

async function fetchMessages() {
  messages.value = (
    await chatStore.fetchMessages(
      localStore.lastUserserver.host,
      params.value.roomId,
      page,
      (err) => {
        return err;
      },
    )
  ).data as any;
}

function scroll(behavior: 'smooth' | 'auto' = 'smooth') {
  const el = document.querySelector('.chatroom .room__content');
  el?.scrollTo({
    top: el.scrollHeight,
    left: 0,
    behavior,
  });
}

watch(messages, () => {
  nextTick(() => {
    scroll();
  });
});

onMounted(() => {
  scroll('auto');
});

await fetchMessages();

chatStore.currentRoom = async (event: string) => {
  if (event === 'refresh.messages') {
    await fetchMessages();
  }
};
</script>

<template>
  <div class="chatroom">
    <div class="room__header">
      <h2 class="header__title">{{ room.roomName }}</h2>
      <span v-if="room.roomDescription" class="header__description">
        {{ room.roomDescription }}
      </span>
    </div>

    <div class="room__content">
      <div class="room__messages">
        <div
          :class="[
            'message',
            message.sender === authStore.username && 'message--self',
            messages[messages.findIndex((x) => x.id === message.id) + 1]
              ?.sender === authStore.username && 'message--after',
            messages[messages.findIndex((x) => x.id === message.id) - 1]
              ?.sender === authStore.username && 'message--before',
          ]"
          v-for="message in messages"
          :key="message.id">
          <div class="message__avatar">
            <div
              class="avatar"
              :style="{
                background: `linear-gradient(to bottom right, ${
                  profilePictureColors(parseUserId(message.sender).name)
                    .background[0]
                } 0%, ${
                  profilePictureColors(parseUserId(message.sender).name)
                    .background[1]
                } 100%)`,
              }">
              {{ parseUserId(message.sender).name[0].toUpperCase() }}
            </div>
          </div>
          <div class="message__bubble">
            <div class="message__header">
              <span class="message__sender">{{
                parseUserId(message.sender).name
              }}</span>
              <span class="message__timestamp">{{
                moment(message.timestamp).fromNow()
              }}</span>
            </div>
            <div class="message__content">
              <span>{{ message.body.content }}</span>
            </div>
            <div class="message__pending" v-if="message.pending">
              <Icon>schedule</Icon>
            </div>
          </div>
        </div>
      </div>

      <div class="room__empty" v-if="messages.length === 0">
        <span class="text-light-500 dark:text-dark-300">{{
          t('chat.emptyRoom')
        }}</span>
      </div>
    </div>

    <div class="room__components">
      <TextInput
        v-model:value="message"
        placeholder="Enter your message..."
        :clear-on-enter="true"
        @pressend-enter="sendMessage()"
        :maxLength="1024" />
      <button
        class="room__send"
        @click="sendMessage()"
        :disabled="message.length === 0">
        <Icon>send</Icon>
      </button>

      <span
        class="room__amount text-light-600 dark:text-dark-300"
        :class="{
          'text-yellow-500 dark:text-yellow-200':
            message.length > 800 && message.length < 1000,
          'text-red-600 dark:text-red-300': message.length > 1000,
        }"
        v-if="message.length > 0"
        >{{ message.length }}/1024</span
      >
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

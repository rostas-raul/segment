<script lang="ts" setup>
import { useChatStore, useLocalStore } from '@/store/store';
import { ref, Ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { parseUserId, profilePictureColors } from '@/util/Common';
import moment from 'moment';
import TextInput from '@/components/Input/TextInput.vue';
import Icon from '@/components/Icon/Icon.vue';

interface Params {
  roomId: string;
}

const route = useRoute();
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

const messages = ref<any | null>(null);

const message = ref('');

async function sendMessage() {
  await chatStore.sendMessage(
    localStore.lastUserserver.host,
    params.value.roomId,
    message.value,
    (err) => {
      return err;
    },
  );

  message.value = '';
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
  ).data;
}

function scroll() {
  const el = document.querySelector('.chatroom .room__content');
  el?.scrollTo({
    top: el.scrollHeight,
    left: 0,
    behavior: 'smooth',
  });
}

watch(messages, () => {
  scroll();
});

onMounted(() => {
  scroll();
});

await fetchMessages();
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
        <div class="message" v-for="message in messages" :key="message.id">
          <div class="message__avatar">
            <div
              class="avatar"
              :style="{
                color: profilePictureColors(parseUserId(message.sender).name)
                  .foreground,
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
        </div>
      </div>
    </div>

    <div class="room__components">
      <TextInput
        v-model:value="message"
        placeholder="Enter your message..."
        :clear-on-enter="true"
        @pressend-enter="sendMessage()" />
      <button class="room__send" @click="sendMessage()">
        <Icon>send</Icon>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

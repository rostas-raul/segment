<script lang="ts" setup>
import { useChatStore, useLocalStore, useAuthStore } from '@/store/store';
import { ref, Ref, watch, onMounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { parseUserId, profilePictureColors } from '@/util/Common';
import moment from 'moment';
import TextInput from '@/components/Input/TextInput.vue';
import Icon from '@/components/Icon/Icon.vue';
import { RoomMessage } from '@/types/Room';
import { Routes, useTranslator } from '@/main';
import { randomUUID } from 'crypto';
import Button from '@/components/Button/Button.vue';

import DOMPurify from 'dompurify';
import { marked } from 'marked';

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
const tempRoom = (
  await chatStore.fetchRoom(
    localStore.lastUserserver.host,
    params.value.roomId,
    (err) => {
      return err;
    },
  )
).data!;

const messages = ref<Array<RoomMessage & { status?: number }>>([]);
const message = ref('');
const router = useRouter();

const room = computed(() => chatStore.rooms.find((r) => r.id === tempRoom.id)!);

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
    status: 1,
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

  if (!res) return;

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
      (err) => {
        return err;
      },
    )
  ).data as any;
}

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

async function acceptInvite() {
  await chatStore.acceptRoomInvitation(
    localStore.lastUserserver.host,
    params.value.roomId,
    (err) => {
      return err;
    },
  );
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

  // Set last viewed to current room
  localStore.lastViewedRooms[room.value.id] = moment().valueOf();
});

await fetchMessages();

chatStore.currentRoom = async (event: string) => {
  if (event === 'refresh.messages') {
    await fetchMessages();
  }
};

// Also fetch the messages if the room updates
watch(room, async () => await fetchMessages());
</script>

<template>
  <div class="chatroom">
    <div class="room__header">
      <div class="header__left">
        <h2 class="header__title">{{ room.roomName }}</h2>
        <span v-if="room.roomDescription" class="header__description">
          {{ room.roomDescription }}
        </span>
      </div>
      <div class="header__right">
        <RouterLink
          class="default_style"
          :to="`${Routes.Chat}/${room.id}/settings`">
          <Button class="button__settings" type="transparent">
            <Icon>more_vert</Icon>
          </Button>
        </RouterLink>
      </div>
    </div>

    <div class="room__content" v-if="messages">
      <div class="room__messages">
        <div
          :class="[
            'message',
            message.sender === authStore.username && 'message--self',
            messages[messages.findIndex((x) => x.id === message.id) + 1]
              ?.sender === message.sender && 'message--after',
            messages[messages.findIndex((x) => x.id === message.id) - 1]
              ?.sender === message.sender && 'message--before',
            message.status === 2 && 'message--failed',
            message.encryption &&
              !chatStore.encryptedMessageCache.find(
                (msg) => msg.sub === `${message.room}:${message.id}`,
              ) &&
              'message--decryptionFailed',
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
              <span class="avatar__letter">{{
                parseUserId(message.sender).name[0].toUpperCase()
              }}</span>
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
            <div class="message__row">
              <div
                class="message__content"
                v-if="
                  !message.encryption ||
                  chatStore.encryptedMessageCache.find(
                    (msg) => msg.sub === `${message.room}:${message.id}`,
                  )
                ">
                <span
                  v-html="
                    DOMPurify.sanitize(
                      marked.parseInline(
                        (message.encryption
                          ? chatStore.encryptedMessageCache.find(
                              (msg) =>
                                msg.sub === `${message.room}:${message.id}`,
                            )?.data
                          : message.body.content) || '',
                      ),
                      {
                        ALLOWED_TAGS: ['b', 'strong', 'i', 'em'],
                      },
                    ) ||
                    `<i class='text-light-700 dark:text-dark-200'>${t(
                      'chat.xssWarning',
                    )}</i>`
                  " />
              </div>
              <div class="message__content" v-else>
                <i class="text-light-700 dark:text-dark-200">{{
                  t('chat.failedDecryption')
                }}</i>
              </div>
              <div class="message__icons">
                <div class="message__pending" v-if="message.status === 1">
                  <Icon>schedule</Icon>
                </div>
                <div class="message__failed" v-if="message.status === 2">
                  <Icon>error</Icon>
                </div>
                <div class="message__encrypted" v-if="message.encryption">
                  <Icon>lock</Icon>
                </div>
              </div>
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

    <div class="room__components" v-if="messages">
      <TextInput
        v-model:value="message"
        :placeholder="t('chat.enterMessage')"
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

    <div class="room__invitation" v-if="!messages">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl">
          {{ t('chat.invJoinTitle') }} {{ room.roomName }}?
        </h2>
        <p>
          {{ t('chat.invJoinDesc1') }} <i>{{ room.roomName }}</i
          >, {{ t('chat.invJoinDesc2') }}
        </p>
      </div>

      <div class="flex flex-row gap-2 w-full">
        <Button class="outline--danger" type="outline" @click="leaveRoom()">{{
          t('chat.invDecline')
        }}</Button>
        <Button type="primary" @click="acceptInvite()">{{
          t('chat.invAccept')
        }}</Button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

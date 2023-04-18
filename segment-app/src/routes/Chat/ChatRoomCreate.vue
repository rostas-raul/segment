<script lang="ts" setup>
import Button from '@/components/Button/Button.vue';
import TextInput from '@/components/Input/TextInput.vue';
import { useTranslator } from '@/main';
import { useChatStore, useLocalStore } from '@/store/store';
import { CommonMessages } from '@/types/Api';
import { fallbackWithSimple } from '@intlify/core-base';
import { AxiosError } from 'axios';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

interface Params {
  mode: 'public' | 'private' | 'dm';
}

const { t } = useTranslator();

const route = useRoute();
const chatStore = useChatStore();
const localStore = useLocalStore();

const params = ref<Params>(route.params as any);

const roomName = ref<string>('');
const roomDescription = ref<string>('');
const roomPassword = ref<string>('');

const dmParticipant = ref<string>('');
const participants = ref<string[]>([]);

const page = ref<number>(0);

async function create() {
  let p: string[] | undefined = [];

  if (params.value.mode === 'dm') {
    p = [dmParticipant.value];
  } else if (params.value.mode === 'private') {
    p = participants.value;
  } else {
    p = undefined;
  }

  const data = await chatStore.createRoom(
    localStore.lastUserserver.host,
    {
      roomName: roomName.value,
      roomDescription: roomDescription.value,
      roomPassword: roomPassword.value,
      roomVisibility: params.value.mode === 'public' ? 'public' : 'private',
      participants: p,
      dm: params.value.mode === 'dm' ? true : false,
    },
    (err: AxiosError) => {
      // TODO: error handling
      return err;
    },
  );

  if (data.status === 'FAIL') {
    switch (data.message) {
      case CommonMessages.ValidationError: {
        break;
      }
    }
  } else {
    await chatStore.fetchRooms(localStore.lastUserserver.host, (err) => {
      // TODO: error handling
      // error.value = t('chat.failedToFetchRooms');
      return err;
    });
  }
}
</script>

<template>
  <div class="chatroom__create">
    <div class="create__page" v-if="page === 0">
      <h1 class="header">
        {{ t('chat.createChatroomCreateA') }}
        {{
          params.mode === 'public'
            ? t('chat.createChatroomPublic')
            : params.mode === 'private'
            ? t('chat.createChatroomPrivate')
            : t('chat.createChatroomDM')
        }}
      </h1>
      <p class="mb-4" v-if="params.mode === 'dm'">
        <i>{{ t('chat.createChatroomDMNote') }}</i>
      </p>
      <TextInput
        :label="t('chat.createChatRoom.inputLabelRoomName')"
        :placeholder="t('chat.createChatRoom.inputPlaceholderRoomName')"
        v-model:value="roomName" />
      <TextInput
        :label="t('chat.createChatRoom.inputLabelRoomDescription')"
        :placeholder="t('chat.createChatRoom.inputPlaceholderRoomDescription')"
        v-model:value="roomDescription" />
      <TextInput
        v-if="params.mode === 'dm'"
        :label="t('chat.createChatroomRecipient')"
        placeholder="bob@segment.chat"
        v-model:value="dmParticipant" />
      <Button
        type="primary"
        :disabled="!roomName"
        @click="params.mode === 'private' ? (page = 1) : create()"
        >{{
          params.mode === 'private'
            ? t('chat.createChatroomNext')
            : t('chat.createChatroomCreate')
        }}</Button
      >
    </div>

    <div class="create__page" v-else-if="page === 1">
      <h1 class="header">{{ t('chat.createChatroomIPTitle') }}</h1>
      <p class="mb-4">
        {{ t('chat.createChatroomIPDesc') }}
      </p>

      <TextInput
        placeholder="Alice@segment.chat"
        v-model:value="participants[0]" />
      <TextInput
        v-if="participants[0]?.length > 0"
        placeholder="Bob@segment.chat"
        v-model:value="participants[1]" />
      <TextInput
        v-if="participants[0]?.length > 0 && participants[1]?.length > 0"
        placeholder="Charlie@segment.chat"
        v-model:value="participants[2]" />
      <TextInput
        v-if="
          participants[0]?.length > 0 &&
          participants[1]?.length > 0 &&
          participants[2]?.length > 0
        "
        placeholder="David@segment.chat"
        v-model:value="participants[3]" />
      <TextInput
        v-if="
          participants[0]?.length > 0 &&
          participants[1]?.length > 0 &&
          participants[2]?.length > 0 &&
          participants[3]?.length > 0
        "
        placeholder="Erin@segment.chat"
        v-model:value="participants[4]" />

      <Button
        type="primary"
        :disabled="participants[0]?.length === 0"
        @click="create()"
        >{{ t('chat.createChatroomCreate') }}</Button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

<script lang="ts" setup>
import Button from '@/components/Button/Button.vue';
import TextInput from '@/components/Input/TextInput.vue';
import { useTranslator } from '@/main';
import { useChatStore, useLocalStore } from '@/store/store';
import { CommonMessages } from '@/types/Api';
import { AxiosError } from 'axios';
import { ref } from 'vue';

const { t } = useTranslator();

const chatStore = useChatStore();
const localStore = useLocalStore();

const roomName = ref<string>('');
const roomDescription = ref<string>('');
const roomPassword = ref<string>('');

async function create() {
  const data = await chatStore.createRoom(
    localStore.lastUserserver.host,
    {
      roomName: roomName.value,
      roomDescription: roomDescription.value,
      roomPassword: roomPassword.value,
      roomVisibility: 'private',
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
    <h1 class="header">{{ t('chat.createChatRoom.header') }}</h1>

    <TextInput
      :label="t('chat.createChatRoom.inputLabelRoomName')"
      :placeholder="t('chat.createChatRoom.inputPlaceholderRoomName')"
      v-model:value="roomName" />
    <TextInput
      :label="t('chat.createChatRoom.inputLabelRoomDescription')"
      :placeholder="t('chat.createChatRoom.inputPlaceholderRoomDescription')"
      v-model:value="roomDescription" />
    <TextInput
      :label="t('chat.createChatRoom.inputLabelRoomPassword')"
      :placeholder="t('chat.createChatRoom.inputPlaceholderRoomPassword')"
      type="password"
      v-model:value="roomPassword" />

    <Button type="primary" :disabled="!roomName" @click="create()">{{
      t('chat.createChatRoom.buttonText')
    }}</Button>
  </div>
</template>

<style lang="scss" scoped></style>

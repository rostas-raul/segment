<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue';
import { Routes, useTranslator } from '@/main';

const { t } = useTranslator();
</script>

<template>
  <div class="chatroom__add">
    <h1 class="header">{{ t('chat.addChatroom') }}</h1>
    <p>
      {{ t('chat.addChatroomDesc') }}
    </p>

    <div class="flex flex-col gap-2 mt-4">
      <RouterLink class="default_style" :to="`${Routes.ChatroomCreate}/public`">
        <div class="add_button">
          <Icon>public</Icon>
          <div class="flex flex-col">
            <h2>{{ t('chat.addChatroomPublic') }}</h2>
            <p>
              {{ t('chat.addChatroomPublicDesc') }}
            </p>
          </div>
        </div>
      </RouterLink>
      <RouterLink
        class="default_style"
        :to="`${Routes.ChatroomCreate}/private`">
        <div class="add_button">
          <Icon>lock</Icon>
          <div class="flex flex-col">
            <h2>{{ t('chat.addChatroomPrivate') }}</h2>
            <p>
              {{ t('chat.addChatroomPrivateDesc') }}
            </p>
          </div>
        </div>
      </RouterLink>
      <RouterLink class="default_style" :to="`${Routes.ChatroomCreate}/dm`">
        <div class="add_button">
          <Icon>enhanced_encryption</Icon>
          <div class="flex flex-col">
            <h2>{{ t('chat.addChatroomDM') }}</h2>
            <p>
              {{ t('chat.addChatroomDMDesc') }}
            </p>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

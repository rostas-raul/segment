<script lang="ts" setup>
import Icon from '@/components/Icon/Icon.vue';
import { Routes } from '@/main';
</script>

<template>
  <div class="chatroom__add">
    <h1 class="header">Add a Chatroom</h1>
    <p>
      In segment, chatrooms are spaces for two or more people to communicate
      with each other.
    </p>

    <div class="flex flex-col gap-2 mt-4">
      <RouterLink class="default_style" :to="`${Routes.ChatroomCreate}/public`">
        <div class="add_button">
          <Icon>public</Icon>
          <div class="flex flex-col">
            <h2>Public</h2>
            <p>
              Public chatrooms are available to everyone. Anyone can
              participate. Great for large communities.
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
            <h2>Private</h2>
            <p>
              Private chatrooms are invite only and won't show up anywhere.
              Great for you and your friends.
            </p>
          </div>
        </div>
      </RouterLink>
      <RouterLink class="default_style" :to="`${Routes.ChatroomCreate}/dm`">
        <div class="add_button">
          <Icon>enhanced_encryption</Icon>
          <div class="flex flex-col">
            <h2>Direct Message</h2>
            <p>
              End-to-end encrypted communication between you and a recipient.
              Great for confidential chats.
            </p>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

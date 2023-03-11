<script lang="ts" setup>
import { Routes, useTranslator } from '@/main';
import { useChatStore, useLocalStore } from '@/store/store';
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import tippy, { Props as TippyProps } from 'tippy.js';

const { t } = useTranslator();
const chatStore = useChatStore();
const localStore = useLocalStore();

await chatStore.fetchRooms(localStore.lastUserserver.host, (err) => {
  error.value = t('chat.failedToFetchRooms');
  return err;
});

const error = ref<string | null>(null);
const rooms = computed(() => chatStore.rooms);

const toolTips: { selector: string; instance: any }[] = [];
function createToolTips(selector: string, props?: Partial<TippyProps>) {
  // destroy all tooltips using the selector
  toolTips.filter((tooltip) => tooltip.selector !== selector);

  const els = document.querySelectorAll(selector);
  els.forEach((el) => {
    const instance = tippy(el, {
      content: el.getAttribute('data-tooltip') || '#FIXME#',
      ...props,
    });
    toolTips.push({ selector, instance });
  });
}

const tippyProps: Partial<TippyProps> = {
  // prevent XSS with room names
  allowHTML: false,
  placement: 'right',
};

onMounted(() => {
  nextTick(() => {
    createToolTips('.room[data-tooltip]', tippyProps);
  });
});

watch(rooms, () => {
  createToolTips('.room[data-tooltip]', tippyProps);
});
</script>

<template>
  <div class="page page__chat">
    <div class="chat__rooms">
      <div class="rooms_list">
        <RouterLink
          class="room"
          v-for="room in rooms"
          :key="room.id"
          :to="`${Routes.Chat}/${room.id}`"
          :data-tooltip="room.roomName">
          {{ room.roomName.substring(0, 1) }}
        </RouterLink>
      </div>
      <div class="rooms_separator" v-if="rooms?.length" />
      <div class="rooms_create">
        <RouterLink
          :to="Routes.ChatroomCreate"
          class="room room_create"
          data-tooltip="New Chatroom">
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

<script lang="ts" setup>
import { Routes, useTranslator } from '@/main';
import { useAuthStore, useChatStore, useLocalStore } from '@/store/store';
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import tippy, { Props as TippyProps } from 'tippy.js';
import Logo from '@/components/Logo/Logo.vue';
import { localUserId, parseUserId, profilePictureColors } from '@/util/Common';
import ThemeSwitcher from '@/components/ThemeSwitcher/ThemeSwitcher.vue';
import { useRoute, useRouter } from 'vue-router';
import Icon from '@/components/Icon/Icon.vue';

const { t } = useTranslator();
const chatStore = useChatStore();
const localStore = useLocalStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

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

  // Check if there are no rooms
  if (rooms.value.length === 0) {
    // Redirect to ChatroomAdd
    router.push(Routes.ChatroomAdd);
  }
});

function scrollToTop() {
  const el = document.querySelector('.chat__rooms');
  el?.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto',
  });
}
</script>

<template>
  <div class="page page__chat">
    <div class="chat__topbar">
      <div class="topbar__logo">
        <Logo :text="true" />
      </div>

      <div class="topbar__right">
        <div class="topbar__themeSwitcher">
          <ThemeSwitcher />
        </div>

        <div class="topbar__user">
          <div class="topbar__username">
            {{ parseUserId(authStore.username).name }}
          </div>
          <div class="topbar__avatar">
            <div
              class="avatar"
              :style="{
                background: `linear-gradient(to bottom right, ${
                  profilePictureColors(parseUserId(authStore.username).name)
                    .background[0]
                } 0%, ${
                  profilePictureColors(parseUserId(authStore.username).name)
                    .background[1]
                } 100%)`,
              }">
              {{ parseUserId(authStore.username).name[0].toUpperCase() }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat__wrapper">
      <div class="rooms__wrapper">
        <div class="chat__rooms">
          <div class="rooms_list">
            <RouterLink
              @click="scrollToTop()"
              class="room"
              :class="[
                room.id.startsWith('dm!') && 'room--dm',
                route.path === `/chat/${room.id}/settings` &&
                  'router-link-active',
              ]"
              v-for="room in rooms.sort(
                (a, b) =>
                  (localStore.lastViewedRooms[b.id] || Infinity) -
                  (localStore.lastViewedRooms[a.id] || Infinity),
              )"
              :key="room.id"
              :to="`${Routes.Chat}/${room.id}`"
              :data-tooltip="room.id.startsWith('dm!') ? `${room.roomName} (DM with ${parseUserId(room.participants.find(x => x.sub !== localUserId())!.sub).name})` : room.roomName">
              <span v-if="!room.id.startsWith('dm!')">{{
                room.roomName.substring(0, 1)
              }}</span>
              <div
                v-else
                class="avatar"
                :style="{
                  background: `linear-gradient(to bottom right, ${
                    profilePictureColors(parseUserId(room.participants.find(x => x.sub !== localUserId())!.sub).name)
                      .background[0]
                  } 0%, ${
                    profilePictureColors(parseUserId(room.participants.find(x => x.sub !== localUserId())!.sub).name)
                      .background[1]
                  } 100%)`,
                }">
                <span class="avatar__letter">{{
                  parseUserId(
                    room.participants.find((x) => x.sub !== localUserId())!.sub,
                  ).name[0].toUpperCase()
                }}</span>
              </div>

              <div
                class="room__indicator indicator--warning"
                v-if="
                  room.participants.find((x) => x.sub === localUserId())
                    ?.status === 1
                ">
                <Icon>mail</Icon>
              </div>
            </RouterLink>
          </div>
          <div class="rooms_separator" v-if="rooms?.length > 0" />
          <div class="rooms_create">
            <RouterLink
              :to="Routes.ChatroomAdd"
              class="room room_create"
              data-tooltip="New Chatroom">
              +
            </RouterLink>
          </div>
          <div class="rooms_public mt-4">
            <RouterLink
              :to="Routes.ChatroomPublic"
              class="room room_public"
              data-tooltip="Public Chatrooms">
              <Icon>explore</Icon>
            </RouterLink>
          </div>
        </div>
      </div>
      <div class="chat__room">
        <RouterView :key="($route.params.roomId as string) || ''" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import './Chat.scss';
</style>

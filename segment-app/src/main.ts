import { createApp } from 'vue';
import {
  createRouter,
  createWebHashHistory,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';
import { createPinia } from 'pinia';
import { createI18n, useI18n } from 'vue-i18n';
import App from '@/App.vue';
import Auth from './routes/Auth/Auth.vue';
import AuthLogin from './routes/Auth/AuthLogin.vue';
import AuthRegister from './routes/Auth/AuthRegister.vue';
import Chat from './routes/Chat/Chat.vue';
import ChatRoom from './routes/Chat/ChatRoom.vue';
import en from './i18n/en';
import hu from './i18n/hu';
import { useAuthStore } from './store/store';
import ChatRoomCreateVue from './routes/Chat/ChatRoomCreate.vue';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

// Meta things
export const DOCUMENT_TITLE = 'segment';

// Router
export enum Routes {
  Root = '/',

  Auth = '/auth',
  AuthLogin = '/auth/login',
  AuthRegister = '/auth/register',

  Chat = '/chat',
  ChatroomCreate = '/chat/create',
}

const routes: Array<RouteRecordRaw> = [
  {
    path: Routes.Root,
    redirect: Routes.Auth,
  },
  {
    path: Routes.Auth,
    component: Auth,
    redirect: Routes.AuthLogin,
    children: [
      { path: Routes.AuthLogin, component: AuthLogin },
      {
        path: Routes.AuthRegister,
        component: AuthRegister,
      },
    ],
  },
  {
    path: Routes.Chat,
    component: Chat,
    children: [
      {
        path: ':roomId',
        component: ChatRoom,
        props: true,
      },
      {
        path: Routes.ChatroomCreate,
        component: ChatRoomCreateVue,
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    const authStore = useAuthStore();
    if (to.matched.some((r) => r.path === Routes.Chat)) {
      if (!authStore.accessToken) {
        return Routes.Auth;
      }
    }

    return true;
  },
);

// i18n
const i18n = createI18n<[typeof en], 'en-US' | 'hu-HU'>({
  legacy: false,
  locale: 'hu-HU',
  fallbackLocale: 'en-US',
  messages: { 'en-US': en, 'hu-HU': hu },
});

export function useTranslator() {
  return useI18n<{ message: typeof en }>({
    useScope: 'global',
  });
}

// Vue
createApp(App).use(createPinia()).use(router).use(i18n).mount('#root');

// Some events
const authStore = useAuthStore();

if (
  !authStore.keypair ||
  !authStore.keypair.public ||
  !authStore.keypair.private
) {
  authStore.generateKeyPair();
}

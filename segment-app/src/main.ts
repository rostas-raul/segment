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
import { useAuthStore, useLocalStore } from './store/store';
import ChatRoomCreate from './routes/Chat/ChatRoomCreate.vue';
import ChatRoomAdd from './routes/Chat/ChatRoomAdd.vue';
import ChatRoomPublic from './routes/Chat/ChatRoomPublic.vue';
import ChatRoomSettings from './routes/Chat/ChatRoomSettings.vue';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  watchFile,
  writeFile,
  writeFileSync,
} from 'fs';
import { join } from 'path';

// Meta things
export const DOCUMENT_TITLE = 'segment';

// Router
export enum Routes {
  Root = '/',

  Auth = '/auth',
  AuthLogin = '/auth/login',
  AuthRegister = '/auth/register',

  Chat = '/chat',
  ChatroomAdd = '/chat/add',
  ChatroomCreate = '/chat/create',
  ChatroomPublic = '/chat/public',
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
        path: ':roomId/settings',
        component: ChatRoomSettings,
        props: true,
      },
      {
        path: Routes.ChatroomAdd,
        component: ChatRoomAdd,
      },
      {
        path: Routes.ChatroomPublic,
        component: ChatRoomPublic,
      },
      {
        path: `${Routes.ChatroomCreate}/:mode`,
        component: ChatRoomCreate,
        props: true,
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
const localStore = useLocalStore();

if (
  !authStore.keypair ||
  !authStore.keypair.public ||
  !authStore.keypair.private
) {
  authStore.generateKeyPair();
}

// Try to sign into the last session
if (
  authStore.accessToken &&
  localStore.lastUserserver.host &&
  localStore.lastUserserver.username
) {
  await authStore.postLogin(
    localStore.lastUserserver.host,
    authStore.accessToken,
  );
}

initCSS();

function initCSS() {
  const cssId = 'custom-css';

  // check if the folder even exists
  const appdata =
    process.env.APPDATA ||
    (process.platform == 'darwin'
      ? process.env.HOME + '/Library/Preferences'
      : process.env.HOME + '/.local/share');

  if (!existsSync(join(appdata, 'segment'))) {
    mkdirSync(join(appdata, 'segment'));
  }

  if (!existsSync(join(appdata, 'segment', 'theme.css'))) {
    writeFileSync(join(appdata, 'segment', 'theme.css'), '');
  }

  loadCSS(appdata, cssId);

  watchFile(join(appdata, 'segment', 'theme.css'), (_curr, _prev) => {
    console.log('bruh');
    loadCSS(appdata, cssId);
  });
}

function loadCSS(appdata: string, cssId: string) {
  const content = readFileSync(
    join(appdata, 'segment', 'theme.css'),
  ).toString();

  if (!document.getElementById(cssId)) {
    const el = document.createElement('style');
    document.head.appendChild(el);
    el.type = 'text/css';
    el.id = cssId;
    el.appendChild(document.createTextNode(content));
  }

  try {
    document.querySelector(`#${cssId}`)!.innerHTML = content;
  } catch {
    /**/
  }
}

<script lang="ts" setup>
import Button from '@/components/Button/Button.vue';
import Icon from '@/components/Icon/Icon.vue';
import TextInput from '@/components/Input/TextInput.vue';
import { DOCUMENT_TITLE, useTranslator, Routes } from '@/main';
import { useAuthStore, useLocalStore } from '@/store/store';
import { ApiResponse, AuthMessages, CommonMessages } from '@/types/Api';
import axios, { AxiosError, AxiosResponse } from 'axios';
import path from 'path';
import { onMounted, ref, inject, watch } from 'vue';
import { useRouter } from 'vue-router';

const { t } = useTranslator();
const authStore = useAuthStore();
const localStore = useLocalStore();
const router = useRouter();

onMounted(() => (document.title = `${DOCUMENT_TITLE} - Login`));

const username = ref<string>(localStore.lastUserserver.username || '');
const password = ref<string>('');

const userserverAddressI: unknown & { value: string } =
  inject('userserverAddress')!;
const userserverAddress = ref(
  path.join(userserverAddressI.value, '/').replace(':/', '://'),
);

watch(userserverAddressI, () => {
  userserverAddress.value = path
    .join(userserverAddressI.value, '/')
    .replace(':/', '://');
});

const errors = ref<{
  username?: string[];
  password?: string[];
  global?: string[];
}>({});

async function login() {
  errors.value = {};

  const data = await authStore.login(
    userserverAddress.value,
    {
      username: username.value,
      password: password.value,
      deviceId: authStore.deviceId || undefined,
    },
    (err: AxiosError) => {
      if (!err.response?.status) {
        errors.value.global = [t('auth.serverNotAvailable')];
      }
      return err;
    },
  );

  if (data.status === 'FAIL') {
    switch (data.message) {
      case CommonMessages.ValidationError: {
        errors.value.username =
          data
            ?.data!.errors!.find((e) => e.startsWith('username'))
            ?.split(';')[1]
            ?.split(',')
            ?.reverse()
            ?.map((x) => t(`errors.${x}`)) || undefined;
        errors.value.password =
          data
            ?.data!.errors!.find((e) => e.startsWith('password'))
            ?.split(';')[1]
            ?.split(',')
            ?.reverse()
            ?.map((x) => t(`errors.${x}`)) || undefined;
        break;
      }
      case AuthMessages.UserNotFound: {
        if (!errors.value.global) errors.value.global = [];
        errors.value.global.push(t(`errors.${AuthMessages.UserNotFound}`));
        break;
      }
      case AuthMessages.PasswordIncorrect: {
        if (!errors.value.global) errors.value.global = [];
        errors.value.global.push(t(`errors.${AuthMessages.PasswordIncorrect}`));
        break;
      }
    }
  } else {
    const accessToken = data.data!.accessToken!;
    const deviceId = data.data!.deviceId!;
    authStore.accessToken = accessToken;
    authStore.deviceId = deviceId;
    localStore.lastUserserver = {
      host: userserverAddress.value,
      username: username.value,
    };

    await authStore.uploadKeys(userserverAddress.value, (err: AxiosError) => {
      if (!err.response?.status) {
        errors.value.global = [t('auth.failedToUploadKeys')];
      }
      return err;
    });

    // Route to the chat route
    router.push(Routes.Chat);
  }
}
</script>

<template>
  <div class="auth__page auth__login">
    <TextInput
      :label="t('auth.inputLabelUsername')"
      :placeholder="t('auth.inputPlaceholderUsername')"
      v-model:value="username" />
    <div
      class="my-2 flex flex-row items-center gap-1 text-red-500 text-sm"
      v-if="errors.username">
      <Icon :style="{ fontSize: '20px' }">error</Icon>
      {{ errors.username?.[0] }}
    </div>
    <TextInput
      :label="t('auth.inputLabelPassword')"
      :placeholder="t('auth.inputPlaceholderPassword')"
      type="password"
      v-model:value="password" />
    <div
      class="my-2 flex flex-row items-center gap-1 text-red-500 text-sm"
      v-if="errors.password">
      <Icon :style="{ fontSize: '20px' }">error</Icon>
      {{ errors.password?.[0] }}
    </div>
    <Button
      type="primary"
      :disabled="!username || !password"
      @click="login()"
      >{{ t('auth.login.buttonText') }}</Button
    >

    <div
      class="my-2 flex flex-row items-center gap-1 text-red-500 text-sm"
      v-if="errors.global">
      <Icon :style="{ fontSize: '20px' }">error</Icon>
      {{ errors.global?.[0] }}
    </div>

    <p class="mt-2 text-sm">
      {{ t('auth.login.alternateActionPre') }}
      <RouterLink :to="Routes.AuthRegister">
        {{ t('auth.login.alternateAction') }}
      </RouterLink>
    </p>
  </div>
</template>

<style lang="scss" scoped>
@import './Auth.scss';
</style>

<script lang="ts" setup>
import Button from '@/components/Button/Button.vue';
import TextInput from '@/components/Input/TextInput.vue';
import { useTranslator, Routes, DOCUMENT_TITLE } from '@/main';
import { onMounted, ref, inject, watch } from 'vue';
import axios, { AxiosError, AxiosResponse } from 'axios';
import path from 'path';
import { ApiResponse, AuthMessages, CommonMessages } from '@/types/Api';
import Icon from '@/components/Icon/Icon.vue';
import { useAuthStore } from '@/store/store';

const { t } = useTranslator();
const authStore = useAuthStore();

onMounted(() => (document.title = `${DOCUMENT_TITLE} - Register`));

const username = ref<string>('');
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
const success = ref(false);

async function register() {
  errors.value = {};

  const data = await authStore.register(
    userserverAddress.value,
    {
      username: username.value,
      password: password.value,
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
      case AuthMessages.UsernameTaken: {
        if (!errors.value.global) errors.value.global = [];
        errors.value.global.push(t(`errors.${AuthMessages.UsernameTaken}`));
        break;
      }
      case AuthMessages.RegistrationDisabled: {
        if (!errors.value.global) errors.value.global = [];
        errors.value.global.push(
          t(`errors.${AuthMessages.RegistrationDisabled}`),
        );
        break;
      }
    }
  } else {
    success.value = true;
  }
}
</script>

<template>
  <div class="auth__page auth__register">
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
      @click="register()"
      >{{ t('auth.register.buttonText') }}</Button
    >

    <div
      class="my-2 flex flex-row items-center gap-1 text-red-500 text-sm"
      v-if="errors.global">
      <Icon :style="{ fontSize: '20px' }">error</Icon>
      {{ errors.global?.[0] }}
    </div>

    <div
      class="my-2 flex flex-row items-center gap-1 text-green-500 text-sm"
      v-if="success">
      <Icon :style="{ fontSize: '20px' }">check_circle</Icon>
      {{ t('auth.register.success') }}
    </div>

    <p class="mt-2 text-sm">
      {{ t('auth.register.alternateActionPre') }}
      <RouterLink :to="Routes.AuthLogin">
        {{ t('auth.register.alternateAction') }}
      </RouterLink>
    </p>
  </div>
</template>

<style lang="scss" scoped>
@import './Auth.scss';
</style>

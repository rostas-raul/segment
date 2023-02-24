<script lang="ts" setup>
import InlineTextInput from '@/components/Input/InlineTextInput.vue';
import Logo from '@/components/Logo/Logo.vue';
import { useLocalStore } from '@/store/store';
import { provide, ref, watch } from 'vue';
import { useTranslator } from '@/main';

const backgroundImage = new URL(
  `/src/assets/images/auth__banner-0${Math.floor(Math.random() * 15 + 1)}.jpg`,
  import.meta.url,
);

const localStore = useLocalStore();
const userserverAddress = ref<string>(localStore.lastUserserver.host);

const { t } = useTranslator();

provide('userserverAddress', userserverAddress);
</script>

<template>
  <div class="page page__auth">
    <div class="page__wrapper">
      <div class="page__content">
        <div class="auth__logo">
          <Logo :text="true" />
        </div>
        <div class="auth__container">
          <div class="flex flex-row flex-wrap whitespace-pre">
            {{ t('auth.userserverLabel') }}

            <InlineTextInput
              class="text-secondary-600 font-medium"
              v-model:value="userserverAddress">
              {{ userserverAddress }}
            </InlineTextInput>
          </div>

          <div class="auth__content">
            <RouterView v-slot="{ Component }">
              <KeepAlive>
                <Component :is="Component" />
              </KeepAlive>
            </RouterView>
          </div>
        </div>
        <div class="auth__footer"></div>
      </div>

      <div
        class="page__banner"
        :style="{
          backgroundImage: `url('${backgroundImage.toString()}')`,
        }"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import './Auth.scss';
</style>

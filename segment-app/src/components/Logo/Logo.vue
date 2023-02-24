<script lang="ts" setup>
import { useLocalStore } from '@/store/store';

interface Props {
  text: boolean;
}

defineProps<Props>();

const localStore = useLocalStore();
const theme = localStore.theme;
</script>

<template>
  <div class="logo">
    <img
      src="@/assets/segment-symbol.svg"
      alt="segment"
      class="logo__img logo__symbol"
      v-if="!text" />

    <img
      src="@/assets/segment-text--light.svg"
      alt="segment"
      class="logo__img logo__text"
      v-else-if="text && theme === 'light'" />
    <img
      src="@/assets/segment-text--dark.svg"
      alt="segment"
      class="logo__img logo__text"
      v-else-if="text && theme === 'dark'" />
  </div>
</template>

<style lang="scss" scoped>
@import './Logo.scss';
</style>

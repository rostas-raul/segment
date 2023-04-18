<script lang="ts" setup>
import { computed } from 'vue';
import Button from '../Button/Button.vue';
import Icon from '../Icon/Icon.vue';
import { useLocalStore } from '@/store/store';

const localStore = useLocalStore();
const theme = computed(() => localStore.theme);
</script>

<template>
  <button class="themeSwitcher" @click="localStore.toggleTheme()">
    <Icon v-if="theme === 'light'">dark_mode</Icon>
    <Icon v-else-if="theme === 'dark'">light_mode</Icon>
  </button>
</template>

<style lang="scss" scoped>
@import './ThemeSwitcher.scss';
</style>

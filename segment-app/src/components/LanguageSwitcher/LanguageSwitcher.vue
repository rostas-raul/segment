<script lang="ts" setup>
import { computed } from 'vue';
import Button from '../Button/Button.vue';
import Icon from '../Icon/Icon.vue';
import { useLocalStore } from '@/store/store';
import { useI18n } from 'vue-i18n';
import moment from 'moment';

const localStore = useLocalStore();

const i18n = useI18n();

function toggleLanguage() {
  const currentLang = i18n.locale;

  if (currentLang.value === 'en-US') {
    i18n.locale.value = 'hu-HU';
    moment.locale('hu');
  } else {
    i18n.locale.value = 'en-US';
    moment.locale('en');
  }
}
</script>

<template>
  <button class="languageSwitcher" @click="toggleLanguage()">
    <Icon>public</Icon>
  </button>
</template>

<style lang="scss" scoped>
@import './LanguageSwitcher.scss';
</style>

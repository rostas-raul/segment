<script lang="ts" setup>
export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'monochrome'
  | 'outline'
  | 'transparent';

interface Props {
  type: ButtonType;
}

defineProps<Props>();
</script>

<template>
  <button :class="['button', `button_${type}`]">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@import './Button.scss';
</style>

<script lang="ts" setup>
import { randomString } from '@/util/Random';

const emit = defineEmits(['update:value', 'pressendEnter']);

interface Props {
  type?: 'text' | 'password';
  placeholder?: string | null;
  label?: string | null;
  id?: string;
  value?: string;
  clearOnEnter?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: null,
  label: null,
  id: 'I' + randomString().split('-')[0],
  value: '',
  clearOnEnter: false,
});

function keyPress(ev: any) {
  if (ev?.key === 'Enter') {
    emit('pressendEnter');

    if (props.clearOnEnter === true) {
      const el: HTMLInputElement | null = document.querySelector(
        `#${props.id}`,
      );
      if (el) {
        el!.value = '';
        emit('update:value', '');
      }
    }
  }
}
</script>

<template>
  <div class="input" type="text">
    <label v-if="label" :for="id" class="input__label">
      {{ label }}
    </label>

    <input
      :id="id"
      :type="type"
      :placeholder="placeholder || ''"
      autocorrect="off"
      autocomplete="off"
      class="input__element input_text"
      :value="value"
      @input="$emit('update:value', ($event.target as HTMLInputElement).value)"
      @keypress="keyPress" />
  </div>
</template>

<style lang="scss" scoped>
@import './Input.scss';
</style>

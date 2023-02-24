<script lang="ts" setup>
import { useTranslator } from '@/main';
import { randomString } from '@/util/Random';
import { ref } from 'vue';
import Button from '../Button/Button.vue';
import Icon from '../Icon/Icon.vue';

defineEmits(['update:value']);

interface Props {
  type?: 'text' | 'password';
  id?: string;
  value?: string;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  id: randomString(12),
  value: '',
});

const { t } = useTranslator();

const editing = ref<boolean>(false);
</script>

<template>
  <div class="input" type="inline">
    <div class="inline__wrapper">
      <div class="inline__input" v-if="editing">
        <input
          :id="id"
          :type="type"
          autocorrect="off"
          autocomplete="off"
          autofocus
          class="input__element input_inline"
          :value="value"
          @input="
            $emit('update:value', ($event.target as HTMLInputElement).value)
          " />
        <Button type="secondary" @click="editing = false">{{ t('ok') }}</Button>
      </div>

      <div class="inline__component" @click="editing = true" v-else>
        <slot />
        <Icon>edit</Icon>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import './Input.scss';
</style>

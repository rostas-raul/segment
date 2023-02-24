<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useLocalStore } from './store/store';

const localStore = useLocalStore();

const App = ref<HTMLElement | null>(null);
onMounted(() => {
  document.documentElement.setAttribute('data-theme', localStore.theme);
});
</script>

<template>
  <main class="App" ref="App">
    <Suspense>
      <RouterView />
    </Suspense>
  </main>
</template>

<style lang="scss">
@import './style.scss';
</style>

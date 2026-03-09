<template>
  <div class="app-container">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content" ref="scrollArea">
      <section class="notif-hero text-center fade-in delay-1">
        <h1 class="headline">{{ $t('guide.monitoraggioElettrico.title') }}</h1>
        <p class="notif-intro">
          {{ $t('guide.monitoraggioElettrico.intro') }}
        </p>
      </section>

      <section class="settings-list fade-in delay-2">
        </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import GuideHeader from '@/components/layout/GuideHeader.vue';

const isLightMode = ref(false);
const scrollArea = ref(null);

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  isLightMode.value = savedTheme === 'light';

  nextTick(() => {
    requestAnimationFrame(() => {
      if (scrollArea.value) {
        scrollArea.value.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    });
  });
});
</script>

<style scoped>
.headline { font-size: 32px; font-weight: 500; color: var(--accent-blue); margin-bottom: 1rem; }
.notif-intro { font-size: 15px; color: var(--text-muted); line-height: 1.5; margin-bottom: 2rem; }

/* Scroll fluido per iOS */
.main-content {
  -webkit-overflow-scrolling: touch;
}
</style>
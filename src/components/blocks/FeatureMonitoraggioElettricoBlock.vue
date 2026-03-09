<template>
  <section class="card feature-card">
    <div class="feature-illustration">
      <div style="font-size: 40px; text-align: center;">🧩</div>
    </div>
    
    <h3 class="card-title text-center">{{ $t('blocks.features.monitoraggioElettrico.title') }}</h3>
    <p class="card-text text-center">
      {{ $t('blocks.features.monitoraggioElettrico.description') }}
    </p>
    
    <button class="btn-primary" @click="goToGuide">
      {{ $t('blocks.features.monitoraggioElettrico.button') }}
    </button>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToGuide = () => {
  router.push('/guide/monitoraggio-elettrico'); 
};
</script>

<style scoped>
/* Stili del widget */
</style>
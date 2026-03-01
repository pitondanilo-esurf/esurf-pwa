<template>
  <section class="card feature-card">
    <div class="feature-illustration">
      <svg viewBox="0 0 200 80" width="100%" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="10" width="100" height="60" rx="6" fill="var(--bg-card-alt)" border="1px solid var(--border-color)"/>
        <rect x="60" y="30" width="80" height="4" fill="var(--border-color)" />
        <rect x="60" y="40" width="60" height="4" fill="var(--border-color)" />
        <g class="success-pulse">
          <circle cx="150" cy="20" r="12" fill="var(--accent-green)" />
          <path d="M145 20 L148 23 L155 16" stroke="var(--bg-card)" stroke-width="2" fill="none" stroke-linecap="round" />
        </g>
      </svg>
    </div>
    
    <h3 class="card-title text-center">{{ $t('blocks.features.activation.title') }}</h3>
    <p class="card-text text-center">{{ $t('blocks.features.activation.description') }}</p>
    
    <button class="btn-primary" @click="goToIdentitaDigitale">{{ $t('blocks.features.activation.button') }}</button>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const goToIdentitaDigitale = () => {
  router.push('/guide/identita-digitale'); //
};
</script>

<style scoped>
@keyframes pulseGlow {
  0% { transform: scale(1); filter: drop-shadow(0 0 0px transparent); }
  50% { transform: scale(1.08); filter: drop-shadow(0 0 10px var(--accent-green)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 0px transparent); }
}
.success-pulse { 
  transform-origin: 150px 20px; 
  animation: pulseGlow 3s infinite ease-in-out 1s; 
}
</style>
<template>
  <section class="card feature-card">
    <div class="feature-illustration">
      <svg viewBox="0 0 200 80" width="100%" height="80" xmlns="http://www.w3.org/2000/svg">
        <g class="notification-float">
          <rect x="70" y="10" width="80" height="25" rx="12.5" fill="var(--btn-bg)" />
          <circle cx="85" cy="22.5" r="6" fill="var(--accent-green)" />
          <rect x="100" y="20" width="40" height="4" fill="var(--border-color)" />
        </g>
        <g class="notification-float delay-path">
          <rect x="40" y="45" width="90" height="25" rx="12.5" fill="var(--btn-bg)" />
          <circle cx="55" cy="57.5" r="6" fill="var(--accent-green)" />
          <rect x="70" y="55" width="50" height="4" fill="var(--border-color)" />
        </g>
      </svg>
    </div>
    
    <h3 class="card-title text-center">{{ $t('blocks.features.notifications.title') }}</h3>
    <p class="card-text text-center">
      {{ $t('blocks.features.notifications.description') }}
    </p>
    
    <button class="btn-primary" @click="goToNotifications">
      {{ $t('blocks.features.notifications.button') }}
    </button>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';
// L'istanza i18n globale gestisce già il localStorage, ma possiamo importare useI18n se ci serve nel setup
import { useI18n } from 'vue-i18n'; 

const router = useRouter();
const { t } = useI18n(); // Inizializza le traduzioni per il componente

const goToNotifications = () => {
  // Reindirizza alla rotta della guida notifiche
  router.push('/guide/notifiche'); 
};
</script>

<style scoped>
@keyframes floatY { 
  0%, 100% { transform: translateY(0); } 
  50% { transform: translateY(-4px); } 
}
.notification-float { animation: floatY 4s infinite ease-in-out; }
.notification-float.delay-path { animation-delay: 2s; }
</style>
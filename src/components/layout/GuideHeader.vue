<template>
  <header class="f-guide-header fade-in delay-0">
    
    <div class="f-nav-row">
      <div class="f-back-container" @click="handleBack">
        <div class="f-back-button">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </div>
        <span v-if="title" class="f-back-text">{{ $t('common.back') || 'Indietro' }}</span>
      </div>

      <div v-if="!title" class="header-center">
        <img 
          :src="isLightMode ? logoLight : logoDark" 
          alt="E-surf Logo" 
          class="app-logo" 
        />
      </div>
      
      <div v-if="!title" style="width: 36px;"></div>
    </div>

    <h1 v-if="title" class="f-guide-title">{{ title }}</h1>
    
  </header>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'; 
import logoLight from '@/assets/img/logo-light.svg';
import logoDark from '@/assets/img/logo-dark.svg';

const props = defineProps({
  isLightMode: {
    type: Boolean,
    default: false
  },
  backRoute: {
    type: String,
    default: '/home' 
  },
  // Nuova prop per supportare i titoli delle sezioni Fintech
  title: {
    type: String,
    default: ''
  }
});

const router = useRouter();
const route = useRoute(); 

const handleBack = () => {
  // 1. Prima guarda se c'è una direttiva specifica nell'URL (es. dalla Dashboard)
  if (route.query.back) {
    router.push(route.query.back);
  } 
  // 2. Altrimenti usa il comportamento standard (la Prop) o la history
  else {
    // Miglioramento UX: se l'utente ha navigato naturalmente, torna indietro fluido
    if (window.history.length > 1 && props.backRoute === '/home') {
      router.back();
    } else {
      router.push(props.backRoute);
    }
  }
};
</script>

<style scoped>
.f-guide-header {
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  margin-bottom: 8px;
}

.f-nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.f-back-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: fit-content;
  color: var(--text-muted);
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.f-back-container:hover { color: var(--accent-blue); }

.f-back-button {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: var(--text-main);
}
.f-back-container:hover .f-back-button {
  border-color: var(--accent-blue);
  background: rgba(59, 130, 246, 0.05);
}

.f-back-text {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.f-guide-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
  letter-spacing: -0.8px;
}

.app-logo {
  height: 28px;
  width: auto;
}

.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>
<template>
  <header class="top-header fade-in delay-0">
    <button class="back-btn" @click="router.back()" aria-label="Torna indietro">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </button>

    <div class="header-center">
      <img 
        :src="isLightMode ? '/src/assets/img/logo-light.svg' : '/src/assets/img/logo-dark.svg'" 
        alt="E-surf Logo" 
        class="app-logo" 
      />
    </div>
    
    <div style="width: 36px;"></div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';

// Riceve lo stato del tema come prop per la reattività
defineProps({
  isLightMode: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();
</script>

<style scoped>
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color); /* */
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  padding: 8px 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  width: 36px;
}

.back-btn:hover {
  transform: translateX(-4px);
}

.app-logo {
  height: 32px; /* Dimensione standard logo */
  width: auto;
}
</style>
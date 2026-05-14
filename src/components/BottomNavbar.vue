<template>
  <nav class="f-bottom-nav">
    <div class="f-nav-item" :class="{ active: route.path === '/home' }" @click="router.push('/home')">
      <svg class="f-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <span>Home</span>
    </div>


    <div class="f-nav-item" :class="{ active: isHubActive }" @click="router.push('/hub')">
      <svg class="f-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
      <span>Hub</span>
    </div>

    <div class="f-nav-item action-item" @click="$emit('quick-action')">
      <div class="f-action-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
      <span class="action-label">Action</span>
    </div>

    <div class="f-nav-item" :class="{ active: route.path === '/analytics' }" @click="router.push('/analytics')">
      <svg class="f-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      <span>Analytics</span>
    </div>
    
    <div class="f-nav-item" :class="{ active: route.path === '/settings' }" @click="router.push('/settings')">
      <svg class="f-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
      <span>Impostazioni</span>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isHubActive = computed(() => {
  return route.path === '/hub' || route.path === '/dashboard';
});
</script>

<style scoped>
.f-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background-color: rgba(255, 255, 255, 0.94);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}

@media (prefers-color-scheme: dark) {
  .f-bottom-nav {
    background-color: rgba(15, 23, 42, 0.94);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
}

.f-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  gap: 4px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
}

.f-nav-icon {
  width: 20px;
  height: 20px;
}

.f-nav-item span {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1px;
}

.f-nav-item.active {
  color: #2563eb;
}

/* Stile speciale per l'Action Button centrale */
.action-item {
  overflow: visible;
  margin-top: -20px; /* Lo solleva leggermente */
}

.f-action-button {
  width: 48px;
  height: 48px;
  background: #2563eb;
  border-radius: 16px; /* Design squadrato Fintech */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
  transition: transform 0.2s;
}

.f-action-button svg {
  width: 24px;
  height: 24px;
}

.action-item:active .f-action-button {
  transform: scale(0.9) translateY(2px);
}

.action-label {
  margin-top: 4px;
  color: #64748b;
}

/* Indicatore di selezione superiore */
.f-nav-item:not(.action-item)::before {
  content: '';
  position: absolute;
  top: 0;
  width: 0;
  height: 2px;
  background-color: #2563eb;
  transition: width 0.3s ease;
}

.f-nav-item.active::before {
  width: 24px;
}
</style>
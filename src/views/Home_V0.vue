<template>
  <div class="app-container">
    <header class="top-nav fade-in delay-0">
      <button class="icon-btn hover-scale" @click="toggleTheme" aria-label="Cambia Tema">
        <svg v-if="isLightMode" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
      </button>

      <div class="header-center">
        <img 
          :src="isLightMode ? '/src/assets/img/logo-light.svg' : '/src/assets/img/logo-dark.svg'" 
          alt="E-surf Logo" 
          class="app-logo" 
        />
      </div>

      <div style="display:flex; gap: 8px;">
        <button class="icon-btn hover-scale">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </button>
        <button class="icon-btn hover-scale">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
      </div>
    </header>

    <main class="main-content">
      <section class="card hero-card fade-in delay-1">
        <div class="hero-illustration">
          <svg viewBox="0 0 300 120" width="100%" height="120" xmlns="http://www.w3.org/2000/svg">
            <path d="M120 70 Q 150 90 180 50" stroke="var(--accent-blue)" stroke-width="2" fill="none" class="animated-path" />
            <path d="M120 80 Q 160 100 190 60" stroke="var(--accent-cyan)" stroke-width="2" fill="none" class="animated-path delay-path" />
            <rect x="60" y="20" width="60" height="70" rx="8" fill="var(--accent-blue)" />
            <rect x="65" y="25" width="50" height="60" rx="4" fill="var(--bg-card)" />
            <rect x="75" y="35" width="30" height="20" rx="2" fill="var(--btn-bg)" />
            <circle cx="90" cy="70" r="6" fill="var(--accent-blue)" />
            <rect x="180" y="10" width="50" height="90" rx="8" fill="var(--bg-card-alt)" stroke="var(--border-color)" stroke-width="2" />
            <g class="energy-pulse">
              <circle cx="205" cy="55" r="14" fill="var(--accent-green)" />
              <path d="M205 45 L200 55 H205 L203 65 L210 52 H205 Z" fill="var(--bg-card)" />
            </g>
          </svg>
        </div>
        <h1 class="hero-title">Crea la tua identità<br>Digitale Energetica</h1>
        <p class="hero-subtitle">Rendi i tuoi contatori dei nodi intelligenti: partecipa attivamente alla rete moderna scambiando energia, dati e flessibilità.</p>
      </section>

      <section class="card action-card fade-in delay-2">
        <h2 class="card-title">Action</h2>
        <p class="card-text">Evolvi da semplice consumatore a protagonista attivo della transizione energetica.</p>
        <a href="#" class="text-link hover-bright">Scopri l'identità energetica digitale</a>
        <button class="btn-text-only hover-scale">Scopri di più</button>
      </section>

      <h2 class="section-title fade-in delay-3">Come funziona</h2>

      <component
        v-for="(blockName, index) in dashboardConfig.blocks"
        :key="index"
        :is="availableBlocks[blockName]"
        :class="`fade-in delay-${4 + index}`"
      />

    </main>

    <footer class="app-footer fade-in delay-6">
      <a href="#" class="hover-bright">F.A.Q.</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, shallowRef } from 'vue';
import FeatureActivation from '@/components/blocks/FeatureActivation.vue';
import FeatureNotifications from '@/components/blocks/FeatureNotifications.vue';

const availableBlocks = shallowRef({
  'FeatureActivation': FeatureActivation,
  'FeatureNotifications': FeatureNotifications
});

const dashboardConfig = ref({
  blocks: ['FeatureActivation', 'FeatureNotifications']
});

const isLightMode = ref(false);

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    isLightMode.value = true;
    document.body.classList.add('light-mode');
  }
});

const toggleTheme = () => {
  isLightMode.value = !isLightMode.value;
  if (isLightMode.value) {
    document.body.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
  } else {
    document.body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
  }
};
</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
.top-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; }
.icon-btn { background: none; border: none; color: var(--text-main); cursor: pointer; padding: 8px; transition: transform 0.2s ease; }
.hero-card { padding: 30px 24px; }
.hero-illustration { margin-bottom: 20px; }
.hero-title { font-size: 26px; font-weight: 700; line-height: 1.2; margin: 0 0 16px 0; }
.hero-subtitle { font-size: 13px; color: var(--text-muted); line-height: 1.4; margin: 0; }
.section-title { font-size: 22px; font-weight: 700; margin: 32px 0 20px 0; }
.text-link { display: block; color: var(--text-muted); font-size: 13px; text-decoration: none; margin-bottom: 20px; transition: color 0.2s; }
.app-footer { text-align: center; padding: 20px 0; }
.app-footer a { color: var(--text-muted); text-decoration: none; font-size: 14px; transition: color 0.2s; }

@keyframes pulseGlowHero {
  0% { transform: scale(1); filter: drop-shadow(0 0 0px transparent); }
  50% { transform: scale(1.08); filter: drop-shadow(0 0 10px var(--accent-green)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 0px transparent); }
}
.energy-pulse { transform-origin: 205px 55px; animation: pulseGlowHero 2.5s infinite ease-in-out; }

@keyframes dashFlow { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
.animated-path { stroke-dasharray: 10 10; animation: dashFlow 3s linear infinite; }
.animated-path.delay-path { animation-direction: reverse; animation-duration: 4s; }
</style>
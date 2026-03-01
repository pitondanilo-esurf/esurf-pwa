<template>
  <div class="app-container">
    <header class="top-nav fade-in delay-0">
      
      <div style="display:flex; gap: 8px; align-items: center;">
        <button class="icon-btn hover-scale" @click="toggleTheme" :aria-label="$t('common.changeTheme')">
          <svg v-if="isLightMode" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        </button>

        <button class="icon-btn hover-scale lang-toggle" @click="toggleLanguage">
          {{ locale === 'it' ? 'EN' : 'IT' }}
        </button>
      </div>

      <div class="header-center">
        <img 
          :src="isLightMode ? '/src/assets/img/logo-light.svg' : '/src/assets/img/logo-dark.svg'" 
          alt="E-surf Logo" 
          class="app-logo" 
        />
      </div>

      <div style="display:flex; gap: 12px; align-items: center;">
        
        <button class="icon-btn hover-scale">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>

        <div v-if="loadingAuth" class="auth-spinner"></div>
        <template v-else>
          <template v-if="isAuthenticated">
            <div class="desktop-actions">
               <div class="user-pill hover-scale" @click="goToProfile" :title="$t('common.profile')">
                  {{ (user.profile?.first_name || user.first_name || 'U')[0].toUpperCase() }}
               </div>
               <button class="icon-btn hover-scale logout-icon" @click="handleLogout" :title="$t('common.logout')">
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                   <polyline points="16 17 21 12 16 7"></polyline>
                   <line x1="21" y1="12" x2="9" y2="12"></line>
                 </svg>
               </button>
            </div>
          </template>
          
          <button v-else class="btn-text-only login-btn hover-scale" @click="goToLogin">
            {{ $t('common.login') }}
          </button>
        </template>

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
        
        <h1 class="hero-title" v-html="$t('home.hero.title').replace('Digitale', '<br>Digitale')"></h1>
        <p class="hero-subtitle">{{ $t('home.hero.subtitle1') }}</p>
        <button class="btn-primary hover-scale" @click="goToPods">
          {{ $t('home.hero.btnPods') }}
        </button>
        
        <p class="hero-subtitle">{{ $t('home.hero.subtitle2') }}</p>
        <button class="btn-primary hover-scale" @click="goTo5Steps">
          {{ $t('home.hero.btnGuide') }}
        </button>
      </section>

      <hr class="section-divider">

      <h2 class="section-title fade-in delay-3">{{ $t('home.hero.suggestion') }}</h2>

      <component
        v-for="(blockName, index) in dashboardConfig.blocks"
        :key="index"
        :is="availableBlocks[blockName]"
        :class="`fade-in delay-${4 + index}`"
      />
    </main>

    <footer class="app-footer fade-in delay-6">
      <a href="#" class="hover-bright">{{ $t('common.faq') }}</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
// Importo useI18n per la logica di switch lingua nel setup
import { useI18n } from 'vue-i18n'; 
import AuthService from '@/services/AuthService';

import FeatureActivation from '@/components/blocks/FeatureActivation.vue';
import FeatureNotifications from '@/components/blocks/FeatureNotifications.vue';

const router = useRouter();
const { locale } = useI18n(); // Inizializzo l'istanza della lingua attiva

// --- BLOCCHI DINAMICI ---
const availableBlocks = shallowRef({
  'FeatureActivation': FeatureActivation,
  'FeatureNotifications': FeatureNotifications
});
const dashboardConfig = ref({
  blocks: ['FeatureActivation', 'FeatureNotifications']
});

// --- STATO TEMA E LINGUA ---
const isLightMode = ref(false);

const toggleLanguage = () => {
  const newLang = locale.value === 'it' ? 'en' : 'it';
  locale.value = newLang; // Cambia la lingua reattivamente in tutta l'app
  localStorage.setItem('locale', newLang); // Salva la preferenza
};

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

// --- STATO AUTENTICAZIONE ---
const user = ref({});
const isAuthenticated = ref(false);
const loadingAuth = ref(true);

onMounted(async () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    isLightMode.value = true;
    document.body.classList.add('light-mode');
  }

  try {
    const response = await AuthService.getUser();
    user.value = response.data;
    isAuthenticated.value = true;
  } catch (error) {
    isAuthenticated.value = false;
    user.value = {};
    try { await AuthService.logout(); } catch(e) {}
  } finally {
    loadingAuth.value = false;
  }
});

// --- NAVIGAZIONE ---
const goToProfile = () => router.push('/profilo'); 
const goToLogin = () => router.push('/login');
const goToPods = () => router.push('/pods');
const goToIdentitaDigitale = () => router.push('/guide/identita-digitale');
const goTo5Steps = () => router.push('/guide/5-steps');

const handleLogout = async () => {
  loadingAuth.value = true;
  try {
    await AuthService.logout();
  } catch(e) {
    console.error("Errore durante il logout", e);
  } finally {
    isAuthenticated.value = false;
    user.value = {};
    loadingAuth.value = false;
    router.push('/');
  }
};
</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
/* ... (altri stili invariati) ... */

/* Stile per il pulsante testuale del toggle lingua */
.lang-toggle {
  font-weight: 800;
  font-size: 14px;
  color: var(--accent-cyan);
  width: 32px;
  display: flex;
  justify-content: center;
}

.top-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; }
.icon-btn { background: none; border: none; color: var(--text-main); cursor: pointer; padding: 8px; transition: transform 0.2s ease; }

.desktop-actions { display: flex; align-items: center; gap: 12px; }

.user-pill {
  width: 32px;
  height: 32px;
  background-color: var(--accent-blue);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.logout-icon { opacity: 0.8; }
.logout-icon:hover { color: #ff4757; opacity: 1; }

.login-btn { width: auto; padding: 6px 12px; font-size: 14px; }

.auth-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: spinAuth 1s linear infinite;
  margin: 0 8px;
}

@keyframes spinAuth { to { transform: rotate(360deg); } }

.hero-card { padding: 30px 24px; }
.hero-illustration { margin-bottom: 20px; }
.hero-title { font-size: 26px; font-weight: 700; line-height: 1.2; margin: 0 0 16px 0; }
.hero-subtitle { font-size: 13px; color: var(--text-muted); line-height: 1.4; margin: 0 0 16px 0; }

.section-divider { border: 0; border-top: 1px solid var(--border-color); margin: 40px 0; opacity: 0.5; }
.section-title { font-size: 22px; font-weight: 700; margin: 0 0 20px 0; }

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
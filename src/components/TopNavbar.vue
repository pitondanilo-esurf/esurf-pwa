<template>
  <header class="f-top-nav fade-in">
    <div class="nav-left">
      <button class="f-icon-btn" @click="toggleTheme" :title="isLightMode ? 'Passa al tema scuro' : 'Passa al tema chiaro'">
        <svg v-if="isLightMode" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
        </svg>
      </button>
      <button class="f-lang-toggle" @click="toggleLanguage">
        {{ locale === 'it' ? 'EN' : 'IT' }}
      </button>
    </div>

    <div class="nav-center">
      <img v-if="currentLogo" :src="currentLogo" alt="e-surf" class="nav-logo" />
      <span v-else class="text-logo">e-surf</span>
    </div>

    <div class="nav-right">
      <div v-if="loadingAuth" class="f-auth-spinner"></div>
      <template v-else>
        <div v-if="isAuthenticated" class="f-user-actions">
           
           <div class="f-user-profile" @click="goToProfile" title="Vai al Profilo">
              <span v-if="user.power_user" class="f-power-badge">PRO</span>
              
              <div class="f-user-pill">
                {{ (user.name || user.first_name || 'U')[0].toUpperCase() }}
              </div>
           </div>

           <div class="f-divider"></div>

           <button class="f-icon-btn f-logout-btn" @click="handleLogout" title="Esci">
             <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
               <polyline points="16 17 21 12 16 7"></polyline>
               <line x1="21" y1="12" x2="9" y2="12"></line>
             </svg>
           </button>
        </div>
        <button v-else class="f-login-btn" @click="goToLogin">
          {{ locale === 'it' ? 'Accedi' : 'Login' }}
        </button>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AuthService from '@/services/AuthService';

const router = useRouter();
const { locale } = useI18n();

const logoLight = new URL('@/assets/img/logo-light.svg', import.meta.url).href;
const logoDark = new URL('@/assets/img/logo-dark.svg', import.meta.url).href;
const currentLogo = computed(() => isLightMode.value ? logoLight : logoDark);

const isLightMode = ref(false); 
const user = ref({});
const isAuthenticated = ref(false);
const loadingAuth = ref(true);

onMounted(async () => {
  if (localStorage.getItem('theme') === 'light') {
    isLightMode.value = true;
    document.body.classList.add('light-mode');
  } else {
    isLightMode.value = false;
    document.body.classList.remove('light-mode');
  }

  try {
    const response = await AuthService.getUser();
    user.value = response.data;
    isAuthenticated.value = true;
  } catch (e) {
    isAuthenticated.value = false;
  } finally {
    loadingAuth.value = false;
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

const toggleLanguage = () => {
  locale.value = locale.value === 'it' ? 'en' : 'it';
  localStorage.setItem('locale', locale.value);
};

const goToProfile = () => router.push('/profilo');
const goToLogin = () => router.push('/login');
const handleLogout = async () => {
  loadingAuth.value = true;
  try { await AuthService.logout(); } catch(e) {}
  isAuthenticated.value = false; user.value = {}; loadingAuth.value = false;
  router.push('/');
};
</script>

<style scoped>
/* NAV HEADER COMPLETO - Effetto Sticky & Glassmorphism */
.f-top-nav {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  padding: 12px 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--bg-app);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  /* Aggiunge traslucenza intelligente basata sul tema */
  background-color: color-mix(in srgb, var(--bg-app) 85%, transparent);
}

.nav-left, .nav-right { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  width: 100px; 
}
.nav-right { justify-content: flex-end; width: auto; }
.nav-center { flex: 1; text-align: center; }

/* LOGO */
.text-logo { font-weight: 800; font-size: 20px; color: var(--text-primary); letter-spacing: -0.5px; }
.nav-logo { height: 26px; }

/* ICON BUTTONS (Tema, Logout, ecc) */
.f-icon-btn {
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  color: var(--text-primary); 
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.f-icon-btn:hover { 
  background: var(--bg-card);
  border-color: var(--border-color);
}
.f-logout-btn { color: var(--text-muted); }
.f-logout-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.2); }

/* LINGUA TOGGLE - Stile Pillola */
.f-lang-toggle {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 700; 
  font-size: 0.75rem; 
  color: var(--text-primary);
  width: 38px;
  height: 38px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.f-lang-toggle:hover {
  background: var(--accent-blue);
  color: #ffffff;
  border-color: var(--accent-blue);
}

/* ZONA UTENTE */
.f-user-actions { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}

.f-user-profile {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}
.f-user-profile:active { transform: scale(0.95); }

/* AVATAR PREMIUM */
.f-user-pill {
  width: 38px; 
  height: 38px; 
  border-radius: 12px; /* Arrotondatura quadrata Fintech */
  background: linear-gradient(135deg, var(--accent-blue) 0%, #1e40af 100%);
  color: #fff;
  display: flex; 
  align-items: center; 
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
  border: 2px solid transparent;
  transition: all 0.2s;
}
.f-user-profile:hover .f-user-pill {
  border-color: rgba(255,255,255,0.4);
}

/* BADGE PRO SOVRAPPOSTO */
.f-power-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  color: #fff; 
  font-size: 0.55rem;
  padding: 2px 6px; 
  border-radius: 6px; 
  font-weight: 800;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 2;
  border: 2px solid var(--bg-app); /* Crea uno stacco visivo netto col background */
}

/* SEPARATORE VERTICALE */
.f-divider {
  width: 1px;
  height: 24px;
  background-color: var(--border-color);
  margin: 0 4px;
}

/* LOGIN BTN */
.f-login-btn { 
  background: var(--text-primary); 
  color: var(--bg-app); 
  border: none; 
  font-weight: 700; 
  font-size: 0.85rem; 
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer; 
  transition: all 0.2s;
}
.f-login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* SPINNER */
.f-auth-spinner { 
  width: 20px; height: 20px; 
  border: 2px solid var(--border-color); 
  border-top-color: var(--accent-blue); 
  border-radius: 50%; 
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; 
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
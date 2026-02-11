<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="brand">
        <span class="brand-text">e-Surf <span class="light">Identity</span></span>
      </div>

      <div class="desktop-menu">
         <div v-if="showWarning" class="nav-warning" @click="$emit('force-signing')">
             ⚠️ Firma Richiesta
         </div>
         
         <template v-else>
             <router-link 
               to="/dashboard" 
               class="nav-link" 
               :class="{ active: isDashboard && !isProfile }"
             >
               Dashboard
             </router-link>
             
             <router-link 
               :to="{ path: '/dashboard', query: { view: 'profile' } }" 
               class="nav-link" 
               :class="{ active: isProfile }"
             >
               Profilo
             </router-link>
             
             <router-link 
               to="/pods" 
               class="nav-link" 
               active-class="active"
             >
               Contatori
             </router-link>
         </template>
      </div>

      <div class="desktop-actions">
         <div class="user-pill">{{ userInitial }}</div>
         <button @click="handleLogout" class="btn-logout-icon" title="Esci">➜</button>
      </div>

      <button class="hamburger" @click="toggleMenu">
        <span class="bar" :class="{ open: isOpen }"></span>
        <span class="bar" :class="{ open: isOpen }"></span>
        <span class="bar" :class="{ open: isOpen }"></span>
      </button>
    </div>

    <transition name="slide-down">
      <div v-if="isOpen" class="mobile-menu">
        <div v-if="showWarning" class="mobile-link warning" @click="$emit('force-signing'); isOpen=false">
            ⚠️ Firma Richiesta
        </div>
        <template v-else>
            <router-link to="/dashboard" class="mobile-link" @click="isOpen=false">Dashboard</router-link>
            <router-link :to="{ path: '/dashboard', query: { view: 'profile' } }" class="mobile-link" @click="isOpen=false">Profilo</router-link>
            <router-link to="/pods" class="mobile-link" @click="isOpen=false">Contatori</router-link>
        </template>
        <div class="divider" style="border-top:1px solid #e2e8f0; margin:5px 0;"></div>
        <button @click="handleLogout" class="mobile-link logout">Esci</button>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AuthService from '@/services/AuthService';

const props = defineProps({
  user: { type: Object, default: () => ({}) },
  showWarning: { type: Boolean, default: false }
});

const router = useRouter();
const route = useRoute();
const isOpen = ref(false);

const userInitial = computed(() => {
  const name = props.user.profile?.first_name || props.user.first_name || 'U';
  return name[0]?.toUpperCase();
});

// Calcolo stato attivo per gestire il tab Profilo vs Dashboard
const isDashboard = computed(() => route.path === '/dashboard');
const isProfile = computed(() => route.path === '/dashboard' && route.query.view === 'profile');

const toggleMenu = () => isOpen.value = !isOpen.value;

const handleLogout = async () => {
  try { await AuthService.logout(); } 
  catch(e) { console.error(e); } 
  finally { router.push('/'); }
};
</script>

<style scoped>
/* REGOLE NAVBAR ENTERPRISE (Isolate) */
.navbar {
  position: fixed; top: 0; left: 0; width: 100%; height: 70px;
  z-index: 1000; background: rgba(255, 255, 255, 0.98);
  border-bottom: 1px solid #cbd5e1; box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.nav-container {
  max-width: 1200px; margin: 0 auto; height: 100%;
  display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem;
}
.brand-text { font-weight: 700; font-size: 1.2rem; color: #0f172a; font-family: 'Inter', sans-serif; }
.brand-text .light { font-weight: 300; color: #64748b; }

.desktop-menu { display: flex; gap: 20px; align-items: center; }
.nav-link {
  text-decoration: none; color: #64748b; font-weight: 500; font-size: 0.9rem;
  padding: 8px 12px; border-radius: 8px; transition: 0.2s; font-family: 'Inter', sans-serif;
}
.nav-link:hover, .nav-link.active { color: #2563eb; background: #eff6ff; }
.nav-warning { color: #ea580c; font-weight: 700; cursor: pointer; font-size: 0.9rem; }

.desktop-actions { display: flex; align-items: center; gap: 15px; }
.user-pill {
  width: 32px; height: 32px; background: #0f172a; color: white;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 0.85rem;
}
.btn-logout-icon {
  background: white; border: 1px solid #cbd5e1; width: 32px; height: 32px;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #64748b; transition: 0.2s; font-size: 0;
}
.btn-logout-icon::after { content: '➜'; font-size: 14px; }
.btn-logout-icon:hover { border-color: #fca5a5; color: #ef4444; background: #fef2f2; }

/* HAMBURGER */
.hamburger {
  display: none; flex-direction: column; justify-content: center; gap: 6px;
  width: 36px; height: 36px; background: transparent; border: none; cursor: pointer; padding: 0;
}
.bar { width: 24px; height: 3px; background-color: #0f172a; border-radius: 3px; transition: 0.3s; }
.bar.open:nth-child(1) { transform: translateY(9px) rotate(45deg); }
.bar.open:nth-child(2) { opacity: 0; }
.bar.open:nth-child(3) { transform: translateY(-9px) rotate(-45deg); }

/* MOBILE MENU */
.mobile-menu {
  position: fixed; top: 70px; left: 0; width: 100%; background: white;
  border-bottom: 1px solid #cbd5e1; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  padding: 1.5rem; display: flex; flex-direction: column; gap: 10px; z-index: 990;
}
.mobile-link {
  text-decoration: none; color: #1e293b; font-weight: 600; font-size: 1rem;
  padding: 12px; border-radius: 8px; text-align: center; display: block;
}
.mobile-link.active { background: #eff6ff; color: #2563eb; }
.mobile-link.logout { color: #ef4444; }
.mobile-link.warning { color: #ea580c; background: #fff7ed; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }

@media (max-width: 768px) {
  .desktop-menu, .desktop-actions { display: none !important; }
  .hamburger { display: flex !important; }
}
</style>
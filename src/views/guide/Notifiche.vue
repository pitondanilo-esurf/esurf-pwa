<template>
  <div class="app-container">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
      <section class="notif-hero text-center fade-in delay-1">
        <h1 class="headline">{{ $t('notificheHelp.title') }}</h1>
        <p class="notif-intro">
          {{ $t('notificheHelp.intro') }}
        </p>
        
        <div class="shield-container">
          <svg viewBox="0 0 100 120" width="80" height="100">
            <path d="M50 10 L10 25 v40 c0 30 40 50 40 50 s40 -20 40 -50 v-40 z" fill="rgba(79, 172, 254, 0.1)" stroke="var(--accent-blue)" stroke-width="2" />
            <text x="50" y="75" text-anchor="middle" fill="var(--accent-blue)" font-size="45" font-weight="bold">E</text>
            <path d="M45 10 L35 40 h10 L40 60 L65 30 h-10 L60 10 z" fill="#FFD700" transform="translate(45, -5) scale(0.6)" />
          </svg>
        </div>
      </section>

      <section class="settings-list fade-in delay-2">
        <div v-for="(setting, index) in notificationSettings" :key="index" class="setting-card">
          <div class="setting-info">
            <h3 class="setting-title">{{ $t(`notificheHelp.settings.${setting.key}.title`) }}:</h3>
            <p class="setting-desc">{{ $t(`notificheHelp.settings.${setting.key}.desc`) }}</p>
          </div>
          
          <label class="switch">
            <input type="checkbox" v-model="setting.active">
            <span class="slider round"></span>
          </label>
        </div>
      </section>

      <footer v-if="allNotificationsOff" class="notif-warning fade-in">
        {{ $t('notificheHelp.warning') }}
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from '@/services/AuthService';
import GuideHeader from '@/components/layout/GuideHeader.vue';
// Non serve importare useI18n perché usiamo solo $t() nel template

const router = useRouter();
const isLightMode = ref(false);
const loadingAuth = ref(true);

// L'array ora contiene solo lo stato e la chiave di riferimento per il JSON
const notificationSettings = ref([
  { key: 'opp', active: false },
  { key: 'comp', active: false },
  { key: 'readiness', active: false },
  { key: 'platinum', active: false }
]);

const allNotificationsOff = computed(() => {
  return notificationSettings.value.every(s => !s.active);
});

onMounted(async () => {
  try {
    await AuthService.getUser();
  } catch (error) {
    localStorage.clear();
    sessionStorage.clear();
    router.push('/login');
    return;
  } finally {
    loadingAuth.value = false;
  }

  const savedTheme = localStorage.getItem('theme');
  isLightMode.value = savedTheme === 'light';
  window.scrollTo(0, 0);
});
</script>

<style src="@/assets/css/main.css"></style>

<style scoped>
.headline { font-size: 32px; font-weight: 500; color: var(--accent-blue); margin-bottom: 1rem; }
.notif-intro { font-size: 15px; color: var(--text-muted); line-height: 1.5; margin-bottom: 2rem; }

.shield-container { margin-bottom: 1rem; display: flex; justify-content: center; }

.settings-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 15px; }

.setting-card {
  background: var(--bg-card-alt);
  border-radius: 6px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s;
}

.setting-info { flex: 1; }
.setting-title { font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 2px;margin-top: 2px; }
.setting-desc { font-size: 13px; color: var(--text-muted); line-height: 1.4; }

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  flex-shrink: 0;
}

.switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #3a3a3c;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px; width: 20px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider { background-color: var(--accent-blue); }
input:checked + .slider:before { transform: translateX(24px); }

.notif-warning {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 20px;
  padding-bottom: 40px;
}
</style>
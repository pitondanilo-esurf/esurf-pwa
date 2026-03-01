<template>
  <div class="app-container onboarding-view">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content slider-wrapper">
      <div v-if="loadingAuth" class="auth-spinner-container">
        <div class="auth-spinner"></div>
      </div>

      <transition v-else name="slide-fade" mode="out-in">
        <div :key="currentStep" class="slide-body">
          <div class="illustration-container">
             <div v-html="steps[currentStep].svg" class="svg-render"></div>
          </div>

          <div class="info-group text-center">
            <h1 class="headline">{{ steps[currentStep].title }}</h1>
            <h2 class="subheadline">{{ steps[currentStep].subtitle }}</h2>
            <p class="body-text">{{ steps[currentStep].description }}</p>
          </div>
        </div>
      </transition>
    </main>

    <footer class="footer-fixed">
      <div class="nav-dots">
        <span 
          v-for="(step, index) in steps" 
          :key="index" 
          class="dot-indicator" 
          :class="{ active: index === currentStep }"
          @click="goToStep(index)"
          :aria-label="'Vai allo step ' + (index + 1)"
        ></span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// Importo useI18n per accedere alle traduzioni dinamiche
import { useI18n } from 'vue-i18n'; 
import AuthService from '@/services/AuthService';
import GuideHeader from '@/components/layout/GuideHeader.vue';

const router = useRouter();
const { t } = useI18n(); // Inizializzo i18n

const currentStep = ref(0);
const isLightMode = ref(false);
const loadingAuth = ref(true);

// Trasformato 'steps' in una Computed Property per supportare il cambio lingua dinamico
const steps = computed(() => [
  {
    title: t('guides.steps.step1.title'),
    subtitle: t('guides.steps.step1.subtitle'),
    description: t('guides.steps.step1.description'),
    svg: `<svg viewBox="0 0 200 150"><rect x="50" y="40" width="100" height="70" rx="4" fill="none" stroke="var(--accent-blue)" stroke-width="2"/><path d="M70 60 h60 M70 80 h40" stroke="var(--text-muted)" stroke-width="2"/></svg>`
  },
  {
    title: t('guides.steps.step2.title'),
    subtitle: t('guides.steps.step2.subtitle'),
    description: t('guides.steps.step2.description'),
    svg: `<svg viewBox="0 0 200 150"><path d="M100 30 l-40 15 v40 c0 25 40 45 40 45 s40 -20 40 -45 v-40 z" fill="rgba(52,199,89,0.1)" stroke="#34C759" stroke-width="2"/></svg>`
  },
  {
    title: t('guides.steps.step3.title'),
    subtitle: t('guides.steps.step3.subtitle'),
    description: t('guides.steps.step3.description'),
    svg: `<svg viewBox="0 0 200 150"><circle cx="100" cy="75" r="22" fill="none" stroke="var(--accent-cyan)" stroke-dasharray="4"/><circle cx="100" cy="75" r="8" fill="var(--accent-cyan)"/></svg>`
  },
  {
    title: t('guides.steps.step4.title'),
    subtitle: t('guides.steps.step4.subtitle'),
    description: t('guides.steps.step4.description'),
    svg: `<svg viewBox="0 0 200 150"><path d="M40 110 L75 60 L125 90 L160 30" fill="none" stroke="var(--accent-blue)" stroke-width="3"/></svg>`
  },
  {
    title: t('guides.steps.step5.title'),
    subtitle: t('guides.steps.step5.subtitle'),
    description: t('guides.steps.step5.description'),
    svg: `<svg viewBox="0 0 200 150"><rect x="135" y="45" width="35" height="75" fill="var(--accent-cyan)"/><path d="M152 15 l10 15 h-20 z" fill="var(--accent-cyan)"/></svg>`
  }
]);

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
  if (isLightMode.value) document.body.classList.add('light-mode');
  window.scrollTo(0, 0);
});

const goToStep = (index) => { currentStep.value = index; };
</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
/* Stili invariati */
.onboarding-view { height: 100vh; display: flex; flex-direction: column; background-color: var(--bg-app); position: relative; }
.slider-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; padding-bottom: 100px; }
.illustration-container { height: 200px; display: flex; justify-content: center; align-items: center; margin-bottom: 2rem; }
.headline { font-size: 24px; font-weight: 800; color: var(--text-main); margin-bottom: 8px; }
.subheadline { font-size: 16px; color: var(--accent-cyan); margin-bottom: 1.5rem; font-weight: 600; }
.body-text { font-size: 15px; color: var(--text-muted); line-height: 1.6; max-width: 90%; margin: 0 auto; }
.footer-fixed { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; padding: 40px 24px; background: var(--bg-app); z-index: 100; }
.nav-dots { display: flex; justify-content: center; gap: 12px; }
.dot-indicator { width: 12px; height: 12px; border-radius: 6px; background: var(--text-muted); opacity: 0.4; cursor: pointer; transition: all 0.3s ease; border: 1px solid var(--border-color); }
.dot-indicator.active { width: 32px; background: var(--accent-cyan); opacity: 1; border: none; }
.auth-spinner-container { display: flex; justify-content: center; align-items: center; }
.auth-spinner { width: 30px; height: 30px; border: 3px solid var(--border-color); border-top-color: var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateX(20px); }
.slide-fade-leave-to { opacity: 0; transform: translateX(-20px); }
</style>
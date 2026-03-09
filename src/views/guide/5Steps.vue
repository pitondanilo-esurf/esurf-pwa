<template>
  <div class="app-container onboarding-view">
    <GuideHeader :isLightMode="isLightMode" />

    <main 
      class="main-content slider-wrapper"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <div v-if="loadingAuth" class="auth-spinner-container">
        <div class="auth-spinner"></div>
      </div>

      <transition v-else :name="transitionName" mode="out-in">
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
import { useI18n } from 'vue-i18n'; 
import AuthService from '@/services/AuthService';
import GuideHeader from '@/components/layout/GuideHeader.vue';

const router = useRouter();
const { t } = useI18n();

const currentStep = ref(0);
const isLightMode = ref(false);
const loadingAuth = ref(true);

const touchStartX = ref(0);
const touchEndX = ref(0);
const transitionName = ref('slide-fade');

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

const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchEnd = (e) => {
  touchEndX.value = e.changedTouches[0].clientX;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeThreshold = 50; 
  const diff = touchStartX.value - touchEndX.value;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      if (currentStep.value < steps.value.length - 1) {
        transitionName.value = 'slide-next';
        currentStep.value++;
      }
    } else {
      if (currentStep.value > 0) {
        transitionName.value = 'slide-prev';
        currentStep.value--;
      }
    }
  }
};

const goToStep = (index) => {
  transitionName.value = index > currentStep.value ? 'slide-next' : 'slide-prev';
  currentStep.value = index;
};

onMounted(async () => {
  try {
    await AuthService.getUser();
  } catch (error) {
    localStorage.clear();
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
</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
/* =========================================
   LAYOUT PRINCIPALE
   ========================================= */
.onboarding-view { 
  height: 100vh; 
  display: flex; 
  flex-direction: column; 
  background-color: var(--bg-app); 
  position: relative; 
  overflow: hidden; 
}

.slider-wrapper { 
  flex: 1; 
  display: flex; 
  justify-content: center; 
  touch-action: pan-y; /* Permette lo scroll verticale nativo, ma cattura l'orizzontale in JS */
} 

.slide-body { 
  width: 100%; 
  max-width: 400px; 
  padding: 0 20px; 
}

/* =========================================
   CONTENUTO SLIDE (Testi e SVG)
   ========================================= */
.illustration-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.svg-render {
  width: 100%;
  max-width: 250px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.headline { 
  font-size: 24px; 
  font-weight: 700; 
  color: var(--text-main); 
  margin: 0;
}

.subheadline {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin: 0;
}

.body-text { 
  font-size: 14px; 
  color: var(--text-muted); 
  line-height: 1.5; 
  margin: 0;
}

/* =========================================
   FOOTER FISSO E PALLINI DI NAVIGAZIONE
   ========================================= */
.footer-fixed {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px 0 40px 0; /* Spazio extra in basso per i dispositivi mobile */
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.nav-dots {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dot-indicator { 
  width: 12px; 
  height: 12px; 
  border-radius: 6px; 
  background: var(--text-muted); 
  opacity: 0.4; 
  cursor: pointer; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  border: 1px solid var(--border-color); 
}

.dot-indicator.active { 
  width: 32px; 
  background: var(--accent-cyan); 
  opacity: 1; 
  border: none; 
}

/* =========================================
   ANIMAZIONI SWIPE
   ========================================= */
.slide-next-enter-active, .slide-next-leave-active,
.slide-prev-enter-active, .slide-prev-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-next-enter-from { opacity: 0; transform: translateX(50px); }
.slide-next-leave-to { opacity: 0; transform: translateX(-50px); }

.slide-prev-enter-from { opacity: 0; transform: translateX(-50px); }
.slide-prev-leave-to { opacity: 0; transform: translateX(50px); }

/* SPINNER */
.auth-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.auth-spinner { 
  width: 40px; 
  height: 40px; 
  border: 3px solid var(--border-color); 
  border-top-color: var(--accent-blue); 
  border-radius: 50%; 
  animation: spin 1s linear infinite; 
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
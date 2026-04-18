<template>
  <div class="app-container">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
      <div v-if="!isDetailOpen" class="page-header-compact fade-in delay-1">
         <div class="header-left">
            <h2>{{ $t('resources.swipe.selectionTitle') }}</h2>
            <p>{{ $t('resources.swipe.selectionSubtitle') }}</p>
         </div>
         <button class="btn-add-compact hover-scale" @click="router.push('/home')">
            {{ $t('common.back') || 'Indietro' }}
         </button>
      </div>

      <transition name="fade">
        <div v-if="!isDetailOpen" class="selection-grid fade-in delay-2">
          <div v-for="(res, index) in resources" :key="res.id" 
               class="mini-card hover-scale" @click="openDetail(index)">
            <div class="mini-card-icon">{{ getIcon(res.resource_type) }}</div>
            <div class="mini-card-info">
              <h4>{{ res.address }}</h4>
              <span>{{ res.city }}</span>
            </div>
            <div class="mini-card-arrow">→</div>
          </div>
        </div>
      </transition>

      <transition name="slide-up">
        <div v-if="isDetailOpen" class="swipe-overlay" 
             @touchstart="handleTouchStart" 
             @touchend="handleTouchEnd">
          
          <div class="swipe-nav-desktop">
            <button class="nav-arrow prev" @click="prevPod" :disabled="currentIndex === 0">←</button>
            <button class="nav-arrow next" @click="nextPod" :disabled="currentIndex === resources.length - 1">→</button>
          </div>
          
          <div class="swipe-modal-container">
            <header class="swipe-header">
              <button class="btn-close-swipe" @click="isDetailOpen = false">✕ {{ $t('resources.swipe.close') || 'Chiudi' }}</button>
              <div class="swipe-counter">{{ currentIndex + 1 }} / {{ resources.length }}</div>
              <div class="type-indicator">{{ getIcon(currentPod.resource_type) }}</div>
            </header>

            <div class="swipe-content-wrapper">
              <transition :name="swipeDirection">
                <div :key="currentPod.id" class="full-detail-card">
                  <section class="detail-hero">
                    <span class="detail-city">{{ currentPod.city }}</span>
                    <h1 class="detail-address">{{ currentPod.address }}</h1>
                    <div class="compliance-tag" :class="getComplianceClass(currentPod)">
                      {{ $t('resources.swipe.compliance') || 'Compliance' }}: {{ currentPod.compliance_data?.level || 'N/D' }}
                    </div>
                  </section>

                  <section class="detail-stats">
                    <div class="stat-box">
                      <label>{{ $t('resources.swipe.power') || 'Potenza' }}</label>
                      <p>{{ currentPod.consumer_power_kw || '0' }} kW</p>
                    </div>
                    <div class="stat-box">
                      <label>{{ $t('resources.swipe.status') || 'Stato' }}</label>
                      <p :class="currentPod.status">{{ $t(`resources.statusMap.${currentPod.status}`) || currentPod.status }}</p>
                    </div>
                  </section>

                  <section v-if="currentAiData" class="ai-insight-box">
                    <div class="ai-header">
                      <span class="ai-spark">✨</span>
                      <span>{{ $t('resources.swipe.aiTitle') || 'AI Insight' }}</span>
                    </div>
                    <p>{{ currentAiData.suggestion || $t('resources.swipe.emptyAi') || 'Analisi in corso per ottimizzare i tuoi consumi...' }}</p>
                  </section>

                  <div class="detail-actions">
                    <button class="btn-main-action" @click="openEditModal(currentPod)">{{ $t('resources.swipe.manageBtn') || 'Gestisci Asset' }}</button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </transition>
    </main>

    <PodAiModal :show="showAiModal" :aiData="activeAiData" @close="showAiModal = false" />
    <PodModify :show="showEditModal" :podData="selectedPod" @close="showEditModal = false" @saved="fetchData" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from '@/services/axios';
import GuideHeader from '@/components/layout/GuideHeader.vue';
import PodAiModal from '@/components/pods/PodAiModal.vue';
import PodModify from '@/components/pods/PodModify.vue';

const router = useRouter();
const { t } = useI18n();
const resources = ref([]);
const loading = ref(true);
const isLightMode = ref(localStorage.getItem('theme') === 'light');

const isDetailOpen = ref(false);
const currentIndex = ref(0);
const swipeDirection = ref('slide-next');

let touchStart = 0;
let touchEnd = 0;

const currentPod = computed(() => resources.value[currentIndex.value] || {});
const currentAiData = computed(() => {
  const ai = currentPod.value.ai_analysis;
  return typeof ai === 'string' ? JSON.parse(ai) : ai;
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/api/resources');
    resources.value = res.data.data || res.data || [];
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
};

const openDetail = (index) => {
  currentIndex.value = index;
  isDetailOpen.value = true;
};

const nextPod = () => {
  if (currentIndex.value < resources.value.length - 1) {
    swipeDirection.value = 'slide-next';
    currentIndex.value++;
  }
};

const prevPod = () => {
  if (currentIndex.value > 0) {
    swipeDirection.value = 'slide-prev';
    currentIndex.value--;
  }
};

const handleTouchStart = (e) => touchStart = e.changedTouches[0].screenX;
const handleTouchEnd = (e) => {
  touchEnd = e.changedTouches[0].screenX;
  const diff = touchStart - touchEnd;
  if (diff > 50) nextPod();
  if (diff < -50) prevPod();
};

const getIcon = (t) => t === 'gas' ? '🔥' : (t === 'acqua' ? '💧' : '⚡');
const getComplianceClass = (p) => `level-${p.compliance_data?.level?.toLowerCase() || 'none'}`;

const showAiModal = ref(false);
const activeAiData = ref(null);
const showEditModal = ref(false);
const selectedPod = ref(null);

const openAiModal = (pod) => { activeAiData.value = currentAiData.value; showAiModal.value = true; };
const openEditModal = (pod) => { selectedPod.value = pod; showEditModal.value = true; };

onMounted(fetchData);
</script>

<style scoped>
.main-content { padding: 1rem; max-width: 1000px; margin: 0 auto; }

/* HEADER E GRIGLIA */
.page-header-compact { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-header-compact h2 { margin: 0; font-size: 1.3rem; font-weight: 700; }
.page-header-compact p { margin: 2px 0 0 0; color: var(--text-muted); font-size: 0.8rem; }
.btn-add-compact { background-color: var(--accent-blue); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 0.75rem; cursor: pointer; }

.selection-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }
.mini-card { background: var(--bg-card); border: 1px solid var(--border-color); padding: 12px; border-radius: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.2s; }
.mini-card:hover { border-color: var(--accent-blue); }
.mini-card-icon { font-size: 1.2rem; }
.mini-card-info h4 { margin: 0; font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
.mini-card-info span { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; }

/* =========================================
   STILI MODALE SWIPE (AGGIORNATI)
   ========================================= */

/* Sfondo con effetto Blur centrato */
.swipe-overlay { 
  position: fixed; 
  top: 0; left: 0; right: 0; bottom: 0; 
  background: rgba(0, 0, 0, 0.4); 
  backdrop-filter: blur(8px); 
  z-index: 9999; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
}

/* Corpo della Modale */
.swipe-modal-container {
  width: 100%;
  max-width: 500px;
  height: 90vh;
  background: var(--bg-app);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  position: relative;
  z-index: 10;
}

/* Header interno della Modale */
.swipe-header { 
  padding: 16px 20px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border-bottom: 1px solid var(--border-color); 
  background: var(--bg-card); 
  z-index: 2;
}
.btn-close-swipe { 
  background: var(--bg-app); 
  border: 1px solid var(--border-color); 
  color: var(--text-main); 
  font-weight: 800; 
  padding: 6px 14px; 
  border-radius: 10px; 
  font-size: 0.75rem; 
  cursor: pointer; 
  transition: 0.2s;
}
.btn-close-swipe:hover { background: #ef4444; color: white; border-color: #ef4444; }

/* Area dei contenuti (animata) */
.swipe-content-wrapper { 
  flex: 1; 
  position: relative; 
  overflow: hidden; 
}

.full-detail-card { 
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
  padding: 24px; 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
  overflow-y: auto; /* Aggiunto per permettere lo scroll di contenuti lunghi */
}

/* Dettagli Card */
.detail-hero .detail-city { font-size: 0.75rem; font-weight: 800; color: var(--accent-blue); text-transform: uppercase; }
.detail-hero .detail-address { font-size: 1.6rem; font-weight: 800; margin: 4px 0 10px 0; line-height: 1.1; }
.compliance-tag { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; background: var(--bg-card); border: 1px solid var(--border-color); }

.detail-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.stat-box { background: var(--bg-card); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); }
.stat-box label { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; display: block; }
.stat-box p { margin: 2px 0 0 0; font-size: 1rem; font-weight: 700; }

.ai-insight-box { background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.05) 100%); border: 1px solid var(--accent-blue); padding: 16px; border-radius: 16px; }
.ai-header { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.7rem; color: var(--accent-blue); margin-bottom: 6px; }

.detail-actions { display: flex; flex-direction: column; gap: 8px; margin-top: auto; padding-bottom: 20px; }
.btn-main-action { background: var(--accent-blue); color: white; border: none; padding: 14px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; cursor: pointer; }

/* Frecce Desktop (Esterne) */
.swipe-nav-desktop { 
  position: absolute; 
  width: 100%; 
  max-width: 700px; /* Più largo della modale per posizionare le frecce ai lati */
  display: flex; 
  justify-content: space-between; 
  pointer-events: none; /* Permette di cliccare la modale al centro */
  z-index: 5;
}

.nav-arrow { 
  pointer-events: auto; /* Rende cliccabili le frecce */
  background: var(--bg-card); 
  border: 1px solid var(--border-color); 
  color: var(--text-main); 
  width: 45px; height: 45px; 
  border-radius: 50%; 
  cursor: pointer; 
  font-weight: 800; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
.nav-arrow:hover { transform: scale(1.1); background: var(--accent-blue); color: white; }
.nav-arrow:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }

/* Animazioni Slide */
.slide-next-enter-active, .slide-next-leave-active, .slide-prev-enter-active, .slide-prev-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-next-enter-from { transform: translateX(100%); opacity: 0; }
.slide-next-leave-to { transform: translateX(-100%); opacity: 0; }
.slide-prev-enter-from { transform: translateX(-100%); opacity: 0; }
.slide-prev-leave-to { transform: translateX(100%); opacity: 0; }

/* Comportamento Mobile: Ritorna a tutto schermo */
@media (max-width: 600px) {
  .swipe-modal-container {
    height: 100vh;
    max-width: 100%;
    border-radius: 0;
  }
  .swipe-nav-desktop { display: none; }
}
</style>
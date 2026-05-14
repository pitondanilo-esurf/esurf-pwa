<template>
  <div class="app-container">
    <TopNavbar />

    <main class="main-content" :class="['resource-' + currentResourceType]">
      
      <div class="premium-progress fade-in">
        <div class="progress-bar" :style="{ width: '100%', background: resourceConfig.color }"></div>
      </div>

      <div class="header-premium fade-in delay-1">
        <div class="badges-row">
          <div class="card-tag resource-tag" :style="{ color: resourceConfig.color, borderColor: resourceConfig.color }">
            {{ resourceConfig.tag }}: <span class="pod-code">{{ currentPodCode }}</span>
          </div>
        </div>
        
        <h1 class="title-premium">
          {{ greetingName }}, {{ resourceConfig.titleMsg }}
        </h1>
      </div>

      <div class="lens-viewport fade-in delay-2">
        
        <electricPower_lens 
          v-if="currentResourceType === 'energia_elettrica'" 
          :aiAnalysis="aiData"
        />

        <gas_lens 
          v-else-if="currentResourceType === 'gas'" 
          :aiAnalysis="aiData"
          :assets="configuredAssets"
        />

        <water_lens 
          v-else-if="currentResourceType === 'acqua'" 
          :aiAnalysis="aiData"
        />

      </div>

      <div class="action-footer fade-in delay-3">
        <button @click="enterDashboard" class="btn-primary-revo">
          🚀 ATTIVA DASHBOARD {{ resourceConfig.name.toUpperCase() }}
        </button>
      </div>

    </main>
    <BottomNavbar class="fade-in delay-3" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios';
import AuthService from '@/services/AuthService';

import TopNavbar from '@/components/TopNavbar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';

// Import dei componenti specifici per risorsa
import electricPower_lens from '@/components/lenses/electricPower_lens.vue';
import gas_lens from '@/components/lenses/gas_lens.vue';
import water_lens from '@/components/lenses/water_lens.vue'; // <-- Import aggiunto

const router = useRouter();
const user = ref(null);
const currentResourceType = ref('energia_elettrica');
const currentPodCode = ref(null);
const aiData = ref(null);
const configuredAssets = ref([]); 

const resourceDictionaries = {
  energia_elettrica: { name: 'Energia', tag: '⚡ POD', color: '#3b82f6', titleMsg: 'ecco il tuo piano energetico.' },
  gas: { name: 'Gas', tag: '🔥 PDR', color: '#f59e0b', titleMsg: 'ecco il tuo profilo termico.' },
  acqua: { name: 'Acqua', tag: '💧 IDRICO', color: '#06b6d4', titleMsg: 'ecco la tua gestione idrica.' }
};

const resourceConfig = computed(() => resourceDictionaries[currentResourceType.value] || resourceDictionaries.energia_elettrica);

onMounted(async () => {
  const podId = localStorage.getItem('esurf_current_pod_id');
  currentPodCode.value = localStorage.getItem('esurf_current_pod_code');
  
  // Rilevamento tipo risorsa salvata da ResourceOnboarding
  const rType = localStorage.getItem('esurf_current_resource_type');
  if (rType) {
    const normalized = rType.toLowerCase();
    if (normalized.includes('acqua') || normalized.includes('water')) {
      currentResourceType.value = 'acqua';
    } else if (normalized.includes('gas')) {
      currentResourceType.value = 'gas';
    } else {
      currentResourceType.value = 'energia_elettrica';
    }
  }

  try {
    const userRes = await AuthService.getUser();
    user.value = userRes.data;

    if (podId) {
      // 1. Recuperiamo gli asset configurati
      const assetRes = await axios.get(`/api/pods/${podId}/assets`);
      configuredAssets.value = assetRes.data || [];

      // 2. Carichiamo i dati dell'analisi AI della bolletta
      const aiRes = await axios.get('/api/pods/latest-independence', { params: { pod_id: podId } });
      aiData.value = aiRes.data.ai_analysis;
    }
  } catch (e) {
    console.error("Errore Caricamento Hub:", e);
  }
});

const greetingName = computed(() => user.value?.first_name || 'Amico');

const enterDashboard = () => {
  // Pulizia e navigazione verso la dashboard finale
  localStorage.removeItem('esurf_current_pod_id');
  localStorage.removeItem('esurf_current_resource_type');
  router.push('/hub');
};
</script>

<style scoped>
.main-content { 
  padding: 12px 20px; 
  max-width: 480px; 
  margin: 0 auto; 
  padding-bottom: 80px; 
}

.premium-progress { height: 3px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 16px; overflow: hidden; }
.progress-bar { height: 100%; transition: width 0.5s ease; }

.header-premium { margin-bottom: 20px; }
.badges-row { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 12px; }

.card-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 8px; border: 1px solid; background: var(--bg-card); }
.pod-code { font-family: monospace; font-weight: 800; }

.title-premium { font-size: 24px; font-weight: 800; line-height: 1.2; color: var(--text-primary); margin: 0; }

.lens-viewport { 
  margin-top: 20px; 
  min-height: 400px;
}

.placeholder-vettore {
  padding: 40px;
  text-align: center;
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px dashed var(--border-color);
  color: var(--text-muted);
}

.action-footer { margin-top: 20px; }
.btn-primary-revo { 
  width: 100%; 
  background: var(--text-primary); 
  color: var(--bg-card); 
  border: none; 
  padding: 18px; 
  border-radius: 16px; 
  font-size: 15px; 
  font-weight: 800; 
  cursor: pointer; 
}
</style>
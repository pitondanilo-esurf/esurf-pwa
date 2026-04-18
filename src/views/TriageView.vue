<template>
  <div class="app-container">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
      <section v-if="triageItems.length > 0" class="triage-section fade-in">
        <div class="section-header-mini">
          <span class="pulse-icon"></span>
          <h3>CENTRO OPERATIVO: {{ triageItems.length }} URGENZE</h3>
        </div>
        
        <div class="triage-carousel">
          <div v-for="item in triageItems" :key="item.id" class="triage-card" :class="item.type">
            <div class="triage-content">
              <span class="triage-tag">{{ item.tag }}</span>
              <h4 class="triage-address">{{ item.address }}</h4>
              <p class="triage-msg">{{ item.message }}</p>
            </div>
            <button class="triage-action-btn" @click="handleTriageAction(item)">
              {{ item.actionLabel }} →
            </button>
          </div>
        </div>
      </section>

      <section class="assets-section fade-in delay-1">
        <div class="section-header-mini">
          <h3>TUTTI I TUOI ASSET ({{ resources.length }})</h3>
        </div>

        <div v-if="loading" class="loading-state">
           <div class="spinner"></div>
        </div>
        
        <div v-else class="tower-grid">
            <ControlTowerCard 
              v-for="res in resources" :key="res.id"
              :resource="res"
              @view-ai="openAiModal"
              @edit="openEditModal"
              @view-compliance="openComplianceModal"
            />
        </div>
      </section>
    </main>

    <PodAiModal :show="showAiModal" :aiData="activeAiData" @close="showAiModal = false" />
    <PodModify :show="showEditModal" :podData="selectedPod" @close="showEditModal = false" @saved="fetchData" />
    <ResourceComplianceModal :show="showComplianceModal" :complianceData="activeComplianceData" @close="showComplianceModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios';
import GuideHeader from '@/components/layout/GuideHeader.vue';
import ControlTowerCard from '@/components/resources/ControlTowerCard.vue';
import PodAiModal from '@/components/pods/PodAiModal.vue';
import PodModify from '@/components/pods/PodModify.vue';
import ResourceComplianceModal from '@/components/resources/ResourceComplianceModal.vue';

const router = useRouter();
const isLightMode = ref(localStorage.getItem('theme') === 'light');
const resources = ref([]);
const loading = ref(true);

// Modal States
const showAiModal = ref(false);
const activeAiData = ref(null);
const showEditModal = ref(false);
const selectedPod = ref(null);
const showComplianceModal = ref(false);
const activeComplianceData = ref(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('/api/resources');
    resources.value = res.data.data || res.data || [];
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
};

// LOGICA DI TRIAGE: Estrae solo ciò che richiede attenzione
const triageItems = computed(() => {
  const items = [];
  resources.value.forEach(r => {
    const ai = typeof r.ai_analysis === 'string' ? JSON.parse(r.ai_analysis) : r.ai_analysis;
    
    // Urgenza: Bolletta mancante o errore
    if (r.status === 'pending' || r.status === 'failed' || !r.bill_file) {
      items.push({
        id: `urg-${r.id}`,
        type: 'urgency',
        tag: 'AZIONE RICHIESTA',
        address: r.address,
        message: !r.bill_file ? 'Manca la bolletta di Aprile.' : 'Errore nel caricamento dati.',
        actionLabel: 'Carica ora',
        resource: r
      });
    }
    
    // Opportunità: AI High Potential
    if (ai?.market_potential === 'HIGH' || ai?.CER_potential === 'HIGH') {
      items.push({
        id: `opp-${r.id}`,
        type: 'opportunity',
        tag: 'OPPORTUNITÀ AI',
        address: r.address,
        message: ai.CER_potential === 'HIGH' ? 'Alto potenziale per Comunità Energetica.' : 'Possibile ottimizzazione tariffaria.',
        actionLabel: 'Scopri di più',
        resource: r
      });
    }
  });
  return items;
});

const handleTriageAction = (item) => {
  if (item.type === 'urgency') openEditModal(item.resource);
  else openAiModal(item.resource);
};

const openAiModal = (res) => {
  activeAiData.value = typeof res.ai_analysis === 'string' ? JSON.parse(res.ai_analysis) : res.ai_analysis;
  showAiModal.value = true;
};
const openEditModal = (res) => { selectedPod.value = res; showEditModal.value = true; };
const openComplianceModal = (data) => { activeComplianceData.value = data; showComplianceModal.value = true; };

onMounted(fetchData);
</script>

<style scoped>
.main-content { padding: 1rem; max-width: 1200px; margin: 0 auto; }

.section-header-mini { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.section-header-mini h3 { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

/* ANIMAZIONE PULSE PER URGENZE */
.pulse-icon { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); animation: pulse-red 2s infinite; }
@keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

/* CAROUSEL TRIAGE */
.triage-carousel { 
  display: flex; 
  gap: 12px; 
  overflow-x: auto; 
  padding-bottom: 20px; 
  margin-bottom: 20px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.triage-carousel::-webkit-scrollbar { height: 4px; }
.triage-carousel::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }

.triage-card { 
  flex: 0 0 280px; 
  scroll-snap-align: start;
  background: var(--bg-card); 
  border-radius: 16px; 
  padding: 16px; 
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160px;
  position: relative;
  overflow: hidden;
}

/* Colorazione tematica slide */
.triage-card.urgency { border-left: 4px solid #ef4444; }
.triage-card.opportunity { border-left: 4px solid #10b981; }

.triage-tag { font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.05); margin-bottom: 8px; display: inline-block; }
.urgency .triage-tag { color: #ef4444; }
.opportunity .triage-tag { color: #10b981; }

.triage-address { font-size: 0.9rem; font-weight: 700; margin: 0 0 4px 0; color: var(--text-main); }
.triage-msg { font-size: 0.8rem; color: var(--text-muted); line-height: 1.3; margin: 0; }

.triage-action-btn { 
  margin-top: 12px;
  background: var(--bg-app); 
  border: 1px solid var(--border-color); 
  color: var(--text-main); 
  padding: 8px; 
  border-radius: 8px; 
  font-size: 0.75rem; 
  font-weight: 700; 
  cursor: pointer;
  transition: all 0.2s;
}
.triage-action-btn:hover { background: var(--accent-blue); color: white; border-color: var(--accent-blue); }

/* GRID SOTTOSTANTE */
.tower-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
</style>
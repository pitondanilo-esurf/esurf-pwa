<template>
  <div class="app-container">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
      <div class="page-header-compact fade-in delay-1">
         <div class="header-left">
            <h2>{{ $t('resources.header.titleTower') || 'Torre di Controllo' }}</h2>
            <p>{{ $t('resources.header.subtitleTower') || 'Gestione per eccezioni' }}</p>
         </div>
         <button class="btn-add-compact hover-scale" @click="goToOnboarding">
            {{ $t('resources.header.addBtn') || '+ Aggiungi' }}
         </button>
      </div>

      <div class="filters-area fade-in delay-2">
        
        <div class="filter-block">
          <label class="row-label">Filtra per Categoria:</label>
          <div class="pill-track">
            <button v-for="f in filterOptions" :key="f.id" 
                    class="pill-btn" :class="{ 'active': currentFilter === f.id }"
                    @click="setMainFilter(f.id)">
              {{ f.label }} <span v-if="f.count > 0" class="count">{{ f.count }}</span>
            </button>
          </div>
        </div>

        <div class="filter-block compliance-block">
          <div class="compliance-selector-box">
            <label class="row-label">Screma per livello (In <strong>AND</strong>):</label>
            <select v-model="complianceFilter" class="custom-select" :disabled="currentFilter === 'all'">
              <option value="all">Tutti i livelli</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
              <option value="none">Nessuna Compliance</option>
            </select>
          </div>
          <p v-if="currentFilter !== 'all'" class="filter-hint">
            * Mostrando <strong>{{ currentFilterLabel }}</strong> + <strong>{{ currentComplianceLabel }}</strong>
          </p>
        </div>
      </div>

      <div class="content-area fade-in delay-2">
        <div v-if="loading" class="loading-state">
           <div class="spinner"></div><p>{{ $t('resources.status.loading') }}</p>
        </div>
        
        <div v-else class="tower-grid">
            <ControlTowerCard 
              v-for="res in filteredResources" :key="res.id"
              :resource="res"
              @view-ai="openAiModal"
              @edit="openEditModal"
              @view-compliance="openComplianceModal"
            />
            <div v-if="filteredResources.length === 0" class="empty-state">
              Nessun risultato per questa combinazione di filtri.
            </div>
        </div>
      </div>
    </main>

    <PodAiModal :show="showAiModal" :aiData="activeAiData" @close="showAiModal = false" />
    <PodModify :show="showEditModal" :podData="selectedPod" @close="showEditModal = false" @saved="fetchData" />
    <ResourceComplianceModal :show="showComplianceModal" :complianceData="activeComplianceData" @close="showComplianceModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from '@/services/axios';
import GuideHeader from '@/components/layout/GuideHeader.vue';
import ControlTowerCard from '@/components/resources/ControlTowerCard.vue';
import PodAiModal from '@/components/pods/PodAiModal.vue';
import PodModify from '@/components/pods/PodModify.vue';
import ResourceComplianceModal from '@/components/resources/ResourceComplianceModal.vue'; 

const router = useRouter();
const { t } = useI18n();
const isLightMode = ref(localStorage.getItem('theme') === 'light');

const resources = ref([]);
const loading = ref(true);
const currentFilter = ref('all');
const complianceFilter = ref('all');

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

const filterOptions = computed(() => [
  { id: 'all', label: 'TUTTI', count: resources.value.length },
  { id: 'energia_elettrica', label: 'LUCE', count: resources.value.filter(r => r.resource_type === 'energia_elettrica').length },
  { id: 'gas', label: 'GAS', count: resources.value.filter(r => r.resource_type === 'gas').length },
  { id: 'acqua', label: 'ACQUA', count: resources.value.filter(r => r.resource_type === 'acqua').length },
  { id: 'compliance_ix', label: 'COMPLIANCE IX', count: resources.value.filter(r => r.status === 'pending' || r.status === 'failed' || !r.bill_file).length },
  { id: 'cta', label: 'CALL TO ACTION', count: resources.value.filter(r => r.call_to_action === true).length },
  { id: 'opportunities', label: 'OPPORTUNITIES', count: resources.value.filter(r => {
      const ai = typeof r.ai_analysis === 'string' ? JSON.parse(r.ai_analysis) : r.ai_analysis;
      return ai?.market_potential === 'HIGH' || ai?.CER_potential === 'HIGH';
    }).length 
  }
]);

const currentFilterLabel = computed(() => filterOptions.value.find(f => f.id === currentFilter.value)?.label || '');
const currentComplianceLabel = computed(() => complianceFilter.value === 'all' ? 'Tutti' : complianceFilter.value.toUpperCase());

const setMainFilter = (filterId) => {
  currentFilter.value = filterId;
  if (filterId === 'all') complianceFilter.value = 'all';
};

const filteredResources = computed(() => {
  if (currentFilter.value === 'all') return resources.value;

  let list = resources.value;

  if (currentFilter.value === 'compliance_ix') {
    list = list.filter(r => r.status === 'pending' || r.status === 'failed' || !r.bill_file);
  } else if (currentFilter.value === 'cta') {
    list = list.filter(r => r.call_to_action === true);
  } else if (currentFilter.value === 'opportunities') {
    list = list.filter(r => {
        const ai = typeof r.ai_analysis === 'string' ? JSON.parse(r.ai_analysis) : r.ai_analysis;
        return ai?.market_potential === 'HIGH' || ai?.CER_potential === 'HIGH';
    });
  } else {
    list = list.filter(r => r.resource_type === currentFilter.value);
  }

  if (complianceFilter.value !== 'all') {
    list = list.filter(r => {
      const level = r.compliance_data?.level?.toLowerCase() || '';
      if (complianceFilter.value === 'none') return !level;
      return level.includes(complianceFilter.value);
    });
  }

  return list;
});

const openAiModal = (res) => {
  activeAiData.value = typeof res.ai_analysis === 'string' ? JSON.parse(res.ai_analysis) : res.ai_analysis;
  showAiModal.value = true;
};
const openEditModal = (res) => { selectedPod.value = res; showEditModal.value = true; };
const openComplianceModal = (data) => { activeComplianceData.value = data; showComplianceModal.value = true; };
const goToOnboarding = () => router.push('/onboarding-risorse');

onMounted(() => {
  if (isLightMode.value) document.body.classList.add('light-mode');
  fetchData();
});
</script>

<style scoped>
.main-content { padding: 1rem 1rem 4rem 1rem; max-width: 1200px; margin: 0 auto; }
.page-header-compact { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }

/* NUOVA STRUTTURA FILTRI COMPATTA */
.filters-area { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; /* Ridotto gap verticale */
  margin-bottom: 1.5rem; 
  background: var(--bg-card); 
  padding: 12px 14px; /* Padding ridotto */
  border-radius: 12px; 
  border: 1px solid var(--border-color); 
}

.filter-block { display: flex; flex-direction: column; gap: 6px; }
.row-label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }

.pill-track { display: flex; gap: 6px; flex-wrap: wrap; }
/* Bottoni più piccoli e ravvicinati */
.pill-btn { background: var(--bg-app); border: 1px solid var(--border-color); color: var(--text-muted); padding: 5px 12px; border-radius: 16px; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.pill-btn.active { background: var(--accent-blue); color: white; border-color: var(--accent-blue); }
.pill-btn .count { background: rgba(0,0,0,0.15); padding: 2px 5px; border-radius: 6px; font-size: 0.6rem; margin-left: 4px; }

.compliance-block { border-top: 1px dashed var(--border-color); padding-top: 10px; }
.compliance-selector-box { display: flex; flex-direction: column; gap: 4px; }
/* Tendina compatta */
.custom-select { background: var(--bg-app); border: 1px solid var(--border-color); color: var(--text-main); padding: 6px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; width: 100%; max-width: 200px; }

.filter-hint { font-size: 0.65rem; color: var(--accent-blue); font-weight: 600; margin-top: 2px; opacity: 0.9; }

/* OTTIMIZZAZIONE ORIZZONTALE SU DESKTOP */
@media (min-width: 800px) {
  .filters-area { 
    flex-direction: row; 
    align-items: center; 
    justify-content: space-between; 
    gap: 16px; 
  }
  .filter-block { flex: 1; }
  .compliance-block { 
    border-top: none; 
    padding-top: 0; 
    border-left: 1px solid var(--border-color); 
    padding-left: 16px; 
    max-width: 250px; 
    flex: none; /* Impedisce che si allarghi troppo */
  }
  .custom-select { max-width: 100%; }
}

.tower-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.empty-state { grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); font-size: 0.9rem; font-style: italic; }
</style>
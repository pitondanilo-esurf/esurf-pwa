<template>
  <div class="app-container admin-mode">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
      <div class="page-header-compact fade-in delay-1">
         <div class="header-left">
            <div class="admin-badge">SUPERADMIN</div>
            <h2>POD Orfani (Non in CER)</h2>
            <p>Rilevamento e gestione dei POD non ancora assegnati ad alcuna Comunità Energetica.</p>
         </div>
      </div>

      <div class="kpi-grid fade-in delay-2">
        <div class="kpi-card">
          <span class="kpi-label">POD Orfani Totali</span>
          <div class="kpi-value">{{ totalOrphans }}</div>
        </div>
        <div class="kpi-card highlight-purple">
          <span class="kpi-label">Potenza Aggregabile (Orfana)</span>
          <div class="kpi-value">{{ totalPowerMw }} <span class="unit">MW</span></div>
        </div>
      </div>

      <div class="content-area fade-in delay-2 mt-4">
        <div v-if="loading" class="loading-state">
           <div class="spinner"></div><p>Ricerca POD orfani in corso...</p>
        </div>
        
        <div v-else class="pods-container">
            <div v-if="orphanPods.length === 0" class="glass-card empty-state">
                <div class="empty-icon">✅</div>
                <h3>Tutti i POD sono assegnati!</h3>
                <p>Non ci sono POD "orfani" nel sistema. Ogni asset fa parte di una CER.</p>
            </div>
            
            <div v-else class="locations-wrapper">
                <div v-for="group in groupedPods" :key="group.address" class="location-group">
                    <div class="location-header">
                        <h3 class="location-title"> {{ group.address }}</h3>
                        <span class="location-badge">{{ group.items.length }} POD</span>
                    </div>

                    <div class="accordion-container">
                        <div v-for="pod in group.items" :key="pod.id" class="pod-card-item" :class="{'is-open': expandedId === pod.id}">
                            
                            <div class="pod-card-header" @click="toggleAccordion(pod.id)">
                                <div class="header-top-row">
                                    <div class="header-left-col">
                                        <div class="type-indicator"></div>
                                        <span class="pod-code">{{ pod.pod_code || 'Codice N/D' }}</span>
                                        
                                        <span class="badge-substation" title="Cabina Primaria">
                                            📍 {{ pod.primary_substation || 'Cabina N/D' }}
                                        </span>
                                        <span class="cer-potential-badge" v-if="getMarketPotential(pod)">
                                            🎯 {{ getMarketPotential(pod) }}
                                        </span>
                                    </div>
                                    
                                    <div class="header-right-col">
                                        <span class="badge badge-status" :class="pod.status">{{ pod.status || 'Incomplete' }}</span>
                                        <span class="chevron">{{ expandedId === pod.id ? '▲' : '▼' }}</span>
                                    </div>
                                </div>

                                <div class="header-bottom-row" v-if="getMarketNotes(pod)">
                                    <span class="market-notes">📝 <strong>Analisi AI:</strong> {{ getMarketNotes(pod) }}</span>
                                </div>
                            </div>

                            <div v-if="expandedId === pod.id" class="pod-card-body">
                                
                                <div class="profile-row">
                                    <span class="text-muted" style="font-size: 0.75rem;">Energy Profile</span>
                                    <span class="badge badge-role">
                                        <span v-if="getEffectiveRole(pod) === 'producer'">⚡ PRODUCER</span>
                                        <span v-else-if="getEffectiveRole(pod) === 'prosumer'">☀️ PROSUMER</span>
                                        <span v-else>🔌 CONSUMER</span>
                                    </span>
                                </div>

                                <div class="action-buttons-row">
                                    <button class="action-btn btn-dark" @click="openQrModal(pod)">
                                        📱 QR
                                    </button>
                                    <button class="action-btn btn-purple" @click="openAiModal(pod)">
                                        ✨ AI Analysis
                                    </button>
                                    <button class="action-btn btn-dark" @click="openAssetModal(pod)">
                                        🔌 Assets
                                    </button>
                                </div>

                                <div class="divider"></div>

                                <div class="user-info-section">
                                    <div class="address-line">{{ pod.city }}, {{ pod.address }}</div>
                                    <div class="user-line" v-if="pod.user">
                                        👤 <strong>{{ pod.user.name }} {{ pod.user.surname || '' }}</strong> 
                                        <span class="text-muted">(✉️ {{ pod.user.email }})</span>
                                    </div>
                                    <div class="user-line text-muted" v-else>Nessun utente associato</div>
                                </div>

                                <div class="stats-grid">
                                    <div class="stat-block">
                                        <label>POWER</label>
                                        <p>{{ pod.contract_power || pod.production_capacity || 0 }} kW</p>
                                    </div>
                                    <div class="stat-block">
                                        <label>CONSUMPTION</label>
                                        <p>{{ pod.annual_consumption_kwh || 0 }} kWh</p>
                                    </div>
                                    <div class="stat-block">
                                        <label>SUBSTATION</label>
                                        <p class="substation-text">{{ pod.primary_substation || 'N/D' }}</p>
                                    </div>
                                </div>

                                <div class="bill-section" v-if="pod.bill_file">
                                    <label>BILL</label>
                                    <div class="bill-status success">📄 Present</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>

    <PodAssetModal :show="showAssetModal" :pod="activeResource" @close="showAssetModal = false" />
    <PodAiModal :show="showAiModal" :aiData="activeAiData" @close="showAiModal = false" />
    
    <transition name="fade">
        <div v-if="showQrModal" class="modal-overlay" @click.self="showQrModal = false">
            <div class="admin-form-modal" style="max-width: 350px; text-align: center;">
                <div class="modal-header">
                    <h3>QR Code POD</h3>
                    <button class="btn-close" @click="showQrModal = false">✕</button>
                </div>
                <div class="modal-body" v-if="activeResource">
                    <p class="text-muted mb-3">Scansiona per info sul POD <strong>{{ activeResource.pod_code }}</strong></p>
                    <div style="background: white; padding: 15px; border-radius: 8px; display: inline-block;">
                        <img :src="getQrUrl(activeResource)" alt="QR Code" style="width: 200px; height: 200px; display: block;" />
                    </div>
                </div>
            </div>
        </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '@/services/axios';
import GuideHeader from '@/components/layout/GuideHeader.vue';
import PodAssetModal from '@/components/pods/PodAssetModal.vue';
import PodAiModal from '@/components/pods/PodAiModal.vue';

const isLightMode = ref(localStorage.getItem('theme') === 'light');
const loading = ref(true);
const orphanPods = ref([]);
const expandedId = ref(null);

const showAssetModal = ref(false);
const showAiModal = ref(false);
const showQrModal = ref(false);
const activeResource = ref(null);
const activeAiData = ref(null);

onMounted(() => {
    fetchOrphans();
});

const fetchOrphans = async () => {
    loading.value = true;
    try {
        const response = await axios.get('/api/pods/orphans'); 
        orphanPods.value = response.data.data || [];
    } catch (error) {
        console.error("Errore nel caricamento POD orfani:", error);
    } finally {
        loading.value = false;
    }
};

const totalOrphans = computed(() => orphanPods.value.length);
const totalPowerMw = computed(() => {
    const totalKw = orphanPods.value.reduce((sum, pod) => sum + parseFloat(pod.contract_power || pod.production_capacity || 0), 0);
    return (totalKw / 1000).toFixed(2);
});

// Helper per parsare in sicurezza il JSON dell'AI
const parseAi = (pod) => {
    if (!pod.ai_analysis) return {};
    try {
        return typeof pod.ai_analysis === 'string' ? JSON.parse(pod.ai_analysis) : pod.ai_analysis;
    } catch (e) {
        return {};
    }
};

// Funzione Intelligente per recuperare il VERO ruolo del POD
const getEffectiveRole = (pod) => {
    const ai = parseAi(pod);
    
    // Cerca nei possibili campi del JSON dell'AI
    const aiRole = ai.profilo_energetico || ai.energy_profile || ai.pod_role || '';
    
    if (aiRole) {
        const normalized = aiRole.toLowerCase();
        if (normalized.includes('prosumer')) return 'prosumer';
        if (normalized.includes('producer')) return 'producer';
        if (normalized.includes('consumer')) return 'consumer';
    }
    
    // Fallback sulla colonna standard del database se l'AI non ha dati
    return pod.pod_role ? pod.pod_role.toLowerCase() : 'consumer';
};

// Estrae il market_potential (o chiavi simili generate dall'AI)
const getMarketPotential = (pod) => {
    const ai = parseAi(pod);
    return ai.market_potential || ai.potenziale_cer || null;
};

// Estrae i market_notes
const getMarketNotes = (pod) => {
    const ai = parseAi(pod);
    return ai.market_notes || ai.note_mercato || null;
};

const groupedPods = computed(() => {
    const groups = {};
    orphanPods.value.forEach(pod => {
        const citta = pod.city ? pod.city.trim() : '';
        const via = pod.address ? pod.address.trim() : '';
        let displayAddress = citta && via ? `${citta}, ${via}` : (citta || via || 'Indirizzo Sconosciuto');
        
        let normKey = displayAddress.toLowerCase().replace(/[^\w\s]/gi, '').trim();
        if (!normKey) normKey = 'unknown';

        if (!groups[normKey]) {
            groups[normKey] = { address: displayAddress, items: [] };
        }
        groups[normKey].items.push(pod);
    });
    return Object.values(groups).sort((a, b) => a.address.localeCompare(b.address));
});

const toggleAccordion = (id) => {
    expandedId.value = expandedId.value === id ? null : id;
};

const openQrModal = (pod) => { activeResource.value = pod; showQrModal.value = true; };
const openAssetModal = (pod) => { activeResource.value = pod; showAssetModal.value = true; };
const openAiModal = (pod) => {
    activeAiData.value = parseAi(pod);
    showAiModal.value = true;
};

const getQrUrl = (pod) => {
    const baseUrl = window.location.origin;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl + '/querypods?code=' + pod.pod_code)}`;
};
</script>

<style scoped>
.app-container.admin-mode { background-color: var(--bg-app, #121212); min-height: 100vh; color: #fff; font-family: 'Inter', sans-serif; }
.main-content { padding: 1rem; max-width: 1000px; margin: 0 auto; }

.page-header-compact { margin-bottom: 1.5rem; }
.admin-badge { background: #8b5cf6; color: white; font-size: 0.65rem; font-weight: 900; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; letter-spacing: 1px; }
.header-left h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #fff; }
.header-left p { color: #a1a1aa; font-size: 0.85rem; margin-top: 4px; }

/* KPI */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.kpi-card { background: #1e1e24; border: 1px solid #2d2d35; padding: 20px; border-radius: 12px; }
.kpi-label { font-size: 0.75rem; color: #a1a1aa; text-transform: uppercase; font-weight: 700; }
.kpi-value { font-size: 2rem; font-weight: 800; color: #fff; margin-top: 5px; }
.kpi-card.highlight-purple { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.05); }
.kpi-card.highlight-purple .kpi-value { color: #8b5cf6; }

.mt-4 { margin-top: 1.5rem; }
.text-muted { color: #8b8b95; }

/* Raggruppamenti e Struttura Accordion */
.location-group { margin-bottom: 25px; }
.location-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid #2d2d35; padding-bottom: 8px; }
.location-title { font-size: 1rem; font-weight: 600; color: #e4e4e7; margin: 0; }
.location-badge { background: #2d2d35; color: #a1a1aa; font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; font-weight: 700; }

.accordion-container { display: flex; flex-direction: column; gap: 10px; }

/* POD CARD STYLES */
.pod-card-item { background: #18181b; border: 1px solid #2d2d35; border-radius: 8px; overflow: hidden; transition: 0.2s; }
.pod-card-item:hover { border-color: #3f3f46; }
.pod-card-item.is-open { border-color: #8b5cf6; }

/* HEADER A DUE RIGHE */
.pod-card-header { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; user-select: none; }
.header-top-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.header-left-col { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.type-indicator { width: 14px; height: 14px; background-color: #b45309; border-radius: 4px; flex-shrink: 0; } 
.pod-code { font-family: monospace; font-size: 1.1rem; font-weight: 700; color: #fff; }

.header-right-col { display: flex; align-items: center; gap: 15px; flex-shrink: 0; }

/* NUOVI BADGE NELL'HEADER */
.badge-substation { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa; font-size: 0.7rem; padding: 3px 8px; border-radius: 6px; font-weight: 700; display: inline-flex; align-items: center; }
.cer-potential-badge { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #10b981; font-size: 0.7rem; padding: 3px 10px; border-radius: 6px; font-weight: 700; }
.header-bottom-row { padding-left: 24px; }
.market-notes { font-size: 0.75rem; color: #94a3b8; font-style: normal; line-height: 1.4; display: block; }
.market-notes strong { color: #cbd5e1; }

.badge { font-size: 0.65rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; border: 1px solid transparent; }
.badge-status { color: #94a3b8; border-color: #334155; background: rgba(51, 65, 85, 0.2); }
.badge-status.active { color: #10b981; border-color: #065f46; background: rgba(16, 185, 129, 0.1); }
.badge-role { color: #fbbf24; border-color: #451a03; background: rgba(251, 191, 36, 0.1); font-size: 0.6rem; padding: 2px 6px; }

.chevron { color: #3b82f6; font-size: 0.9rem; font-weight: 900; }

/* Dettagli Espansi */
.pod-card-body { padding: 16px; border-top: 1px solid #2d2d35; background: #121214; }
.profile-row { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }

.action-buttons-row { display: flex; gap: 10px; margin-bottom: 15px; }
.action-btn { padding: 6px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; border: none; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
.action-btn.btn-dark { background: #000; color: #fff; border: 1px solid #2d2d35; }
.action-btn.btn-dark:hover { background: #27272a; }
.action-btn.btn-purple { background: #a855f7; color: #fff; }
.action-btn.btn-purple:hover { background: #9333ea; }

.divider { height: 1px; background: #2d2d35; margin: 15px 0; border-style: dashed; }

.user-info-section { margin-bottom: 15px; }
.address-line { color: #d4d4d8; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.user-line { font-size: 0.9rem; color: #fff; }

.stats-grid { display: flex; gap: 30px; margin-bottom: 15px; }
.stat-block label { display: block; font-size: 0.65rem; color: #a1a1aa; font-weight: 800; margin-bottom: 2px; }
.stat-block p { margin: 0; font-size: 1rem; font-weight: 700; color: #fff; }
.substation-text { color: #3b82f6 !important; }

.bill-section label { display: block; font-size: 0.65rem; color: #a1a1aa; font-weight: 800; margin-bottom: 2px; }
.bill-status { font-size: 0.85rem; font-weight: 700; }
.bill-status.success { color: #10b981; }

/* Modali generici */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.admin-form-modal { background: #18181b; border: 1px solid #2d2d35; width: 100%; border-radius: 12px; overflow: hidden; }
.modal-header { padding: 15px 20px; border-bottom: 1px solid #2d2d35; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.1rem; color: #fff; }
.btn-close { background: none; border: none; color: #a1a1aa; font-size: 1.2rem; cursor: pointer; }
.modal-body { padding: 20px; }

.loading-state, .empty-state { text-align: center; padding: 3rem; color: #a1a1aa; }
.spinner { width: 30px; height: 30px; border: 3px solid #2d2d35; border-top: 3px solid #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px auto; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.8; }
</style>
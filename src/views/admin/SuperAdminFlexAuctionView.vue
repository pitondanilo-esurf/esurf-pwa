<template>
  <div class="app-container admin-mode">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
      <div class="page-header-compact fade-in delay-1">
         <div class="header-left">
            <div class="admin-badge">SUPERADMIN</div>
            <h2>Gestione Aste di Flessibilità</h2>
            <p>Registrazione parametri TSO/DSO e Simulazione Scenari</p>
         </div>
         <button class="btn-main-action hover-scale" @click="openCreateModal">
            + Registra Nuova Asta
         </button>
      </div>

      <div class="kpi-grid fade-in delay-2">
        <div class="kpi-card">
          <span class="kpi-label">Capacità Aggregata</span>
          <div class="kpi-value">58.4 <span class="unit">MW</span></div>
        </div>
        <div class="kpi-card highlight-green">
          <span class="kpi-label">Impatto ESG (CO2)</span>
          <div class="kpi-value">1,410 <span class="unit">Ton</span></div>
        </div>
        <div class="kpi-card highlight-purple">
          <span class="kpi-label">Mercati Attivi</span>
          <div class="kpi-value">4 <span class="unit">TSO/DSO</span></div>
        </div>
      </div>

      <section class="registry-section fade-in delay-2">
        <div class="section-title">Registro Operativo e Scenari (Simulazione)</div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Mercato / Ente</th>
                <th>Asset / Ambito</th>
                <th>Capacità</th>
                <th>Fisso/Var</th>
                <th>Scenario Ore</th>
                <th>Stato</th>
                <th class="text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="asteStoriche.length === 0">
                <td colspan="7" class="text-center text-muted" style="padding: 30px;">
                  Nessuna asta presente nel database. Creane una!
                </td>
              </tr>

              <template v-for="asta in asteStoriche" :key="asta.id">
                <tr :class="{ 'row-expanded': expandedAuctionId === asta.id }">
                  <td>
                    <span class="m-type" :class="asta.market_type">{{ asta.market_type }}</span><br>
                    <small class="text-muted">{{ asta.provider || 'Terna' }}</small>
                  </td>
                  <td>
                    <div class="asset-stack">
                      <span class="asset-count">
                        {{ detectionResults[asta.id] ? detectionResults[asta.id].count : 0 }} POD
                      </span>
                      <small class="text-muted">{{ asta.scope || 'Nazionale' }}</small>
                    </div>
                  </td>
                  <td>{{ asta.capacity_mw }} MW</td>
                  <td class="font-mono text-xs">
                    €{{ formatNumber(asta.capacity_price_mw) }}<br>
                    <span class="text-muted">€{{ formatNumber(asta.activation_price_mwh) }}</span>
                  </td>
                  <td>
                    <span class="hours-badge">{{ asta.simulation_params?.sim_hours || 0 }}h</span>
                  </td>
                  <td><span class="status-badge" :class="asta.status || 'Attiva'">{{ asta.status || 'Attiva' }}</span></td>
                  <td class="text-center">
                    <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
                      <button class="btn-icon-calc" style="padding: 6px; font-size: 1rem;" @click="openEditModal(asta)" title="Modifica Asta">
                        ✏️
                      </button>
                      <button class="btn-icon-calc" @click="toggleSimulator(asta)">
                        {{ expandedAuctionId === asta.id ? '✕ Chiudi' : '🧮 Simula' }}
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="expandedAuctionId === asta.id" class="simulator-row">
                  <td colspan="7">
                    <div class="simulator-box">
                      
                      <div class="detection-panel">
                        <div class="detection-header">
                          <h4>Scansione Rete (POD Discovery)</h4>
                          <button class="btn-primary-outline" @click="detectEligiblePods(asta)" :disabled="isDetecting[asta.id]">
                            {{ isDetecting[asta.id] ? '⏳ Rilevamento in corso...' : '🔍 Avvia Scansione' }}
                          </button>
                        </div>

                        <div v-if="detectionResults[asta.id]" class="detection-kpi fade-in">
                          <div class="kpi-mini">
                            <label>Target Scope</label>
                            <strong>{{ detectionResults[asta.id].scope_target || 'Nazionale' }}</strong>
                          </div>
                          <div class="kpi-mini highlight-blue">
                            <label>POD Idonei Trovati</label>
                            <strong>{{ detectionResults[asta.id].count }}</strong>
                          </div>
                          <div class="kpi-mini highlight-green">
                            <label>Potenza Aggregabile</label>
                            <strong>{{ formatNumber(detectionResults[asta.id].total_kw) }} kW</strong>
                          </div>
                          <div class="kpi-mini highlight-purple">
                            <label>Copertura Bando</label>
                            <strong>{{ formatNumber(((detectionResults[asta.id].total_kw / 1000) / asta.capacity_mw) * 100) }}%</strong>
                          </div>
                        </div>
                      </div>

                      <div class="sim-header" style="margin-top: 24px;">
                        <span class="sparkle">✨</span> STRUMENTO DI TARATURA OFFERTA: <strong>{{ asta.market_id || 'Asta' }}</strong>
                      </div>
                      <div class="sim-content">
                        <div class="sim-inputs">
                          <div class="sim-input-group">
                            <label>Ore Attivazione Stimate (Anno)</label>
                            <input type="range" min="0" max="250" v-model="asta.simulation_params.sim_hours" />
                            <div class="range-val">{{ asta.simulation_params.sim_hours }} ore</div>
                          </div>
                          
                          <div class="sim-input-group">
                            <label>Fee Piattaforma (%)</label>
                            <div class="fee-input-wrapper">
                              <input type="number" step="0.5" min="0" max="100" v-model="asta.platform_fee_percentage" />
                            </div>
                          </div>

                          <button class="btn-save-sim" @click="saveSimulationScenario(asta)">
                            Salva Scenario e Fee
                          </button>
                        </div>

                        <div class="sim-results">
                          <div class="res-item">
                            <label>Ricavo Fisso (Disponibilità)</label>
                            <p>€ {{ formatNumber(asta.capacity_mw * asta.capacity_price_mw) }}</p>
                          </div>
                          <div class="res-item">
                            <label>Ricavo Var. (Energia)</label>
                            <p>€ {{ formatNumber(asta.capacity_mw * asta.activation_price_mwh * (asta.simulation_params.sim_hours || 0)) }}</p>
                          </div>
                          <div class="res-item highlight-blue">
                            <label>Totale Lordo (Incasso)</label>
                            <p>€ {{ formatNumber(calcTotal(asta)) }}</p>
                          </div>
                          <div class="res-item highlight-purple">
                            <label>Fee Piattaforma ({{ asta.platform_fee_percentage || 0 }}%)</label>
                            <p>- € {{ formatNumber(calcTotal(asta) * ((asta.platform_fee_percentage || 0) / 100)) }}</p>
                          </div>
                          <div class="res-item highlight-green">
                            <label>Netto (Stimato su capacità nominale)</label>
                            <p>€ {{ formatNumber(calcTotal(asta) * (1 - (asta.platform_fee_percentage || 0) / 100)) }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>

      <transition name="fade">
        <div v-if="showAuctionForm" class="modal-overlay" @click.self="showAuctionForm = false">
          <div class="admin-form-modal">
            <div class="modal-header">
              <h3>{{ isEditing ? 'Modifica Asta' : 'Configurazione Asta TSO/DSO' }}</h3>
              <button class="btn-close" @click="showAuctionForm = false">✕</button>
            </div>
            
            <div class="modal-body">
              <form @submit.prevent="submitAuction" class="admin-form">
                
                <div class="form-row">
                  <div class="form-group full-width">
                    <label>ID Asta / Riferimento TSO-DSO</label>
                    <input type="text" v-model="newAuction.market_id" placeholder="Es. DSO_MI_2026_01" required>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Tipo Mercato</label>
                    <select v-model="newAuction.market_type" required>
                      <option value="UVAM">Terna - UVAM</option>
                      <option value="MSD">Terna - MSD</option>
                      <option value="DSO">DSO - Local Flex</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label>Ente Banditore (TSO/DSO)</label>
                    <select v-model="newAuction.provider" required>
                      <option disabled value="">-- Seleziona Ente --</option>
                      <option v-if="newAuction.market_type !== 'DSO'" value="Terna">Terna (TSO)</option>
                      <template v-else>
                        <option value="e-distribuzione">e-distribuzione (Nazionale)</option>
                        <option value="Unareti">Unareti (Milano, Brescia)</option>
                        <option value="Areti">Areti (Roma)</option>
                        <option value="Inrete">Inrete (Emilia-Romagna, Marche)</option>
                        <option value="Ireti">Ireti (Torino, Genova, Parma...)</option>
                        <option value="Megareti">Megareti (Verona, Vicenza)</option>
                        <option value="Edyna">Edyna (Alto Adige)</option>
                        <option value="Deval">Deval (Valle d'Aosta)</option>
                        <option value="Set Distribuzione">Set Distribuzione (Trentino)</option>
                        <option value="RetiPiù">RetiPiù (Brianza)</option>
                        <option value="Altro">Altro (DSO Minore)</option>
                      </template>
                    </select>
                  </div>
                </div>

                <div class="form-group full-width" v-if="newAuction.market_type === 'DSO'">
                  <label>Ambito Locale (Codice Nodo/Cabina)</label>
                  <input type="text" v-model="newAuction.scope" placeholder="Es. AC001E01152">
                </div>

                <div class="form-divider highlight-blue">Parametri Economici & Fee</div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Premio Disponibilità (€/MW)</label>
                    <input type="number" step="0.01" v-model="newAuction.capacity_price_mw" required>
                  </div>
                  <div class="form-group">
                    <label>Strike Price Energia (€/MWh)</label>
                    <input type="number" step="0.01" v-model="newAuction.activation_price_mwh" required>
                  </div>
                  <div class="form-group">
                    <label>Fee Piattaforma (%)</label>
                    <input type="number" step="0.1" v-model="newAuction.platform_fee_percentage" required>
                  </div>
                </div>

                <div class="form-divider highlight-green">Parametri ESG & Scenario Base</div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Capacità (MW)</label>
                    <input type="number" step="0.1" v-model="newAuction.capacity_mw" required>
                  </div>
                  <div class="form-group">
                    <label>Baseline Grid (gCO2/kWh)</label>
                    <input type="number" v-model="newAuction.baseline_co2" required>
                  </div>
                  <div class="form-group">
                    <label>Ore stimate (Simulazione)</label>
                    <input type="number" v-model="newAuction.simulation_params.sim_hours" required>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-secondary" @click="showAuctionForm = false">Annulla</button>
                  <button type="submit" class="btn-primary">
                    {{ isEditing ? 'Aggiorna Asta' : 'Registra Asta' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from '@/services/axios';
import GuideHeader from '@/components/layout/GuideHeader.vue';

const isLightMode = ref(localStorage.getItem('theme') === 'light');
const showAuctionForm = ref(false);
const expandedAuctionId = ref(null);

const isDetecting = ref({});
const detectionResults = ref({});

// Stato per la modalità Modifica
const isEditing = ref(false);
const editingAuctionId = ref(null);

const newAuction = ref({
  market_id: '', market_type: 'DSO', provider: '', scope: '', 
  capacity_price_mw: null, activation_price_mwh: null, platform_fee_percentage: 20,
  capacity_mw: null, baseline_co2: 240, saved_co2_tons: 0,
  simulation_params: { sim_hours: 50 }
});

// Apre la modale per Creare una NUOVA asta
const openCreateModal = () => {
  isEditing.value = false;
  editingAuctionId.value = null;
  newAuction.value = {
    market_id: '', market_type: 'DSO', provider: '', scope: '', 
    capacity_price_mw: null, activation_price_mwh: null, platform_fee_percentage: 20,
    capacity_mw: null, baseline_co2: 240, saved_co2_tons: 0,
    simulation_params: { sim_hours: 50 }
  };
  showAuctionForm.value = true;
};

// Apre la modale per MODIFICARE un'asta esistente
const openEditModal = (asta) => {
  isEditing.value = true;
  editingAuctionId.value = asta.id;
  // Copia profonda dei dati per non alterare la tabella in tempo reale se si annulla
  newAuction.value = {
    market_id: asta.market_id, 
    market_type: asta.market_type, 
    provider: asta.provider, 
    scope: asta.scope, 
    capacity_price_mw: asta.capacity_price_mw, 
    activation_price_mwh: asta.activation_price_mwh, 
    platform_fee_percentage: asta.platform_fee_percentage,
    capacity_mw: asta.capacity_mw, 
    baseline_co2: asta.baseline_co2, 
    saved_co2_tons: asta.saved_co2_tons,
    simulation_params: asta.simulation_params 
      ? JSON.parse(JSON.stringify(asta.simulation_params)) 
      : { sim_hours: 50 }
  };
  showAuctionForm.value = true;
};

watch(() => newAuction.value.market_type, (newVal) => {
  if (newVal === 'UVAM' || newVal === 'MSD') {
    newAuction.value.provider = 'Terna';
  } else if (!isEditing.value) {
    // Resetta solo se stiamo creando una nuova asta, non durante l'edit
    newAuction.value.provider = ''; 
  }
});

const asteStoriche = ref([]);

const fetchAuctions = async () => {
  try {
    const res = await axios.get('/api/auctions');
    asteStoriche.value = res.data.data || [];
  } catch (e) {
    console.error("Errore nel caricamento aste:", e);
  }
};

const toggleSimulator = (asta) => {
  if (!asta.simulation_params) asta.simulation_params = { sim_hours: 0 };
  expandedAuctionId.value = expandedAuctionId.value === asta.id ? null : asta.id;
};

const detectEligiblePods = async (asta) => {
  isDetecting.value[asta.id] = true;
  try {
    const res = await axios.get(`/api/auctions/${asta.id}/detect-pods`);
    detectionResults.value[asta.id] = res.data;
  } catch (e) {
    console.error("Errore nel rilevamento POD:", e);
    alert('Errore durante la scansione dei POD.');
  } finally {
    isDetecting.value[asta.id] = false;
  }
};

const saveSimulationScenario = async (asta) => {
  try {
    await axios.patch(`/api/auctions/${asta.id}/simulation`, {
      simulation_params: asta.simulation_params,
      platform_fee_percentage: asta.platform_fee_percentage
    });
    alert("Parametri di simulazione storicizzati correttamente nel DB!");
  } catch (e) {
    console.error("Errore salvataggio simulazione:", e);
    alert("Errore durante il salvataggio nel database.");
  }
};

const calcTotal = (asta) => {
  const hours = asta.simulation_params?.sim_hours || 0;
  const fisso = asta.capacity_mw * asta.capacity_price_mw;
  const variabile = asta.capacity_mw * asta.activation_price_mwh * hours;
  return fisso + variabile;
};

const formatNumber = (num) => new Intl.NumberFormat('it-IT').format(num || 0);

// Un'unica funzione che gestisce sia la creazione (POST) che la modifica (PUT)
const submitAuction = async () => {
  try {
    if (isEditing.value) {
      await axios.put(`/api/auctions/${editingAuctionId.value}`, newAuction.value);
      alert("Asta aggiornata con successo!");
    } else {
      await axios.post('/api/auctions', newAuction.value);
      alert("Asta creata con successo!");
    }
    
    showAuctionForm.value = false;
    await fetchAuctions(); // Ricarica la tabella
    
  } catch (e) {
    console.error("Errore salvataggio asta:", e);
    let errorMsg = "Impossibile salvare l'asta. Controlla i campi o la connessione.";
    if (e.response && e.response.data && e.response.data.errors) {
        const errors = Object.values(e.response.data.errors).flat();
        errorMsg = "ATTENZIONE - Dati non validi:\n\n" + errors.join('\n');
    } else if (e.response && e.response.data && e.response.data.message) {
        errorMsg = e.response.data.message;
    }
    alert(errorMsg);
  }
};

onMounted(() => {
  fetchAuctions();
});
</script>

<style scoped>
.app-container.admin-mode { background-color: var(--bg-app); min-height: 100vh; }
.main-content { padding: 1rem; max-width: 1200px; margin: 0 auto; }

.page-header-compact { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
.admin-badge { background: #8b5cf6; color: white; font-size: 0.65rem; font-weight: 900; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; letter-spacing: 1px; }

.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 2rem; }
.kpi-card { background: var(--bg-card); border: 1px solid var(--border-color); padding: 20px; border-radius: 12px; }
.kpi-value { font-size: 2rem; font-weight: 800; color: var(--text-main); }

/* TABELLA E RIGHE */
.admin-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; background: var(--bg-card); border-radius: 12px; overflow: hidden; }
.admin-table th { text-align: left; padding: 12px; border-bottom: 2px solid var(--border-color); font-weight: 800; text-transform: uppercase; font-size: 0.7rem; color: var(--text-muted); }
.admin-table td { padding: 12px; border-bottom: 1px solid var(--border-color); }
.row-expanded td { background: rgba(139, 92, 246, 0.05); border-bottom: none; }

.m-type { font-weight: 800; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; }
.m-type.UVAM { background: #8b5cf6; color: white; }
.m-type.MSD { background: #3b82f6; color: white; }
.m-type.DSO { background: #f59e0b; color: white; }

.hours-badge { background: #3b82f6; color: white; padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 0.75rem; }
.btn-icon-calc { background: var(--bg-app); border: 1px solid var(--border-color); color: var(--text-main); padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: bold; font-size: 0.75rem; }
.btn-icon-calc:hover { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

/* BOX SIMULATORE E RILEVAMENTO */
.simulator-row td { padding: 0; background: rgba(139, 92, 246, 0.05); }
.simulator-box { padding: 20px; border-bottom: 1px solid var(--border-color); border-top: 1px dashed var(--border-color); animation: slideDown 0.3s ease-out; }

/* CSS per Rilevamento POD */
.detection-panel { background: var(--bg-card); border: 1px dashed #8b5cf6; padding: 16px; border-radius: 12px; margin-bottom: 20px; }
.detection-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.detection-header h4 { margin: 0; font-size: 0.85rem; color: var(--text-main); font-weight: 800; text-transform: uppercase; }
.btn-primary-outline { background: transparent; border: 1px solid #8b5cf6; color: #8b5cf6; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-primary-outline:hover:not(:disabled) { background: #8b5cf6; color: white; }
.btn-primary-outline:disabled { opacity: 0.5; cursor: not-allowed; }
.detection-kpi { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; border-top: 1px solid var(--border-color); padding-top: 12px; }
.kpi-mini { display: flex; flex-direction: column; }
.kpi-mini label { font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800; }
.kpi-mini strong { font-size: 1.2rem; color: var(--text-main); font-weight: 800; }
.kpi-mini.highlight-blue strong { color: #3b82f6; }
.kpi-mini.highlight-green strong { color: #10b981; }
.kpi-mini.highlight-purple strong { color: #8b5cf6; }

.sim-header { font-size: 0.75rem; font-weight: 800; color: #8b5cf6; margin-bottom: 16px; text-transform: uppercase; }
.sim-content { display: grid; grid-template-columns: 250px 1fr; gap: 40px; }

.sim-inputs { display: flex; flex-direction: column; gap: 15px; }
.sim-input-group label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--text-muted); margin-bottom: 8px; }
.sim-input-group input[type="range"] { width: 100%; accent-color: #8b5cf6; }
.fee-input-wrapper input { width: 100%; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); padding: 8px; border-radius: 8px; font-weight: bold; }
.range-val { font-weight: 800; color: #8b5cf6; font-size: 1.1rem; margin-top: 4px; }
.btn-save-sim { background: #8b5cf6; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 800; font-size: 0.8rem; cursor: pointer; transition: 0.2s; margin-top: auto; }
.btn-save-sim:hover { opacity: 0.9; }

.sim-results { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.res-item { padding: 12px; border-radius: 10px; background: var(--bg-app); border: 1px solid var(--border-color); }
.res-item label { font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800; display: block; margin-bottom: 6px; }
.res-item p { font-size: 1.1rem; font-weight: 800; margin: 0; color: var(--text-main); }
.highlight-blue { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
.highlight-purple { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.05); }
.highlight-green { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }

@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

/* FORM MODALE REGISTRAZIONE */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.admin-form-modal { background: var(--bg-app); width: 100%; max-width: 650px; border-radius: 16px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); }
.modal-body { overflow-y: auto; padding: 20px; }
.form-row { display: flex; gap: 16px; margin-bottom: 12px; }
.form-group { flex: 1; display: flex; flex-direction: column; }
.form-group label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); margin-bottom: 4px; }
.form-group input, .form-group select { background: var(--bg-card); border: 1px solid var(--border-color); padding: 8px; border-radius: 6px; color: var(--text-main); }

.form-divider { margin-top: 15px; font-size: 0.75rem; font-weight: 800; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 10px; }
.form-divider.highlight-blue { color: #3b82f6; }
.form-divider.highlight-purple { color: #8b5cf6; }
.form-divider.highlight-green { color: #10b981; }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color); }
.btn-primary { background: var(--accent-blue); border: none; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-secondary { background: transparent; border: 1px solid var(--border-color); color: var(--text-main); padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }

@media (max-width: 768px) {
  .sim-content { grid-template-columns: 1fr; }
}
</style>
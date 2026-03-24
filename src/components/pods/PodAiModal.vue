<template>
  <transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
          <div class="glass-modal ai-modal">
              <div class="modal-header ai-header">
                  <div class="ai-title-box">
                      <h3>{{ $t('pods.aiModal.title') || 'Analisi Bolletta AI' }}</h3>
                      <span class="ai-subtitle">Gemini Analysis &bull; {{ aiData?.pod_id || 'POD NON RILEVATO' }}</span>
                  </div>
                  <button @click="$emit('close')" class="btn-close-modal">✕</button>
              </div>
              
              <div class="modal-body ai-body">
                  <div v-if="aiData" class="ai-content">
                      
                      <div class="ai-kpi-grid">
                          <div class="kpi-card" :class="getPotentialClass(aiData.market_potential)">
                              <span class="kpi-label">MARKET</span>
                              <span class="kpi-value">{{ aiData.market_potential || 'N/D' }}</span>
                          </div>
                          <div class="kpi-card" :class="getPotentialClass(aiData.CER_potential)">
                              <span class="kpi-label">CER</span>
                              <span class="kpi-value">{{ aiData.CER_potential || 'N/D' }}</span>
                          </div>
                          <div class="kpi-card" :class="getPotentialClass(aiData['D&R_potential'])">
                              <span class="kpi-label">UVAM (D&R)</span>
                              <span class="kpi-value">{{ aiData['D&R_potential'] || 'N/D' }}</span>
                          </div>
                          <div class="kpi-card confidence">
                              <span class="kpi-label">{{ $t('pods.aiModal.reliability') || 'Affidabilità' }}</span>
                              <span class="kpi-value">{{ aiData.confidence ? (aiData.confidence * 100).toFixed(0) : 0 }}%</span>
                          </div>
                      </div>

                      <div v-if="aiData.market_notes" class="ai-notes-box mb-3">
                          <div class="notes-icon">💡</div><p>{{ aiData.market_notes }}</p>
                      </div>

                      <div class="ai-section-box">
                          <div class="sec-head"><h4>👤 {{ $t('pods.aiModal.registry') || 'Anagrafica & Fornitura' }}</h4></div>
                          <div class="ai-grid-compact">
                              <div class="ai-item">
                                  <label>{{ $t('pods.aiModal.type') || 'Tipologia' }}</label>
                                  <div class="ai-value">
                                      {{ aiData.user_type === 'COMPANY' ? '🏢 Azienda' : '🏠 Privato' }}
                                  </div>
                              </div>
                              <div class="ai-item">
                                  <label>Uso</label>
                                  <div class="ai-value text-cap">{{ aiData.exact_usage_type || 'N/D' }}</div>
                              </div>
                              <div class="ai-item full-width" v-if="aiData.indirizzo">
                                  <label>{{ $t('pods.aiModal.supplyAddress') || 'Indirizzo di Fornitura' }}</label>
                                  <div class="ai-value">
                                      {{ aiData.indirizzo.Via }} {{ aiData.indirizzo.NumeroCivico }}, 
                                      {{ aiData.indirizzo.Cap }} {{ aiData.indirizzo.Città }}
                                  </div>
                              </div>
                              <div class="ai-item" v-if="aiData.PartitaIva">
                                  <label>P.IVA</label>
                                  <div class="ai-value">{{ aiData.PartitaIva }}</div>
                              </div>
                              <div class="ai-item" v-if="aiData.DSO">
                                  <label>Distributore Locale</label>
                                  <div class="ai-value">{{ aiData.DSO }}</div>
                              </div>
                              <div class="ai-item" v-if="aiData.utility">
                                  <label>Fornitore Attuale</label>
                                  <div class="ai-value">{{ aiData.utility }}</div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-section-box">
                          <div class="sec-head"><h4>📜 Contratto & Affidabilità</h4></div>
                          <div class="ai-grid-compact">
                              <div class="ai-item full-width">
                                  <label>{{ $t('pods.aiModal.activeOffer') || 'Offerta Attiva' }}</label>
                                  <div class="ai-value text-cap">{{ aiData.contract_type || 'N/D' }}</div>
                              </div>
                              <div class="ai-item">
                                  <label>Prezzo</label>
                                  <div class="badge-pill" :class="aiData.price_type === 'FIXED' ? 'bg-blue' : (aiData.price_type === 'VARIABLE' ? 'bg-orange' : 'bg-gray')">
                                      {{ aiData.price_type === 'FIXED' ? '🔒 Fisso' : (aiData.price_type === 'VARIABLE' ? '📈 Variabile' : 'Sconosciuto') }}
                                  </div>
                              </div>
                              <div class="ai-item">
                                  <label>Scadenza</label>
                                  <div class="ai-value">{{ aiData.end_date || 'N/D' }}</div>
                              </div>
                              <div class="ai-item">
                                  <label>Pagamenti</label>
                                  <div class="badge-pill" :class="aiData.payment_status === 'REGULAR' ? 'bg-green' : (aiData.payment_status === 'ARREARS' ? 'bg-red' : 'bg-gray')">
                                      {{ aiData.payment_status === 'REGULAR' ? '✔ Regolari' : (aiData.payment_status === 'ARREARS' ? '❌ Insoluti' : 'N/D') }}
                                  </div>
                              </div>
                              <div class="ai-item">
                                  <label>Metodo / ESG</label>
                                  <div style="display: flex; gap: 5px;">
                                      <span class="badge-pill bg-gray">{{ aiData.payment_method || 'N/D' }}</span>
                                      <span v-if="aiData.is_100_green" class="badge-pill bg-green" title="Energia 100% Green">🌱 Green</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-grid-cols-3">
                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('pods.aiModal.techData') || 'Dati Tecnici' }}</div>
                              <div class="ai-list-rows">
                                  <div class="row-item">
                                      <span>Potenza Imp.</span>
                                      <strong>{{ aiData.committed_power_kw }} kW</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>Tensione</span>
                                      <strong>{{ aiData.voltage_level || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>Contatore</span>
                                      <strong style="font-size: 0.75rem;">{{ aiData.meter_type || '-' }}</strong>
                                  </div>
                              </div>
                              <div v-if="aiData.reactive_penalties" class="alert-box mt-2">
                                  ⚠️ Penali Reattiva
                              </div>
                          </div>

                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">Ripartizione Spesa</div>
                              <div class="ai-list-rows">
                                  <div class="row-item">
                                      <span>Media(Tot)</span>
                                      <strong class="highlight-text">{{ aiData.average_unit_cost ? Number(aiData.average_unit_cost).toFixed(3) : '-' }} €</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.spesa_energia">
                                      <span>Energia</span>
                                      <strong>{{ aiData.cost_breakdown.spesa_energia }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.spesa_rete">
                                      <span>Rete</span>
                                      <strong>{{ aiData.cost_breakdown.spesa_rete }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.imposte_iva">
                                      <span>Imp/IVA</span>
                                      <strong>{{ aiData.cost_breakdown.imposte_iva }}</strong>
                                  </div>
                              </div>
                          </div>
                          
                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">Costi per Fascia</div>
                              <div class="ai-list-rows" v-if="aiData.costo_kwh">
                                  <div class="row-item">
                                      <span class="c-f1">F1</span>
                                      <strong>{{ formatCost(aiData.costo_kwh.F1 || aiData.costo_kwh.f1) || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span class="c-f2">F2</span>
                                      <strong>{{ formatCost(aiData.costo_kwh.F2 || aiData.costo_kwh.f2) || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span class="c-f3">F3</span>
                                      <strong>{{ formatCost(aiData.costo_kwh.F3 || aiData.costo_kwh.f3) || '-' }}</strong>
                                  </div>
                              </div>
                              <div v-else class="ai-list-rows"><div class="row-item"><span>N/D</span></div></div>
                          </div>
                      </div>

                      <div class="ai-section-box">
                          <div class="sec-head">
                              <h4>📊 {{ $t('pods.aiModal.consumptionAnalysis') || 'Analisi Consumi' }}</h4>
                              <span class="total-ann">{{ aiData.consumption_bands?.total_annual }} kWh/anno</span>
                          </div>
                          
                          <div class="bands-display">
                              <div class="band-item f1">
                                  <span class="b-label">F1</span>
                                  <span class="b-val">{{ aiData.consumption_bands?.f1 || aiData.consumption_bands?.F1 || 0 }}</span>
                              </div>
                              <div class="band-item f2">
                                  <span class="b-label">F2</span>
                                  <span class="b-val">{{ aiData.consumption_bands?.f2 || aiData.consumption_bands?.F2 || 0 }}</span>
                              </div>
                              <div class="band-item f3">
                                  <span class="b-label">F3</span>
                                  <span class="b-val">{{ aiData.consumption_bands?.f3 || aiData.consumption_bands?.F3 || 0 }}</span>
                              </div>
                          </div>

                          <div class="bands-legend mt-2 mb-3">
                              <div class="legend-item">
                                  <span class="dot f1-dot"></span>
                                  <span>
                                      <strong>F1:</strong> Lun-Ven 8-19 
                                      <span v-if="aiData.costo_kwh" class="c-f1" style="margin-left: 4px;">
                                          ({{ formatCost(aiData.costo_kwh.F1 || aiData.costo_kwh.f1) }}/kWh)
                                      </span>
                                  </span>
                              </div>
                              <div class="legend-item">
                                  <span class="dot f2-dot"></span>
                                  <span>
                                      <strong>F2:</strong> Lun-Ven 7-8 / 19-23, Sab 7-23 
                                      <span v-if="aiData.costo_kwh" class="c-f2" style="margin-left: 4px;">
                                          ({{ formatCost(aiData.costo_kwh.F2 || aiData.costo_kwh.f2) }}/kWh)
                                      </span>
                                  </span>
                              </div>
                              <div class="legend-item">
                                  <span class="dot f3-dot"></span>
                                  <span>
                                      <strong>F3:</strong> Notte (23-7), Dom e Festivi 
                                      <span v-if="aiData.costo_kwh" class="c-f3" style="margin-left: 4px;">
                                          ({{ formatCost(aiData.costo_kwh.F3 || aiData.costo_kwh.f3) }}/kWh)
                                      </span>
                                  </span>
                              </div>
                          </div>

                          <div v-if="aiData.quarter" class="quarters-row mt-2 mb-3">
                              <div class="q-item" v-for="(val, key) in aiData.quarter" :key="key">
                                  <span class="q-lbl">{{ key }}</span><span class="q-val">{{ val }}</span>
                              </div>
                          </div>

                          <div v-if="aiData.last_year" class="mt-3">
                              <div class="sec-head-tiny" style="border-top: 1px dashed var(--border-color); padding-top: 12px; margin-bottom: 8px;">
                                  📅 Storico Totale Mensile (kWh)
                              </div>
                              <div class="month-grid">
                                  <div class="m-item" v-for="month in sortedMonths" :key="'tot-'+month">
                                      <span class="m-lbl">{{ month.substring(0,3) }}</span>
                                      <span class="m-val">{{ aiData.last_year[month] || '-' }}</span>
                                  </div>
                              </div>
                          </div>

                          <div v-if="aiData.last_year_fasce && Object.keys(aiData.last_year_fasce).length > 0" class="mt-3">
                              <div class="sec-head-tiny" style="border-top: 1px dashed var(--border-color); padding-top: 12px; margin-bottom: 8px;">
                                  📊 Dettaglio Mensile per Fasce (kWh)
                              </div>
                              <div class="bands-table-container">
                                  <table class="bands-table">
                                      <thead>
                                          <tr>
                                              <th>Mese</th>
                                              <th class="c-f1">F1</th>
                                              <th class="c-f2">F2</th>
                                              <th class="c-f3">F3</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          <tr v-for="month in sortedBandsMonths" :key="'band-'+month">
                                              <td class="text-cap"><strong>{{ month.substring(0,3) }}</strong></td>
                                              <td>{{ aiData.last_year_fasce[month].F1 ?? aiData.last_year_fasce[month].f1 ?? 0 }}</td>
                                              <td>{{ aiData.last_year_fasce[month].F2 ?? aiData.last_year_fasce[month].f2 ?? 0 }}</td>
                                              <td>{{ aiData.last_year_fasce[month].F3 ?? aiData.last_year_fasce[month].f3 ?? 0 }}</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                          </div>

                          <div v-if="aiData.max_power_peaks && Object.keys(aiData.max_power_peaks).length > 0" class="mt-3">
                              <div class="sec-head-tiny" style="border-top: 1px dashed var(--border-color); padding-top: 12px; margin-bottom: 8px;">
                                  ⚡ Picchi di Potenza Mensili (kW)
                              </div>
                              <div class="month-grid">
                                  <div class="m-item" v-for="month in sortedPeakMonths" :key="'peak-'+month">
                                      <span class="m-lbl">{{ month.substring(0,3) }}</span>
                                      <span class="m-val highlight-text" :class="{'text-danger': aiData.max_power_peaks[month] > aiData.committed_power_kw}">{{ aiData.max_power_peaks[month] }}</span>
                                  </div>
                              </div>
                              <div v-if="hasExceededPower" style="font-size: 0.7rem; color: #ef4444; margin-top: 4px; text-align: right;">
                                  *Superamenti della potenza impegnata rilevati.
                              </div>
                          </div>

                      </div>

                  </div>
              </div>
          </div>
      </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  aiData: Object
});

defineEmits(['close']);

// 1. Calcola il colore dei badge (HIGH/MEDIUM/LOW)
const getPotentialClass = (val) => {
  if (!val) return 'low';
  const v = val.toLowerCase();
  return v === 'high' ? 'high' : (v === 'medium' ? 'medium' : 'low');
};

// 2. Formatta i costi dell'energia
const formatCost = (val) => {
    if (val === undefined || val === null || val === '') return '';
    return Number(val).toFixed(4) + ' €';
};

// 3. Verifica superamenti potenza
const hasExceededPower = computed(() => {
    if(!props.aiData || !props.aiData.max_power_peaks || !props.aiData.committed_power_kw) return false;
    return Object.values(props.aiData.max_power_peaks).some(val => val > props.aiData.committed_power_kw);
});

// --- LOGICA DI ORDINAMENTO CRONOLOGICO DEI MESI POTENZIATA ---
const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

const getMonthIndex = (m) => {
    if (!m) return 99;
    // Converte in minuscolo e prende le prime 3 lettere per coprire sia "gen" che "gennaio"
    const normalized = String(m).trim().toLowerCase().substring(0, 3);
    const idx = monthNames.findIndex(name => name.startsWith(normalized));
    return idx === -1 ? 99 : idx; 
};

// Ordinamento per la griglia totale
const sortedMonths = computed(() => {
    if(!props.aiData?.last_year) return [];
    return Object.keys(props.aiData.last_year).sort((a, b) => getMonthIndex(a) - getMonthIndex(b));
});

// Ordinamento per la tabella fasce
const sortedBandsMonths = computed(() => {
    if(!props.aiData?.last_year_fasce) return [];
    return Object.keys(props.aiData.last_year_fasce).sort((a, b) => getMonthIndex(a) - getMonthIndex(b));
});

// Ordinamento per i picchi
const sortedPeakMonths = computed(() => {
    if(!props.aiData?.max_power_peaks) return [];
    return Object.keys(props.aiData.max_power_peaks).sort((a, b) => getMonthIndex(a) - getMonthIndex(b));
});
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 650px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }

/* AI MODAL STYLES */
.ai-header { background: var(--bg-app); border-bottom: 1px solid var(--border-color); padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; color: var(--text-main); }
.ai-header h3 { margin: 0; }
.ai-subtitle { font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: block; margin-top: 2px; }
.ai-body { padding: 1.5rem; background: var(--bg-card); display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; color: var(--text-main); }
.mb-3 { margin-bottom: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }

/* GRIGLIE E BOX */
.ai-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 5px; }
.kpi-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 4px; border-radius: 8px; text-align: center; border: 1px solid transparent; }
.kpi-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; opacity: 0.8; }
.kpi-value { font-size: 0.95rem; font-weight: 700; }

.kpi-card.high { background: rgba(22, 163, 74, 0.1); color: #15803d; border-color: rgba(22, 163, 74, 0.2); }
.kpi-card.medium { background: rgba(234, 179, 8, 0.1); color: #a16207; border-color: rgba(234, 179, 8, 0.2); }
.kpi-card.low { background: var(--bg-app); color: var(--text-muted); border-color: var(--border-color); }
.kpi-card.confidence { background: rgba(59, 130, 246, 0.1); color: #1d4ed8; border-color: rgba(59, 130, 246, 0.2); }

.ai-section-box { background: var(--bg-app); border-radius: 10px; padding: 12px; border: 1px solid var(--border-color); }
.ai-section-box.no-bg { background: transparent; border: 1px solid var(--border-color); padding: 10px; }
.sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; }
.sec-head h4 { margin: 0; font-size: 0.85rem; color: var(--text-main); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
.sec-head-tiny { font-size: 0.7rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }

.ai-grid-compact { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; }
.ai-item label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 2px; }
.ai-value { font-size: 0.9rem; font-weight: 600; color: var(--text-main); line-height: 1.3; }
.ai-item.full-width { grid-column: span 2; }
.text-cap { text-transform: capitalize; }
.text-danger { color: #ef4444 !important; }

/* BADGES */
.badge-pill { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; color: white; }
.bg-blue { background-color: #3b82f6; }
.bg-orange { background-color: #f59e0b; }
.bg-green { background-color: #10b981; }
.bg-red { background-color: #ef4444; }
.bg-gray { background-color: var(--border-color); color: var(--text-main); }

/* LISTE E CELLE */
.ai-grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ai-list-rows .row-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 6px 0; border-bottom: 1px solid var(--bg-app); }
.ai-list-rows .row-item:last-child { border-bottom: none; }
.ai-list-rows span { color: var(--text-muted); }
.ai-list-rows strong { color: var(--text-main); text-align: right; }
.highlight-text { color: var(--accent-blue) !important; font-size: 0.95rem; }

.alert-box { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 6px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-align: center; border: 1px solid rgba(239, 68, 68, 0.2); }

/* CONSUMI */
.total-ann { font-size: 0.8rem; font-weight: 700; color: var(--accent-cyan); background: rgba(59, 130, 246, 0.1); padding: 3px 10px; border-radius: 6px; }
.bands-display { display: flex; gap: 8px; margin-bottom: 12px; }
.band-item { flex: 1; text-align: center; background: var(--bg-card); padding: 8px 4px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; }
.b-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 800; }
.b-val { font-size: 1rem; font-weight: 700; color: var(--text-main); margin: 2px 0; }

/* LEGENDA FASCE */
.bands-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; background: var(--bg-card); padding: 8px 12px; border-radius: 6px; border: 1px dashed var(--border-color); }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.9rem; color: var(--text-muted); }
.legend-item strong { color: var(--text-main); }
.legend-item .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.f1-dot { background-color: #3b82f6; } 
.f2-dot { background-color: #10b981; } 
.f3-dot { background-color: #f59e0b; } 

.c-f1 { color: #3b82f6; font-weight: 700; }
.c-f2 { color: #10b981; font-weight: 700; }
.c-f3 { color: #f59e0b; font-weight: 700; }

.quarters-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.q-item { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 6px; text-align: center; }
.q-lbl { display: block; font-size: 0.65rem; color: var(--text-muted); font-weight: 700; }
.q-val { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }

/* GRIGLIE MENSILI ORDINATE */
.month-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.m-item { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 6px 4px; text-align: center; display: flex; flex-direction: column; }
.m-lbl { font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800; }
.m-val { font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin: 2px 0; }

/* NUOVA TABELLA FASCE MENSILI */
.bands-table-container { width: 100%; overflow-x: auto; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-card); }
.bands-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: center; }
.bands-table th { padding: 8px; background: var(--bg-app); color: var(--text-muted); font-weight: 800; text-transform: uppercase; font-size: 0.7rem; border-bottom: 1px solid var(--border-color); }
.bands-table td { padding: 8px; color: var(--text-main); border-bottom: 1px solid var(--bg-app); }
.bands-table tr:last-child td { border-bottom: none; }
.bands-table tr:hover td { background-color: rgba(59, 130, 246, 0.05); }

.ai-notes-box { background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.2); padding: 12px; border-radius: 8px; display: flex; gap: 10px; align-items: flex-start; }
.notes-icon { font-size: 1.2rem; }
.ai-notes-box p { margin: 0; font-size: 0.85rem; color: var(--text-main); line-height: 1.4; }

@media (max-width: 600px) {
    .ai-grid-cols-3 { grid-template-columns: 1fr; }
    .ai-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .month-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
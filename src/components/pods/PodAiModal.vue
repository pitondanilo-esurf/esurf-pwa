<template>
  <transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
          <div class="glass-modal ai-modal">
              <div class="modal-header ai-header">
                  <div class="ai-title-box">
                      <h3>{{ $t('pods.aiModal.title') }}</h3>
                      <span class="ai-subtitle">Gemini Analysis &bull; {{ aiData?.pod_id || $t('pods.aiModal.podNotFound') }}</span>
                  </div>
                  <button @click="$emit('close')" class="btn-close-modal">✕</button>
              </div>
              
              <div class="modal-body ai-body">
                  <div v-if="aiData" class="ai-content">
                      
                      <div class="ai-kpi-grid">
                          <div class="kpi-card" :class="getPotentialClass(aiData.market_potential)">
                              <span class="kpi-label">MARKET</span>
                              <span class="kpi-value">{{ aiData.market_potential || $t('pods.aiModal.nd') }}</span>
                          </div>
                          <div class="kpi-card" :class="getPotentialClass(aiData.CER_potential)">
                              <span class="kpi-label">CER</span>
                              <span class="kpi-value">{{ aiData.CER_potential || $t('pods.aiModal.nd') }}</span>
                          </div>
                          <div class="kpi-card" :class="getPotentialClass(aiData['D&R_potential'])">
                              <span class="kpi-label">UVAM (D&R)</span>
                              <span class="kpi-value">{{ aiData['D&R_potential'] || $t('pods.aiModal.nd') }}</span>
                          </div>
                          <div class="kpi-card confidence">
                              <span class="kpi-label">{{ $t('pods.aiModal.reliability') }}</span>
                              <span class="kpi-value">{{ aiData.confidence ? (aiData.confidence * 100).toFixed(0) : 0 }}%</span>
                          </div>
                      </div>

                      <div v-if="aiData.market_notes" class="ai-notes-box mb-3">
                          <div class="notes-icon">💡</div><p>{{ aiData.market_notes }}</p>
                      </div>

                      <div class="ai-section-box">
                          <div class="sec-head"><h4>👤 {{ $t('pods.aiModal.registry') }}</h4></div>
                          <div class="ai-grid-compact">
                              
                              <div class="ai-item full-width" v-if="aiData.nominativo">
                                  <label>{{ $t('pods.aiModal.holderName') }}</label>
                                  <div class="ai-value">{{ aiData.nominativo }}</div>
                              </div>
                              <div class="ai-item" v-if="aiData['e-mail']">
                                  <label>{{ $t('pods.aiModal.email') }}</label>
                                  <div class="ai-value" style="word-break: break-all;">{{ aiData['e-mail'] }}</div>
                              </div>

                              <div class="ai-item">
                                  <label>{{ $t('pods.aiModal.type') }}</label>
                                  <div class="ai-value">
                                      {{ aiData.user_type === 'COMPANY' ? $t('pods.aiModal.company') : $t('pods.aiModal.private') }}
                                  </div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('pods.aiModal.usage') }}</label>
                                  <div class="ai-value text-cap">{{ aiData.exact_usage_type || $t('pods.aiModal.nd') }}</div>
                              </div>
                              
                              <div class="ai-item" v-if="aiData.pod_type">
                                  <label>{{ $t('pods.aiModal.energyProfile') }}</label>
                                  <div class="ai-value">
                                      {{ aiData.pod_type === 'PROSUMER' ? '☀️ Prosumer' : '🔌 Consumer' }}
                                  </div>
                              </div>
                              
                              <div class="ai-item full-width" v-if="aiData.indirizzo">
                                  <label>{{ $t('pods.aiModal.supplyAddress') }}</label>
                                  <div class="ai-value">
                                      {{ aiData.indirizzo.Via }} {{ aiData.indirizzo.NumeroCivico }}, 
                                      {{ aiData.indirizzo.Cap }} {{ aiData.indirizzo.Città }}
                                  </div>
                              </div>
                              <div class="ai-item" v-if="aiData.PartitaIva">
                                  <label>{{ $t('pods.aiModal.vat') }}</label>
                                  <div class="ai-value">{{ aiData.PartitaIva }}</div>
                              </div>
                              <div class="ai-item" v-if="aiData.DSO">
                                  <label>{{ $t('pods.aiModal.dso') }}</label>
                                  <div class="ai-value">{{ aiData.DSO }}</div>
                              </div>
                              <div class="ai-item" v-if="aiData.utility">
                                  <label>{{ $t('pods.aiModal.supplier') }}</label>
                                  <div class="ai-value">{{ aiData.utility }}</div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-section-box">
                          <div class="sec-head"><h4>📜 {{ $t('pods.aiModal.contractTitle') }}</h4></div>
                          <div class="ai-grid-compact">
                               <div class="ai-item">
                                  <label>{{ $t('pods.aiModal.billDate') }}</label>
                                  <div class="ai-value">{{ aiData.bill_date || $t('pods.aiModal.nd') }}</div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('pods.aiModal.period') }}</label>
                                  <div class="ai-value text-cap" style="font-size: 0.8rem;">{{ aiData.period || $t('pods.aiModal.nd') }}</div>
                              </div>

                            <div class="ai-item full-width">
                                  <label>{{ $t('pods.aiModal.activeOffer') }}</label>
                                  <div class="ai-value text-cap">{{ aiData.contract_type || $t('pods.aiModal.nd') }}</div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('pods.aiModal.price') }}</label>
                                  <div class="badge-pill" :class="aiData.price_type === 'FIXED' ? 'bg-blue' : (aiData.price_type === 'VARIABLE' ? 'bg-orange' : 'bg-gray')">
                                      {{ aiData.price_type === 'FIXED' ? '🔒 ' + $t('pods.aiModal.fixed') : (aiData.price_type === 'VARIABLE' ? '📈 ' + $t('pods.aiModal.variable') : $t('pods.aiModal.unknown')) }}
                                  </div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('pods.aiModal.expiry') }}</label>
                                  <div class="ai-value">{{ aiData.end_date || $t('pods.aiModal.nd') }}</div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('pods.aiModal.payments') }}</label>
                                  <div class="badge-pill" :class="aiData.payment_status === 'REGULAR' ? 'bg-green' : (aiData.payment_status === 'ARREARS' ? 'bg-red' : 'bg-gray')">
                                      {{ aiData.payment_status === 'REGULAR' ? '✔ ' + $t('pods.aiModal.regular') : (aiData.payment_status === 'ARREARS' ? '❌ ' + $t('pods.aiModal.arrears') : $t('pods.aiModal.nd')) }}
                                  </div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('pods.aiModal.methodEsg') }}</label>
                                  <div style="display: flex; gap: 5px;">
                                      <span class="badge-pill bg-gray">{{ aiData.payment_method || $t('pods.aiModal.nd') }}</span>
                                      <span v-if="aiData.is_100_green" class="badge-pill bg-green" :title="$t('pods.aiModal.greenEnergy')">🌱 {{ $t('pods.aiModal.green') }}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-grid-cols-3">
                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('pods.aiModal.techData') }}</div>
                              <div class="ai-list-rows">
                                  <div class="row-item">
                                      <span>{{ $t('pods.aiModal.committedPower') }}</span>
                                      <strong>{{ aiData.committed_power_kw }} kW</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('pods.aiModal.voltage') }}</span>
                                      <strong>{{ aiData.voltage_level || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('pods.aiModal.meter') }}</span>
                                      <strong style="font-size: 0.75rem;">{{ aiData.meter_type || '-' }}</strong>
                                  </div>
                                  
                                  <div class="row-item" v-if="aiData.has_storage_deduced !== undefined">
                                      <span>{{ $t('pods.aiModal.storageDeduced') }}</span>
                                      <strong :style="aiData.has_storage_deduced ? 'color: #10b981;' : ''">
                                          {{ aiData.has_storage_deduced ? '🔋 ' + $t('pods.aiModal.deduced') : '❌ ' + $t('pods.aiModal.absent') }}
                                      </strong>
                                  </div>
                              </div>
                              <div v-if="aiData.reactive_penalties" class="alert-box mt-2">
                                  ⚠️ {{ $t('pods.aiModal.reactivePenalties') }}
                              </div>
                          </div>

                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('pods.aiModal.costBreakdown') }}</div>
                              <div class="ai-list-rows">
                                  <div class="row-item">
                                      <span>{{ $t('pods.aiModal.avgTotal') }}</span>
                                      <strong class="highlight-text">{{ aiData.average_unit_cost ? Number(aiData.average_unit_cost).toFixed(3) : '-' }} €</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.spesa_energia">
                                      <span>{{ $t('pods.aiModal.energy') }}</span>
                                      <strong>{{ aiData.cost_breakdown.spesa_energia }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.spesa_rete">
                                      <span>{{ $t('pods.aiModal.network') }}</span>
                                      <strong>{{ aiData.cost_breakdown.spesa_rete }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.imposte_iva">
                                      <span>{{ $t('pods.aiModal.taxes') }}</span>
                                      <strong>{{ aiData.cost_breakdown.imposte_iva }}</strong>
                                  </div>
                              </div>
                          </div>
                          
                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('pods.aiModal.costsByBand') }}</div>
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
                              <div v-else class="ai-list-rows"><div class="row-item"><span>{{ $t('pods.aiModal.nd') }}</span></div></div>
                          </div>
                      </div>

                      <div class="ai-section-box">
                          <div class="sec-head">
                              <h4>📊 {{ $t('pods.aiModal.consumptionAnalysis') }}</h4>
                              <span class="total-ann">{{ aiData.consumption_bands?.total_annual }} kWh/{{ $t('pods.aiModal.year') }}</span>
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
                                      <strong>F1:</strong> {{ $t('pods.aiModal.f1Desc') }}
                                      <span v-if="aiData.costo_kwh" class="c-f1" style="margin-left: 4px;">
                                          ({{ formatCost(aiData.costo_kwh.F1 || aiData.costo_kwh.f1) }}/kWh)
                                      </span>
                                  </span>
                              </div>
                              <div class="legend-item">
                                  <span class="dot f2-dot"></span>
                                  <span>
                                      <strong>F2:</strong> {{ $t('pods.aiModal.f2Desc') }}
                                      <span v-if="aiData.costo_kwh" class="c-f2" style="margin-left: 4px;">
                                          ({{ formatCost(aiData.costo_kwh.F2 || aiData.costo_kwh.f2) }}/kWh)
                                      </span>
                                  </span>
                              </div>
                              <div class="legend-item">
                                  <span class="dot f3-dot"></span>
                                  <span>
                                      <strong>F3:</strong> {{ $t('pods.aiModal.f3Desc') }}
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
                                  📅 {{ $t('pods.aiModal.monthlyHistory') }}
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
                                  📊 {{ $t('pods.aiModal.monthlyBands') }}
                              </div>
                              <div class="bands-table-container">
                                  <table class="bands-table">
                                      <thead>
                                          <tr>
                                              <th>{{ $t('pods.aiModal.month') }}</th>
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
                                  ⚡ {{ $t('pods.aiModal.powerPeaks') }}
                              </div>
                              <div class="month-grid">
                                  <div class="m-item" v-for="month in sortedPeakMonths" :key="'peak-'+month">
                                      <span class="m-lbl">{{ month.substring(0,3) }}</span>
                                      <span class="m-val highlight-text" :class="{'text-danger': aiData.max_power_peaks[month] > aiData.committed_power_kw}">{{ aiData.max_power_peaks[month] }}</span>
                                  </div>
                              </div>
                              <div v-if="hasExceededPower" style="font-size: 0.7rem; color: #ef4444; margin-top: 4px; text-align: right;">
                                  *{{ $t('pods.aiModal.powerExceeded') }}
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

const getPotentialClass = (val) => {
  if (!val) return 'low';
  const v = val.toLowerCase();
  return v === 'high' ? 'high' : (v === 'medium' ? 'medium' : 'low');
};

const formatCost = (val) => {
    if (val === undefined || val === null || val === '') return '';
    return Number(val).toFixed(4) + ' €';
};

const hasExceededPower = computed(() => {
    if(!props.aiData || !props.aiData.max_power_peaks || !props.aiData.committed_power_kw) return false;
    return Object.values(props.aiData.max_power_peaks).some(val => val > props.aiData.committed_power_kw);
});

const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

const getMonthIndex = (m) => {
    if (!m) return 99;
    const normalized = String(m).trim().toLowerCase().substring(0, 3);
    const idx = monthNames.findIndex(name => name.startsWith(normalized));
    return idx === -1 ? 99 : idx; 
};

const sortedMonths = computed(() => {
    if(!props.aiData?.last_year) return [];
    return Object.keys(props.aiData.last_year).sort((a, b) => getMonthIndex(a) - getMonthIndex(b));
});

const sortedBandsMonths = computed(() => {
    if(!props.aiData?.last_year_fasce) return [];
    return Object.keys(props.aiData.last_year_fasce).sort((a, b) => getMonthIndex(a) - getMonthIndex(b));
});

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
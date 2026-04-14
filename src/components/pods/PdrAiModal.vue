<template>
  <transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
          <div class="glass-modal ai-modal">
              <div class="modal-header ai-header">
                  <div class="ai-title-box">
                      <h3>{{ $t('pdrAiModal.title') }}</h3>
                      <span class="ai-subtitle">Gemini Analysis &bull; {{ aiData?.pdr_id || $t('pdrAiModal.pdrNotFound') }}</span>
                  </div>
                  <button @click="$emit('close')" class="btn-close-modal">✕</button>
              </div>
              
              <div class="modal-body ai-body">
                  <div v-if="aiData" class="ai-content">
                      
                      <div class="ai-kpi-grid">
                          <div class="kpi-card" :class="aiData.usage_type ? 'high' : 'low'">
                              <span class="kpi-label">{{ $t('pdrAiModal.detectedUsage') }}</span>
                              <span class="kpi-value text-truncate" :title="aiData.usage_type">{{ aiData.usage_type || $t('pdrAiModal.nd') }}</span>
                          </div>
                          <div class="kpi-card" :class="aiData.meter_class ? 'high' : 'low'">
                              <span class="kpi-label">{{ $t('pdrAiModal.meterClass') }}</span>
                              <span class="kpi-value">{{ aiData.meter_class || $t('pdrAiModal.nd') }}</span>
                          </div>
                          <div class="kpi-card" :class="aiData.price_type === 'FIXED' ? 'confidence' : 'medium'">
                              <span class="kpi-label">{{ $t('pdrAiModal.priceType') }}</span>
                              <span class="kpi-value">{{ aiData.price_type === 'FIXED' ? $t('pdrAiModal.fixed') : (aiData.price_type === 'VARIABLE' ? $t('pdrAiModal.variable') : $t('pdrAiModal.nd')) }}</span>
                          </div>
                          <div class="kpi-card confidence">
                              <span class="kpi-label">{{ $t('pdrAiModal.reliability') }}</span>
                              <span class="kpi-value">{{ aiData.confidence ? (aiData.confidence * 100).toFixed(0) : 0 }}%</span>
                          </div>
                      </div>

                      <div class="ai-section-box mt-2">
                          <div class="sec-head"><h4>{{ $t('pdrAiModal.registrySupply') }}</h4></div>
                          <div class="ai-grid-compact">
                              <div class="ai-item">
                                  <label>{{ $t('pdrAiModal.userType') }}</label>
                                  <div class="ai-value">
                                      {{ aiData.user_type === 'COMPANY' ? $t('pdrAiModal.company') : $t('pdrAiModal.private') }}
                                  </div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('pdrAiModal.holder') }}</label>
                                  <div class="ai-value text-cap">{{ aiData.customer_name || $t('pdrAiModal.nd') }}</div>
                              </div>
                              <div class="ai-item full-width" v-if="aiData.indirizzo">
                                  <label>{{ $t('pdrAiModal.supplyAddress') }}</label>
                                  <div class="ai-value">
                                      {{ aiData.indirizzo.Via }} {{ aiData.indirizzo.NumeroCivico }}, 
                                      {{ aiData.indirizzo.Cap }} {{ aiData.indirizzo.Città }}
                                  </div>
                              </div>
                              <div class="ai-item" v-if="aiData.fiscal_code_or_vat">
                                  <label>{{ $t('pdrAiModal.taxId') }}</label>
                                  <div class="ai-value">{{ aiData.fiscal_code_or_vat }}</div>
                              </div>
                              <div class="ai-item" v-if="aiData.DSO">
                                  <label>{{ $t('pdrAiModal.dso') }}</label>
                                  <div class="ai-value">{{ aiData.DSO }}</div>
                              </div>
                              <div class="ai-item" v-if="aiData.utility">
                                  <label>{{ $t('pdrAiModal.currentSupplier') }}</label>
                                  <div class="ai-value">{{ aiData.utility }}</div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-section-box mt-3">
                          <div class="sec-head"><h4>{{ $t('pdrAiModal.contractPayments') }}</h4></div>
                          <div class="ai-grid-compact">
                              <div class="ai-item full-width">
                                  <label>{{ $t('pdrAiModal.activeOffer') }}</label>
                                  <div class="ai-value text-cap">{{ aiData.contract_type || $t('pdrAiModal.nd') }}</div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('pdrAiModal.expiryConditions') }}</label>
                                  <div class="ai-value">{{ aiData.end_date || $t('pdrAiModal.nd') }}</div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('pdrAiModal.paymentStatus') }}</label>
                                  <div class="badge-pill" :class="aiData.payment?.status === 'REGULAR' ? 'bg-green' : (aiData.payment?.status === 'ARREARS' ? 'bg-red' : 'bg-gray')">
                                      {{ aiData.payment?.status === 'REGULAR' ? $t('pdrAiModal.regular') : (aiData.payment?.status === 'ARREARS' ? $t('pdrAiModal.arrears') : $t('pdrAiModal.nd')) }}
                                  </div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('pdrAiModal.paymentMethod') }}</label>
                                  <div class="badge-pill bg-gray">{{ aiData.payment?.method || $t('pdrAiModal.nd') }}</div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-grid-cols-3 mt-3">
                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('pdrAiModal.techData') }}</div>
                              <div class="ai-list-rows">
                                  <div class="row-item">
                                      <span>{{ $t('pdrAiModal.class') }}</span>
                                      <strong>{{ aiData.meter_class || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('pdrAiModal.meterType') }}</span>
                                      <strong style="font-size: 0.75rem;">{{ aiData.meter_type || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('pdrAiModal.coeffC') }}</span>
                                      <strong>{{ aiData.coefficient_c || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('pdrAiModal.pcs') }}</span>
                                      <strong>{{ aiData.pcs || '-' }}</strong>
                                  </div>
                              </div>
                          </div>

                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('pdrAiModal.costBreakdown') }}</div>
                              <div class="ai-list-rows">
                                  <div class="row-item">
                                      <span>{{ $t('pdrAiModal.avgCost') }}</span>
                                      <strong class="highlight-text">{{ aiData.average_unit_cost_smc ? Number(aiData.average_unit_cost_smc).toFixed(3) : '-' }} €/Smc</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.spesa_gas_naturale">
                                      <span>{{ $t('pdrAiModal.gasMaterial') }}</span>
                                      <strong>{{ aiData.cost_breakdown.spesa_gas_naturale }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.spesa_rete">
                                      <span>{{ $t('pdrAiModal.transport') }}</span>
                                      <strong>{{ aiData.cost_breakdown.spesa_rete }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.oneri_sistema">
                                      <span>{{ $t('pdrAiModal.systemCharges') }}</span>
                                      <strong>{{ aiData.cost_breakdown.oneri_sistema }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.imposte_iva">
                                      <span>{{ $t('pdrAiModal.taxes') }}</span>
                                      <strong>{{ aiData.cost_breakdown.imposte_iva }}</strong>
                                  </div>
                              </div>
                          </div>
                          
                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('pdrAiModal.currentBillData') }}</div>
                              <div class="ai-list-rows">
                                    <div class="row-item" v-if="aiData.bill_date">
                                      <span>{{ $t('pdrAiModal.billDate') || 'Data Emissione' }}</span>
                                      <strong style="font-size: 0.75rem;">{{ aiData.bill_date }}</strong>
                                  </div>

                                <div class="row-item">
                                      <span>{{ $t('pdrAiModal.period') }}</span>
                                      <strong style="font-size: 0.75rem;">{{ aiData.period || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('pdrAiModal.totalAmount') }}</span>
                                      <strong style="color:#ef4444;">{{ aiData.payment?.total_amount ? aiData.payment.total_amount + ' €' : '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('pdrAiModal.expiry') }}</span>
                                      <strong>{{ aiData.payment?.expiration_date || '-' }}</strong>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-section-box mt-3">
                          <div class="sec-head">
                              <h4>{{ $t('pdrAiModal.consumptionAnalysis') }}</h4>
                          </div>
                          
                          <div class="bands-display">
                              <div class="band-item f1">
                                  <span class="b-label">{{ $t('pdrAiModal.totalAnnualConsumption') }}</span>
                                  <span class="b-val">{{ aiData.consumption?.annual_smc || 0 }} <small>Smc</small></span>
                              </div>
                              <div class="band-item f2">
                                  <span class="b-label">{{ $t('pdrAiModal.periodConsumption') }}</span>
                                  <span class="b-val">{{ aiData.consumption?.period_smc || 0 }} <small>Smc</small></span>
                              </div>
                              <div class="band-item f3">
                                  <span class="b-label">{{ $t('pdrAiModal.monthlyAvg') }}</span>
                                  <span class="b-val">{{ aiData.consumption?.avg_monthly_smc || 0 }} <small>Smc</small></span>
                              </div>
                          </div>

                          <div v-if="aiData.last_year_monthly_smc && Object.keys(aiData.last_year_monthly_smc).length > 0" class="mt-4">
                              <div class="sec-head-tiny" style="border-top: 1px dashed var(--border-color); padding-top: 12px; margin-bottom: 8px;">
                                  {{ $t('pdrAiModal.monthlyHistory') }}
                              </div>
                              <div class="month-grid">
                                  <div class="m-item" v-for="month in sortedMonths" :key="'gas-'+month">
                                      <span class="m-lbl">{{ month.substring(0,3) }}</span>
                                      <span class="m-val">{{ aiData.last_year_monthly_smc[month] || '-' }}</span>
                                  </div>
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  show: Boolean,
  aiData: Object
});

defineEmits(['close']);

// --- LOGICA DI ORDINAMENTO CRONOLOGICO DEI MESI ---
const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

const getMonthIndex = (m) => {
    if (!m) return 99;
    const normalized = String(m).trim().toLowerCase().substring(0, 3);
    const idx = monthNames.findIndex(name => name.startsWith(normalized));
    return idx === -1 ? 99 : idx; 
};

// Ordinamento per la griglia totale mensile del gas
const sortedMonths = computed(() => {
    if(!props.aiData?.last_year_monthly_smc) return [];
    return Object.keys(props.aiData.last_year_monthly_smc).sort((a, b) => getMonthIndex(a) - getMonthIndex(b));
});
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 650px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }

/* AI MODAL STYLES */
.ai-header { background: var(--bg-app); border-bottom: 1px solid var(--border-color); padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; color: var(--text-main); }
.ai-header h3 { margin: 0; color: #ea580c; } /* Tema Gas */
.ai-subtitle { font-size: 0.7rem; color: #f97316; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: block; margin-top: 2px; }
.ai-body { padding: 1.5rem; background: var(--bg-card); display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; color: var(--text-main); }
.mb-3 { margin-bottom: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }

/* GRIGLIE E BOX */
.ai-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 5px; }
.kpi-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 4px; border-radius: 8px; text-align: center; border: 1px solid transparent; }
.kpi-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; opacity: 0.8; }
.kpi-value { font-size: 0.95rem; font-weight: 700; }
.text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; padding: 0 5px; }

/* Colori Tema Gas per KPI */
.kpi-card.high { background: rgba(234, 88, 12, 0.1); color: #ea580c; border-color: rgba(234, 88, 12, 0.2); }
.kpi-card.medium { background: rgba(234, 179, 8, 0.1); color: #a16207; border-color: rgba(234, 179, 8, 0.2); }
.kpi-card.low { background: var(--bg-app); color: var(--text-muted); border-color: var(--border-color); }
.kpi-card.confidence { background: rgba(234, 88, 12, 0.1); color: #c2410c; border-color: rgba(234, 88, 12, 0.2); }

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

/* BADGES */
.badge-pill { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; color: white; }
.bg-blue { background-color: #3b82f6; }
.bg-orange { background-color: #ea580c; }
.bg-green { background-color: #10b981; }
.bg-red { background-color: #ef4444; }
.bg-gray { background-color: var(--border-color); color: var(--text-main); }

/* LISTE E CELLE */
.ai-grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ai-list-rows .row-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 6px 0; border-bottom: 1px solid var(--bg-app); }
.ai-list-rows .row-item:last-child { border-bottom: none; }
.ai-list-rows span { color: var(--text-muted); }
.ai-list-rows strong { color: var(--text-main); text-align: right; }
.highlight-text { color: #ea580c !important; font-size: 0.95rem; }

/* CONSUMI */
.bands-display { display: flex; gap: 8px; margin-bottom: 12px; }
.band-item { flex: 1; text-align: center; background: var(--bg-card); padding: 12px 4px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; }
.b-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; }
.b-val { font-size: 1.2rem; font-weight: 700; color: #ea580c; margin: 4px 0 0 0; }
.b-val small { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

/* GRIGLIE MENSILI ORDINATE */
.month-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.m-item { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 6px 4px; text-align: center; display: flex; flex-direction: column; }
.m-lbl { font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800; }
.m-val { font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin: 2px 0; }

@media (max-width: 600px) {
    .ai-grid-cols-3 { grid-template-columns: 1fr; }
    .ai-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .month-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
<template>
  <transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
          <div class="glass-modal ai-modal">
              <div class="modal-header ai-header">
                  <div class="ai-title-box">
                      <h3>{{ $t('waterAiModal.title') }}</h3>
                      <span class="ai-subtitle">Gemini Analysis &bull; {{ aiData?.pdp_id || $t('waterAiModal.pdpNotFound') }}</span>
                  </div>
                  <button @click="$emit('close')" class="btn-close-modal">✕</button>
              </div>
              
              <div class="modal-body ai-body">
                  <div v-if="aiData" class="ai-content">
                      
                      <div class="ai-kpi-grid">
                          <div class="kpi-card" :class="aiData.usage_type ? 'high' : 'low'">
                              <span class="kpi-label">{{ $t('waterAiModal.detectedUsage') }}</span>
                              <span class="kpi-value text-truncate" :title="aiData.usage_type">{{ aiData.usage_type || $t('waterAiModal.nd') }}</span>
                          </div>
                          <div class="kpi-card" :class="aiData.tariff_type ? 'water-theme' : 'low'">
                              <span class="kpi-label">{{ $t('waterAiModal.tariff') }}</span>
                              <span class="kpi-value text-truncate" :title="aiData.tariff_type">{{ aiData.tariff_type || $t('waterAiModal.nd') }}</span>
                          </div>
                          <div class="kpi-card" :class="aiData.components_num ? 'water-theme' : 'low'">
                              <span class="kpi-label">{{ $t('waterAiModal.components') }}</span>
                              <span class="kpi-value">{{ aiData.components_num || $t('waterAiModal.nd') }}</span>
                          </div>
                          <div class="kpi-card confidence">
                              <span class="kpi-label">{{ $t('waterAiModal.reliability') }}</span>
                              <span class="kpi-value">{{ aiData.confidence ? (aiData.confidence * 100).toFixed(0) : 0 }}%</span>
                          </div>
                      </div>

                      <div class="ai-section-box mt-2">
                          <div class="sec-head"><h4>👤 {{ $t('waterAiModal.registrySupply') }}</h4></div>
                          <div class="ai-grid-compact">
                              <div class="ai-item">
                                  <label>{{ $t('waterAiModal.userType') }}</label>
                                  <div class="ai-value">
                                      {{ aiData.user_type === 'COMPANY' ? $t('waterAiModal.company') : $t('waterAiModal.private') }}
                                  </div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('waterAiModal.holder') }}</label>
                                  <div class="ai-value text-cap">{{ aiData.customer_name || $t('waterAiModal.nd') }}</div>
                              </div>
                              <div class="ai-item full-width" v-if="aiData.indirizzo">
                                  <label>{{ $t('waterAiModal.supplyAddress') }}</label>
                                  <div class="ai-value">
                                      {{ aiData.indirizzo.Via || '' }} {{ aiData.indirizzo.Città || '' }} {{ aiData.indirizzo.Cap ? '(' + aiData.indirizzo.Cap + ')' : '' }}
                                  </div>
                              </div>
                              <div class="ai-item" v-if="aiData.fiscal_code_or_vat">
                                  <label>{{ $t('waterAiModal.taxId') }}</label>
                                  <div class="ai-value">{{ aiData.fiscal_code_or_vat }}</div>
                              </div>
                              <div class="ai-item" v-if="aiData.provider">
                                  <label>{{ $t('waterAiModal.provider') }}</label>
                                  <div class="ai-value">{{ aiData.provider }}</div>
                              </div>
                              <div class="ai-item" v-if="aiData.contract_code">
                                  <label>{{ $t('waterAiModal.contractCode') }}</label>
                                  <div class="ai-value">{{ aiData.contract_code }}</div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-section-box mt-3">
                          <div class="sec-head"><h4>📜 {{ $t('waterAiModal.contractPayments') }}</h4></div>
                          <div class="ai-grid-compact">
                              <div class="ai-item full-width">
                                  <label>{{ $t('waterAiModal.tariffType') }}</label>
                                  <div class="ai-value text-cap">{{ aiData.tariff_type || $t('waterAiModal.nd') }}</div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('waterAiModal.paymentStatus') }}</label>
                                  <div class="badge-pill" :class="aiData.payment?.status === 'REGULAR' ? 'bg-green' : (aiData.payment?.status === 'ARREARS' ? 'bg-red' : 'bg-gray')">
                                      {{ aiData.payment?.status === 'REGULAR' ? $t('waterAiModal.regular') : (aiData.payment?.status === 'ARREARS' ? $t('waterAiModal.arrears') : $t('waterAiModal.nd')) }}
                                  </div>
                              </div>
                              <div class="ai-item">
                                  <label>{{ $t('waterAiModal.paymentMethod') }}</label>
                                  <div class="badge-pill bg-gray">{{ aiData.payment?.method || $t('waterAiModal.nd') }}</div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-grid-cols-3 mt-3">
                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('waterAiModal.techData') }}</div>
                              <div class="ai-list-rows">
                                  <div class="row-item">
                                      <span>{{ $t('waterAiModal.meterSerial') }}</span>
                                      <strong style="font-size: 0.8rem;">{{ aiData.meter_serial || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('waterAiModal.meterType') }}</span>
                                      <strong style="font-size: 0.75rem;">{{ aiData.meter_type || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('waterAiModal.componentsNum') }}</span>
                                      <strong>{{ aiData.components_num || '-' }}</strong>
                                  </div>
                              </div>
                          </div>

                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('waterAiModal.costBreakdown') }}</div>
                              <div class="ai-list-rows">
                                  <div class="row-item" v-if="aiData.cost_breakdown?.acquedotto">
                                      <span>{{ $t('waterAiModal.aqueduct') }}</span>
                                      <strong>{{ aiData.cost_breakdown.acquedotto }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.fognatura">
                                      <span>{{ $t('waterAiModal.sewerage') }}</span>
                                      <strong>{{ aiData.cost_breakdown.fognatura }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.depurazione">
                                      <span>{{ $t('waterAiModal.purification') }}</span>
                                      <strong>{{ aiData.cost_breakdown.depurazione }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.quote_fisse">
                                      <span>{{ $t('waterAiModal.fixedQuotas') }}</span>
                                      <strong>{{ aiData.cost_breakdown.quote_fisse }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.oneri_perequazione">
                                      <span>{{ $t('waterAiModal.equalization') }}</span>
                                      <strong>{{ aiData.cost_breakdown.oneri_perequazione }}</strong>
                                  </div>
                                  <div class="row-item" v-if="aiData.cost_breakdown?.imposte_iva">
                                      <span>{{ $t('waterAiModal.taxes') }}</span>
                                      <strong>{{ aiData.cost_breakdown.imposte_iva }}</strong>
                                  </div>
                              </div>
                          </div>
                          
                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('waterAiModal.currentBillData') }}</div>
                              <div class="ai-list-rows">
                                  <div class="row-item" v-if="aiData.bill_date">
                                      <span>{{ $t('waterAiModal.billDate') || 'Data Emissione' }}</span>
                                      <strong style="font-size: 0.75rem;">{{ aiData.bill_date }}</strong>
                                  </div>

                                <div class="row-item">
                                      <span>{{ $t('waterAiModal.period') }}</span>
                                      <strong style="font-size: 0.75rem;">{{ aiData.period || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('waterAiModal.totalAmount') }}</span>
                                      <strong style="color:#ef4444;">{{ aiData.payment?.total_amount ? aiData.payment.total_amount + ' €' : '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('waterAiModal.expiry') }}</span>
                                      <strong>{{ aiData.payment?.expiration_date || '-' }}</strong>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-section-box mt-3 mb-2">
                          <div class="sec-head">
                              <h4 style="color: #2563eb;">💧 {{ $t('waterAiModal.consumptionAnalysis') }}</h4>
                          </div>
                          
                          <div class="bands-display">
                              <div class="band-item water-band">
                                  <span class="b-label">{{ $t('waterAiModal.totalAnnualConsumption') }}</span>
                                  <span class="b-val">{{ aiData.consumption?.annual_mc || 0 }} <small>mc</small></span>
                              </div>
                              <div class="band-item water-band">
                                  <span class="b-label">{{ $t('waterAiModal.periodConsumption') }}</span>
                                  <span class="b-val">{{ aiData.consumption?.period_mc || 0 }} <small>mc</small></span>
                              </div>
                              <div class="band-item water-band">
                                  <span class="b-label">{{ $t('waterAiModal.referenceVolume') }}</span>
                                  <span class="b-val">{{ aiData.consumption?.reference_volume_mc || 0 }} <small>mc</small></span>
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  show: Boolean,
  aiData: Object
});

defineEmits(['close']);
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 650px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); transition: color 0.2s; }
.btn-close-modal:hover { color: #ef4444; }

/* AI MODAL STYLES - WATER THEME */
.ai-header { background: var(--bg-app); border-bottom: 1px solid var(--border-color); padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; color: var(--text-main); }
.ai-header h3 { margin: 0; color: #2563eb; } /* Blu Acqua */
.ai-subtitle { font-size: 0.7rem; color: #3b82f6; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: block; margin-top: 2px; }
.ai-body { padding: 1.5rem; background: var(--bg-card); display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; color: var(--text-main); }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }

/* GRIGLIE E BOX */
.ai-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 5px; }
.kpi-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 4px; border-radius: 8px; text-align: center; border: 1px solid transparent; }
.kpi-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; opacity: 0.8; }
.kpi-value { font-size: 0.95rem; font-weight: 700; }
.text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; padding: 0 5px; }

/* Colori Tema Acqua per KPI */
.kpi-card.high { background: rgba(22, 163, 74, 0.1); color: #16a34a; border-color: rgba(22, 163, 74, 0.2); }
.kpi-card.water-theme { background: rgba(59, 130, 246, 0.1); color: #2563eb; border-color: rgba(59, 130, 246, 0.2); }
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

/* BADGES */
.badge-pill { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; color: white; }
.bg-blue { background-color: #3b82f6; }
.bg-green { background-color: #10b981; }
.bg-red { background-color: #ef4444; }
.bg-gray { background-color: var(--border-color); color: var(--text-main); }

/* LISTE E CELLE */
.ai-grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ai-list-rows .row-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 6px 0; border-bottom: 1px solid var(--bg-app); }
.ai-list-rows .row-item:last-child { border-bottom: none; }
.ai-list-rows span { color: var(--text-muted); }
.ai-list-rows strong { color: var(--text-main); text-align: right; }
.highlight-text { color: #2563eb !important; font-size: 0.95rem; }

/* CONSUMI */
.bands-display { display: flex; gap: 8px; margin-bottom: 8px; }
.band-item { flex: 1; text-align: center; background: var(--bg-card); padding: 12px 4px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; }
.water-band { border-color: rgba(59, 130, 246, 0.3); background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1)); }
.b-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; }
.b-val { font-size: 1.2rem; font-weight: 700; color: #2563eb; margin: 4px 0 0 0; }
.b-val small { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

@media (max-width: 600px) {
    .ai-grid-cols-3 { grid-template-columns: 1fr; }
    .ai-kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
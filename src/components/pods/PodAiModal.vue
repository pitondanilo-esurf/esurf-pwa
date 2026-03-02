<template>
  <transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
          <div class="glass-modal ai-modal">
              <div class="modal-header ai-header">
                  <div class="ai-title-box">
                      <h3>{{ $t('pods.aiModal.title') }}</h3>
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
                              <span class="kpi-label">{{ $t('pods.aiModal.reliability') }}</span>
                              <span class="kpi-value">{{ aiData.confidence ? (aiData.confidence * 100).toFixed(0) : 0 }}%</span>
                          </div>
                      </div>

                      <div class="ai-section-box">
                          <div class="sec-head"><h4>👤 {{ $t('pods.aiModal.registry') }}</h4></div>
                          <div class="ai-grid-compact">
                              <div class="ai-item">
                                  <label>{{ $t('pods.aiModal.type') }}</label>
                                  <div class="ai-value">{{ aiData.user_type === 'COMPANY' ? '🏢 ' + $t('pods.aiModal.company') : '🏠 ' + $t('pods.aiModal.private') }}</div>
                              </div>
                              <div class="ai-item" v-if="aiData.PartitaIva">
                                  <label>P.IVA</label>
                                  <div class="ai-value">{{ aiData.PartitaIva }}</div>
                              </div>
                              <div class="ai-item full-width" v-if="aiData.indirizzo">
                                  <label>{{ $t('pods.aiModal.supplyAddress') }}</label>
                                  <div class="ai-value">
                                      {{ aiData.indirizzo.Via }} {{ aiData.indirizzo.NumeroCivico }}, 
                                      {{ aiData.indirizzo.Cap }} {{ aiData.indirizzo.Città }}
                                  </div>
                              </div>
                              <div class="ai-item full-width">
                                  <label>{{ $t('pods.aiModal.activeOffer') }}</label>
                                  <div class="ai-value text-cap">{{ aiData.contract_type || 'N/D' }}</div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-grid-cols-2">
                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('pods.aiModal.techData') }}</div>
                              <div class="ai-list-rows">
                                  <div class="row-item">
                                      <span>{{ $t('pods.labels.power') }}</span>
                                      <strong>{{ aiData.committed_power_kw }} kW</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('pods.aiModal.voltage') }}</span>
                                      <strong>{{ aiData.voltage_level || '-' }}</strong>
                                  </div>
                                  <div class="row-item">
                                      <span>{{ $t('pods.aiModal.meter') }}</span>
                                      <strong style="font-size: 0.8rem;">{{ aiData.meter_type || '-' }}</strong>
                                  </div>
                              </div>
                          </div>

                          <div class="ai-section-box no-bg">
                              <div class="sec-head-tiny">{{ $t('pods.aiModal.materialCosts') }}</div>
                              <div class="ai-list-rows">
                                  <div class="row-item"><span>F1</span><strong>{{ aiData.costo_kwh?.F1 || '-' }} €</strong></div>
                                  <div class="row-item"><span>F2</span><strong>{{ aiData.costo_kwh?.F2 || '-' }} €</strong></div>
                                  <div class="row-item"><span>F3</span><strong>{{ aiData.costo_kwh?.F3 || '-' }} €</strong></div>
                              </div>
                          </div>
                      </div>

                      <div class="ai-section-box">
                          <div class="sec-head">
                              <h4>📊 {{ $t('pods.aiModal.consumptionAnalysis') }}</h4>
                              <span class="total-ann">{{ aiData.consumption_bands?.total_annual }} kWh/anno</span>
                          </div>
                          
                          <div class="bands-display">
                              <div class="band-item f1"><span class="b-label">F1</span><span class="b-val">{{ aiData.consumption_bands?.f1 || 0 }}</span></div>
                              <div class="band-item f2"><span class="b-label">F2</span><span class="b-val">{{ aiData.consumption_bands?.f2 || 0 }}</span></div>
                              <div class="band-item f3"><span class="b-label">F3</span><span class="b-val">{{ aiData.consumption_bands?.f3 || 0 }}</span></div>
                          </div>

                          <div v-if="aiData.quarter" class="quarters-row mt-2">
                              <div class="q-item" v-for="(val, key) in aiData.quarter" :key="key">
                                  <span class="q-lbl">{{ key }}</span><span class="q-val">{{ val }}</span>
                              </div>
                          </div>

                          <div v-if="aiData.last_year" class="month-grid mt-3">
                              <div class="m-item" v-for="(val, key) in aiData.last_year" :key="key">
                                  <span class="m-lbl">{{ key.substring(0,3) }}</span><span class="m-val">{{ val }}</span>
                              </div>
                          </div>
                      </div>

                      <div v-if="aiData.market_notes" class="ai-notes-box">
                          <div class="notes-icon">💡</div><p>{{ aiData.market_notes }}</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  show: Boolean,
  aiData: Object
});

defineEmits(['close']);

const getPotentialClass = (val) => {
  if (!val) return 'low';
  const v = val.toLowerCase();
  return v === 'high' ? 'high' : (v === 'medium' ? 'medium' : 'low');
};
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 550px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }

/* AI MODAL STYLES */
.ai-modal { max-width: 600px; }
.ai-header { background: var(--bg-app); border-bottom: 1px solid var(--border-color); padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; color: var(--text-main); }
.ai-header h3 { margin: 0; }
.ai-subtitle { font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: block; margin-top: 2px; }
.ai-body { padding: 1.5rem; background: var(--bg-card); display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; color: var(--text-main); }
.ai-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 5px; }
.kpi-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 4px; border-radius: 8px; text-align: center; border: 1px solid transparent; }
.kpi-label { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; opacity: 0.8; }
.kpi-value { font-size: 0.9rem; font-weight: 700; }
.kpi-card.high { background: rgba(22, 163, 74, 0.1); color: #15803d; border-color: rgba(22, 163, 74, 0.2); }
.kpi-card.medium { background: rgba(234, 179, 8, 0.1); color: #a16207; border-color: rgba(234, 179, 8, 0.2); }
.kpi-card.low { background: var(--bg-app); color: var(--text-muted); border-color: var(--border-color); }
.kpi-card.confidence { background: rgba(59, 130, 246, 0.1); color: #1d4ed8; border-color: rgba(59, 130, 246, 0.2); }
.ai-section-box { background: var(--bg-app); border-radius: 10px; padding: 12px; border: 1px solid var(--border-color); }
.ai-section-box.no-bg { background: transparent; border: 1px solid var(--border-color); padding: 10px; }
.sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; }
.sec-head h4 { margin: 0; font-size: 0.8rem; color: var(--text-main); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
.sec-head-tiny { font-size: 0.65rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
.total-ann { font-size: 0.75rem; font-weight: 700; color: var(--accent-cyan); background: rgba(59, 130, 246, 0.1); padding: 2px 8px; border-radius: 6px; }
.ai-grid-compact { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; }
.ai-item label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 1px; }
.ai-value { font-size: 0.9rem; font-weight: 600; color: var(--text-main); line-height: 1.2; }
.ai-item.full-width { grid-column: span 2; }
.ai-grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ai-list-rows .row-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid var(--bg-app); }
.ai-list-rows span { color: var(--text-muted); }
.ai-list-rows strong { color: var(--text-main); }
.bands-display { display: flex; gap: 8px; margin-bottom: 12px; }
.band-item { flex: 1; text-align: center; background: var(--bg-card); padding: 6px 4px; border-radius: 6px; border: 1px solid var(--border-color); }
.b-label { display: block; font-size: 0.65rem; color: var(--text-muted); font-weight: 800; }
.b-val { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
.quarters-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.q-item { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 4px; text-align: center; }
.q-lbl { display: block; font-size: 0.6rem; color: var(--text-muted); font-weight: 700; }
.q-val { font-size: 0.8rem; font-weight: 600; color: var(--text-main); }
.month-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
.m-item { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 4px; padding: 3px; text-align: center; }
.m-lbl { display: block; font-size: 0.55rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
.m-val { font-size: 0.75rem; font-weight: 600; color: var(--text-main); }
.ai-notes-box { background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.2); padding: 12px; border-radius: 8px; display: flex; gap: 10px; align-items: flex-start; margin-top: 5px; }
.notes-icon { font-size: 1.2rem; }
.ai-notes-box p { margin: 0; font-size: 0.85rem; color: var(--text-main); line-height: 1.4; }
</style>
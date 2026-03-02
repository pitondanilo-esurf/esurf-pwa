<template>
  <transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
          <div class="glass-modal compliance-modal">
              <div class="modal-header compliance-header">
                  <div class="header-title">
                      <h3>Maturità Asset</h3>
                      <span class="subtitle-pod">{{ complianceData?.level }} &bull; {{ complianceData?.score }}%</span>
                  </div>
                  <button @click="$emit('close')" class="btn-close-modal">✕</button>
              </div>
              
              <div class="modal-body compliance-body">
                  <div class="compliance-score-section">
                      <div class="score-ring" :class="getComplianceColorClass(complianceData?.level)">
                          <span class="score-pct">{{ complianceData?.score }}%</span>
                      </div>
                  </div>

                  <div class="compliance-breakdown">
                      <div class="breakdown-grid">
                          <div v-for="(status, key) in complianceData?.breakdown" :key="key" class="breakdown-card">
                              <span class="b-label">{{ key.replace('_', ' ') }}</span>
                              <span class="b-status" :class="status.toLowerCase()">{{ status }}</span>
                          </div>
                      </div>
                  </div>

                  <div v-if="complianceData?.missing?.length" class="missing-actions-box">
                      <h4 class="box-title">🚀 Azioni Consigliate</h4>
                      <ul class="missing-list">
                          <li v-for="task in complianceData.missing" :key="task">
                              <span class="list-bullet">⚡</span> {{ task }}
                          </li>
                      </ul>
                  </div>

                  <div class="compliance-footer-meta" v-if="complianceData?.last_calculated_at">
                      Calcolato il: {{ new Date(complianceData.last_calculated_at).toLocaleString() }}
                  </div>
              </div>
          </div>
      </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    show: Boolean,
    complianceData: Object
});

const emit = defineEmits(['close']);

const getComplianceColorClass = (level) => {
    if (!level) return 'level-none';
    const l = level.toLowerCase();
    if (l.includes('bronze')) return 'level-bronze';
    if (l.includes('silver')) return 'level-silver';
    if (l.includes('gold')) return 'level-gold';
    if (l.includes('platinum')) return 'level-platinum';
    return 'level-none';
};
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 550px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; color: var(--text-main); }
.modal-header h3 { margin: 0; color: var(--text-main); font-size: 1.1rem; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; color: var(--text-main); }

.compliance-modal { max-width: 500px; }
.compliance-header { background: var(--bg-app); padding: 1.2rem 1.5rem; }
.header-title { display: flex; flex-direction: column; }
.subtitle-pod { font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700; font-family: monospace; margin-top: 4px; }
.compliance-body { padding: 1.5rem; background: var(--bg-card); display: flex; flex-direction: column; gap: 1.5rem; }

.compliance-score-section { display: flex; justify-content: center; }
.score-ring { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 6px solid var(--border-color); margin: 0 auto; }
.score-ring.level-bronze { border-color: #CD7F32; }
.score-ring.level-silver { border-color: #E0E0E0; }
.score-ring.level-gold { border-color: #FFD700; }
.score-ring.level-platinum { border-color: #4facfe; }
.score-pct { font-size: 1.5rem; font-weight: 800; color: var(--text-main); }

.breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.breakdown-card { background: var(--bg-app); border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; display: flex; flex-direction: column; }
.b-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
.b-status { font-size: 0.8rem; font-weight: 700; }
.b-status.ok, .b-status.excellent { color: #16a34a; }
.b-status.missing, .b-status.empty { color: #ef4444; }

.missing-actions-box { background: rgba(59, 130, 246, 0.05); border: 1px solid var(--border-color); border-radius: 10px; padding: 15px; }
.box-title { font-size: 0.9rem; margin: 0 0 10px 0; color: var(--text-main); }
.missing-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.missing-list li { font-size: 0.85rem; color: var(--text-main); display: flex; gap: 8px; align-items: center; }
.list-bullet { color: var(--accent-blue); font-size: 0.7rem; }
.compliance-footer-meta { font-size: 0.7rem; color: var(--text-muted); text-align: center; margin-top: 5px; }
</style>
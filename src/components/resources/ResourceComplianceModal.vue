<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
      <div class="glass-modal compliance-modal">
        
        <div class="modal-header">
          <h3>Valutazione Conformità</h3>
          <button @click="$emit('close')" class="btn-close-modal" title="Chiudi">✕</button>
        </div>

        <div class="modal-body" v-if="complianceData">
          
          <div class="score-header" :class="getLevelClass(complianceData.level)">
            <div class="score-circle">
              <span class="score-number">{{ complianceData.score }}</span>
              <span class="score-max">/100</span>
            </div>
            <div class="level-info">
              <span class="level-badge">{{ complianceData.level }}</span>
              <p class="level-desc">{{ getLevelDescription(complianceData.level) }}</p>
            </div>
          </div>

          <div class="missing-actions" v-if="complianceData.missing && complianceData.missing.length > 0">
            <h4>⚠️ Azioni Richieste per migliorare</h4>
            <ul class="action-list">
              <li v-for="(action, index) in complianceData.missing" :key="index">
                <span class="bullet">👉</span> {{ action }}
              </li>
            </ul>
          </div>
          <div class="all-good" v-else>
            <h4>✅ Profilo Eccellente</h4>
            <p>Non ci sono azioni in sospeso. La risorsa è pronta per la comunità!</p>
          </div>

          <div class="breakdown-section" v-if="complianceData.breakdown">
            <h4>Dettaglio Requisiti</h4>
            <div class="breakdown-grid">
              
              <div class="bd-item" v-if="complianceData.breakdown.legal">
                <span class="bd-icon">⚖️</span>
                <div class="bd-text">
                    <span class="bd-label">Mandati e Privacy</span>
                    <span class="bd-status" :class="getStatusClass(complianceData.breakdown.legal)">
                        {{ formatStatus(complianceData.breakdown.legal) }}
                    </span>
                </div>
              </div>

              <div class="bd-item" v-if="complianceData.breakdown.ai">
                <span class="bd-icon">✨</span>
                <div class="bd-text">
                    <span class="bd-label">Dati Intelligenza IA</span>
                    <span class="bd-status" :class="getStatusClass(complianceData.breakdown.ai)">
                        {{ formatStatus(complianceData.breakdown.ai) }}
                    </span>
                </div>
              </div>

              <div class="bd-item" v-if="complianceData.breakdown.grid">
                <span class="bd-icon">⚡</span>
                <div class="bd-text">
                    <span class="bd-label">Rete Elettrica</span>
                    <span class="bd-status" :class="getStatusClass(complianceData.breakdown.grid)">
                        {{ formatStatus(complianceData.breakdown.grid) }}
                    </span>
                </div>
              </div>

              <div class="bd-item" v-if="complianceData.breakdown.load_curve">
                <span class="bd-icon">📊</span>
                <div class="bd-text">
                    <span class="bd-label">Curve di Carico</span>
                    <span class="bd-status" :class="getStatusClass(complianceData.breakdown.load_curve)">
                        {{ formatStatus(complianceData.breakdown.load_curve) }}
                    </span>
                </div>
              </div>

              <div class="bd-item" v-if="complianceData.breakdown.assets">
                <span class="bd-icon">🔌</span>
                <div class="bd-text">
                    <span class="bd-label">Dispositivi / Asset</span>
                    <span class="bd-status" :class="getStatusClass(complianceData.breakdown.assets)">
                        {{ formatStatus(complianceData.breakdown.assets) }}
                    </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        <div class="modal-footer">
          <span class="last-calc" v-if="complianceData?.last_calculated_at">
            Ultimo calcolo: {{ formatDate(complianceData.last_calculated_at) }}
          </span>
          <button @click="$emit('close')" class="btn-ghost-small">Chiudi</button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  complianceData: { type: Object, default: null }
});

defineEmits(['close']);

const getLevelClass = (level) => {
    if (!level) return 'theme-bronze';
    const l = level.toLowerCase();
    if (l.includes('bronze')) return 'theme-bronze';
    if (l.includes('silver')) return 'theme-silver';
    if (l.includes('gold')) return 'theme-gold';
    if (l.includes('platinum')) return 'theme-platinum';
    return 'theme-bronze';
};

const getLevelDescription = (level) => {
    switch (level) {
        case 'PLATINUM': return 'Massima efficienza! Profilo perfetto.';
        case 'GOLD': return 'Ottimo livello, mancano solo dettagli minori.';
        case 'SILVER': return 'Livello intermedio, necessario completare i dati base.';
        case 'BRONZE': return 'Profilo incompleto. Segui le azioni richieste.';
        default: return 'In attesa di valutazione.';
    }
};

const formatStatus = (status) => {
    const map = {
        'OK': 'Completo',
        'MISSING': 'Mancante',
        'EXCELLENT': 'Eccellente',
        'WARNING': 'Da Verificare',
        'FILE_ONLY': 'In Analisi',
        'CRITICAL': 'Critico',
        'EMPTY': 'Assente'
    };
    return map[status] || status;
};

const getStatusClass = (status) => {
    if (['OK', 'EXCELLENT'].includes(status)) return 'status-green';
    if (['MISSING', 'CRITICAL'].includes(status)) return 'status-red';
    if (['WARNING', 'FILE_ONLY'].includes(status)) return 'status-orange';
    return 'status-gray';
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.compliance-modal { max-width: 500px; }

/* HEADER SCORE */
.score-header { display: flex; align-items: center; gap: 20px; padding: 20px; border-radius: 12px; margin-bottom: 20px; color: white; }
.theme-bronze { background: linear-gradient(135deg, #CD7F32, #8B4513); }
.theme-silver { background: linear-gradient(135deg, #9E9E9E, #616161); }
.theme-gold { background: linear-gradient(135deg, #FFD700, #B8860B); }
.theme-platinum { background: linear-gradient(135deg, #00f2fe, #4facfe); }

.score-circle { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-direction: column; border: 3px solid rgba(255,255,255,0.5); }
.score-number { font-size: 2rem; font-weight: 800; line-height: 1; }
.score-max { font-size: 0.8rem; opacity: 0.8; }

.level-info { flex: 1; }
.level-badge { font-size: 1.2rem; font-weight: 800; letter-spacing: 1px; }
.level-desc { margin: 5px 0 0 0; font-size: 0.85rem; opacity: 0.9; }

/* AZIONI MANCANTI */
.missing-actions { background: rgba(239, 68, 68, 0.05); border: 1px dashed rgba(239, 68, 68, 0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px; }
.missing-actions h4 { color: #ef4444; margin: 0 0 10px 0; font-size: 0.95rem; }
.action-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.action-list li { font-size: 0.9rem; display: flex; align-items: center; gap: 8px; color: var(--text-main); }
.bullet { font-size: 0.8rem; }

.all-good { background: rgba(22, 163, 74, 0.05); border: 1px solid rgba(22, 163, 74, 0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
.all-good h4 { color: #16a34a; margin: 0 0 5px 0; }
.all-good p { margin: 0; font-size: 0.9rem; color: var(--text-muted); }

/* BREAKDOWN GRID */
.breakdown-section h4 { margin: 0 0 15px 0; font-size: 0.95rem; color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 5px; }
.breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.bd-item { display: flex; align-items: center; gap: 10px; background: var(--bg-app); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); }
.bd-icon { font-size: 1.5rem; }
.bd-text { display: flex; flex-direction: column; }
.bd-label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.bd-status { font-size: 0.85rem; font-weight: 800; }

.status-green { color: #16a34a; }
.status-red { color: #ef4444; }
.status-orange { color: #d97706; }
.status-gray { color: #64748b; }

.modal-footer { display: flex; justify-content: space-between; align-items: center; }
.last-calc { font-size: 0.75rem; color: var(--text-muted); }
</style>
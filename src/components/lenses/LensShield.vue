<template>
  <div class="cards-stack fade-in delay-2">
    <div class="premium-card autonomy-card">
      <div class="autonomy-content">
        <div class="autonomy-text">
          <h3 class="card-question">Indipendenza Attuale</h3>
          <p class="insight-desc-compact">{{ insightDescShort }}</p>
        </div>
        <div class="autonomy-badge">
          <span class="percent-val">{{ autonomyPercent }}%</span>
        </div>
      </div>
      <div class="autonomy-mini-bar">
        <div class="mini-bar-fill" :style="{ width: autonomyPercent + '%' }"></div>
      </div>
    </div>

    <div class="premium-card market-card">
      <div class="market-header-row">
        <h3 class="card-question">Analisi di Mercato AI</h3>
        <button class="ai-badge-btn hover-scale" @click="$emit('openAiModal')">
          ✨ AI Analysis
        </button>
      </div>
      <div class="market-grid">
        <div class="market-mini-item">
          <label>Potenziale CER</label>
          <p>{{ marketInfo.cer_potential }}</p>
        </div>
        <div class="market-mini-item">
          <label>Flessibilità D&R</label>
          <p>{{ marketInfo.dr_potential }}</p>
        </div>
        <div class="market-mini-item full-width">
          <label>Note di Mercato</label>
          <p>{{ marketInfo.notes }}</p>
        </div>
      </div>
    </div>

    <div class="premium-card smart-card-premium">
      <div class="smart-header">
        <div class="icon-box-small">🛡️</div>
        <span class="smart-label">LA TUA MOSSA VINCENTE</span>
      </div>
      <h4 class="smart-solution-title">{{ smartCard.title }}</h4>
      <p class="smart-solution-desc">{{ smartCard.description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  autonomyPercent: { type: Number, default: 0 },
  insightDescShort: { type: String, default: '' },
  marketInfo: { type: Object, required: true },
  smartCard: { type: Object, required: true }
});

defineEmits(['openAiModal']);
</script>

<style scoped>
.cards-stack { display: flex; flex-direction: column; gap: 12px; }
.premium-card { padding: 14px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); transition: border-color 0.3s ease; }
.card-question { font-size: 13px; font-weight: 700; margin: 0 0 8px 0; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px; }

.autonomy-content { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.insight-desc-compact { font-size: 12px; color: var(--text-muted); line-height: 1.3; margin: 0; max-width: 75%; }
.autonomy-badge { background: var(--bg-app); padding: 8px 12px; border-radius: 12px; border: 1px solid var(--border-color); }
.percent-val { font-size: 20px; font-weight: 900; color: var(--accent); }
.autonomy-mini-bar { width: 100%; height: 4px; background: var(--border-color); border-radius: 4px; overflow: hidden; }
.mini-bar-fill { height: 100%; background: var(--accent); transition: width 1.5s ease; }

.market-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
.ai-badge-btn { background: rgba(59, 130, 246, 0.1); color: var(--accent); border: 1px solid var(--accent); padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.hover-scale:hover { transform: scale(1.02); }

.market-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.market-mini-item label { display: block; font-size: 9px; font-weight: 800; color: var(--accent); margin-bottom: 2px; text-transform: uppercase; }
.market-mini-item p { font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.2; }
.full-width { grid-column: span 2; border-top: 1px solid var(--border-color); padding-top: 8px; }

.smart-card-premium { border: 1px solid var(--accent); }
.smart-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.icon-box-small { color: var(--accent); width: 18px; height: 18px; font-size: 16px; }
.smart-label { font-size: 10px; font-weight: 900; color: var(--accent); letter-spacing: 1px; }
.smart-solution-title { font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; }
.smart-solution-desc { font-size: 13px; color: var(--text-muted); line-height: 1.4; margin: 0; }
</style>
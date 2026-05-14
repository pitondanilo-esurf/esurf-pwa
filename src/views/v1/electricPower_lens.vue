<template>
  <div class="vector-container">
    <div class="lens-nav">
      <button 
        v-for="(lens, key) in lensMap" 
        :key="key"
        class="lens-pill"
        :class="{ 'active': activeLens === key }"
        @click="activeLens = key"
      >
        <span class="pill-icon">{{ lens.icon }}</span>
        <span class="pill-label">{{ lens.label }}</span>
      </button>
    </div>

    <div class="lens-content">
      
      <div v-if="activeLens === 'wallet'" class="lens-fade">
        <div class="metric-hero">
          <span class="metric-value">€{{ aiAnalysis?.savings_potential_euro || '240' }}</span>
          <span class="metric-label">Risparmio annuo stimato</span>
        </div>
        <div class="insight-card">
          <p class="insight-text">
            Il tuo profilo suggerisce un'ottimizzazione sulle fasce F2 e F3. 
            Passando a un fornitore dinamico potresti abbattere la bolletta del {{ aiAnalysis?.percentage_improvement || '15' }}%.
          </p>
        </div>
      </div>

      <div v-else-if="activeLens === 'shield'" class="lens-fade">
        <div class="shield-visual">
          <div class="battery-container">
            <div class="battery-level" :style="{ height: (aiAnalysis?.autonomy_score || 45) + '%' }"></div>
            <div class="battery-text">{{ aiAnalysis?.autonomy_score || 45 }}%</div>
          </div>
          <h3 class="shield-title">Grado di Autonomia</h3>
        </div>
        <div class="insight-card highlight">
          <p class="insight-text">
            🛡️ <strong>Protezione attiva:</strong> Con la configurazione attuale dei tuoi asset, sei protetto dai picchi di mercato per quasi metà del tuo fabbisogno.
          </p>
        </div>
      </div>

      <div v-else-if="activeLens === 'planet'" class="lens-fade">
        <div class="planet-visual">
          <div class="co2-badge">
            <span class="co2-value">{{ aiAnalysis?.co2_saved || '1.2' }}</span>
            <span class="co2-unit">Tonnellate CO2 / Anno</span>
          </div>
          <div class="equivalence">
            🌳 Equivale a <strong>{{ Math.round((aiAnalysis?.co2_saved || 1.2) * 15) }} alberi</strong> piantati
          </div>
        </div>
        <div class="insight-card">
          <p class="insight-text">
            La tua impronta energetica è superiore alla media del 10%. 
            Ridurre gli sprechi in stand-by è il tuo primo passo verso il Net Zero.
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  aiAnalysis: {
    type: Object,
    default: () => ({})
  }
});

const activeLens = ref('wallet');

const lensMap = {
  wallet: { icon: '📉', label: 'Wallet' },
  shield: { icon: '🛡️', label: 'Shield' },
  planet: { icon: '🌿', label: 'Planet' }
};
</script>

<style scoped>
.vector-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Navigazione interna tra le lenti */
.lens-nav {
  display: flex;
  justify-content: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 14px;
  border: 1px solid var(--border-color);
}

.lens-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 11px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.lens-pill.active {
  background: var(--text-primary);
  color: var(--bg-app);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.pill-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

/* Animazioni e visualizzazione contenuti */
.lens-fade {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.metric-hero {
  text-align: center;
  padding: 30px 0;
}

.metric-value {
  display: block;
  font-size: 48px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -2px;
}

.metric-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
}

.insight-card {
  background: rgba(255, 255, 255, 0.03);
  padding: 20px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  line-height: 1.5;
}

.insight-card.highlight {
  border-left: 4px solid #3b82f6;
}

.insight-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}

/* SHIELD Visual */
.shield-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.battery-container {
  width: 70px;
  height: 120px;
  border: 3px solid var(--text-primary);
  border-radius: 10px;
  position: relative;
  padding: 4px;
  margin-bottom: 15px;
}

.battery-level {
  background: #3b82f6;
  border-radius: 4px;
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  transition: height 1s ease-in-out;
}

.battery-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 900;
  font-size: 14px;
  color: var(--text-primary);
  mix-blend-mode: difference;
}

/* PLANET Visual */
.planet-visual {
  text-align: center;
  padding: 20px 0;
}

.co2-badge {
  display: inline-flex;
  flex-direction: column;
  background: rgba(16, 185, 129, 0.1);
  padding: 20px;
  border-radius: 50%;
  width: 140px;
  height: 140px;
  justify-content: center;
  border: 1px solid rgba(16, 185, 129, 0.3);
  margin-bottom: 15px;
}

.co2-value {
  font-size: 32px;
  font-weight: 900;
  color: #10b981;
}

.co2-unit {
  font-size: 10px;
  font-weight: 700;
  color: #10b981;
}

.equivalence {
  font-size: 14px;
  color: var(--text-muted);
}
</style>
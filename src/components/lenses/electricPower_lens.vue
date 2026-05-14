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
        <LensWallet 
          :optimizationAmount="walletAmount" 
        />
      </div>

      <div v-else-if="activeLens === 'shield'" class="lens-fade">
        <LensShield 
          :autonomyPercent="shieldAutonomy"
          :insightDescShort="shieldInsight"
          :marketInfo="shieldMarket"
          :smartCard="shieldSmartCard"
          @openAiModal="$emit('openAiModal')"
        />
      </div>

      <div v-else-if="activeLens === 'planet'" class="lens-fade">
        <LensPlanet 
          :targetCo2="planetCo2" 
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Importazione dei componenti Lente 
import LensWallet from '@/components/lenses/LensWallet.vue';
import LensShield from '@/components/lenses/LensShield.vue';
import LensPlanet from '@/components/lenses/LensPlanet.vue';

const props = defineProps({
  aiAnalysis: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['openAiModal']);

const activeLens = ref('wallet');

const lensMap = {
  wallet: { icon: '📉', label: 'Wallet' },
  shield: { icon: '🛡️', label: 'Shield' },
  planet: { icon: '🌿', label: 'Planet' }
};

// --- MAPPING DATI AI -> PROP DEI COMPONENTI LENTE ---

// Dati per LensWallet
const walletAmount = computed(() => {
  return Number(props.aiAnalysis?.savings_potential_euro) || 240;
});

// Dati per LensPlanet
const planetCo2 = computed(() => {
  return Number(props.aiAnalysis?.co2_saved) || 1.2;
});

// Dati per LensShield
const shieldAutonomy = computed(() => {
  return Number(props.aiAnalysis?.autonomy_score) || 45;
});

const shieldInsight = computed(() => {
  return props.aiAnalysis?.insight_problem || "Ottimizzazione fasce di prelievo raccomandata per il tuo profilo di carico.";
});

const shieldMarket = computed(() => ({
  cer_potential: props.aiAnalysis?.CER_potential || 'Da valutare',
  dr_potential: props.aiAnalysis?.['D&R_potential'] || 'Da valutare',
  notes: props.aiAnalysis?.market_notes || 'Nessuna nota di mercato specifica rilevata per questa utenza.'
}));

const shieldSmartCard = computed(() => ({
  title: "Azione Consigliata AI",
  description: `Il tuo profilo suggerisce un'ottimizzazione sulle fasce F2 e F3. Passando a un fornitore dinamico potresti abbattere la bolletta del ${props.aiAnalysis?.percentage_improvement || '15'}%.`
}));

</script>

<style scoped>
.vector-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Navigazione interna tra le lenti (Stile "Pill") */
.lens-nav {
  display: flex;
  justify-content: center;
  gap: 8px;
  background: var(--bg-card);
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
  color: var(--bg-card);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.pill-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

/* Animazioni di transizione tra i componenti Lente */
.lens-fade {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
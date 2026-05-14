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
        <water_LensWallet 
          :optimizationAmount="walletAmount" 
          :usageType="usageType"
          :componentsNum="componentsNum"
        />
      </div>

      <div v-else-if="activeLens === 'shield'" class="lens-fade">
        <water_LensShield 
          :efficiencyPercent="shieldEfficiency"
          :insightDescShort="shieldInsight"
          :marketInfo="shieldMarket"
          :smartCard="shieldSmartCard"
          @openAiModal="$emit('openAiModal')"
        />
      </div>

      <div v-else-if="activeLens === 'planet'" class="lens-fade">
        <water_LensPlanet 
          :targetVolumeMc="planetVolumeMc" 
          :componentsNum="componentsNum"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Importazione dei nuovi componenti specifici per l'acqua
import water_LensWallet from '@/components/lenses/water_LensWallet.vue';
import water_LensShield from '@/components/lenses/water_LensShield.vue';
import water_LensPlanet from '@/components/lenses/water_LensPlanet.vue';

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

// --- MAPPING DATI JSON AI ACQUA -> COMPONENTI ---

// WALLET: Stima risparmio (15% su un costo medio basato sui dati)
const walletAmount = computed(() => {
  // Se 91€ sono per ~5 mesi, stimiamo l'annuale a circa 220€ e calcoliamo il 15%
  return Math.round(220 * 0.15); 
});

const usageType = computed(() => {
  return props.aiAnalysis?.usage_type || 'Uso Domestico';
});

const componentsNum = computed(() => {
  return props.aiAnalysis?.components_num || 1;
});

// PLANET: Passiamo i metri cubi per farli convertire in litri
const planetVolumeMc = computed(() => {
  return props.aiAnalysis?.consumption?.annual_mc || 103;
});

// SHIELD: Efficienza e note contatore
const shieldEfficiency = computed(() => {
  // Il contatore ULTRASONICO è il top di gamma, offre teleletture precisissime
  return props.aiAnalysis?.meter_type?.toUpperCase() === 'ULTRASONICO' ? 98 : 70;
});

const shieldInsight = computed(() => {
  return `Copertura ottimale. Il tuo contatore ${props.aiAnalysis?.meter_type || 'standard'} garantisce precisione nella fatturazione.`;
});

const shieldMarket = computed(() => ({
  cost_acquedotto: props.aiAnalysis?.cost_breakdown?.acquedotto || '30.38',
  meter_type: props.aiAnalysis?.meter_type || 'Standard',
  notes: `${props.aiAnalysis?.tariff_type || 'Tariffa Domestica'} (${props.aiAnalysis?.components_num || 3} componenti).`
}));

const shieldSmartCard = computed(() => {
  if (props.aiAnalysis?.meter_type?.toUpperCase() === 'ULTRASONICO') {
    return {
      title: "Telemetria Attiva",
      description: "Il tuo contatore Ultrasonico permette una lettura millimetrica. L'AI può monitorare i micro-flussi notturni per avvisarti immediatamente in caso di perdite occulte."
    };
  }
  return {
    title: "Allarme Perdite",
    description: "I sistemi meccanici faticano a leggere le micro-perdite. Ti suggeriamo di chiudere tutti i rubinetti e verificare se la rotellina del contatore gira."
  };
});

</script>

<style scoped>
.vector-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

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
  background: #06b6d4; /* Accento Azzurro Acqua */
  color: #fff;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
}

.pill-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.lens-fade {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
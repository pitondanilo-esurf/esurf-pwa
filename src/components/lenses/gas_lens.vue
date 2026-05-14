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
        <gas_LensWallet 
          :optimizationAmount="walletAmount" 
          :usageType="usageType"
        />
      </div>

      <div v-else-if="activeLens === 'shield'" class="lens-fade">
        <gas_LensShield 
          :efficiencyPercent="shieldEfficiency"
          :insightDescShort="shieldInsight"
          :marketInfo="shieldMarket"
          :smartCard="shieldSmartCard"
          @openAiModal="$emit('openAiModal')"
        />
      </div>

      <div v-else-if="activeLens === 'planet'" class="lens-fade">
        <gas_LensPlanet 
          :targetCo2="planetCo2" 
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Importazione dei nuovi componenti specifici per il gas
import gas_LensWallet from '@/components/lenses/gas_LensWallet.vue';
import gas_LensShield from '@/components/lenses/gas_LensShield.vue';
import gas_LensPlanet from '@/components/lenses/gas_LensPlanet.vue';

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

// --- MAPPING DATI JSON AI GAS -> COMPONENTI ---

// WALLET: Calcola potenziale risparmio (es. stima del 15% sul totale annuo o basato su Smc)
const walletAmount = computed(() => {
  const smc = props.aiAnalysis?.consumption?.annual_smc || 1397;
  const unitCost = props.aiAnalysis?.average_unit_cost_smc || 0.69;
  return Math.round((smc * unitCost) * 0.15); // Stima 15% ottimizzazione
});

const usageType = computed(() => {
  return props.aiAnalysis?.usage_type || 'Riscaldamento';
});

// PLANET: 1 Smc di gas genera circa 2.02 kg di CO2. Dividiamo per 1000 per le Tonnellate.
const planetCo2 = computed(() => {
  const smc = props.aiAnalysis?.consumption?.annual_smc || 1397;
  return Number(((smc * 2.02) / 1000).toFixed(1));
});

// SHIELD: Efficienza e note di mercato
const shieldEfficiency = computed(() => {
  // Punteggio base basato sul tipo di contatore (Tradizionale abbassa un po' l'efficienza percepita/gestibilità)
  return props.aiAnalysis?.meter_type === 'Tradizionale' ? 68 : 85;
});

const shieldInsight = computed(() => {
  return `Profilo di consumo: ${props.aiAnalysis?.consumption?.annual_smc || 1397} Smc/anno. Picchi rilevati nel mese di Gennaio.`;
});

const shieldMarket = computed(() => ({
  unit_cost: props.aiAnalysis?.average_unit_cost_smc ? Number(props.aiAnalysis.average_unit_cost_smc).toFixed(3) : 'N/D',
  meter_type: props.aiAnalysis?.meter_type || 'Sconosciuto',
  notes: `Contratto: ${props.aiAnalysis?.contract_type || 'Sconosciuto'} (${props.aiAnalysis?.price_type === 'VARIABLE' ? 'Prezzo Variabile' : 'Prezzo Fisso'}).`
}));

const shieldSmartCard = computed(() => {
  if (props.aiAnalysis?.meter_type === 'Tradizionale') {
    return {
      title: "Aggiornamento Meter",
      description: "Il tuo contatore Tradizionale in classe G4 potrebbe impedire teleletture precise. Un passaggio allo Smart Meter eliminerebbe i conguagli stimati."
    };
  }
  return {
    title: "Scudo Tariffario",
    description: "Il tuo contratto variabile ti espone ai picchi invernali. L'AI terrà traccia del mercato per segnalarti quando bloccare una tariffa fissa."
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
  background: #f59e0b; /* Accento arancione Gas */
  color: #fff;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
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
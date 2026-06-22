<template>
  <div v-if="isImpianto" class="realtime-banner mt-3">
    
    <div class="rt-header">
      <div class="flex-align gap-2">
        <div class="live-indicator" :class="{ 'pulsing': hasData, 'waiting': !hasData }"></div>
        <h4 class="m-0">Telemetria Impianto LIVE</h4>
      </div>
      <div v-if="hasData && rt" class="rt-timestamp">
        Sincronizzato: {{ rt.timestamp }}
      </div>
    </div>

    <div v-if="impiantoInfo" class="rt-meta-row">
      <div class="meta-item">
        <span class="meta-label">Inverter:</span>
        <span class="meta-value f-accent">{{ impiantoInfo.brand }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Potenza Impianto:</span>
        <span class="meta-value">{{ impiantoInfo.potenza_picco_kwp }} kWp</span>
      </div>
      <div v-if="impiantoInfo.nome" class="meta-item">
        <span class="meta-label">Nome:</span>
        <span class="meta-value">{{ impiantoInfo.nome }}</span>
      </div>
      
      <button @click.stop="$emit('open-chart')" class="btn-chart-rt" title="Visualizza Grafico Storico Impianto">
        📈 Grafico Storico
      </button>
    </div>

    <div v-if="hasData && rt" class="rt-dashboard">
      
      <div class="rt-card solar">
        <div class="rt-label">☀️ Produzione Solare</div>
        <div class="rt-value">{{ formatW(rt.flusso_solare_w) }} <span class="unit">kW</span></div>
      </div>

      <div class="rt-card load">
        <div class="rt-label">🏠 Consumo Casa</div>
        <div class="rt-value">{{ formatW(rt.flusso_casa_w) }} <span class="unit">kW</span></div>
      </div>

      <div class="rt-card grid" :class="rt.flusso_rete_w >= 0 ? 'grid-import' : 'grid-export'">
        <div class="rt-label">{{ rt.flusso_rete_w >= 0 ? '📥 Prelievo Rete' : '📤 Immissione Rete' }}</div>
        <div class="rt-value">{{ formatW(Math.abs(rt.flusso_rete_w)) }} <span class="unit">kW</span></div>
      </div>

      <div v-if="showBattery" class="rt-card battery">
        <div class="rt-label">🔋 Batteria ({{ rt.batteria_soc_percentuale !== undefined ? rt.batteria_soc_percentuale : '--' }}%)</div>
        <div class="rt-value" :class="getBatteryColor(rt.batteria_stato)">
          {{ formatW(rt.batteria_potenza_w) }} <span class="unit">kW</span>
        </div>
        
        <div class="rt-storage-info">
          <span>Stato: <strong :class="getBatteryColor(rt.batteria_stato)">{{ translateBatteryState(rt.batteria_stato) }}</strong></span>
          <span v-if="impiantoInfo?.bess_capacity_kwh">Capacità: <strong>{{ impiantoInfo.bess_capacity_kwh }} kWh</strong></span>
          <span v-if="impiantoInfo?.bess_max_power_kw">Max Pow: <strong>{{ impiantoInfo.bess_max_power_kw }} kW</strong></span>
        </div>
      </div>

      <div class="rt-card info-full">
        <span class="mr-3">📅 Oggi: <strong>{{ (rt.energia_oggi_wh / 1000).toFixed(1) }} kWh</strong></span>
        <span>📊 Mese: <strong>{{ (rt.energia_mese_wh / 1000).toFixed(1) }} kWh</strong></span>
      </div>
    </div>

    <div v-else-if="loading || !hasData" class="rt-error-state">
      <p class="mb-0"><em>Dati in attesa di sincronizzazione con il campo...</em></p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue';
import axios from '@/services/axios'; 

const props = defineProps({
  podId: { type: String, required: true },
  isExpanded: { type: Boolean, default: false }
});

const emit = defineEmits(['open-chart']);

const isImpianto = ref(false);
const hasData = ref(false);
const loading = ref(true);
const rt = ref(null);
const impiantoInfo = ref(null);
let pollingTimer = null; 

const hasBatteryConfig = computed(() => impiantoInfo.value?.has_bess === true);
const hasBatteryLiveData = computed(() => rt.value && rt.value.batteria_soc_percentuale !== null && rt.value.batteria_soc_percentuale !== undefined);
const showBattery = computed(() => hasBatteryConfig.value || hasBatteryLiveData.value);

const translateBatteryState = (state) => {
  if (!state) return 'Sconosciuto';
  const s = state.toLowerCase();
  if (s === 'charging') return 'In Carica ⚡';
  if (s === 'discharging') return 'In Scarica 🔋';
  if (s === 'idle' || s === 'standby') return 'Standby ⏸️';
  return state;
};

const getBatteryColor = (state) => {
  if (!state) return 'text-muted';
  const s = state.toLowerCase();
  if (s === 'charging') return 'text-charging';
  if (s === 'discharging') return 'text-discharging';
  return 'text-muted';
};

const formatW = (watts) => {
  if (watts === null || watts === undefined) return "0.00";
  return (watts / 1000).toFixed(2);
};

const fermaPolling = () => {
  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }
};

const fetchRealTimeData = async () => {
  try {
    const res = await axios.get(`/api/realtime/${props.podId}`);
    const data = res.data;

    isImpianto.value = data.is_impianto;
    hasData.value = data.has_data;
    
    if (data.impianto_info) {
      impiantoInfo.value = data.impianto_info;
    }

    if (data.has_data) {
      rt.value = data.realtime;
    }
  } catch (error) {
    console.error(`❌ Errore API real-time:`, error);
  } finally {
    loading.value = false;
  }
};

const cicloPolling = async () => {
  if (!props.isExpanded) {
    fermaPolling();
    return;
  }
  await fetchRealTimeData();
  if (isImpianto.value) {
    pollingTimer = setTimeout(cicloPolling, 15000);
  }
};

watch(() => props.isExpanded, (expanded) => {
  if (expanded) {
    fermaPolling(); 
    cicloPolling();
  } else {
    fermaPolling();
  }
}, { immediate: true });

onUnmounted(() => fermaPolling());
</script>

<style scoped>
/* SOSTITUITI COLORI HARDCODED CON VARIABILI CSS */
.realtime-banner {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 15px;
  color: var(--text-main);
}
.rt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.rt-timestamp { color: var(--text-muted); font-size: 0.8rem; }

.rt-meta-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: 15px; margin-bottom: 15px; padding: 10px 14px;
  background: var(--bg-app); border-radius: 8px; border: 1px dashed var(--border-color);
  font-size: 0.8rem;
}
.meta-item { display: flex; align-items: center; gap: 6px; }
.meta-label { color: var(--text-muted); text-transform: uppercase; font-size: 0.65rem; font-weight: 600;}
.meta-value { font-weight: 700; color: var(--text-main); font-family: 'JetBrains Mono', monospace; }
.f-accent { color: #38bdf8; } 

.btn-chart-rt {
  margin-left: auto;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}
.btn-chart-rt:hover {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.rt-dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }

/* RT CARD: Adattata al tema chiaro/scuro */
.rt-card { 
  background: var(--bg-card); 
  padding: 12px; 
  border-radius: 8px; 
  border: 1px solid var(--border-color);
  border-left-width: 4px;
}
.rt-storage-info { 
  margin-top: 8px; font-size: 0.65rem; color: var(--text-muted); display: flex; flex-direction: column; 
  gap: 3px; border-top: 1px solid var(--border-color); padding-top: 6px;
}

/* Colori Dinamici (Rimangono assoluti perché semantici) */
.text-charging { color: #10b981 !important; }
.text-discharging { color: #f59e0b !important; }
.text-muted { color: var(--text-muted) !important; }

.solar { border-left-color: #f59e0b; }
.load { border-left-color: #3b82f6; }
.grid-import { border-left-color: #ef4444; }
.grid-export { border-left-color: #10b981; }
.battery { border-left-color: #8b5cf6; }

.info-full { grid-column: 1 / -1; background: transparent; border: none; font-size: 0.8rem; color: var(--text-muted); text-align: center; padding-top: 5px;}
.rt-value { font-size: 1.2rem; font-weight: bold; }
.unit { font-size: 0.8rem; color: var(--text-muted); }
.rt-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; }

.live-indicator { width: 10px; height: 10px; border-radius: 50%; }
.live-indicator.pulsing { background-color: #ef4444; animation: pulse-red 2s infinite; }
.live-indicator.waiting { background-color: var(--text-muted); }
.rt-error-state { text-align: center; padding: 15px; color: var(--text-muted); font-size: 0.9rem; }

@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
</style>
<template>
  <section class="monitor-row mb-5">
    <div class="monitor-grid">
      
      <div class="admin-card stats-card">
        <div class="card-header">
          <span class="label">Worker Keep-Alive</span>
          <div :class="['pulse-dot', workerHealth.status]"></div>
        </div>
        <div class="card-body">
          <h2 :class="workerHealth.status">{{ workerStatusLabel }}</h2>
          <p class="sub-text">Ultimo check: <span class="monospace">{{ workerHealth.last_run_formatted }}</span></p>
        </div>
      </div>

      <div class="admin-card stats-card">
        <div class="card-header"><span class="label">Esecuzione Attuale</span></div>
        <div class="card-body">
          <div class="flex-between">
            <div>
              <h2 class="text-white">{{ workerHealth.metrics?.total_processed || 0 }}</h2>
              <p class="sub-text">Impianti gestiti</p>
            </div>
            <div class="text-right">
              <h2 class="text-red">{{ workerHealth.metrics?.errors || 0 }}</h2>
              <p class="sub-text">Errori rilevati</p>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-card chart-box">
        <div class="card-header">
          <span class="label">Performance Integrazioni (48h)</span>
          <div class="chart-legend">
             <span class="leg-success">■ Successi</span>
             <span class="leg-error">■ Errori</span>
          </div>
        </div>
        
        <div class="canvas-container">
          <template v-if="chartData.length > 0">
            <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none" style="overflow: visible;">
              <defs>
                <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(16, 185, 129, 0.2)" />
                  <stop offset="100%" stop-color="rgba(16, 185, 129, 0.0)" />
                </linearGradient>
              </defs>

              <line v-for="i in 4" :key="'grid'+i" x1="0" :y1="(i-1)*25" x2="300" :y2="(i-1)*25" stroke="rgba(51, 65, 85, 0.5)" stroke-width="0.5" stroke-dasharray="2 4"/>
              
              <text v-for="i in 4" :key="'lbl'+i" x="-5" :y="(i-1)*25 + 3" fill="#64748b" font-size="6" font-family="monospace" text-anchor="end">
                {{ Math.round(maxChartValue - ((i-1)/3) * maxChartValue) }}
              </text>

              <path :d="pathSuccessArea" fill="url(#successGrad)" />
              <path :d="pathSuccessLine" fill="none" stroke="#10b981" stroke-width="1.5" />
              <path :d="pathErrorLine" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 3" />
            </svg>
          </template>
          <div v-else class="empty-chart">
            <span v-if="isLoadingCsv">Caricamento dati storici...</span>
            <span v-else>Nessun dato CSV rilevato nelle ultime 48h.</span>
          </div>
        </div>

        <div class="chart-footer">
          <span>{{ csvStats.startTime }}</span>
          <span>Eventi: {{ csvStats.count }}</span>
          <span>{{ csvStats.endTime }}</span>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from '@/services/axios';
import Papa from 'papaparse'; // Manteniamo PapaParse per leggere il CSV comodamente

// --- STATO E VARIABILI ---
const workerHealth = ref({ status: 'offline', last_run_formatted: '--', metrics: {} });
const chartData = ref([]);
const csvStats = ref({ count: 0, startTime: '--', endTime: '--' });
const isLoadingCsv = ref(true);
let healthInterval = null;

const workerStatusLabel = computed(() => {
  if (workerHealth.value.status === 'healthy') return 'OPERATIVO';
  if (workerHealth.value.status === 'degraded') return 'DEGRADATO';
  return 'OFFLINE';
});

// --- FETCH HEALTH (Valkey) ---
const getHealthStatus = async () => {
  try {
    const res = await axios.get('/api/admin/worker-health');
    if (res.data) {
      workerHealth.value = {
        ...res.data,
        last_run_formatted: new Date(res.data.last_run).toLocaleTimeString()
      };
    } else {
      workerHealth.value.status = 'offline';
    }
  } catch (e) {
    workerHealth.value.status = 'offline';
  }
};

// --- FETCH CSV (Storico) ---
const loadCsvData = async () => {
  try {
    //const res = await axios.get('/stats/worker_metrics.csv');
    const res = await axios.get('/api/admin/worker-metrics-csv');
    Papa.parse(res.data, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Filtra eventi ultime 48h
        const last48h = results.data.filter(row => {
          if (!row.timestamp) return false;
          const diff = (new Date() - new Date(row.timestamp)) / (1000 * 60 * 60);
          return diff <= 48;
        });

        if (last48h.length > 0) {
          chartData.value = last48h;
          csvStats.value.count = last48h.length;
          csvStats.value.startTime = new Date(last48h[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          csvStats.value.endTime = new Date(last48h[last48h.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        isLoadingCsv.value = false;
      }
    });
  } catch (e) {
    console.warn("Nessun CSV statistico trovato o errore di rete.", e);
    isLoadingCsv.value = false;
  }
};

// --- LOGICA GRAFICO SVG NATIVO ---
// Trova il valore massimo (tra successi ed errori) per scalare l'asse Y
const maxChartValue = computed(() => {
  if (chartData.value.length === 0) return 10;
  const maxVal = Math.max(...chartData.value.map(d => Math.max(d.success || 0, d.errors || 0)));
  return maxVal < 5 ? 5 : maxVal * 1.2; // Minimo scala 5, aggiunge 20% di padding sopra
});

// Funzione generatrice di path SVG (stessa logica del file RoiAssessment)
const getPath = (dataKey, isArea) => {
  if (chartData.value.length === 0) return '';
  const w = 300;
  const h = 75; // Altezza massima del disegno (lascia 25px per le labels sotto)
  const maxV = maxChartValue.value;
  const dx = chartData.value.length > 1 ? w / (chartData.value.length - 1) : w;

  let dStr = isArea 
    ? `M 0,${h} ` 
    : `M 0,${h - ((chartData.value[0][dataKey] || 0) / maxV) * h} `;

  chartData.value.forEach((point, i) => {
    const x = i * dx;
    const y = h - ((point[dataKey] || 0) / maxV) * h;
    dStr += `L ${x},${y} `;
  });

  if (isArea) {
    dStr += `L ${w},${h} Z`;
  }
  return dStr;
};

const pathSuccessArea = computed(() => getPath('success', true));
const pathSuccessLine = computed(() => getPath('success', false));
const pathErrorLine = computed(() => getPath('errors', false));

// --- CICLO DI VITA ---
onMounted(async () => {
  await getHealthStatus();
  await loadCsvData();
  healthInterval = setInterval(getHealthStatus, 30000); // Polling ogni 30s
});

onUnmounted(() => {
  if (healthInterval) clearInterval(healthInterval);
});
</script>

<style scoped>
/* ========================================= */
/* STILI DASHBOARD MONITORAGGIO (FINTECH)    */
/* ========================================= */
.mb-5 { margin-bottom: 2.5rem; }

.monitor-grid {
  display: grid;
  grid-template-columns: 250px 250px 1fr;
  gap: 1.5rem;
}

.admin-card { 
  background: #1e293b; 
  border-radius: 12px; 
  border: 1px solid #334155; 
}

.stats-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  min-height: 140px;
}

.chart-box {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.canvas-container { 
  flex-grow: 1; 
  min-height: 80px; 
  position: relative;
  width: 100%;
  padding-left: 15px; /* Spazio per le label Y */
  padding-top: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 1px;
}

.sub-text { font-size: 0.75rem; color: #64748b; margin-top: 5px; }
.monospace { font-family: 'JetBrains Mono', 'Courier New', monospace; }
h2 { font-size: 1.8rem; font-weight: 800; margin: 0; letter-spacing: -1px; }

/* Legenda Chart Nativa */
.chart-legend { display: flex; gap: 10px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;}
.leg-success { color: #10b981; }
.leg-error { color: #ef4444; }

/* Colori Stati Worker */
.text-white { color: #f8fafc; }
.text-red { color: #ef4444; }
h2.healthy { color: #10b981; }
h2.degraded { color: #f59e0b; }
h2.offline { color: #64748b; }

/* Pulse Animation Status */
.pulse-dot { width: 10px; height: 10px; border-radius: 50%; position: relative; }
.pulse-dot.healthy { background: #10b981; box-shadow: 0 0 10px #10b981; animation: pulse-green 2s infinite; }
.pulse-dot.degraded { background: #f59e0b; animation: pulse-orange 2s infinite; }
.pulse-dot.offline { background: #ef4444; }

@keyframes pulse-green {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
@keyframes pulse-orange {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

.chart-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: #475569;
  margin-top: 5px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}

.flex-between { display: flex; justify-content: space-between; width: 100%; align-items: center;}
.text-right { text-align: right; }

.empty-chart {
  display: flex; align-items: center; justify-content: center;
  height: 100%; color: #475569; font-size: 0.8rem;
}

/* Responsive Dashboard */
@media (max-width: 1024px) {
  .monitor-grid { grid-template-columns: 1fr 1fr; }
  .chart-box { grid-column: span 2; }
}
@media (max-width: 600px) {
  .monitor-grid { grid-template-columns: 1fr; }
  .chart-box { grid-column: span 1; }
}
</style>
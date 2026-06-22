<template>
  <div class="admin-card mt-4">
    <div class="header-left mb-4">
      <h2>
        <p>Storico Impianto: </p><span class="text-blue">{{ nomeImpianto || 'Caricamento...' }}</span>
        <p>POD: </p><span class="text-gray" style="font-weight: 700;">{{ props.podId || 'Caricamento...' }}</span>
      </h2>
      <p class="subtitle">Andamento flussi di potenza (Ultimi {{ giorniDisponibili.length }} Giorni)</p>
    </div>

    <div v-if="loading" class="empty-text">Recupero dati in corso...</div>
    <div v-else-if="!rawData || rawData.length === 0" class="empty-text">
      Nessun dato disponibile per questo impianto.
    </div>
    
    <div v-else class="charts-wrapper">
      
      <div class="filters-container mb-3">
        <button 
          @click="impostaGiorno(null)" 
          class="btn-filter" 
          :class="{ active: giornoSelezionato === null }"
        >
          Panoramica ({{ giorniDisponibili.length }} Giorni)
        </button>
        
        <button 
          v-for="(giorno, index) in giorniDisponibili" 
          :key="giorno"
          @click="impostaGiorno(giorno)"
          class="btn-filter"
          :class="{ active: giornoSelezionato === giorno }"
        >
          Giorno {{ index + 1 }}
          <span class="btn-date">{{ formattaDataBreve(giorno) }}</span>
        </button>
      </div>

      <div class="chart-section">
        <div class="flex-align mb-2" style="justify-content: space-between;">
          <div class="flex-gap legenda">
            <span class="status-badge" style="color: #F59E0B; border-color: #F59E0B;">■ Produzione Solare</span>
            <span class="status-badge" style="color: #3B82F6; border-color: #3B82F6;">■ Consumo Casa</span>
            <span class="status-badge" style="color: #A855F7; border-color: #A855F7;">■ Contributo Batteria</span>
          </div>
        </div>

        <div class="chart-container">
          <svg v-if="storico.length > 0" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="custom-chart" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradSolare" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F59E0B" stop-opacity="0.3"/><stop offset="100%" stop-color="#F59E0B" stop-opacity="0"/></linearGradient>
              <linearGradient id="gradCasa" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3B82F6" stop-opacity="0.2"/><stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/></linearGradient>
              <linearGradient id="gradBatt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A855F7" stop-opacity="0.2"/><stop offset="100%" stop-color="#A855F7" stop-opacity="0"/></linearGradient>
            </defs>

            <g class="grid">
              <template v-for="n in 5" :key="`h-grid-main-${n}`">
                <text x="35" :y="getGridY(n, svgHeight) + 4" class="axis-label">{{ formatYLabel((maxMainValue / 4) * (n - 1)) }}</text>
                <line x1="45" :y1="getGridY(n, svgHeight)" :x2="svgWidth" :y2="getGridY(n, svgHeight)" />
              </template>
            </g>
            <g class="grid-vertical">
              <line v-for="n in 7" :key="`v-grid-main-${n}`" :x1="getGridX(n)" y1="0" :x2="getGridX(n)" :y2="svgHeight" />
            </g>
            
            <path :d="getPathMain('flusso_casa_w', true)" fill="url(#gradCasa)" class="area-path" />
            <path :d="getPathMain('flusso_solare_w', true)" fill="url(#gradSolare)" class="area-path" />
            <path :d="getPathContributoBatteria(true)" fill="url(#gradBatt)" class="area-path" />

            <path :d="getPathMain('flusso_casa_w')" fill="none" stroke="#3B82F6" stroke-width="2" class="line-path" />
            <path :d="getPathMain('flusso_solare_w')" fill="none" stroke="#F59E0B" stroke-width="2.5" class="line-path" />
            <path :d="getPathContributoBatteria()" fill="none" stroke="#A855F7" stroke-width="2" stroke-dasharray="4,2" class="line-path" />
          </svg>
        </div>
      </div>

      <div class="chart-section mt-3">
        <div class="flex-align mb-2" style="justify-content: space-between;">
          <span class="status-badge" style="color: #10B981; border-color: #10B981;">■ Rete (+ Prelievo / - Immissione)</span>
        </div>
        
        <div class="chart-container small">
          <svg v-if="storico.length > 0" :viewBox="`0 0 ${svgWidth} ${svgHeightSmall}`" class="custom-chart" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradRete" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#10B981" stop-opacity="0.3"/><stop offset="100%" stop-color="#10B981" stop-opacity="0"/></linearGradient>
            </defs>

            <g class="grid">
              <text x="35" :y="12" class="axis-label">+{{ formatYLabel(maxReteValue) }}</text>
              <text x="35" :y="svgHeightSmall / 2 + 3" class="axis-label">0</text>
              <text x="35" :y="svgHeightSmall - 4" class="axis-label">-{{ formatYLabel(maxReteValue) }}</text>
              
              <line x1="45" :y1="svgHeightSmall / 2" :x2="svgWidth" :y2="svgHeightSmall / 2" class="grid-center" />
            </g>
            <g class="grid-vertical">
              <line v-for="n in 7" :key="`v-grid-rete-${n}`" :x1="getGridX(n)" y1="0" :x2="getGridX(n)" :y2="svgHeightSmall" />
            </g>
            
            <path :d="getPathRete(true)" fill="url(#gradRete)" class="area-path" />
            <path :d="getPathRete()" fill="none" stroke="#10B981" stroke-width="2" class="line-path" />
          </svg>
        </div>
      </div>

      <div class="chart-section mt-3">
        <div class="flex-align mb-2" style="justify-content: space-between;">
          <span class="status-badge" style="color: #8B5CF6; border-color: #8B5CF6;">■ Stato Carica Batteria (SOC %)</span>
        </div>
        
        <div class="chart-container extra-small">
          <svg v-if="storico.length > 0" :viewBox="`0 0 ${svgWidth} ${svgHeightExtraSmall}`" class="custom-chart" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradSOC" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.4"/><stop offset="100%" stop-color="#8B5CF6" stop-opacity="0"/></linearGradient>
            </defs>

            <g class="grid">
              <text x="35" y="10" class="axis-label">100%</text>
              <text x="35" :y="svgHeightExtraSmall / 2 + 3" class="axis-label">50%</text>
              <text x="35" :y="svgHeightExtraSmall - 2" class="axis-label">0%</text>

              <line x1="45" y1="0" :x2="svgWidth" :y2="0" />
              <line x1="45" :y1="svgHeightExtraSmall / 2" :x2="svgWidth" :y2="svgHeightExtraSmall / 2" />
              <line x1="45" :y1="svgHeightExtraSmall" :x2="svgWidth" :y2="svgHeightExtraSmall" />
            </g>
            <g class="grid-vertical">
              <line v-for="n in 7" :key="`v-grid-batt-${n}`" :x1="getGridX(n)" y1="0" :x2="getGridX(n)" :y2="svgHeightExtraSmall" />
            </g>
            
            <path :d="getPathSOC(true)" fill="url(#gradSOC)" class="area-path" />
            <path :d="getPathSOC()" fill="none" stroke="#8B5CF6" stroke-width="2.5" class="line-path" />
          </svg>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminService from '@/services/AdminService.js';

const props = defineProps({
  podId: { type: String, required: true }
});

const loading = ref(true);
const rawData = ref([]); 
const nomeImpianto = ref('');
const giornoSelezionato = ref(null); 

const svgWidth = 800;
const svgHeight = 250;           
const svgHeightSmall = 150;      
const svgHeightExtraSmall = 100; 
const padLeft = 45; // Spazio lasciato a sinistra per le etichette Y

const giorniDisponibili = computed(() => {
  if (!rawData.value || rawData.value.length === 0) return [];
  const days = new Set();
  rawData.value.forEach(d => {
    const datePart = d.timestamp.split(' ')[0];
    days.add(datePart);
  });
  return Array.from(days).sort();
});

const storico = computed(() => {
  if (!giornoSelezionato.value) return rawData.value;
  return rawData.value.filter(d => d.timestamp.startsWith(giornoSelezionato.value));
});

const impostaGiorno = (giorno) => {
  giornoSelezionato.value = giorno;
};

const formattaDataBreve = (dataString) => {
  const data = new Date(dataString);
  return data.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
};

const formatYLabel = (val) => {
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return Math.round(val);
};

const maxMainValue = computed(() => {
  if (!storico.value || storico.value.length === 0) return 1000;
  let max = 0;
  storico.value.forEach(d => {
    const quotaScaricaBatt = d.batteria_potenza_w < 0 ? Math.abs(d.batteria_potenza_w) : 0;
    max = Math.max(max, d.flusso_solare_w || 0, d.flusso_casa_w || 0, quotaScaricaBatt);
  });
  return max > 0 ? max * 1.1 : 1000;
});

const maxReteValue = computed(() => {
  if (!storico.value || storico.value.length === 0) return 1000;
  let max = 0;
  storico.value.forEach(d => {
    max = Math.max(max, Math.abs(d.flusso_rete_w || 0));
  });
  return max > 0 ? max * 1.1 : 1000;
});

// ============================================================
// FUNZIONE CORE: GENERATORE CURVE DI BEZIER
// ============================================================
const buildCurvedPath = (points, isArea, baseline) => {
  if (!points || points.length === 0) return "";
  let d = isArea ? `M ${points[0].x} ${baseline} L ${points[0].x} ${points[0].y}` : `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = points[i].x + (points[i+1].x - points[i].x) / 2;
    d += ` C ${cp1x} ${points[i].y}, ${cp1x} ${points[i+1].y}, ${points[i+1].x} ${points[i+1].y}`;
  }
  if (isArea) d += ` L ${points[points.length-1].x} ${baseline} Z`;
  return d;
};

// ============================================================
// FUNZIONI ESTRAZIONE PUNTI
// ============================================================
const getPathMain = (key, isArea = false) => {
  if (!storico.value || storico.value.length === 0) return "";
  const usableWidth = svgWidth - padLeft;
  const points = storico.value.map((d, index) => ({
    x: padLeft + (index / (storico.value.length - 1)) * usableWidth,
    y: svgHeight - ((d[key] || 0) / maxMainValue.value * svgHeight)
  }));
  return buildCurvedPath(points, isArea, svgHeight);
};

const getPathContributoBatteria = (isArea = false) => {
  if (!storico.value || storico.value.length === 0) return "";
  const usableWidth = svgWidth - padLeft;
  const points = storico.value.map((d, index) => {
    const val = d.batteria_potenza_w < 0 ? Math.abs(d.batteria_potenza_w) : 0;
    return {
      x: padLeft + (index / (storico.value.length - 1)) * usableWidth,
      y: svgHeight - (val / maxMainValue.value * svgHeight)
    };
  });
  return buildCurvedPath(points, isArea, svgHeight);
};

const getPathRete = (isArea = false) => {
  if (!storico.value || storico.value.length === 0) return "";
  const usableWidth = svgWidth - padLeft;
  const zeroY = svgHeightSmall / 2;
  const points = storico.value.map((d, index) => ({
    x: padLeft + (index / (storico.value.length - 1)) * usableWidth,
    y: zeroY - ((d.flusso_rete_w || 0) / maxReteValue.value * zeroY)
  }));
  return buildCurvedPath(points, isArea, zeroY); 
};

const getPathSOC = (isArea = false) => {
  if (!storico.value || storico.value.length === 0) return "";
  const usableWidth = svgWidth - padLeft;
  const points = storico.value.map((d, index) => ({
    x: padLeft + (index / (storico.value.length - 1)) * usableWidth,
    y: svgHeightExtraSmall - ((d.batteria_soc_percentuale || 0) / 100 * svgHeightExtraSmall)
  }));
  return buildCurvedPath(points, isArea, svgHeightExtraSmall);
};

const getGridY = (n, h) => h - ((n - 1) * (h / 4));
const getGridX = (n) => padLeft + ((n - 1) / 6) * (svgWidth - padLeft);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await AdminService.getStoricoPod(props.podId, 120); 
    nomeImpianto.value = res.data?.nome_impianto || 'Impianto Sconosciuto';
    rawData.value = res.data?.data || [];
  } catch (error) {
    console.error("Errore Storico:", error);
    rawData.value = []; 
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* CSS RESPONSIVO AL TEMA */
.admin-card { background: var(--bg-card); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-main); }
.header-left h2 { margin: 0; font-size: 1.25rem; font-weight: 500; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.header-left h2 p { margin: 0; font-size: 1.1rem; color: var(--text-muted); }
.subtitle { color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; margin-bottom: 0;}
.text-blue { color: #38bdf8; font-weight: 700; }

.text-gray { color: var(--text-main); background: var(--bg-app); padding: 2px 8px; border-radius: 6px; font-size: 0.95rem; border: 1px solid var(--border-color); }
.empty-text { text-align: center; color: var(--text-muted); padding: 2rem; font-style: italic; }

.status-badge { font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; background: var(--bg-app); border: 1px solid; }
.flex-gap { display: flex; gap: 12px; flex-wrap: wrap; }
.flex-align { display: flex; align-items: center; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mt-3 { margin-top: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }

/* === AGGIORNAMENTO SCROLLBAR FINTECH === */
.filters-container {
  display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px;
  scroll-behavior: smooth;
  /* Scrollbar compatibile Firefox */
  scrollbar-width: thin; 
  scrollbar-color: var(--border-color) var(--bg-app);
}

/* Scrollbar compatibile Webkit (Chrome, Edge, Safari) */
.filters-container::-webkit-scrollbar {
  height: 6px;
}
.filters-container::-webkit-scrollbar-track {
  background: var(--bg-app);
  border-radius: 4px;
}
.filters-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}
.filters-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.btn-filter {
  background: var(--bg-app); color: var(--text-muted); border: 1px solid var(--border-color);
  border-radius: 10px; padding: 8px 16px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column;
  align-items: center; min-width: 110px; flex-shrink: 0;
}
.btn-filter:hover { background: var(--bg-card); color: var(--text-main); border-color: var(--text-muted);}
.btn-filter.active { 
  background: linear-gradient(145deg, #2563eb, #1d4ed8); color: white; border-color: #3b82f6; 
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
.btn-date { font-size: 0.65rem; font-weight: 500; opacity: 0.9; margin-top: 3px; font-family: 'JetBrains Mono', monospace; }

.charts-wrapper { display: flex; flex-direction: column; gap: 16px; }

.chart-section { background: var(--bg-app); border-radius: 10px; padding: 12px; border: 1px solid var(--border-color);}

.chart-container {
  width: 100%; height: 250px; background: var(--bg-card);
  border-radius: 8px; border: 1px solid var(--border-color); padding: 10px 0; box-sizing: border-box; overflow: hidden;
}

.chart-container.small { height: 150px; }
.chart-container.extra-small { height: 100px; }
.custom-chart { width: 100%; height: 100%; overflow: visible; }

.axis-label {
  fill: var(--text-muted); font-size: 10px; font-weight: 600; font-family: 'JetBrains Mono', monospace; text-anchor: end;
}

.grid line { stroke: var(--border-color); stroke-width: 0.5; stroke-dasharray: 4,4; }
.grid-center { stroke: var(--text-muted); stroke-width: 1.5; stroke-dasharray: 4,4; }
.grid-vertical line { stroke: var(--border-color); stroke-width: 1; stroke-dasharray: 2,4; }

.line-path { stroke-dasharray: 0 5000; animation: drawLine 1.5s ease-out forwards; }
.area-path { opacity: 0; animation: fadeIn 1.5s ease-out forwards; }
@keyframes drawLine { to { stroke-dasharray: 5000 0; } }
@keyframes fadeIn { to { opacity: 1; } }
</style>
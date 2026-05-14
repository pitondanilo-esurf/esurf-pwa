<template>
  <div class="pv-app-wrapper">
    <div class="no-print">
      <GuideHeader :isLightMode="false" />
    </div>

    <div v-if="loading" class="loading-state no-print">
      <div class="spinner"></div>
      <p class="loader-text">SINCRONIZZAZIONE DATI E MODELLO PROFILING...</p>
    </div>

    <div v-else class="pv-container" :class="{ 'is-entered': entered }">
      
      <div class="p-header">
        <svg class="p-header-bg" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid slice">
          <line v-for="i in 11" :key="'h'+i" x1="0" :y1="(i-1)*20" x2="500" :y2="(i-1)*20" />
          <line v-for="i in 26" :key="'v'+i" :x1="(i-1)*20" y1="0" :x2="(i-1)*20" y2="200" />
        </svg>

        <div class="p-header-content">
          <div class="p-header-top">
            <div>
              <div class="p-kicker">ASSESSMENT FINANZIARIO CON FUTURE PROFILING</div>
              <h1 class="p-title">ROI Impianto Fotovoltaico</h1>
              <div class="p-subtitle">{{ activeAddressName }}</div>
            </div>
            
            <div class="p-kpi-grid">
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: #C8A850;">Produzione FV</div>
                <div class="p-kpi-val" style="color: #C8A050;">{{ annualProduction.toFixed(0) }} <span style="font-size: 10px;">kWh</span></div>
              </div>
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: #4ABA6B;">Risparmio Bolletta</div>
                <div class="p-kpi-val" style="color: #4ABA6B;">€{{ directSavings.toFixed(0) }} <span style="font-size: 10px;">/a</span></div>
              </div>
              <div class="p-kpi-cell" style="background: rgba(74, 139, 186, 0.05); border-bottom: 2px solid #4A8BBA;">
                <div class="p-kpi-lbl" style="color: #4A8BBA;">Beneficio Totale</div>
                <div class="p-kpi-val" style="color: #4A8BBA;">€{{ annualBenefit.toFixed(0) }} <span style="font-size: 10px;">/a</span></div>
              </div>
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: #8A8B90;">Payback</div>
                <div class="p-kpi-val" style="color: #F0F2F5;">{{ payback > 0 ? payback.toFixed(1) : '—' }} <span style="font-size: 10px;">anni</span></div>
              </div>
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: #8A8B90;">ROI (20 anni)</div>
                <div class="p-kpi-val" style="color: #F0F2F5;">{{ roi20 > 0 ? roi20.toFixed(0) : '—' }}%</div>
              </div>
            </div>
          </div>

          <div class="p-tabs" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="display: flex; gap: 4px;">
              <button v-for="t in TABS" :key="t.id" @click="tab = t.id" class="p-tab-btn" :class="{ active: tab === t.id }">
                {{ t.label }}
              </button>
            </div>
            <button @click="printReport" class="p-tab-btn no-print" style="color: #C8A850; font-weight: bold; border: 1px solid rgba(200, 168, 80, 0.4);">
              🖨️ STAMPA REPORT
            </button>
          </div>
        </div>
      </div>

      <div class="p-body">
        
        <div v-show="tab === 'dashboard'" class="tab-content fade-in print-section">
          <div class="p-card mb-4">
            <div class="p-slabel">Sintesi Performance Energetica</div>
            <div class="p-charts-grid mt-4">
               <div>
                <div class="p-chart-title">Copertura Fabbisogno Attuale</div>
                <div class="p-chart-container">
                  <svg width="100%" viewBox="0 0 320 140">
                    <path :d="pathProdArea" fill="rgba(74, 186, 107, 0.2)" />
                    <path :d="pathDirectArea" fill="rgba(200, 168, 80, 0.6)" />
                  </svg>
                </div>
              </div>
              <div class="p-card" style="background: transparent; border: none; padding: 0;">
                <div class="p-info-box mb-2">
                  <div class="p-info-lbl">Indipendenza Rete</div>
                  <div class="p-info-val" style="color: #C8A850;">{{ independencePct.toFixed(0) }}%</div>
                </div>
                <div class="p-info-box">
                  <div class="p-info-lbl">Autoconsumo Totale</div>
                  <div class="p-info-val" style="color: #4A8BBA;">{{ totalSelfConsPct.toFixed(0) }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-show="tab === 'profiling'" class="tab-content fade-in print-section">
          <div class="p-card mb-4" style="border-left: 2px solid #4A8BBA;">
            <div class="p-slabel">🔮 Proiezione Cambiamento Stile di Vita</div>
            <p class="p-sub-text">Simula come cambierà la resa del tuo impianto aggiungendo nuovi carichi elettrici in futuro.</p>
            
            <div class="p-grid-4 mt-4">
              <div class="p-info-box" :class="{ active: futureEV }" @click="futureEV = !futureEV" style="cursor: pointer;">
                <div class="p-info-lbl">🚗 Auto Elettrica</div>
                <div class="p-info-val">{{ futureEV ? '+2.500 kWh' : 'No' }}</div>
                <div class="p-info-sub">Percorrenza media annua</div>
              </div>
              <div class="p-info-box" :class="{ active: futureHP }" @click="futureHP = !futureHP" style="cursor: pointer;">
                <div class="p-info-lbl">🔥 Pompa di Calore</div>
                <div class="p-info-val">{{ futureHP ? '+3.500 kWh' : 'No' }}</div>
                <div class="p-info-sub">Riscaldamento Full Electric</div>
              </div>
              <div class="p-info-box" style="grid-column: span 2;">
                <div class="p-info-lbl">⚡ Incremento Altri Carichi (Induzione, AC)</div>
                <div class="p-input-val">{{ futureOther }} kWh/a</div>
                <input type="range" min="0" max="5000" step="500" v-model.number="futureOther" class="p-slider" />
              </div>
            </div>
          </div>

          <div class="p-card mb-4">
            <div class="p-slabel">Impatto sul Bilancio Energetico</div>
            <div class="p-charts-grid">
              <div>
                <div class="p-chart-title">Nuova Curva di Consumo vs Produzione</div>
                <div class="p-chart-container">
                  <svg width="100%" viewBox="0 0 320 140">
                    <path :d="pathProdArea" fill="rgba(74, 186, 107, 0.1)" stroke="#4ABA6B" stroke-width="1" />
                    <path :d="pathFutureLoadArea" fill="rgba(200, 122, 80, 0.4)" stroke="#C87A50" stroke-width="2" />
                  </svg>
                </div>
              </div>
              <div>
                <div class="p-chart-title">Evoluzione Parametri Finanziari</div>
                <div class="p-table" style="margin-top: 10px;">
                  <div class="p-tr-6"><span class="p-td-lbl">Nuovo Prelievo Rete</span><span class="p-td-val">{{ totalNewImportFuture.toFixed(0) }} kWh</span></div>
                  <div class="p-tr-6"><span class="p-td-lbl">Nuovo Risparmio</span><span class="p-td-val" style="color: #4ABA6B;">€{{ futureSavings.toFixed(0) }}/a</span></div>
                  <div class="p-tr-6"><span class="p-td-lbl">Indipendenza Futura</span><span class="p-td-val" style="color: #C8A850;">{{ futureIndepPct.toFixed(0) }}%</span></div>
                </div>
              </div>
            </div>
            <div class="p-alert-box mt-4">
              <strong>Nota:</strong> Aumentando i consumi, l'autoconsumo della batteria diventa ancora più efficiente, riducendo drasticamente il tempo di payback dell'investimento.
            </div>
          </div>
        </div>

        <div v-show="tab === 'sizing'" class="tab-content fade-in print-section">
           <div class="p-card">
              <div class="p-slabel">Configurazione Tecnica</div>
              <div class="p-input-row">
                <div>
                  <div class="p-input-lbl">Potenza Impianto</div>
                  <div class="p-input-val">{{ pvKw }} kWp</div>
                  <input type="range" min="1" max="20" step="0.5" v-model.number="pvKw" class="p-slider" />
                </div>
                <div>
                  <div class="p-input-lbl">Accumulo</div>
                  <div class="p-input-val">{{ battery }} kWh</div>
                  <input type="range" min="0" max="30" step="2" v-model.number="battery" class="p-slider" />
                </div>
              </div>
           </div>
        </div>

        <div v-show="tab === 'roi'" class="tab-content fade-in print-section">
           <div class="p-card-grid">
              <div class="p-card">
                <div class="p-slabel">Tempo di Rientro</div>
                <div class="p-big-val">{{ payback.toFixed(1) }} <span style="font-size: 14px;">anni</span></div>
              </div>
              <div class="p-card">
                <div class="p-slabel">Beneficio in 20 anni</div>
                <div class="p-big-val">€{{ (annualBenefit * 20).toLocaleString() }}</div>
              </div>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/services/axios';
import GuideHeader from '@/components/layout/GuideHeader.vue';
import { extractAnalysisData } from '@/utils/analysisExtractor';

const loading = ref(true);
const entered = ref(false);
const tab = ref('dashboard');
const activeAddressName = ref('Caricamento...');

// --- STATI ORIGINALI ---
const pvKw = ref(6);
const battery = ref(10);
const costoKwh = ref(0.28);
const SSP_PRICE = 0.09;
const TAX_DEDUCTION = 0.50;
const COST_PER_KWP = 1200;
const COST_PER_KWH_BAT = 700;

// --- NUOVI STATI PROFILING ---
const futureEV = ref(false);
const futureHP = ref(false);
const futureOther = ref(0);

const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' }, 
  { id: 'profiling', label: '🔮 Future Profiling' },
  { id: 'sizing', label: '📐 Sizing' }, 
  { id: 'roi', label: '💶 ROI' }
];

const arrF1 = ref(Array(12).fill(300));
const arrF2 = ref(Array(12).fill(200));
const arrF3 = ref(Array(12).fill(250));

// --- MOTORE DI CALCOLO DINAMICO (Update con Profiling) ---
const monthlyTableData = computed(() => {
  return months.map((month, i) => {
    // Consumo Base
    let baseCons = arrF1.value[i] + arrF2.value[i] + arrF3.value[i];
    
    // Aggiunta Profiling Futuro
    let extraEv = futureEV.value ? 210 : 0; // ~2500/12
    let extraHp = futureHP.value ? ( [500,450,300,100,0,0,0,0,100,300,450,500][i] ) : 0; // Stagionale
    let extraOther = futureOther.value / 12;
    
    const totalCons = baseCons + extraEv + extraHp + extraOther;
    
    // Produzione (Stima semplificata basata su irraggiamento medio Italia)
    const irr = [2.1, 2.9, 4.1, 5.2, 6.0, 6.8, 7.2, 6.5, 5.0, 3.5, 2.2, 1.8];
    const prod = irr[i] * 30 * pvKw.value * 0.85;

    const directCovered = Math.min(totalCons * 0.4, prod); // Empirico
    const surplus = Math.max(0, prod - directCovered);
    const batCovered = Math.min(surplus, battery.value * 0.8 * 30, (totalCons - directCovered));
    
    return { month, prod, cons: totalCons, directCovered, batCovered, exported: surplus - batCovered };
  });
});

const annualProduction = computed(() => monthlyTableData.value.reduce((a,b)=>a+b.prod,0));
const totalConsumption = computed(() => monthlyTableData.value.reduce((a,b)=>a+b.cons,0));
const selfConsKwh = computed(() => monthlyTableData.value.reduce((a,b)=>a+b.directCovered + b.batCovered, 0));
const exportKwh = computed(() => monthlyTableData.value.reduce((a,b)=>a+b.exported,0));

const totalSelfConsPct = computed(() => (selfConsKwh.value / annualProduction.value) * 100);
const independencePct = computed(() => (selfConsKwh.value / totalConsumption.value) * 100);

const directSavings = computed(() => selfConsKwh.value * costoKwh.value);
const earnings = computed(() => exportKwh.value * SSP_PRICE);
const annualBenefit = computed(() => directSavings.value + earnings.value);

const netCost = computed(() => ((pvKw.value * COST_PER_KWP) + (battery.value * COST_PER_KWH_BAT)) * (1-TAX_DEDUCTION));
const payback = computed(() => annualBenefit.value > 0 ? netCost.value / annualBenefit.value : 0);
const roi20 = computed(() => ((annualBenefit.value * 20 - netCost.value) / netCost.value) * 100);

// --- METRICHE FUTURE ---
const totalNewImportFuture = computed(() => totalConsumption.value - selfConsKwh.value);
const futureSavings = computed(() => directSavings.value);
const futureIndepPct = computed(() => independencePct.value);

// --- GRAFICI SVG ---
const getPath = (data, mx) => {
  const w = 280, h = 100, dx = w/11;
  return `M 30,110 ` + data.map((v,i)=>`L ${30+i*dx},${110-(v/mx)*h}`).join(' ') + ` L 310,110 Z`;
};

const maxV = computed(() => Math.max(...monthlyTableData.value.map(r=>r.prod), ...monthlyTableData.value.map(r=>r.cons), 10));
const pathProdArea = computed(() => getPath(monthlyTableData.value.map(r=>r.prod), maxV.value));
const pathDirectArea = computed(() => getPath(monthlyTableData.value.map(r=>r.directCovered + r.batCovered), maxV.value));
const pathFutureLoadArea = computed(() => getPath(monthlyTableData.value.map(r=>r.cons), maxV.value));

const printReport = () => window.print();

onMounted(async () => {
  try {
    const res = await axios.get('/api/resources');
    const data = extractAnalysisData(res.data.data || res.data, localStorage.getItem('esurf_active_address_id'));
    if (data?.activeAddressName) activeAddressName.value = data.activeAddressName;
  } catch(e) {} finally { loading.value = false; setTimeout(() => entered.value = true, 100); }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;600&display=swap');
.pv-app-wrapper { background: #0A0C0E; min-height: 100vh; font-family: 'Inter', sans-serif; color: #F0F2F5; }
.p-header { background: #111317; padding: 26px 22px 0; position: relative; border-bottom: 1px solid #232830; }
.p-header-bg { position: absolute; inset: 0; opacity: 0.03; stroke: white; stroke-width: 0.5; }
.p-header-content { position: relative; max-width: 860px; margin: 0 auto; }
.p-kicker { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: #8A8B90; }
.p-title { font-size: 26px; font-weight: 400; margin: 0; }
.p-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: #2A2D35; border-radius: 6px; overflow: hidden; margin-top: 18px; }
.p-kpi-cell { background: #16181D; padding: 12px 14px; }
.p-kpi-lbl { font-family: 'Space Mono', monospace; font-size: 8px; text-transform: uppercase; color: #8A8B90; }
.p-kpi-val { font-size: 18px; font-family: 'Space Mono', monospace; font-weight: 700; }
.p-tabs { display: flex; gap: 4px; margin-top: 20px; }
.p-tab-btn { background: none; border: none; padding: 12px 16px; font-family: 'Space Mono', monospace; font-size: 9px; color: #5A5D65; cursor: pointer; border-bottom: 2px solid transparent; }
.p-tab-btn.active { border-bottom-color: #C8A850; color: #C8A850; }
.p-body { max-width: 860px; margin: 0 auto; padding: 24px 20px 80px; }
.p-card { background: #16181D; border-radius: 8px; padding: 20px; border: 1px solid #232830; }
.p-info-box { background: rgba(255,255,255,0.03); border: 1px solid #232830; border-radius: 6px; padding: 12px; transition: 0.3s; }
.p-info-box.active { border-color: #4A8BBA; background: rgba(74, 139, 186, 0.1); }
.p-info-lbl { font-size: 8px; color: #8A8B90; text-transform: uppercase; }
.p-info-val { font-size: 14px; font-weight: 600; }
.p-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.p-slider { width: 100%; height: 4px; background: #2A2D35; -webkit-appearance: none; border-radius: 99px; }
.p-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.p-chart-title { font-size: 10px; font-weight: 600; color: #A09880; }
.p-chart-container { border-top: 1px solid #232830; padding-top: 16px; }
.p-tr-6 { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #232830; font-family: 'Space Mono', monospace; font-size: 10px; }
.p-td-val { font-weight: 700; color: #F0F2F5; }

@media print {
  .no-print { display: none !important; }
  .p-tabs { display: none !important; }
  .print-section { display: block !important; margin-bottom: 40px; }
  .pv-app-wrapper { background: white !important; color: black !important; }
  .p-card { border: 1px solid #ccc !important; background: white !important; }
}
</style>
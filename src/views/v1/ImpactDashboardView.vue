<template>
  <div class="app-container">
    <GuideHeader :isLightMode="false" />

    <main class="main-content">
      <section class="address-section fade-in" :class="{ 'is-entered': entered }">
        <div class="address-selector">
          <div class="address-info">
            <span class="label">ANALISI IMPATTO:</span>
            <div class="address-value">
              <svg class="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{{ activeAddressName }}</span>
            </div>
          </div>
          <div class="sync-badge">Aggiornato Oggi</div>
        </div>
      </section>

      <section class="tabs-section fade-in delay-1">
        <div class="fintech-tabs">
          <button 
            v-for="t in tabs" 
            :key="t.id"
            @click="tab = t.id"
            class="f-tab"
            :class="{ active: tab === t.id }"
          >
            {{ t.label }}
          </button>
        </div>
      </section>

      <div v-if="loading" class="loading-state fade-in delay-2">
        <div class="spinner"></div>
        <p>Elaborazione dati reali in corso...</p>
      </div>

      <div v-else class="impact-content fade-in delay-2" :class="{ 'is-entered': entered }">
        
        <div v-if="tab === 'overview'" class="tab-pane">
          
          <div class="smart-tile score-tile">
            <div class="score-ring-wrapper">
              <svg width="84" height="84" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="var(--border-color)" stroke-width="8" />
                <circle cx="48" cy="48" r="38" fill="none" :stroke="scoreColor" stroke-width="8" stroke-linecap="round"
                  :stroke-dasharray="ringCircumference"
                  :stroke-dashoffset="ringOffset"
                  transform="rotate(-90 48 48)"
                  class="animated-ring"
                  :style="{ filter: `drop-shadow(0 0 8px ${scoreColor}66)` }"
                />
                <text x="48" y="55" text-anchor="middle" fill="var(--text-main)" font-size="22" font-weight="900">
                  {{ animated.globalScore }}
                </text>
              </svg>
            </div>
            <div class="score-info">
              <span class="status-label">Score Globale</span>
              <h2 class="status-level" :style="{ color: scoreColor }">
                {{ globalScore < 50 ? "Sotto la media" : globalScore < 75 ? "Nella media" : "Ottimo" }}
              </h2>
              <p class="action-desc mt-1">
                {{ globalScore < 75 ? 'Ampi margini di miglioramento su energia e indipendenza.' : 'Performance eccellente rispetto al benchmark.' }}
              </p>
            </div>
          </div>

          <h3 class="section-title mt-4">Spesa stimata</h3>
          <div class="smart-tile">
            <div class="expense-header">
              <span class="total-monthly">€ {{ animated.spesaTotale }}<span class="per-month">/mese</span></span>
              <div class="expense-annual">
                <span class="annual-label">Proiezione Annua</span>
                <span class="annual-value">€ {{ animated.spesaAnnua }}</span>
              </div>
            </div>
            
            <div class="expense-bars mt-3">
              <div v-for="b in expenseBars" :key="b.label" class="bar-item">
                <div class="bar-info">
                  <span class="b-label">{{ b.label }}</span>
                  <span class="b-val">€{{ b.value }} <span class="b-pct">({{ spesaTotale > 0 ? Math.round(b.value / spesaTotale * 100) : 0 }}%)</span></span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill animated-width" 
                       :style="{ width: `${spesaTotale > 0 ? (b.value / spesaTotale) * 100 : 0}%`, background: b.color, boxShadow: `0 0 8px ${b.color}44` }">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 class="section-title mt-4">Consumi vs Benchmark Nazionale</h3>
          <div class="smart-tile gauges-tile">
            <div v-for="g in gauges" :key="g.label" class="gauge-item">
              <svg :width="100" :height="60" viewBox="0 0 140 84">
                <path d="M 18,70 A 52,52 0 0,1 122,70" fill="none" stroke="var(--border-color)" stroke-width="12" stroke-linecap="round" />
                <path d="M 18,70 A 52,52 0 0,1 122,70" fill="none" :stroke="g.color" stroke-width="12" stroke-linecap="round"
                  :stroke-dasharray="g.circ"
                  :stroke-dashoffset="g.offset"
                  class="animated-ring"
                  :style="{ filter: `drop-shadow(0 0 6px ${g.color}66)` }"
                />
                <text x="70" y="66" text-anchor="middle" fill="var(--text-main)" font-size="22" font-weight="800">
                  {{ Math.round(g.value * g.pct) }}
                </text>
              </svg>
              <span class="gauge-label">{{ g.label }}</span>
              <span class="gauge-unit">{{ g.unit }}</span>
            </div>
          </div>
        </div>

        <div v-if="tab === 'impatto'" class="tab-pane">
          
          <h3 class="section-title">Impronta Carbonio Annua</h3>
          <div class="smart-tile co2-tile">
            <div class="co2-header">
              <span class="co2-total">{{ animated.co2Annua }} <span class="co2-unit">kg CO₂eq</span></span>
              <p class="action-desc mt-1">Equivale a percorrere <strong>{{ Math.round(co2Annua / 0.12).toLocaleString("it-IT") }} km</strong> in auto.</p>
            </div>
            
            <div class="co2-bars mt-3">
              <div v-for="b in co2Bars" :key="b.label" class="bar-item">
                <div class="bar-info">
                  <span class="b-label">
                    {{ b.label }}
                    <span v-if="b.isGreen" class="green-tag">100% Rinnovabile</span>
                  </span>
                  <span class="b-val">{{ Math.round(b.co2) }} kg</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill animated-width" 
                       :style="{ width: `${co2Annua > 0 ? Math.min((b.co2 / co2Annua) * 100, 100) : (b.isGreen ? 0 : 0)}%`, background: `linear-gradient(90deg, ${b.color}88, ${b.color})` }">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 class="section-title mt-4">Indipendenza Energetica</h3>
          <div class="smart-tile">
            <div class="ind-score-row">
              <svg width="70" height="70" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="30" fill="none" stroke="var(--border-color)" stroke-width="8" />
                <circle cx="40" cy="40" r="30" fill="none" stroke="var(--accent-blue)" stroke-width="8" stroke-linecap="round"
                  :stroke-dasharray="188.4"
                  :stroke-dashoffset="188.4 * (1 - indipendenzaScore / 100)"
                  transform="rotate(-90 40 40)"
                  class="animated-ring"
                />
                <text x="40" y="46" text-anchor="middle" fill="var(--text-main)" font-size="16" font-weight="800">
                  {{ animated.indipendenza }}%
                </text>
              </svg>
              <div class="ind-text">
                <span class="ind-desc">{{ indMessage }}</span>
              </div>
            </div>

            <div class="ind-grid mt-3">
              <div v-for="i in indItems" :key="i.label" class="ind-box">
                <span class="ib-label">{{ i.label }}</span>
                <span class="ib-val" :style="{ color: i.color }">{{ i.value }}</span>
                <span class="ib-note">{{ i.note }}</span>
              </div>
            </div>
          </div>

          <h3 class="section-title mt-4">Confronto con famiglie simili</h3>
          <div class="pills-grid">
            <div v-for="p in pills" :key="p.label" class="pill-card hover-scale">
              <span class="p-label">{{ p.label }}</span>
              <span class="p-val">{{ p.value }} <span class="p-unit">{{ p.unit }}</span></span>
              <span class="p-delta" :class="p.up ? 'text-red' : 'text-green'">
                {{ p.up ? '▲' : '▼' }} {{ Math.abs(p.delta) }}% vs media IT
              </span>
            </div>
          </div>
        </div>

        <div v-if="tab === 'scenari'" class="tab-pane">
          <p class="action-desc mb-3">
            Simulazione interventi basati sui tuoi consumi reali. Seleziona per i dettagli.
          </p>

          <div v-for="s in scenarios" :key="s.id" 
               class="smart-tile scenario-card"
               :class="{ 'scenario-active': activeScenario === s.id }"
               :style="{ borderColor: activeScenario === s.id ? s.color : '' }"
               @click="activeScenario = activeScenario === s.id ? null : s.id">
            
            <div class="scen-header">
              <div class="scen-titles">
                <h4 class="scen-title">{{ s.label }}</h4>
                <span class="scen-desc">{{ s.desc }}</span>
              </div>
              <div class="scen-save-box">
                <span class="scen-save text-green">-€ {{ s.risparmio }}</span>
                <span class="scen-save-lbl">all'anno</span>
              </div>
            </div>

            <div v-if="activeScenario === s.id" class="scen-details mt-3 fade-in">
              <div class="scen-grid">
                <div class="scen-metric">
                  <span class="sm-label">Investimento</span>
                  <span class="sm-val" :style="{ color: s.color }">€ {{ s.investimento.toLocaleString("it-IT") }}</span>
                </div>
                <div class="scen-metric">
                  <span class="sm-label">Payback</span>
                  <span class="sm-val" :style="{ color: s.color }">{{ s.payback }} anni</span>
                </div>
                <div class="scen-metric">
                  <span class="sm-label">CO₂ Evitata</span>
                  <span class="sm-val" :style="{ color: s.color }">{{ s.co2 }}%</span>
                </div>
                <div class="scen-metric">
                  <span class="sm-label">Indipendenza</span>
                  <span class="sm-val" :style="{ color: s.color }">+{{ s.indipendenza }}%</span>
                </div>
              </div>
              <div class="scen-alert mt-2" :style="{ borderLeftColor: s.color }">
                L'intervento si ripaga da solo in {{ s.payback }} anni grazie all'azzeramento dei costi in bolletta.
              </div>
            </div>
          </div>

          <div class="smart-tile combo-cta mt-4">
            <div class="combo-icon">🚀</div>
            <div>
              <h4 style="margin:0; font-size: 13px; font-weight: 800;">Ottimizzazione Combo</h4>
              <p class="action-desc mt-1" style="margin-bottom: 0;">
                Combinando FV + Pompa potresti risparmiare <strong class="text-wallet">€ 1.380/anno</strong> e ridurre le emissioni del <strong class="text-green">91%</strong>.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios';
import AuthService from '@/services/AuthService';
import GuideHeader from '@/components/layout/GuideHeader.vue';

const router = useRouter();

// --- STATO UI ---
const loading = ref(true);
const entered = ref(false);
const tab = ref('overview');
const activeScenario = ref(null);
const activeAddressName = ref('Caricamento...');

const tabs = [
  { id: 'overview', label: '📊 Panoramica' },
  { id: 'impatto', label: '🌍 Impatto' },
  { id: 'scenari', label: '⚡ Scenari' }
];

// --- DATI REALI ---
const data = reactive({
  bollette: {
    energia: { mensile: 0, unita: "kWh", consumo: 0 },
    gas: { mensile: 0, unita: "smc", consumo: 0 },
    acqua: { mensile: 0, unita: "m³", consumo: 0 },
  },
});

const isGreenEnergy = ref(false); 
const indipendenzaScore = ref(18);
const indMessage = ref("L'abitazione dipende quasi completamente dalla rete.");

// Costanti benchmark e CO2 (Medie italiane)
const benchmarkNazionale = { energia: 160, gas: 110, acqua: 42 };
const co2Factors = { energia: 0.233, gas: 2.04, acqua: 0.149 };

// --- ANIMAZIONI NUMERICHE ---
const animated = reactive({
  globalScore: 0,
  spesaTotale: 0,
  spesaAnnua: 0,
  co2Annua: 0,
  indipendenza: 0
});

const animateValue = (key, target, duration = 1200) => {
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    animated[key] = Math.round(target * ease);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

// --- LOGICA DI RECUPERO DATI REALI ---
onMounted(async () => {
  try {
    const [userRes, resRes] = await Promise.all([
      AuthService.getUser(),
      axios.get('/api/resources')
    ]);
    
    const resources = resRes.data.data || resRes.data || [];

    // Algoritmo di raggruppamento per trovare l'indirizzo attivo
    const groups = {};
    resources.forEach(r => {
        let aiData = {};
        try { aiData = typeof r.ai_analysis === 'string' ? JSON.parse(r.ai_analysis) : (r.ai_analysis || {}); } catch(e) {}
        const aiAddr = aiData?.indirizzo || {};
        
        const via = aiAddr.Via ? aiAddr.Via.trim() : (r.address ? r.address.trim() : '');
        const civico = aiAddr.NumeroCivico ? aiAddr.NumeroCivico.trim() : '';
        const citta = aiAddr.Città ? aiAddr.Città.trim() : (r.city ? r.city.trim() : '');
        const prov = aiAddr.Provincia ? aiAddr.Provincia.trim() : (r.province ? r.province.trim() : '');
        
        let displayCity = `${citta} ${prov ? '('+prov+')' : ''}`.trim();
        let displayStreet = `${via} ${civico}`.trim();
        let displayAddress = displayCity && displayStreet ? `${displayCity}, ${displayStreet}` : (displayCity || displayStreet || 'Indirizzo Sconosciuto');
        displayAddress = displayAddress.replace(/\s+/g, ' ').trim();

        let normKey = `${citta} ${via}`.toLowerCase().replace(/[^\w\s]/gi, ' ').replace(/\b(di|del|della|dei|degli|via|viale|piazza|corso)\b/g, ' ').replace(/\b[a-z]{2}\b/g, ' ').replace(/\d+/g, ' ').replace(/\s+/g, ' ').trim();
        if (!normKey) normKey = 'unknown_location';

        if (!groups[normKey]) groups[normKey] = { id: normKey, address: displayAddress, items: [] };
        else if (displayAddress.length > groups[normKey].address.length) groups[normKey].address = displayAddress;
        groups[normKey].items.push(r);
    });

    const groupedResources = Object.values(groups);
    let activeGroup = null;
    const savedId = localStorage.getItem('esurf_active_address_id');
    
    if (savedId && groupedResources.some(g => g.id === savedId)) {
        activeGroup = groupedResources.find(g => g.id === savedId);
    } else if (groupedResources.length > 0) {
        activeGroup = groupedResources[0];
    }

    if (activeGroup) {
        activeAddressName.value = activeGroup.address;
        
        const rPower = activeGroup.items.find(r => !r.resource_type || r.resource_type === 'energia_elettrica');
        const rGas = activeGroup.items.find(r => r.resource_type === 'gas');
        const rWater = activeGroup.items.find(r => r.resource_type === 'acqua');

        // Parsing JSON AI Analysis per tutti i vettori
        let pAi = {}, gAi = {}, wAi = {};
        if (rPower) try { pAi = typeof rPower.ai_analysis === 'string' ? JSON.parse(rPower.ai_analysis) : (rPower.ai_analysis || {}); } catch(e) {}
        if (rGas) try { gAi = typeof rGas.ai_analysis === 'string' ? JSON.parse(rGas.ai_analysis) : (rGas.ai_analysis || {}); } catch(e) {}
        if (rWater) try { wAi = typeof rWater.ai_analysis === 'string' ? JSON.parse(rWater.ai_analysis) : (rWater.ai_analysis || {}); } catch(e) {}

        // 🟢 ESTRAZIONE CAMPO GREEN DA AI_ANALYSIS ENERGIA
        isGreenEnergy.value = pAi.is_100_green === true || String(pAi.is_100_green).toLowerCase() === 'true';

        // 🟢 ESTRAZIONE CONSUMI (Usa i DB standard, se vuoti usa direttamente il JSON AI per garantire il dato)
        const pKwh = rPower?.annual_consumption_kwh || pAi?.consumption_bands?.total_annual || 0;
        const gSmc = rGas?.annual_consumption_smc || rGas?.annual_consumption_kwh || gAi?.consumption?.annual_smc || gAi?.consumption?.annual_mc || 0; 
        const wM3 = rWater?.annual_consumption_m3 || rWater?.annual_consumption_kwh || wAi?.consumption?.annual_mc || 0;

        // Popolamento Data Object
        data.bollette.energia.consumo = Math.round(pKwh / 12) || 0;
        data.bollette.energia.mensile = Math.round((pKwh / 12) * 0.25) || 0;

        data.bollette.gas.consumo = Math.round(gSmc / 12) || 0;
        data.bollette.gas.mensile = Math.round((gSmc / 12) * 1.10) || 0;

        data.bollette.acqua.consumo = Math.round(wM3 / 12) || 0;
        data.bollette.acqua.mensile = Math.round((wM3 / 12) * 2.50) || 0;

        // Indipendenza Reale
        if (rPower?.has_storage) {
          indipendenzaScore.value = 65;
          indMessage.value = "Ottima autonomia grazie all'accumulo domestico.";
        } else if (rPower?.production_capacity > 0) {
          indipendenzaScore.value = 45;
          indMessage.value = "Buona indipendenza diurna grazie al fotovoltaico.";
        }
    } else {
        activeAddressName.value = 'Nessun Nucleo Configurato';
    }

  } catch (error) {
    console.error("Errore nel recupero dati per Dashboard Impact", error);
  } finally {
    loading.value = false;
    await nextTick();
    setTimeout(() => { entered.value = true; }, 80);

    animateValue('globalScore', globalScore.value);
    animateValue('spesaTotale', spesaTotale.value);
    animateValue('spesaAnnua', spesaTotale.value * 12);
    animateValue('co2Annua', co2Annua.value);
    animateValue('indipendenza', indipendenzaScore.value);
  }
});

// --- COMPUTED PROPS ---
const spesaTotale = computed(() => data.bollette.energia.mensile + data.bollette.gas.mensile + data.bollette.acqua.mensile);

const co2Annua = computed(() => Math.round(
  (data.bollette.energia.consumo * (isGreenEnergy.value ? 0 : co2Factors.energia) * 12) +
  (data.bollette.gas.consumo * co2Factors.gas * 12) +
  (data.bollette.acqua.consumo * co2Factors.acqua * 12)
));

const energiaScore = computed(() => Math.max(0, Math.min(100, Math.round(100 - ((data.bollette.energia.mensile / benchmarkNazionale.energia) * 50)))));
const gasScore = computed(() => Math.max(0, Math.min(100, Math.round(100 - ((data.bollette.gas.mensile / benchmarkNazionale.gas) * 50)))));
const acquaScore = computed(() => Math.max(0, Math.min(100, Math.round(100 - ((data.bollette.acqua.mensile / benchmarkNazionale.acqua) * 50)))));

const globalScore = computed(() => {
  let total = 0; let count = 0;
  if (data.bollette.energia.mensile > 0) { total += energiaScore.value; count++; }
  if (data.bollette.gas.mensile > 0) { total += gasScore.value; count++; }
  if (data.bollette.acqua.mensile > 0) { total += acquaScore.value; count++; }
  return count > 0 ? Math.round(total / count) : 85; 
});

const scoreColor = computed(() => globalScore.value > 70 ? "#10b981" : globalScore.value > 40 ? "#f59e0b" : "#ef4444");
const ringCircumference = 2 * Math.PI * 38;
const ringOffset = computed(() => ringCircumference * (1 - globalScore.value / 100));

// --- STRUTTURE DATI PER IL TEMPLATE ---
const expenseBars = computed(() => [
  { label: "⚡ Energia", value: data.bollette.energia.mensile, color: "#f59e0b" },
  { label: "🔥 Gas", value: data.bollette.gas.mensile, color: "#f97316" },
  { label: "💧 Acqua", value: data.bollette.acqua.mensile, color: "#3b82f6" }
]);

const gauges = computed(() => [
  { label: 'Energia', value: data.bollette.energia.consumo, max: benchmarkNazionale.energia * 2, color: '#f59e0b', unit: 'kWh/m' },
  { label: 'Gas', value: data.bollette.gas.consumo, max: benchmarkNazionale.gas * 2, color: '#f97316', unit: 'smc/m' },
  { label: 'Acqua', value: data.bollette.acqua.consumo, max: benchmarkNazionale.acqua * 2, color: '#3b82f6', unit: 'm³/m' }
].map(g => {
  const circ = Math.PI * 52;
  const pct = Math.min(g.value / (g.max || 1), 1);
  return { ...g, circ, pct, offset: circ * (1 - pct) };
}));

const co2Bars = computed(() => [
  { 
    label: "⚡ Energia Elettrica", 
    isGreen: isGreenEnergy.value,
    co2: data.bollette.energia.consumo * (isGreenEnergy.value ? 0 : co2Factors.energia) * 12, 
    color: isGreenEnergy.value ? "#10b981" : "#f59e0b" 
  },
  { label: "🔥 Gas Naturale", isGreen: false, co2: data.bollette.gas.consumo * co2Factors.gas * 12, color: "#f97316" },
  { label: "💧 Acqua", isGreen: false, co2: data.bollette.acqua.consumo * co2Factors.acqua * 12, color: "#3b82f6" }
]);

const indItems = computed(() => [
  { label: "Autoconsumo", value: indipendenzaScore.value > 18 ? "Ottimo" : "Scarso", color: "#f59e0b", note: "Rinnovabili" },
  { label: "Rete gas", value: data.bollette.gas.consumo > 0 ? "100%" : "0%", color: data.bollette.gas.consumo > 0 ? "#ef4444" : "#10b981", note: data.bollette.gas.consumo > 0 ? "Dipendente" : "Elettrificata" },
  { label: "Acqua", value: "100%", color: "#3b82f6", note: "Rete comunale" }
]);

const pills = computed(() => [
  { label: "Elettricità", value: data.bollette.energia.mensile, unit: "€/m", delta: Math.round((data.bollette.energia.mensile / (benchmarkNazionale.energia||1) - 1) * 100), up: data.bollette.energia.mensile > benchmarkNazionale.energia },
  { label: "Gas", value: data.bollette.gas.mensile, unit: "€/m", delta: Math.round((data.bollette.gas.mensile / (benchmarkNazionale.gas||1) - 1) * 100), up: data.bollette.gas.mensile > benchmarkNazionale.gas },
  { label: "Acqua", value: data.bollette.acqua.mensile, unit: "€/m", delta: Math.round((data.bollette.acqua.mensile / (benchmarkNazionale.acqua||1) - 1) * 100), up: data.bollette.acqua.mensile > benchmarkNazionale.acqua }
]);

const scenarios = [
  { id: "solar", label: "☀️ Fotovoltaico", desc: "Impianto 4 kWp sul tetto", risparmio: 780, co2: -68, indipendenza: +42, investimento: 7200, payback: 9.2, color: "#f59e0b" },
  { id: "hp", label: "🌡️ Pompa di calore", desc: "Sostituzione caldaia a gas", risparmio: 540, co2: -55, indipendenza: +30, investimento: 5800, payback: 10.7, color: "#3b82f6" },
  { id: "combo", label: "⚡ Combo ottimale", desc: "FV + pompa + accumulo", risparmio: 1380, co2: -91, indipendenza: +74, investimento: 16400, payback: 11.9, color: "#8b5cf6" }
];
</script>

<style scoped>
@import '@/assets/main_V0.css';

.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 16px; max-width: 480px; margin: 0 auto; padding-bottom: 90px; }

/* ANIMAZIONI */
.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0; }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.animated-ring { transition: stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1); }
.animated-width { transition: width 1.2s cubic-bezier(.22,1,.36,1); }

/* SELEZIONE NUCLEO (Stile Dashboard) */
.address-section { margin-bottom: 20px; }
.address-selector { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-card); }
.address-info .label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 4px; }
.address-value { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--text-primary); }
.pin-icon { width: 16px; height: 16px; color: var(--accent-cyan); flex-shrink: 0; }
.sync-badge { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; border: 1px solid rgba(59, 130, 246, 0.2); }

/* TABS FINTECH */
.tabs-section { margin-bottom: 20px; }
.fintech-tabs { display: flex; background: var(--bg-card); padding: 4px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
.f-tab { flex: 1; text-align: center; padding: 10px 0; background: transparent; border: none; border-radius: 8px; font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
.f-tab.active { background: var(--bg-app); color: var(--text-primary); box-shadow: 0 2px 6px rgba(0,0,0,0.1); border: 1px solid var(--border-color); }

/* CARD FINTECH GLOBALI */
.smart-tile { background: var(--bg-card); border-radius: 16px; padding: 18px; border: 1px solid var(--border-color); box-shadow: var(--shadow-card); }
.section-title { font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; padding-left: 4px; }
.action-desc { font-size: 12px; line-height: 1.5; color: var(--text-muted); margin: 0; }

/* SPINNER */
.loading-state { text-align: center; padding: 4rem 1rem; }
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

/* SCORE CARD */
.score-tile { display: flex; align-items: center; gap: 20px; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(255,255,255,0.02) 100%); }
.status-label { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
.status-level { font-size: 22px; font-weight: 900; margin: 4px 0 0 0; letter-spacing: -0.5px; }

/* SPESA CARD */
.expense-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border-color); padding-bottom: 12px; }
.total-monthly { font-size: 28px; font-weight: 900; color: var(--text-primary); letter-spacing: -1px; }
.per-month { font-size: 14px; font-weight: 600; color: var(--text-muted); }
.expense-annual { text-align: right; display: flex; flex-direction: column; }
.annual-label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
.annual-value { font-size: 16px; font-weight: 800; color: var(--text-wallet); }

.bar-item { margin-bottom: 12px; }
.bar-info { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; font-weight: 600; }
.b-label { color: var(--text-primary); }
.b-val { color: var(--text-primary); }
.b-pct { color: var(--text-muted); font-size: 10px; }
.bar-track { height: 8px; background: var(--bg-app); border-radius: 99px; border: 1px solid var(--border-color); overflow: hidden; }
.bar-fill { height: 100%; border-radius: 99px; }

/* GAUGES CARD */
.gauges-tile { display: flex; justify-content: space-around; padding: 20px 10px; }
.gauge-item { display: flex; flex-direction: column; align-items: center; }
.gauge-label { font-size: 11px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; margin-top: 5px; }
.gauge-unit { font-size: 10px; color: var(--text-muted); }

/* CO2 E INDIPENDENZA */
.co2-header { border-bottom: 1px dashed var(--border-color); padding-bottom: 12px; }
.co2-total { font-size: 28px; font-weight: 900; color: var(--text-primary); }
.co2-unit { font-size: 14px; font-weight: 600; color: var(--text-muted); }
.green-tag { background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; border: 1px solid rgba(16, 185, 129, 0.3); }

.ind-score-row { display: flex; align-items: center; gap: 15px; border-bottom: 1px dashed var(--border-color); padding-bottom: 16px; }
.ind-desc { font-size: 13px; font-weight: 600; color: var(--text-muted); }
.ind-grid { display: flex; gap: 10px; }
.ind-box { flex: 1; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; text-align: center; }
.ib-label { font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
.ib-val { font-size: 16px; font-weight: 900; margin-bottom: 2px; }
.ib-note { font-size: 9px; color: var(--text-muted); }

/* PILLS */
.pills-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.pill-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px 10px; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: var(--shadow-card); }
.p-label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
.p-val { font-size: 18px; font-weight: 900; color: var(--text-primary); }
.p-unit { font-size: 11px; color: var(--text-muted); }
.p-delta { font-size: 10px; font-weight: 800; margin-top: 6px; }

/* SCENARI E COMBO */
.scenario-card { cursor: pointer; transition: transform 0.2s, border-color 0.2s; margin-bottom: 12px; }
.scenario-card:active { transform: scale(0.98); }
.scenario-active { border-width: 2px; }
.scen-header { display: flex; justify-content: space-between; align-items: flex-start; }
.scen-title { margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: var(--text-primary); }
.scen-desc { font-size: 11px; color: var(--text-muted); }
.scen-save-box { text-align: right; display: flex; flex-direction: column; }
.scen-save { font-size: 18px; font-weight: 900; }
.scen-save-lbl { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

.scen-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.scen-metric { background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px; display: flex; flex-direction: column; }
.sm-label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
.sm-val { font-size: 16px; font-weight: 900; }

.scen-alert { border-left: 4px solid; background: var(--bg-app); padding: 10px 14px; border-radius: 0 8px 8px 0; font-size: 11px; font-weight: 600; color: var(--text-muted); }

.combo-cta { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%); border-color: rgba(139, 92, 246, 0.3); }
.combo-icon { font-size: 32px; }

/* UTILS */
.text-red { color: #ef4444; }
.text-green { color: #10b981; }
.text-wallet { color: #d4af37; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mb-3 { margin-bottom: 12px; }
</style>
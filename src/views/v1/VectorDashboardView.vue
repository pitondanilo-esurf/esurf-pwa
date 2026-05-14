<template>
  <div class="app-container">
    <GuideHeader :isLightMode="false" />

    <main class="main-content">
      <section class="address-section fade-in" :class="{ 'is-entered': entered }">
        <div class="address-selector">
          <div class="address-info">
            <span class="label">MODELLO VETTORIALE:</span>
            <div class="address-value">
              <svg class="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{{ activeAddressName }}</span>
            </div>
          </div>
          <div class="sync-badge">Analisi 2D</div>
        </div>
        <p class="section-desc mt-2">
          Ogni bolletta è un vettore nello spazio.<br>
          <span class="text-white">Asse X</span> = Impatto economico · <span class="text-white">Asse Y</span> = Impatto CO₂
        </p>
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
        <p>Costruzione spazio vettoriale...</p>
      </div>

      <div v-else class="impact-content fade-in delay-2" :class="{ 'is-entered': entered }">
        
        <div v-if="tab === 'vettori'" class="tab-pane">
          
          <div class="smart-tile canvas-tile">
            <span class="canvas-badge">SPAZIO VETTORIALE 2D</span>
            <div class="canvas-wrapper">
              <svg width="100%" viewBox="0 0 360 300" style="overflow: visible;">
                <line v-for="i in 8" :key="'h'+i" :x1="0" :y1="oy - (i-1)*35" :x2="360" :y2="oy - (i-1)*35" stroke="var(--border-color)" stroke-width="1" />
                <line v-for="i in 10" :key="'v'+i" :x1="ox + (i-1)*35" :y1="0" :x2="ox + (i-1)*35" :y2="300" stroke="var(--border-color)" stroke-width="1" />

                <defs>
                  <marker id="axisX" markerWidth="6" markerHeight="6" refX="5" refY="2.5" orient="auto">
                    <path d="M0,0 L0,5 L6,2.5 z" fill="var(--text-muted)" />
                  </marker>
                  <marker id="axisY" markerWidth="6" markerHeight="6" refX="2.5" refY="5" orient="auto">
                    <path d="M0,0 L5,0 L2.5,6 z" fill="var(--text-muted)" />
                  </marker>
                </defs>
                <line :x1="ox" :y1="300" :x2="ox" :y2="10" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#axisY)" />
                <line :x1="10" :y1="oy" :x2="350" :y2="oy" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#axisX)" />
                
                <text :x="350" :y="oy + 14" fill="var(--text-muted)" font-size="10" font-weight="700" text-anchor="end">COSTO €</text>
                <text :x="ox - 10" :y="16" fill="var(--text-muted)" font-size="10" font-weight="700" text-anchor="middle">CO₂</text>

                <circle :cx="ox" :cy="oy" r="4" fill="var(--accent-cyan)" opacity="0.8" />

                <g v-for="b in bollette" :key="b.id" @click="activeId = activeId === b.id ? null : b.id" style="cursor:pointer">
                  <defs>
                    <marker :id="'arrow-'+b.id" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" :fill="b.color" />
                    </marker>
                  </defs>
                  
                  <line 
                    :x1="ox" :y1="oy" 
                    :x2="ox + vComp(b).x * animProgress" 
                    :y2="oy - vComp(b).y * animProgress" 
                    :stroke="b.color" 
                    :stroke-width="activeId === b.id ? 10 : 6" 
                    stroke-opacity="0.2" 
                    stroke-linecap="round" 
                  />
                  <line 
                    :x1="ox" :y1="oy" 
                    :x2="ox + vComp(b).x * animProgress" 
                    :y2="oy - vComp(b).y * animProgress" 
                    :stroke="b.color" 
                    :stroke-width="activeId === b.id ? 3.5 : 2.5" 
                    stroke-linecap="round" 
                    :marker-end="'url(#arrow-'+b.id+')'" 
                  />
                  <text v-if="animProgress > 0.6" 
                    :x="ox + vComp(b).x * animProgress + (vComp(b).x > 0 ? 10 : -10)" 
                    :y="oy - vComp(b).y * animProgress + (vComp(b).y > 0 ? -8 : 14)" 
                    :fill="b.color" font-size="12" font-weight="800" 
                    :text-anchor="vComp(b).x > 0 ? 'start' : 'end'"
                  >
                    {{ b.nome }}
                  </text>
                </g>

                <g>
                  <defs>
                    <marker id="arrow-res" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill="var(--accent-cyan)" />
                    </marker>
                  </defs>
                  <line :x1="ox" :y1="oy" :x2="ox + resultant.x * animProgress" :y2="oy - resultant.y * animProgress" stroke="var(--accent-cyan)" stroke-width="1.5" stroke-dasharray="6 4" stroke-opacity="0.4" />
                  <line :x1="ox" :y1="oy" :x2="ox + resultant.x * animProgress" :y2="oy - resultant.y * animProgress" stroke="var(--accent-cyan)" stroke-width="4" stroke-linecap="round" marker-end="url(#arrow-res)" style="filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5));" />
                  
                  <text v-if="animProgress > 0.8" :x="ox + resultant.x * 0.5 + 10" :y="oy - resultant.y * 0.5" fill="var(--accent-cyan)" font-size="11" font-weight="700">Risultante</text>
                </g>
              </svg>
            </div>
          </div>

          <div class="smart-tile resultant-tile mt-3">
            <div class="res-header">Σ Vettore Risultante (R)</div>
            <div class="res-grid">
              <div class="res-item">
                <span class="ri-label">|R| Modulo</span>
                <span class="ri-val">€{{ magResultante.toFixed(0) }}/m</span>
              </div>
              <div class="res-item">
                <span class="ri-label">θ Direzione</span>
                <span class="ri-val">{{ angleResultante.toFixed(1) }}°</span>
              </div>
              <div class="res-item">
                <span class="ri-label">CO₂ Totale</span>
                <span class="ri-val">{{ (totCO2/1000).toFixed(1) }}t</span>
              </div>
            </div>
          </div>

          <h3 class="section-title mt-4">Dettaglio Componenti</h3>
          <div class="cards-horizontal">
            <div v-for="b in bollette" :key="b.id" 
                 class="bolletta-card" 
                 :class="{ active: activeId === b.id }"
                 :style="{ borderColor: activeId === b.id ? b.color : '' }"
                 @click="activeId = activeId === b.id ? null : b.id">
              
              <div class="bc-header">
                <span class="bc-icon">{{ b.emoji }}</span>
                <span class="bc-angle" :style="{ color: b.color, borderColor: b.color + '44', background: b.color + '11' }">θ={{ b.angleDeg }}°</span>
              </div>
              <div class="bc-name">{{ b.nome }}</div>
              <div class="bc-mag" :style="{ color: b.color }">€{{ b.magnitude }}</div>
              <div class="bc-sub">/mese · {{ b.consumo }}</div>

              <div v-if="activeId === b.id" class="bc-details fade-in-fast" :style="{ borderTopColor: b.color + '33' }">
                <div class="bc-row">vₓ <span>{{ vComp(b).x.toFixed(1) }}</span></div>
                <div class="bc-row">v_y <span>{{ vComp(b).y.toFixed(1) }}</span></div>
                <div class="bc-row text-red">CO₂ <span>{{ b.co2KgAnno }} kg</span></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="tab === 'decomp'" class="tab-pane">
          <p class="section-desc mb-3">
            Ogni bolletta viene decomposta nelle sue componenti: <span class="text-white">economica (vₓ)</span> e <span class="text-white">ambientale (v_y)</span>.
          </p>

          <div v-for="b in bollette" :key="'dec'+b.id" class="smart-tile decomp-card mt-2">
            <div class="dec-header">
              <div class="dec-title"><span class="dec-icon">{{ b.emoji }}</span> {{ b.nome }}</div>
              <span class="dec-mag" :style="{ color: b.color, background: b.color + '15' }">|v| = €{{ b.magnitude }}</span>
            </div>

            <div class="dec-bar-wrap">
              <div class="dec-bar-info">
                <span>vₓ (Impatto Economico)</span>
                <span class="text-white">{{ vComp(b).x.toFixed(1) }} u</span>
              </div>
              <div class="dec-track">
                <div class="dec-fill" :style="{ width: `${pctComp(b).x}%`, background: `linear-gradient(90deg, ${b.color}66, ${b.color})` }"></div>
              </div>
            </div>

            <div class="dec-bar-wrap mt-2">
              <div class="dec-bar-info">
                <span>v_y (Impatto Ambientale)</span>
                <span class="text-white">{{ vComp(b).y.toFixed(1) }} u</span>
              </div>
              <div class="dec-track">
                <div class="dec-fill" :style="{ width: `${pctComp(b).y}%`, background: 'linear-gradient(90deg, rgba(16,185,129,0.4), #10b981)' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="tab === 'simula'" class="tab-pane">
          <p class="section-desc mb-3">
            Modifica le bollette e osserva come cambia il vettore risultante. Ridurre una spesa = accorciare il suo vettore.
          </p>

          <div class="smart-tile">
            <div v-for="b in bollette" :key="'sim'+b.id" class="slider-wrap">
              <div class="slider-info">
                <span :style="{ color: b.color, fontWeight: 800 }">{{ b.emoji }} {{ b.nome }}</span>
                <span class="text-white font-mono">€{{ magnitudes[b.id] }}/m</span>
              </div>
              <input type="range" class="custom-slider" min="10" max="300" v-model.number="magnitudes[b.id]" :style="{ accentColor: b.color }" />
            </div>
          </div>

          <div class="smart-tile canvas-tile mt-3">
            <span class="canvas-badge text-cyan">LIVE PREVIEW</span>
            <div class="canvas-wrapper">
              <svg width="100%" viewBox="0 0 360 200" style="overflow: visible;">
                <line :x1="ox" :y1="200" :x2="ox" :y2="10" stroke="var(--border-color)" stroke-width="1.5" />
                <line :x1="10" :y1="150" :x2="350" :y2="150" stroke="var(--border-color)" stroke-width="1.5" />
                
                <g v-for="b in bollette" :key="'live'+b.id">
                  <line :x1="ox" :y1="150" :x2="ox + vComp(b).x" :y2="150 - vComp(b).y" :stroke="b.color" stroke-width="3" stroke-linecap="round" />
                </g>
                <line :x1="ox" :y1="150" :x2="ox + resultant.x" :y2="150 - resultant.y" stroke="var(--accent-cyan)" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 4" />
              </svg>
            </div>
          </div>

          <div class="res-grid mt-3">
            <div class="res-item">
              <span class="ri-label">Spesa Totale</span>
              <span class="ri-val text-wallet">€{{ totale }}/m</span>
            </div>
            <div class="res-item">
              <span class="ri-label">CO₂ Annua</span>
              <span class="ri-val text-green">{{ (totCO2/1000).toFixed(2) }}t</span>
            </div>
          </div>

          <div class="smart-tile alert-tile mt-3">
            💡 <strong>Interpretazione vettoriale:</strong> abbassare la bolletta del gas riduce la componente v_y (ambientale) più di tutte le altre, data la sua elevata CO₂ per euro speso. Il vettore risultante ruoterebbe verso l'asse X — impatto economico più contenuto, impronta ambientale ridotta.
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios';
import AuthService from '@/services/AuthService';
import GuideHeader from '@/components/layout/GuideHeader.vue';

const router = useRouter();

// STATO UI
const loading = ref(true);
const entered = ref(false);
const tab = ref('vettori');
const activeId = ref(null);
const activeAddressName = ref('Caricamento...');

const tabs = [
  { id: 'vettori', label: '📐 Spazio 2D' },
  { id: 'decomp', label: '∑ Decomposizione' },
  { id: 'simula', label: '🎛 Simula' }
];

// DATI BASE REALI
const baseData = reactive({
  energia: { mensile: 0, consumo: 0 },
  gas: { mensile: 0, consumo: 0 },
  acqua: { mensile: 0, consumo: 0 }
});
const isGreenEnergy = ref(false);
const co2Factors = { energia: 0.233, gas: 2.04, acqua: 0.149 };

// STATO SIMULATORE
const magnitudes = reactive({ energia: 0, gas: 0, acqua: 0 });

// ANIMAZIONI
const animProgress = ref(0);
const triggerAnimation = () => {
  animProgress.value = 0;
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / 1000, 1);
    animProgress.value = 1 - Math.pow(1 - p, 4);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

watch(tab, (newVal) => {
  if (newVal === 'vettori' || newVal === 'simula') triggerAnimation();
});

// LOGICA FETCH (Stessa identica astrazione robusta)
onMounted(async () => {
  try {
    const [userRes, resRes] = await Promise.all([ AuthService.getUser(), axios.get('/api/resources') ]);
    const resources = resRes.data.data || resRes.data || [];

    const groups = {};
    resources.forEach(r => {
        let aiData = {};
        try { aiData = typeof r.ai_analysis === 'string' ? JSON.parse(r.ai_analysis) : (r.ai_analysis || {}); } catch(e) {}
        const aiAddr = aiData?.indirizzo || {};
        const via = aiAddr.Via ? aiAddr.Via.trim() : (r.address ? r.address.trim() : '');
        const civico = aiAddr.NumeroCivico ? aiAddr.NumeroCivico.trim() : '';
        const citta = aiAddr.Città ? aiAddr.Città.trim() : (r.city ? r.city.trim() : '');
        let displayCity = `${citta}`.trim();
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
    
    if (savedId && groupedResources.some(g => g.id === savedId)) activeGroup = groupedResources.find(g => g.id === savedId);
    else if (groupedResources.length > 0) activeGroup = groupedResources[0];

    if (activeGroup) {
        activeAddressName.value = activeGroup.address;
        const rPower = activeGroup.items.find(r => !r.resource_type || r.resource_type === 'energia_elettrica');
        const rGas = activeGroup.items.find(r => r.resource_type === 'gas');
        const rWater = activeGroup.items.find(r => r.resource_type === 'acqua');

        let pAi = {}, gAi = {}, wAi = {};
        if (rPower) try { pAi = typeof rPower.ai_analysis === 'string' ? JSON.parse(rPower.ai_analysis) : (rPower.ai_analysis || {}); } catch(e) {}
        if (rGas) try { gAi = typeof rGas.ai_analysis === 'string' ? JSON.parse(rGas.ai_analysis) : (rGas.ai_analysis || {}); } catch(e) {}
        if (rWater) try { wAi = typeof rWater.ai_analysis === 'string' ? JSON.parse(rWater.ai_analysis) : (rWater.ai_analysis || {}); } catch(e) {}

        isGreenEnergy.value = pAi.is_100_green === true || String(pAi.is_100_green).toLowerCase() === 'true';

        const pKwh = rPower?.annual_consumption_kwh || pAi?.consumption_bands?.total_annual || 0;
        const gSmc = rGas?.annual_consumption_smc || rGas?.annual_consumption_kwh || gAi?.consumption?.annual_smc || gAi?.consumption?.annual_mc || 0; 
        const wM3 = rWater?.annual_consumption_m3 || rWater?.annual_consumption_kwh || wAi?.consumption?.annual_mc || 0;

        baseData.energia.consumo = Math.round(pKwh / 12) || 0;
        baseData.energia.mensile = Math.round((pKwh / 12) * 0.25) || 120;
        baseData.gas.consumo = Math.round(gSmc / 12) || 0;
        baseData.gas.mensile = Math.round((gSmc / 12) * 1.10) || 85;
        baseData.acqua.consumo = Math.round(wM3 / 12) || 0;
        baseData.acqua.mensile = Math.round((wM3 / 12) * 2.50) || 30;

        magnitudes.energia = baseData.energia.mensile;
        magnitudes.gas = baseData.gas.mensile;
        magnitudes.acqua = baseData.acqua.mensile;
    }
  } catch (error) {
    console.error("Errore Vector Dashboard", error);
  } finally {
    loading.value = false;
    await nextTick();
    setTimeout(() => { entered.value = true; }, 50);
    triggerAnimation();
  }
});

// MATEMATICA VETTORI
const SCALE = 1.0; 
const ox = 50; 
const oy = 250;

const bollette = computed(() => [
  { 
    id: "energia", nome: "Energia", emoji: "⚡", 
    color: isGreenEnergy.value ? "#10b981" : "#f59e0b", 
    magnitude: magnitudes.energia, 
    co2KgAnno: Math.round(baseData.energia.consumo * (isGreenEnergy.value ? 0 : co2Factors.energia) * 12 * (magnitudes.energia / (baseData.energia.mensile||1))),
    angleDeg: isGreenEnergy.value ? 0 : 35,
    consumo: `${baseData.energia.consumo} kWh/m`
  },
  { 
    id: "gas", nome: "Gas", emoji: "🔥", color: "#f97316", 
    magnitude: magnitudes.gas, 
    co2KgAnno: Math.round(baseData.gas.consumo * co2Factors.gas * 12 * (magnitudes.gas / (baseData.gas.mensile||1))),
    angleDeg: 72,
    consumo: `${baseData.gas.consumo} smc/m`
  },
  { 
    id: "acqua", nome: "Acqua", emoji: "💧", color: "#3b82f6", 
    magnitude: magnitudes.acqua, 
    co2KgAnno: Math.round(baseData.acqua.consumo * co2Factors.acqua * 12 * (magnitudes.acqua / (baseData.acqua.mensile||1))),
    angleDeg: 15,
    consumo: `${baseData.acqua.consumo} m³/m`
  }
]);

const vComp = (b) => {
  const rad = (b.angleDeg * Math.PI) / 180;
  return { x: b.magnitude * Math.cos(rad) * SCALE, y: b.magnitude * Math.sin(rad) * SCALE };
};

const pctComp = (b) => {
  const c = vComp(b);
  const sum = Math.abs(c.x) + Math.abs(c.y);
  if (sum === 0) return { x: 0, y: 0 };
  return { x: (Math.abs(c.x) / sum) * 100, y: (Math.abs(c.y) / sum) * 100 };
};

const resultant = computed(() => bollette.value.reduce((acc, b) => {
  const v = vComp(b);
  return { x: acc.x + v.x, y: acc.y + v.y };
}, { x: 0, y: 0 }));

const totale = computed(() => bollette.value.reduce((s, b) => s + b.magnitude, 0));
const totCO2 = computed(() => bollette.value.reduce((s, b) => s + b.co2KgAnno, 0));
const magResultante = computed(() => Math.sqrt(resultant.value.x**2 + resultant.value.y**2) / SCALE);
const angleResultante = computed(() => (Math.atan2(resultant.value.y, resultant.value.x) * 180) / Math.PI);
</script>

<style scoped>
@import '@/assets/main_V0.css';

.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); font-family: 'Inter', sans-serif; }
.main-content { padding: 16px; max-width: 480px; margin: 0 auto; padding-bottom: 90px; }

/* ANIMAZIONI */
.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0; }
.fade-in-fast { animation: fadeIn 0.2s ease forwards; }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* SELEZIONE NUCLEO E TEXT */
.address-section { margin-bottom: 20px; }
.address-selector { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-card); }
.address-info .label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 4px; }
.address-value { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--text-primary); }
.pin-icon { width: 16px; height: 16px; color: var(--accent-cyan); flex-shrink: 0; }
.sync-badge { background: rgba(56, 189, 248, 0.1); color: var(--accent-cyan); padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; border: 1px solid rgba(56, 189, 248, 0.2); }
.section-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; margin: 0; }
.text-white { color: var(--text-primary); font-weight: 600; }
.text-cyan { color: var(--accent-cyan); }
.text-wallet { color: #d4af37; }
.text-green { color: #10b981; }
.text-red { color: #ef4444; }

/* TABS FINTECH */
.tabs-section { margin-bottom: 20px; }
.fintech-tabs { display: flex; background: var(--bg-card); padding: 4px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
.f-tab { flex: 1; text-align: center; padding: 10px 0; background: transparent; border: none; border-radius: 8px; font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
.f-tab.active { background: var(--bg-app); color: var(--text-primary); box-shadow: 0 2px 6px rgba(0,0,0,0.1); border: 1px solid var(--border-color); }

/* SPINNER */
.loading-state { text-align: center; padding: 4rem 1rem; }
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

/* CARDS GLOBALI */
.smart-tile { background: var(--bg-card); border-radius: 16px; padding: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-card); }
.section-title { font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; padding-left: 4px; }

/* VETTORI CANVAS */
.canvas-tile { position: relative; overflow: hidden; padding: 10px; background: linear-gradient(180deg, var(--bg-card) 0%, rgba(255,255,255,0.01) 100%); }
.canvas-badge { position: absolute; top: 12px; right: 14px; font-size: 9px; color: var(--text-muted); font-weight: 800; letter-spacing: 1px; }

/* RISULTANTE CARD */
.resultant-tile { background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(56, 189, 248, 0.02)); border-color: rgba(56, 189, 248, 0.3); }
.res-header { font-size: 10px; color: var(--accent-cyan); text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 12px; }
.res-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.res-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 10px; display: flex; flex-direction: column; }
.ri-label { font-size: 9px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
.ri-val { font-size: 16px; font-weight: 900; color: var(--text-primary); }

/* HORIZONTAL CARDS */
.cards-horizontal { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
.bolletta-card { flex: 0 0 110px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 12px; cursor: pointer; transition: 0.2s; }
.bolletta-card.active { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.bc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.bc-icon { font-size: 20px; }
.bc-angle { font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 800; border: 1px solid; }
.bc-name { font-size: 12px; font-weight: 800; margin-bottom: 2px; }
.bc-mag { font-size: 16px; font-weight: 900; }
.bc-sub { font-size: 9px; color: var(--text-muted); }
.bc-details { margin-top: 10px; padding-top: 10px; border-top: 1px dashed; font-size: 10px; font-weight: 600; font-family: monospace; display: flex; flex-direction: column; gap: 4px; }
.bc-row { display: flex; justify-content: space-between; color: var(--text-muted); }
.bc-row span { color: var(--text-primary); }

/* DECOMPOSIZIONE */
.decomp-card { display: flex; flex-direction: column; }
.dec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.dec-title { font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
.dec-mag { font-size: 11px; padding: 3px 8px; border-radius: 6px; font-weight: 800; }
.dec-bar-wrap { display: flex; flex-direction: column; gap: 6px; }
.dec-bar-info { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); font-weight: 600; }
.dec-track { height: 8px; background: var(--bg-app); border-radius: 99px; overflow: hidden; border: 1px solid var(--border-color); }
.dec-fill { height: 100%; border-radius: 99px; transition: width 1s cubic-bezier(0.22, 1, 0.36, 1); }

/* SIMULATORE */
.slider-wrap { margin-bottom: 16px; }
.slider-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
.font-mono { font-family: monospace; font-weight: 800; }
.custom-slider { width: 100%; height: 6px; border-radius: 99px; background: var(--bg-app); outline: none; -webkit-appearance: none; }
.custom-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: white; border: 2px solid currentColor; cursor: pointer; }

.alert-tile { background: rgba(59, 130, 246, 0.05); border-color: rgba(59, 130, 246, 0.2); font-size: 11px; line-height: 1.6; color: var(--text-muted); }

/* UTILS */
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mb-3 { margin-bottom: 12px; }
</style>
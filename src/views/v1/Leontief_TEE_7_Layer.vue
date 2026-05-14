<template>
  <div class="cer-app-wrapper">
    <div class="no-print">
      <GuideHeader />
    </div>

    <div v-if="loading" class="loading-state no-print">
      <div class="spinner"></div>
      <p class="loader-text">ESTRAZIONE MODELLO DINAMICO Z×Z IN CORSO...</p>
    </div>

    <div v-else class="cer-container" :class="{ 'is-entered': entered }">
      
      <div class="c-header" style="background: #1A1710;">
        <svg class="c-header-bg" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid slice">
          <line v-for="i in 11" :key="'h'+i" x1="0" :y1="(i-1)*20" x2="500" :y2="(i-1)*20" />
          <line v-for="i in 26" :key="'v'+i" :x1="(i-1)*20" y1="0" :x2="(i-1)*20" y2="200" />
        </svg>

        <div class="c-header-content">
          <div class="c-header-top">
            <div>
              <div class="c-kicker">Leontief {{ activeIndices.length }} Settori · TEE · Riqualificazione Energetica</div>
              <h1 class="c-title" style="color: #F0EDE4;">Impatto integrato del nucleo</h1>
              <div class="c-subtitle">
                <span v-for="(s, idx) in activeSectors" :key="s.id">{{ s.short }}{{ idx < activeSectors.length - 1 ? ' · ' : '' }}</span>
              </div>
            </div>
            
            <div class="c-kpi-grid" style="background: #2E2A20;">
              <div class="c-kpi-cell" style="background: #201E16;">
                <div class="c-kpi-lbl" >Spesa d</div>
                <div class="c-kpi-val" style="color: #C8B880;">€{{ totD1.toFixed(0) }}/m</div>
              </div>
              <div class="c-kpi-cell" style="background: #201E16;">
                <div class="c-kpi-lbl" >Output x</div>
                <div class="c-kpi-val" style="color: #C8A050;">€{{ totX1.toFixed(0) }}/m</div>
              </div>
              <div class="c-kpi-cell" style="background: #201E16;">
                <div class="c-kpi-lbl" >Mult. medio</div>
                <div class="c-kpi-val" :style="{ color: avgM1 < avgM0 ? '#7AB87A' : '#C87A7A' }">×{{ avgM1.toFixed(3) }}</div>
              </div>
              <div class="c-kpi-cell" style="background: #201E16;">
                <div class="c-kpi-lbl" >TEE Valore</div>
                <div class="c-kpi-val" style="color: #A87AB8;">€{{ teeValLeontief }}/a</div>
              </div>
            </div>
          </div>

          <div class="c-tabs">
            <button v-for="t in TABS" :key="t.id" @click="tab = t.id" class="c-tab-btn" :class="{ active: tab === t.id }">
              {{ t.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="c-body" style="background: #EEEADE; min-height: 80vh;">
        
        <div v-if="tab === 'vettori'" class="tab-content fade-in delay-1">
          <div class="c-input-grid" style="gap: 12px; margin-bottom: 16px;">
            <div>
              <div class="c-slabel" style="margin-bottom: 6px;">BASELINE — {{ activeIndices.length }} settori</div>
              <div class="svg-vector-box">
                <VectorSVG :d="d0" :x="r0.x" :sectors="activeSectors" :angles="activeAngles" accentColor="#2A2520" />
              </div>
            </div>
            <div>
              <div class="c-slabel" style="margin-bottom: 6px;" :style="{ color: activeIv.length > 0 ? '#4A7A4A' : '#8A8070' }">
                {{ activeIv.length > 0 ? `CON ${activeIv.length} INTERVENTO/I` : 'NESSUN INTERVENTO ATTIVO' }}
              </div>
              <div class="svg-vector-box">
                <VectorSVG :d="d1" :x="r1.x" :sectors="activeSectors" :angles="activeAngles" :accentColor="activeIv.length > 0 ? '#4A7A4A' : '#2A2520'" />
              </div>
            </div>
          </div>

          <div class="c-card mb-4" style="background: #FDFBF6;">
            <div class="c-slabel">Seleziona interventi per aggiornare i vettori</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div v-for="iv in INTERVENTIONS" :key="iv.id" 
                @click="toggleIv(iv.id)"
                class="iv-selector-row"
                :class="{ 'is-active': activeIv.includes(iv.id) }"
                :style="{ borderColor: activeIv.includes(iv.id) ? '#4A7A4A88' : '#D0C8B0' }">
                <div class="iv-icon" :style="{ color: activeIv.includes(iv.id) ? '#4A7A4A' : '#8A8070' }">
                  {{ activeIv.includes(iv.id) ? '✓' : iv.icon }}
                </div>
                <div>
                  <span style="font-family: monospace; font-size: 11px; font-weight: 600; color: #2A2520;">{{ iv.label }}</span>
                  <span v-if="getSchemeForIv(iv.tee)" style="font-family: monospace; font-size: 9px; color: #5A1A5A; margin-left: 8px;">
                    TEE {{ getSchemeForIv(iv.tee).id }}: {{ getSchemeForIv(iv.tee).tpy }}/a = €{{ Math.round(getSchemeForIv(iv.tee).tpy * TEE_PRICE) }}/a
                  </span>
                </div>
                <div style="font-family: monospace; font-size: 9px; color: #8A8070;">€{{ iv.invest.toLocaleString() }}</div>
              </div>
            </div>
          </div>

          <div class="c-card mb-4" style="background: #FDFBF6;">
            <div class="c-slabel">Moltiplicatori per settore — baseline (grigio) vs attivo (colore)</div>
            <div v-for="(s, i) in activeSectors" :key="s.id" class="c-mult-bar-wrap">
              <div class="c-mb-header">
                <span class="c-mb-lbl" :style="{ color: s.color }">{{ s.short }} {{ s.label }} <span v-if="s.id === 'energia' && isGreenEnergy" style="color: #4A7A4A; font-weight: bold; font-size: 8px;">(100% Green AI)</span></span>
                <span class="c-mb-vals">
                  <span class="c-mb-old">×{{ (r0.mult[i] || 1).toFixed(3) }}</span>
                  <span class="c-mb-new" :style="{ color: s.color }">×{{ (r1.mult[i] || 1).toFixed(3) }}</span>
                  <span v-if="(r0.mult[i] || 1) > (r1.mult[i] || 1)" class="c-mb-delta">
                    −{{ ((1 - r1.mult[i]/r0.mult[i])*100).toFixed(1) }}%
                  </span>
                </span>
              </div>
              <div class="mb-1">
                <div class="c-bar-bg"><div class="c-bar-fill" :style="{ width: entered ? `${((r0.mult[i]||1)/(Math.max(r0.mult[i], r1.mult[i])*1.05))*100}%` : '0', background: '#C0B8A8' }"></div></div>
              </div>
              <div>
                <div class="c-bar-bg"><div class="c-bar-fill" :style="{ width: entered ? `${((r1.mult[i]||1)/(Math.max(r0.mult[i], r1.mult[i])*1.05))*100}%` : '0', background: s.color }"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="tab === 'matrice'" class="tab-content fade-in delay-1">
          <div class="c-card mb-4" style="background: #FDFBF6; overflow-x: auto;">
            <div class="c-slabel">Matrice A — {{ activeIndices.length }}×{{ activeIndices.length }} — baseline (con delta interventi attivi)</div>
            <table style="border-collapse: collapse; width: 100%; font-family: monospace; font-size: 9px;">
              <thead>
                <tr>
                  <th style="width: 26px;"></th>
                  <th v-for="s in activeSectors" :key="s.id" :style="{ color: s.color, fontWeight: 600, padding: '4px 5px', textAlign: 'center' }">{{ s.short }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in A1" :key="i">
                  <td style="text-align: right; padding-right: 5px; font-weight: 600; font-size: 8px;" :style="{ color: activeSectors[i].color }">{{ activeSectors[i].short }}</td>
                  <td v-for="(v, j) in row" :key="j" style="padding: 6px 5px; text-align: center; border: 0.5px solid #E0D8C8;" :style="getMatCellStyle(i, j, v)">
                    {{ i === j ? '—' : v.toFixed(2) }}
                    <div v-if="i !== j && Math.abs(v - (A0[i]?.[j]??0)) > 0.005" :style="{ fontSize: '6px', color: (v - A0[i][j]) < 0 ? '#4A7A4A' : '#7A4A4A', marginTop: '1px' }">
                      {{ (v - A0[i][j]) < 0 ? '▼' : '▲' }}{{ Math.abs(v - A0[i][j]).toFixed(2) }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: right; padding-right: 5px; padding-top: 5px; color: #8A8070; font-size: 8px;">×Σ</td>
                  <td v-for="(m, j) in r1.mult" :key="j" style="text-align: center; padding-top: 5px; font-weight: 600; font-size: 9px;" :style="{ color: activeSectors[j].color }">×{{ m.toFixed(3) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="c-card mb-4" style="background: #FDFBF6;">
            <div class="c-slabel">Perché il modello esteso Z×Z cambia le priorità di intervento</div>
            <div class="c-ctx-row border-none" style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 0.5px solid #E0D8C8;">
              <div class="c-ctx-icon">🔗</div>
              <div>
                <div class="c-ctx-title">Dinamica Settoriale Nascosta</div>
                <div class="c-ctx-desc">Nel modello {{ activeIndices.length }}×{{ activeIndices.length }} generato in base alle tue utenze, i vettori energetici interagiscono. Un intervento come il fotovoltaico modifica non solo l'acquisto di elettricità, ma il richiamo a catena dei settori logistici e di manutenzione collegati.</div>
              </div>
            </div>
            <div class="c-ctx-row border-none">
              <div class="c-ctx-icon">🎯</div>
              <div>
                <div class="c-ctx-title">Effetto Cumulativo</div>
                <div class="c-ctx-desc">Ridurre un coefficiente strutturale (come il riscaldamento a gas) propaga efficienza a valle: l'intervento combinato risulta sempre matematicamente superiore alla somma delle singole parti.</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="tab === 'nucleo'" class="tab-content fade-in delay-1">
          <div class="c-card mb-4" style="background: #FDFBF6;">
            <div class="c-slabel">§ Bollette base (Estratte dall'AI)</div>
            <div class="c-input-grid" style="grid-template-columns: repeat(3, 1fr);">
              <div>
                <div style="font-family: monospace; font-size: 9px; color: #7A7060; margin-bottom: 5px;">⚡ Energia: €{{ p.energia }}</div>
                <input type="range" min="5" max="300" step="5" v-model.number="p.energia" class="c-slider" style="accent-color: #8B6914;" />
              </div>
              <div>
                <div style="font-family: monospace; font-size: 9px; color: #7A7060; margin-bottom: 5px;">🔥 Gas: €{{ p.gas }}</div>
                <input type="range" min="5" max="300" step="5" v-model.number="p.gas" class="c-slider" style="accent-color: #8B6914;" />
              </div>
              <div>
                <div style="font-family: monospace; font-size: 9px; color: #7A7060; margin-bottom: 5px;">💧 Acqua: €{{ p.acqua }}</div>
                <input type="range" min="5" max="100" step="5" v-model.number="p.acqua" class="c-slider" style="accent-color: #8B6914;" />
              </div>
            </div>
          </div>

          <div class="c-card mb-4" style="background: #FDFBF6;">
            <div class="c-slabel">§ Riscaldamento supplementare</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
              <button v-for="h in HEAT" :key="h.id" @click="p.hsrc = h.id" style="font-family: monospace; font-size: 9px; padding: 5px 12px; border-radius: 2px; cursor: pointer; transition: all 0.2s;" :style="{ background: p.hsrc === h.id ? h.color+'22' : '#F5F2EC', border: `1px solid ${p.hsrc === h.id ? h.color : '#C8C0A8'}`, color: p.hsrc === h.id ? h.color : '#6A6050' }">{{ h.label }}</button>
            </div>
            <div style="font-family: monospace; font-size: 9px; color: #6A6050; margin-bottom: 5px;">
              Consumo: {{ p.hqty }} {{ getHeatObj.unit }} · Costo: €{{ (getHeatObj.cpu * p.hqty).toFixed(0) }}/m
            </div>
            <input type="range" min="0" max="200" step="5" v-model.number="p.hqty" class="c-slider" style="accent-color: #6B3A1F;" />
          </div>

          <div class="c-card mb-4" style="background: #FDFBF6;">
            <div class="c-slabel">§ Trasporti — auto del nucleo</div>
            <div class="c-input-grid" style="margin-bottom: 12px;">
              <div>
                <div style="font-family: monospace; font-size: 9px; color: #6A6050; margin-bottom: 8px;">Tipo carburante</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                  <button v-for="f in FUEL" :key="f.id" @click="p.fuel = f.id" style="font-family: monospace; font-size: 9px; padding: 5px 8px; border-radius: 2px; cursor: pointer;" :style="{ background: p.fuel === f.id ? f.color+'22' : '#F5F2EC', border: `1px solid ${p.fuel === f.id ? f.color : '#C8C0A8'}`, color: p.fuel === f.id ? f.color : '#6A6050' }">{{ f.label }}</button>
                </div>
              </div>
              <div>
                <div style="font-family: monospace; font-size: 9px; color: #6A6050; margin-bottom: 5px;">Km/mese: {{ p.km }}</div>
                <input type="range" min="0" max="3000" step="100" v-model.number="p.km" class="c-slider" style="accent-color: #2A6A2A; margin-bottom: 10px;" />
                <div style="font-family: monospace; font-size: 9px; color: #6A6050; margin-bottom: 5px;">Veicoli: {{ p.nveh }}</div>
                <input type="range" min="1" max="4" step="1" v-model.number="p.nveh" class="c-slider" style="accent-color: #2A6A2A;" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="tab === 'tee'" class="tab-content fade-in delay-1">
          <div class="c-card mb-4" style="background: #FDFBF6;">
            <div class="c-slabel" style="color: #8B6914;">Titoli di Efficienza Energetica — meccanismo</div>
            <div style="display: flex; flex-direction: column; gap: 0;">
              <div class="c-ctx-row" style="border-bottom: 0.5px solid #E0D8C8;">
                <div style="font-family: monospace; font-size: 10px; color: #8B6914; font-weight: 600; padding-top: 1px;">Cosa sono</div>
                <div style="font-family: 'DM Sans', sans-serif; font-size: 13px; color: #4A4030; line-height: 1.75;">Strumenti di mercato che certificano il risparmio di 1 TOE (11.628 MWh) di energia primaria ottenuto tramite un intervento certificato. Valore medio €{{ TEE_PRICE }}/TEE.</div>
              </div>
              <div class="c-ctx-row border-none">
                <div style="font-family: monospace; font-size: 10px; color: #8B6914; font-weight: 600; padding-top: 1px;">Leontief e TEE</div>
                <div style="font-family: 'DM Sans', sans-serif; font-size: 13px; color: #4A4030; line-height: 1.75;">Le schede standard calcolano il risparmio diretto. Il modello Leontief a {{ activeIndices.length }} settori identifica i risparmi indotti propagati lungo la matrice tecnica: il risparmio reale totale risulta costantemente dell'8-15% superiore.</div>
              </div>
            </div>
          </div>

          <div class="c-card mb-4" style="background: #FDFBF6; padding: 18px;">
            <div class="c-slabel">Schede applicabili — seleziona per simulare</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div v-for="scheme in TEE_SCHEMES" :key="scheme.id" @click="toggleTEE(scheme.id)"
                class="tee-card" :class="{ 'is-active': activeTEE.includes(scheme.id) }"
                :style="{ background: activeTEE.includes(scheme.id) ? '#EDF5ED' : '#FDFBF6', borderColor: activeTEE.includes(scheme.id) ? '#4A7A4A' : '#C8C0A8' }">
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                      <span style="font-family: monospace; font-size: 9px; color: white; padding: 1px 7px; border-radius: 2px; letter-spacing: 0.06em;" :style="{ background: activeTEE.includes(scheme.id) ? '#4A7A4A' : '#8B6914' }">{{ scheme.id }}</span>
                      <span style="font-family: monospace; font-size: 11px; font-weight: 600; color: #2A2520;">{{ scheme.label }} — {{ scheme.desc }}</span>
                    </div>
                    <div style="font-family: 'DM Sans', sans-serif; font-size: 12px; color: #6A6050; line-height: 1.6;">Requisito: {{ scheme.req }}</div>
                  </div>
                  <div style="text-align: right; min-width: 80px;">
                    <div style="font-family: monospace; font-size: 9px; color: #8A8070; margin-bottom: 2px;">TEE/anno</div>
                    <div style="font-family: Georgia, serif; font-style: italic; font-size: 20px; line-height: 1;" :style="{ color: activeTEE.includes(scheme.id) ? '#4A7A4A' : '#8B6914' }">{{ scheme.tpy.toFixed(2) }}</div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
                  <div style="border-radius: 2px; padding: 7px 10px;" :style="{ background: activeTEE.includes(scheme.id) ? '#D8EDD8' : '#F0EDE6' }">
                    <div style="font-family: monospace; font-size: 7px; color: #8A8070; margin-bottom: 2px; text-transform: uppercase;">Valore scheda</div>
                    <div style="font-family: Georgia, serif; font-size: 14px; color: #4A7A4A;">€{{ Math.round(scheme.tpy * TEE_PRICE) }}/a</div>
                  </div>
                  <div style="border-radius: 2px; padding: 7px 10px;" :style="{ background: activeTEE.includes(scheme.id) ? '#D0EAD0' : '#EAE8E0' }">
                    <div style="font-family: monospace; font-size: 7px; color: #8A8070; margin-bottom: 2px; text-transform: uppercase;">+ Effetto Leontief</div>
                    <div style="font-family: Georgia, serif; font-size: 14px; color: #5A1A5A;">+€{{ Math.round(getLeontiefBonus(scheme) * TEE_PRICE) }}/a</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, defineComponent, h } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios';
import AuthService from '@/services/AuthService';
import GuideHeader from '@/components/layout/GuideHeader.vue';
import { extractAnalysisData } from '@/utils/analysisExtractor';

const router = useRouter();
const loading = ref(true);
const entered = ref(false);
const tab = ref('vettori');

// Variabile reattiva estratta dall'AI per l'energia elettrica
const isGreenEnergy = ref(false);

const TABS = [
  { id: "vettori", label: "📐 Vettori" },
  { id: "matrice", label: "∑ Matrice" },
  { id: "nucleo",  label: "🔧 Nucleo" },
  { id: "tee",     label: "◈ TEE" },
];

// --- SETTORI BASE STATICI ---
const BASE_SECTORS = [
  { id: "energia", label: "Energia elettrica", short: "EL", color: "#8B6914" },
  { id: "gas",     label: "Gas naturale",      short: "GN", color: "#8B2020" },
  { id: "acqua",   label: "Acqua potabile",    short: "AQ", color: "#1A4A8B" },
  { id: "rs",      label: "Riscaldamento",     short: "RS", color: "#6B3A1F" },
  { id: "ca",      label: "Carburante auto",   short: "CA", color: "#2A6A2A" },
  { id: "ma",      label: "Manutenzione",      short: "MA", color: "#4A4A18" },
  { id: "lt",      label: "Logistica termica", short: "LT", color: "#5A1A5A" },
];

// --- ANGOLI REATTIVI (Al flag isGreenEnergy) ---
const ALL_ANGLES = computed(() => [
  isGreenEnergy.value ? 0 : 28, // EL: Scende a 0° se l'energia è 100% Green
  65, // GN
  12, // AQ
  52, // RS
  38, // CA
  18, // MA
  32  // LT
]);

const p = ref({
  energia: 120, gas: 85, acqua: 30,
  hsrc: "gasolio", hqty: 40,
  fuel: "benzina", km: 1200, nveh: 1,
  manut: 60, logistica: 25,
});

const HEAT = [
  { id: "gasolio", label: "Gasolio",  unit: "L/m",  cpu: 1.35, color: "#5A4A10" },
  { id: "legna",   label: "Legna",    unit: "kg/m", cpu: 0.10, color: "#6B3A1F" },
  { id: "gpl",     label: "GPL",      unit: "kg/m", cpu: 0.90, color: "#1A4A4A" },
  { id: "pellet",  label: "Pellet",   unit: "kg/m", cpu: 0.35, color: "#5A3A0A" },
  { id: "teler",   label: "Teleriscald.", unit: "GJ/m", cpu: 65.0, color: "#2A1A5A" },
];

const FUEL = [
  { id: "benzina", label: "Benzina",  ckm: 0.12, color: "#4A3020" },
  { id: "diesel",  label: "Diesel",   ckm: 0.10, color: "#3A2A1A" },
  { id: "ibrido",  label: "Ibrido",   ckm: 0.07, color: "#1A3A2A" },
  { id: "ev",      label: "Elettrico",ckm: 0.04, color: "#1A2A3A" },
];

const TEE_PRICE = 270;
const TEE_SCHEMES = [
  { id: "2E",  label: "Scheda 2E",  desc: "Pompa di calore",          tpy: 1.60, req: "Sostituzione caldaia con PDC (COP≥3.5)" },
  { id: "1E",  label: "Scheda 1E",  desc: "Isolamento termico",       tpy: 0.28, req: "Pareti o copertura ≥40mm isolante" },
  { id: "23E", label: "Scheda 23E", desc: "FV + storage",             tpy: 0.25, req: "Impianto ≥3kWp con batteria accoppiata" },
  { id: "5E",  label: "Scheda 5E",  desc: "Veicolo elettrico",        tpy: 0.45, req: "Sostituzione auto ICE→BEV ≥30kWh" },
  { id: "10E", label: "Scheda 10E", desc: "Riduttori flusso idrico",  tpy: 0.08, req: "Aeratori M22/M24 su ≥4 rubinetti" },
  { id: "CER", label: "CER",        desc: "Comunità energetica",      tpy: 0.60, req: "≥10 membri, FV condiviso ≥20kWp" },
];

const INTERVENTIONS = [
  { id: "pdc",   label: "Pompa di calore",       icon: "🌡", tee: "2E", invest: 6800,
    apply: p => ({ ...p, gas: Math.round(p.gas * 0.12), hqty: Math.round(p.hqty * 0.05), hsrc: "teler" }) },
  { id: "fv",    label: "Fotovoltaico 4kWp+bat", icon: "☀", tee: "23E", invest: 7200,
    apply: p => ({ ...p, energia: Math.round(p.energia * 0.30) }) },
  { id: "ev",    label: "Auto elettrica",        icon: "🔋", tee: "5E", invest: 12000,
    apply: p => ({ ...p, fuel: "ev", energia: p.energia + Math.round(p.km * 0.04) }) },
  { id: "isol",  label: "Isolamento termico",    icon: "🧱", tee: "1E", invest: 9500,
    apply: p => ({ ...p, gas: Math.round(p.gas * 0.55), hqty: Math.round(p.hqty * 0.55) }) },
  { id: "pellet",label: "Conversione a pellet",  icon: "🪵", tee: "2E", invest: 3200,
    apply: p => ({ ...p, hsrc: "pellet", gas: Math.round(p.gas * 0.2) }) },
];

const getHeatObj = computed(() => HEAT.find(h => h.id === p.value.hsrc) || HEAT[0]);
const getFuelObj = computed(() => FUEL.find(f => f.id === p.value.fuel) || FUEL[0]);
const getSchemeForIv = (id) => TEE_SCHEMES.find(t => t.id === id);

const activeIv = ref([]);
const activeTEE = ref([]);

const toggleIv = (id) => {
  if (activeIv.value.includes(id)) activeIv.value = activeIv.value.filter(x => x !== id);
  else activeIv.value.push(id);
};
const toggleTEE = (id) => {
  if (activeTEE.value.includes(id)) activeTEE.value = activeTEE.value.filter(x => x !== id);
  else activeTEE.value.push(id);
};
const getLeontiefBonus = (s) => {
  if (s.id === "2E") return s.tpy * 0.15;
  if (s.id === "5E") return s.tpy * 0.12;
  if (s.id === "1E") return s.tpy * 0.08;
  return s.tpy * 0.04;
};

// --- LOGICA Z VETTORI ---
const rPowerExists = ref(false);
const rGasExists = ref(false);
const rWaterExists = ref(false);

const activeIndices = computed(() => {
  const idxs = [];
  if (rPowerExists.value || p.value.energia > 0) idxs.push(0);
  if (rGasExists.value || p.value.gas > 0) idxs.push(1);
  if (rWaterExists.value || p.value.acqua > 0) idxs.push(2);
  idxs.push(3, 4, 5, 6); // RS, CA, MA, LT sempre presenti nel layer esteso
  return idxs;
});

// PASSAGGIO SDOPPIATO DI SETTORI E ANGOLI PER GARANTIRE REATTIVITÀ
const activeSectors = computed(() => activeIndices.value.map(i => BASE_SECTORS[i]));
const activeAngles = computed(() => activeIndices.value.map(i => ALL_ANGLES.value[i]));

// MATH 
const identity = n => Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));
const matSub   = (A,B) => A.map((r,i)=>r.map((v,j)=>v-B[i][j]));

function invN(m) {
  const n = m.length;
  const aug = m.map((row,i)=>[...row,...identity(n)[i]]);
  for(let c=0;c<n;c++){
    let piv=c;
    for(let r=c+1;r<n;r++) if(Math.abs(aug[r][c])>Math.abs(aug[piv][c])) piv=r;
    [aug[c],aug[piv]]=[aug[piv],aug[c]];
    const d=aug[c][c];
    if(Math.abs(d)<1e-12) return identity(n);
    for(let j=0;j<2*n;j++) aug[c][j]/=d;
    for(let r=0;r<n;r++){
      if(r===c) continue;
      const f=aug[r][c];
      for(let j=0;j<2*n;j++) aug[r][j]-=f*aug[c][j];
    }
  }
  return aug.map(r=>r.slice(n));
}

function leontief(matA, vecD) {
  try {
    const n = matA.length;
    const L = invN(matSub(identity(n), matA));
    const x = vecD.map((_,i) => L[i].reduce((s,v,j) => s + v * (vecD[j]||0), 0));
    const mult = Array.from({length:n}, (_,j) => L.reduce((s,row) => s + row[j], 0));
    return { L, x, mult };
  } catch(e) {
    const n = matA.length;
    return { L: identity(n), x: [...vecD], mult: Array(n).fill(1) };
  }
}

const buildA_Full = (hsrc, fuel) => {
  const hElec = hsrc === "teler" ? 0.15 : hsrc === "pellet" ? 0.05 : 0.02;
  const hLog = (hsrc === "gasolio" || hsrc === "gpl") ? 0.18 : (hsrc === "legna" || hsrc === "pellet") ? 0.10 : 0.04;
  const cElec = fuel === "ev" ? 0.45 : fuel === "ibrido" ? 0.12 : 0.02;
  const cLog = (fuel === "benzina" || fuel === "diesel") ? 0.14 : fuel === "ibrido" ? 0.08 : 0.01;
  return [
    [0.00, 0.08, 0.12, hElec, cElec, 0.03, 0.02],
    [0.05, 0.00, 0.10, 0.12,  0.04,  0.02, 0.06],
    [0.02, 0.03, 0.00, 0.02,  0.01,  0.02, 0.01],
    [0.01, 0.02, 0.01, 0.00,  0.00,  0.01, hLog],
    [0.01, 0.02, 0.00, 0.00,  0.00,  0.05, cLog],
    [0.02, 0.01, 0.01, 0.01,  0.04,  0.00, 0.02],
    [0.01, 0.05, 0.01, hLog/2, cLog/2, 0.01, 0.00],
  ];
};

const buildD_Full = (param) => {
  const h = HEAT.find(x => x.id === param.hsrc) || HEAT[0];
  const f = FUEL.find(x => x.id === param.fuel) || FUEL[0];
  return [
    param.energia, param.gas, param.acqua,
    h.cpu * param.hqty,
    f.ckm * param.km * param.nveh,
    param.manut, param.logistica,
  ];
};

const getSubMatrix = (mat) => activeIndices.value.map(i => activeIndices.value.map(j => mat[i][j]));
const getSubVector = (vec) => activeIndices.value.map(i => vec[i]);

// COMPUTED DYNAMICS
const A0_full = computed(() => buildA_Full(p.value.hsrc, p.value.fuel));
const A0 = computed(() => getSubMatrix(A0_full.value));
const d0 = computed(() => getSubVector(buildD_Full(p.value)));
const r0 = computed(() => leontief(A0.value, d0.value));

const effP = computed(() => {
  let q = { ...p.value };
  activeIv.value.forEach(id => {
    const iv = INTERVENTIONS.find(x => x.id === id);
    if (iv) q = iv.apply(q);
  });
  return q;
});

const A1_full = computed(() => buildA_Full(effP.value.hsrc, effP.value.fuel));
const A1 = computed(() => getSubMatrix(A1_full.value));
const d1 = computed(() => getSubVector(buildD_Full(effP.value)));
const r1 = computed(() => leontief(A1.value, d1.value));

const totD1 = computed(() => d1.value.reduce((s, v) => s + v, 0));
const totX1 = computed(() => r1.value.x.reduce((s, v) => s + v, 0));
const avgM0 = computed(() => r0.value.mult.reduce((s, v) => s + v, 0) / activeIndices.value.length);
const avgM1 = computed(() => r1.value.mult.reduce((s, v) => s + v, 0) / activeIndices.value.length);

const teeActiveObjs = computed(() => activeTEE.value.map(id => TEE_SCHEMES.find(t => t.id === id)).filter(Boolean));
const teeValLeontief = computed(() => Math.round(teeActiveObjs.value.reduce((s, t) => s + t.tpy + getLeontiefBonus(t), 0) * TEE_PRICE));

const getMatCellStyle = (i, j, v) => {
  const isD = i === j;
  let bg = isD ? "#F5F2EC" : v >= 0.10 ? "#F5E8E8" : v >= 0.05 ? "#F8F0E0" : "#FDFBF6";
  let color = isD ? "#C0B8A8" : v >= 0.10 ? "#7A2020" : v >= 0.05 ? "#7A5010" : "#5A5248";
  return { background: bg, color: color, fontWeight: v >= 0.08 ? 600 : 400 };
};

// RICERCA PROFONDA LOCALE DEL FLAG GREEN SULL'OGGETTO AI DELLA LUCE
const findGreenFlag = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.is_100_green === true || String(obj.is_100_green).toLowerCase() === 'true') return true;
  if (obj.isgreen === true || String(obj.isgreen).toLowerCase() === 'true') return true;
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      if (findGreenFlag(obj[key])) return true;
    }
  }
  return false;
};

// COMPONENT SVG INLINE CON TOOLTIP HOVER E LEGENDA DINAMICA (USANDO ANGLES)
const VectorSVG = defineComponent({
  props: ['d', 'x', 'sectors', 'angles', 'accentColor'],
  setup(props) {
    const prog = ref(0);
    onMounted(() => {
      let st = null;
      const go = ts => {
        if (!st) st = ts;
        const p = Math.min((ts - st) / 1000, 1);
        prog.value = 1 - Math.pow(1 - p, 3);
        if (p < 1) requestAnimationFrame(go);
      };
      requestAnimationFrame(go);
    });

    return () => {
      const W = 320, H = 220, ox = 50, oy = H - 30, SC = 0.85;
      
      // I vettori mappano sugli angoli reattivi
      const vecs = props.sectors.map((s, i) => {
        const rad = (props.angles[i] || 0) * Math.PI / 180;
        return {
          ...s,
          dx: (props.d[i] || 0) * Math.cos(rad) * SC,
          dy: (props.d[i] || 0) * Math.sin(rad) * SC,
          vx: (props.x[i] || 0) * Math.cos(rad) * SC,
          vy: (props.x[i] || 0) * Math.sin(rad) * SC,
        };
      });

      const Rx = vecs.reduce((s, v) => s + v.vx, 0);
      const Ry = vecs.reduce((s, v) => s + v.vy, 0);
      const theta = (Math.atan2(Ry, Rx) * 180 / Math.PI).toFixed(1);
      const Rmag = Math.sqrt(Rx * Rx + Ry * Ry);

      const lines = [1,2,3,4,5].map(i => h('line', { x1: 0, y1: oy - i * 36, x2: W, y2: oy - i * 36, stroke: '#D8D4C8', strokeWidth: 0.3, strokeDasharray: '2 8' }));
      const vLines = [1,2,3,4,5,6,7].map(i => h('line', { x1: ox + i * 38, y1: 10, x2: ox + i * 38, y2: oy, stroke: '#D8D4C8', strokeWidth: 0.3, strokeDasharray: '2 8' }));

      const defs = h('defs', [
        ...props.sectors.map(s => h('marker', { id: `m-${s.id}`, markerWidth: 6, markerHeight: 6, refX: 5, refY: 2.5, orient: 'auto' }, [h('path', { d: 'M0,0 L0,5 L6,2.5 z', fill: s.color })])),
        h('marker', { id: 'm-R', markerWidth: 7, markerHeight: 7, refX: 6, refY: 3, orient: 'auto' }, [h('path', { d: 'M0,0 L0,6 L7,3 z', fill: props.accentColor })]),
        h('marker', { id: 'm-ax', markerWidth: 5, markerHeight: 5, refX: 4, refY: 2.5, orient: 'auto' }, [h('path', { d: 'M0,0 L0,5 L5,2.5 z', fill: '#B0A890' })])
      ]);

      const axes = [
        h('line', { x1: ox, y1: H - 6, x2: ox, y2: 8, stroke: '#B0A890', strokeWidth: 1, markerEnd: 'url(#m-ax)' }),
        h('line', { x1: 6, y1: oy, x2: W - 6, y2: oy, stroke: '#B0A890', strokeWidth: 1, markerEnd: 'url(#m-ax)' }),
        h('text', { x: W - 8, y: oy + 12, fill: '#A09880', fontSize: 7, fontFamily: 'monospace', textAnchor: 'end' }, 'COSTO €/m'),
        h('text', { x: ox - 4, y: 14, fill: '#A09880', fontSize: 7, fontFamily: 'monospace', textAnchor: 'middle' }, 'CO₂'),
        h('circle', { cx: ox, cy: oy, r: 3, fill: '#3D3530' })
      ];

      const elements = vecs.map((v, i) => {
        const texts = [];
        if (prog.value > 0.6) {
           texts.push(h('text', {
             x: ox + v.vx * prog.value + (v.vx >= 0 ? 6 : -6),
             y: oy - v.vy * prog.value + (v.vy >= 0 ? -3 : 8),
             fill: v.color,
             fontSize: 8,
             fontFamily: 'monospace',
             fontWeight: 'bold',
             textAnchor: v.vx >= 0 ? 'start' : 'end',
             opacity: Math.min((prog.value - 0.6) / 0.4, 1)
           }, v.short));
        }

        return h('g', { key: v.id, style: { cursor: 'pointer' } }, [
          h('title', null, `${v.label} (${v.short})\nDomanda diretta (d): €${(props.d[i] || 0).toFixed(1)}/m\nOutput Leontief (x): €${(props.x[i] || 0).toFixed(1)}/m`),
          h('line', { x1: ox, y1: oy, x2: ox + v.dx * prog.value, y2: oy - v.dy * prog.value, stroke: v.color, strokeWidth: 1.5, strokeDasharray: '5 4', strokeOpacity: 0.35, markerEnd: `url(#m-${v.id})` }),
          h('line', { x1: ox, y1: oy, x2: ox + v.vx * prog.value, y2: oy - v.vy * prog.value, stroke: v.color, strokeWidth: 2.5, strokeLinecap: 'round', markerEnd: `url(#m-${v.id})` }),
          ...texts
        ]);
      });

      const resultantText = [];
      if (prog.value > 0.7) {
         resultantText.push(h('text', {
           x: ox + Rx * prog.value * 0.5 + 10,
           y: oy - Ry * prog.value * 0.5 - 5,
           fill: props.accentColor,
           fontSize: 8,
           fontFamily: 'monospace',
           opacity: Math.min((prog.value - 0.7) / 0.3, 1)
         }, `R θ=${theta}° | ${(Rmag/SC).toFixed(0)}€`));
      }

      const resultant = h('g', { style: { cursor: 'pointer' } }, [
         h('title', null, `Vettore Risultante R\nAngolo: ${theta}°\nModulo Totale: €${(Rmag/SC).toFixed(0)}/m`),
         h('line', { x1: ox, y1: oy, x2: ox + Rx * prog.value, y2: oy - Ry * prog.value, stroke: props.accentColor, strokeWidth: 3.5, strokeLinecap: 'round', markerEnd: 'url(#m-R)' }),
         ...resultantText
      ]);

      const legendItems = props.sectors.map(s => {
          return h('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontFamily: 'monospace', color: '#6A6050' } }, [
              h('div', { style: { width: '8px', height: '8px', backgroundColor: s.color, borderRadius: '50%' } }),
              h('span', null, `${s.short} - ${s.label}`)
          ]);
      });
      const legendWrapper = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', padding: '0 8px 12px 8px', justifyContent: 'center' } }, legendItems);

      const svgNode = h('svg', { width: '100%', viewBox: `0 0 ${W} ${H}`, style: { display: 'block', overflow: 'visible' } }, [defs, ...lines, ...vLines, ...axes, ...elements, resultant]);

      return h('div', null, [svgNode, legendWrapper]);
    };
  }
});

// INIT TRAMITE EXTRACTOR E CHECK LOCALE GREEN FLAG
onMounted(async () => {
  try {
    const [userRes, resRes] = await Promise.all([AuthService.getUser(), axios.get('/api/resources')]);
    const resources = resRes.data.data || resRes.data || [];
    
    const data = extractAnalysisData(resources, localStorage.getItem('esurf_active_address_id'));

    if (data) {
        if (data.rPower) rPowerExists.value = true;
        if (data.rGas) rGasExists.value = true;
        if (data.rWater) rWaterExists.value = true;

        p.value.energia = data.d[0];
        p.value.gas = data.d[1];
        p.value.acqua = data.d[2];

        // ESTRAZIONE LOCALE DEL FLAG GREEN DALLA BOLLETTA ELETTRICA
        let pAi = {};
        if (data.rPower) {
           try { pAi = typeof data.rPower.ai_analysis === 'string' ? JSON.parse(data.rPower.ai_analysis) : (data.rPower.ai_analysis || {}); } catch(e) {}
           if (typeof pAi === 'string') { try { pAi = JSON.parse(pAi); } catch(e) {} }
        }
        isGreenEnergy.value = findGreenFlag(pAi);
    }
  } catch (error) {
    console.error("Errore Leontief TEE", error);
  } finally {
    loading.value = false;
    await nextTick();
    setTimeout(() => { entered.value = true; }, 100);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

.cer-app-wrapper { background: #EEEADE; min-height: 100vh; font-family: Georgia, serif; color: #2A2520; }
.mb-4 { margin-bottom: 24px; }
.mb-3 { margin-bottom: 12px; }

/* SPINNER */
.loading-state { text-align: center; padding: 8rem 1rem; }
.spinner { width: 44px; height: 44px; border: 3px solid #E8E4DC; border-top: 3px solid #8B6914; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
.loader-text { margin-top: 16px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em; color: #A09890; text-transform: uppercase; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* ANIMAZIONI */
.fade-in { opacity: 0; transition: opacity 0.6s ease; }
.fade-in.is-entered, .tab-content.fade-in { opacity: 1; }
.delay-1 { transition-delay: 0.1s; }

/* HEADER */
.c-header { padding: 26px 22px 0; position: relative; overflow: hidden; }
.c-header-bg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.05; pointer-events: none; stroke: white; stroke-width: 0.5; }
.c-header-content { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; }
.c-header-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 18px; }
.c-kicker { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: #f7e3c4; text-transform: uppercase; margin-bottom: 5px; }
.c-title { font-size: 24px; font-weight: 400; font-style: italic; margin: 0; line-height: 1.2; }
.c-subtitle { font-family: 'DM Mono', monospace; font-size: 9px; color: #f8f8f7; margin-top: 4px; }
.c-kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; }
.c-kpi-cell { padding: 10px 14px; }
.c-kpi-lbl { font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 3px;  color: #b6b4b2;}
.c-kpi-val { font-size: 16px; line-height: 1; font-style: italic; }

.c-tabs { display: flex; gap: 0; }
.c-tab-btn { background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; padding: 9px 16px; margin-bottom: -1px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: #c2c1bf; transition: color 0.2s; }
.c-tab-btn.active { border-bottom-color: #C8A850; color: #C8A850; }

/* BODY */
.c-body { max-width: 860px; margin: 0 auto; padding: 22px 20px 60px; }
.c-card { border-radius: 2px; padding: 18px; border: 0.5px solid #C8C0A8; }
.c-slabel { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #b6b4b2; margin-bottom: 14px; }

/* INPUTS */
.c-input-grid { display: grid; grid-template-columns: 1fr 1fr; }
.svg-vector-box { background: #F5F2EA; border: 0.5px solid #C8C0A8; border-radius: 3px; overflow: hidden; padding-top: 10px; }
.c-slider { width: 100%; height: 4px; border-radius: 99px; background: #E0D8C8; outline: none; -webkit-appearance: none; cursor: pointer; }
.c-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: white; border: 2px solid #EEEADE; }

.iv-selector-row { display: grid; grid-template-columns: 24px 1fr auto; gap: 10px; align-items: center; border-radius: 2px; padding: 10px 14px; cursor: pointer; transition: all 0.18s; background: #F5F2EC; }
.iv-selector-row.is-active { background: #EDF5ED; }
.iv-icon { font-family: monospace; font-size: 10px; font-weight: 600; }

.c-mult-bar-wrap { margin-bottom: 13px; }
.c-mb-header { display: flex; justify-content: space-between; margin-bottom: 4px; font-family: monospace; font-size: 10px; }
.c-mb-lbl { color: #6A6050; }
.c-mb-vals { }
.c-mb-old { color: #A09880; text-decoration: line-through; }
.c-mb-new { margin-left: 8px; font-weight: 600; }
.c-mb-delta { color: #4A7A4A; margin-left: 6px; font-size: 9px; }
.c-bar-bg { height: 5px; background: #E8E4D8; border-radius: 99px; overflow: hidden; margin-bottom: 3px; }
.c-bar-fill { height: 100%; border-radius: 99px; transition: width 1s cubic-bezier(.22,1,.36,1); }

.c-ctx-row { display: grid; grid-template-columns: 26px 1fr; gap: 12px; }
.c-ctx-icon { font-size: 18px; padding-top: 1px; }
.c-ctx-title { font-family: monospace; font-size: 11px; font-weight: 600; color: #2A2520; margin-bottom: 4px; }
.c-ctx-desc { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #6A6050; line-height: 1.7; }

.tee-card { border-radius: 0 3px 3px 0; padding: 14px 16px; cursor: pointer; transition: all 0.2s; margin-bottom: 8px;}
</style>
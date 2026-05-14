<template>
  <div class="pv-app-wrapper">
    <div class="no-print">
      <GuideHeader :isLightMode="false" />
    </div>

    <div v-if="loading" class="loading-state no-print">
      <div class="spinner"></div>
      <p class="loader-text">ESTRAZIONE DATI E GENERAZIONE GRAFICI...</p>
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
              <div class="p-kicker">ASSESSMENT RETROFIT ACCUMULO</div>
              <h1 class="p-title">ROI Batteria (BESS)</h1>
              <div class="p-subtitle">{{ activeAddressName }}</div>
            </div>
            
            <div class="p-kpi-grid">
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: #C8A850;">Capacità BESS</div>
                <div class="p-kpi-val" style="color: #C8A050;">{{ battery }} <span style="font-size: 10px;">kWh</span></div>
              </div>
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: #4A8BBA;">Autocons. Aggiuntivo</div>
                <div class="p-kpi-val" style="color: #4A8BBA;">{{ totalBatteryCovered.toFixed(0) }} <span style="font-size: 10px;">kWh/a</span></div>
              </div>
              <div class="p-kpi-cell" style="background: rgba(74, 186, 107, 0.05); border-bottom: 2px solid #4ABA6B;">
                <div class="p-kpi-lbl" style="color: #4ABA6B;">Vantaggio Netto BESS</div>
                <div class="p-kpi-val" style="color: #4ABA6B;">€{{ netBatteryBenefit.toFixed(0) }} <span style="font-size: 10px;">/a</span></div>
              </div>
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: #8A8B90; display: flex; align-items: center; gap: 4px;">
                  Payback
                  <button @click="showRoiModal = true" class="p-help-btn no-print" style="width:14px; height:14px; font-size:8px;">?</button>
                </div>
                <div class="p-kpi-val" style="color: #F0F2F5;">{{ payback > 0 ? payback.toFixed(1) : '—' }} <span style="font-size: 10px;">anni</span></div>
              </div>
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: #8A8B90;">ROI (15 anni)</div>
                <div class="p-kpi-val" style="color: #F0F2F5;">{{ roi15 > 0 ? roi15.toFixed(0) : '—' }}%</div>
              </div>
            </div>
          </div>

          <div class="p-tabs" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="display: flex; gap: 4px;">
              <button v-for="t in TABS" :key="t.id" @click="tab = t.id" class="p-tab-btn" :class="{ active: tab === t.id }">
                {{ t.label }}
              </button>
            </div>
            <button @click="printReport" class="p-tab-btn no-print" style="color: #C8A850; font-weight: bold; border: 1px solid rgba(200, 168, 80, 0.4); border-radius: 4px; padding: 6px 12px; transition: 0.2s;" onmouseover="this.style.background='rgba(200, 168, 80, 0.1)'" onmouseout="this.style.background='transparent'">
              🖨️ STAMPA REPORT
            </button>
          </div>
        </div>
      </div>

      <div class="p-body">
        
        <div v-show="tab === 'dashboard'" class="tab-content fade-in delay-1 print-section">

          <div class="p-card mb-4" style="border-left: 2px solid #C8A850;">
            <div class="p-slabel" style="display: flex; justify-content: space-between;">
              <span>Profilo Fornitura Attuale (Analisi Bolletta AI)</span>
              <span style="color: #C8A850; font-weight: bold;">Costo Bolletta: €{{ costoKwh.toFixed(3) }}/kWh</span>
            </div>
            <div class="p-grid-4 mt-2">
              <div class="p-info-box">
                <div class="p-info-lbl">Piano Tariffario</div>
                <div class="p-info-val">{{ tariffPlan }}</div>
                <div class="p-info-sub">{{ marketType }}</div>
              </div>
              <div class="p-info-box">
                <div class="p-info-lbl">Potenza Impegnata</div>
                <div class="p-info-val">{{ contractPower }} kW</div>
                <div class="p-info-sub">Limite contrattuale</div>
              </div>
              <div class="p-info-box">
                <div class="p-info-lbl">Sostenibilità</div>
                <div class="p-info-val" :style="{ color: isGreen ? '#4ABA6B' : '#F0F2F5' }">
                  {{ isGreen ? '100% Green' : 'Mix Standard' }}
                </div>
                <div class="p-info-sub">{{ isGreen ? 'Energia certificata' : 'Fonti fossili' }}</div>
              </div>
              <div class="p-info-box">
                <div class="p-info-lbl">Prezzo GSE / SSP</div>
                <div class="p-info-val" style="color: #4A8BBA;">€{{ SSP_PRICE }}/kWh</div>
                <div class="p-info-sub">Stima vendita eccedenze</div>
              </div>
            </div>
          </div>
          
          <div class="p-card mb-4">
            <div class="p-slabel" style="display: flex; justify-content: space-between;">
              <span>Analisi Vettoriale: Copertura del Fabbisogno</span>
              <span style="color: #4A8BBA; font-weight: bold;">Batteria: {{ battery }} kWh</span>
            </div>
            
            <div class="p-charts-grid mt-4">
              <div>
                <div class="p-chart-title">1. Profilo Attuale (Senza Batteria)</div>
                <div class="p-chart-legend">
                  <span style="color: #C8A850;">■ Autoconsumo FV</span>
                  <span style="color: #C87A50;">■ Prelievo Rete</span>
                  <span style="color: #4ABA6B;">■ Immissione (Avanzo)</span>
                </div>
                <div class="p-chart-container">
                  <svg width="100%" viewBox="0 0 320 190" class="solar-chart">
                    <line x1="30" y1="100" x2="310" y2="100" stroke="#8A8B90" stroke-width="1.5" />
                    <line v-for="y in [30, 65, 135, 170]" :key="'g1'+y" x1="30" :y1="y" x2="310" :y2="y" stroke="#2A2D35" stroke-width="0.5" stroke-dasharray="2 4"/>
                    
                    <path :d="pathLoadArea" fill="rgba(200, 122, 80, 0.5)" />
                    <path :d="pathLoadLine" fill="none" stroke="#C87A50" stroke-width="1.5" />
                    
                    <path :d="pathAutoDirArea" fill="rgba(200, 168, 80, 0.7)" />
                    <path :d="pathAutoDirLine" fill="none" stroke="#C8A850" stroke-width="1.5" />
                    
                    <path :d="pathExportOldArea" fill="rgba(74, 186, 107, 0.5)" />
                    <path :d="pathExportOldLine" fill="none" stroke="#4ABA6B" stroke-width="1.5" />
                    
                    <text v-for="(m, i) in months" :key="'mt1'+i" :x="30 + i*25.4" y="185" fill="#5A5D65" font-size="8" text-anchor="middle">{{ m }}</text>
                  </svg>
                </div>
                <div class="p-chart-desc">
                  <strong>Stato Attuale:</strong> La base gialla è il sole usato direttamente. Il resto del fabbisogno devi comprarlo dalla rete (zona arancione). Intanto, l'avanzo solare finisce in rete (zona verde).
                </div>
              </div>

              <div>
                <div class="p-chart-title">2. Profilo con Sistema BESS</div>
                <div class="p-chart-legend">
                  <span style="color: #C8A850;">■ Autoconsumo FV</span>
                  <span style="color: #4A8BBA;">■ Copertura BESS</span>
                  <span style="color: #C87A50;">■ Residuo Rete</span>
                </div>
                <div class="p-chart-container">
                  <svg width="100%" viewBox="0 0 320 190" class="solar-chart">
                    <line x1="30" y1="100" x2="310" y2="100" stroke="#8A8B90" stroke-width="1.5" />
                    <line v-for="y in [30, 65, 135, 170]" :key="'g2'+y" x1="30" :y1="y" x2="310" :y2="y" stroke="#2A2D35" stroke-width="0.5" stroke-dasharray="2 4"/>
                    
                    <path :d="pathLoadArea" fill="rgba(200, 122, 80, 0.5)" />
                    <path :d="pathLoadLine" fill="none" stroke="#C87A50" stroke-width="1.5" />
                    
                    <path :d="pathBessTopArea" fill="rgba(74, 139, 186, 0.7)" />
                    <path :d="pathBessTopLine" fill="none" stroke="#4A8BBA" stroke-width="1.5" />
                    
                    <path :d="pathAutoDirArea" fill="rgba(200, 168, 80, 0.7)" />
                    <path :d="pathAutoDirLine" fill="none" stroke="#C8A850" stroke-width="1.5" />
                    
                    <path :d="pathExportNewArea" fill="rgba(74, 186, 107, 0.5)" />
                    <path :d="pathExportNewLine" fill="none" stroke="#4ABA6B" stroke-width="1.5" />
                    
                    <text v-for="(m, i) in months" :key="'mt2'+i" :x="30 + i*25.4" y="185" fill="#5A5D65" font-size="8" text-anchor="middle">{{ m }}</text>
                  </svg>
                </div>
                <div class="p-chart-desc">
                  <strong>Vantaggio Batteria:</strong> L'accumulo "assorbe" l'immissione verde e la trasforma nella fascia azzurra, che cancella un'ampia fetta della costosa zona arancione.
                </div>
              </div>
            </div>
          </div>

          <div class="p-card-grid">
            <div class="p-card">
              <div style="display: flex; gap: 24px;">
                <div style="flex: 1;">
                  <div class="p-slabel" style="color: #4A8BBA;">Cattura Surplus</div>
                  <div class="p-big-val" style="color: #4A8BBA;">{{ capturePct.toFixed(0) }}%</div>
                  <div class="p-bar-wrap mb-2">
                    <div class="p-bar-fill" :style="{ width: `${capturePct}%`, background: '#4A8BBA' }"></div>
                  </div>
                </div>
                <div style="flex: 1;">
                  <div class="p-slabel" style="color: #C8A850;">Risparmio Bolletta</div>
                  <div class="p-big-val" style="color: #C8A850;">{{ savingPct.toFixed(0) }}%</div>
                  <div class="p-bar-wrap mb-2">
                    <div class="p-bar-fill" :style="{ width: `${savingPct}%`, background: '#C8A850' }"></div>
                  </div>
                </div>
              </div>
              <div class="p-sub-text mt-3">
                Immissione recuperata: <strong>{{ totalBatteryCovered.toFixed(0) }} kWh</strong> salvati.<br/>
                Prelievo residuo da pagare: <strong>{{ totalNewImport.toFixed(0) }} kWh</strong>
              </div>
            </div>
            
            <div class="p-card">
              <div class="p-slabel" style="color: #4ABA6B;">Vantaggio Netto (Utile Annuo)</div>
              <div class="p-big-val" style="color: #4ABA6B;">€{{ netBatteryBenefit.toLocaleString(undefined, {maximumFractionDigits: 0}) }}<span style="font-size: 14px; font-weight: normal;">/anno</span></div>
              <div class="p-sub-text mt-2">
                Risparmio lordo bolletta: €{{ grossBatterySavings.toFixed(0) }} /a<br/>
                Perdita incasso GSE (mancato export): -€{{ lostGseRevenue.toFixed(0) }} /a
              </div>
            </div>
          </div>
        </div>

        <div v-show="tab === 'sizing'" class="tab-content fade-in delay-1 print-section">
          <div class="p-card mb-4">
            <div class="p-slabel" style="color: #C8A850;">Configurazione Retrofit BESS</div>
            <div class="p-input-row">
              <div>
                <div class="p-input-lbl">Capacità Batteria di Accumulo (kWh)</div>
                <div class="p-input-val" style="color: #4A8BBA;">{{ battery }} kWh</div>
                <input type="range" min="0" max="100" step="1" v-model.number="battery" class="p-slider" style="accent-color: #4A8BBA;" />
                <div class="p-sub-text mt-1">Costo medio stimato: €{{ COST_PER_KWH_BAT }}/kWh installato.</div>
              </div>
            </div>
            <div class="p-alert-box mt-4">
              <strong>Istruzioni:</strong> Carica il file <strong>Excel (.xlsx)</strong> del tuo impianto esistente per popolare la tabella. I dati visualizzati sono estratti direttamente dal file e non sono modificabili manualmente.
            </div>
          </div>

          <div class="p-card mb-4">
            <div class="p-slabel" style="color: #4A8BBA; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>Dati Impianto e Analisi Differenziale</span>
                <button @click="showHelpModal = true" class="p-help-btn no-print">?</button>
              </div>
              <div class="no-print">
                <label for="excelUpload" style="cursor: pointer; background: #4A8BBA; color: #0A0C0E; padding: 6px 14px; border-radius: 4px; font-family: 'Inter', sans-serif; font-weight: bold; font-size: 11px; text-transform: uppercase;">
                  📁 CARICA EXCEL
                </label>
                <input id="excelUpload" type="file" accept=".xlsx, .xls" @change="handleFileUpload" style="display: none;" />
              </div>
            </div>
            
            <div class="p-table" style="margin-top: 10px;">
              <div class="p-tr-7 header-row">
                <span>Mese</span>
                <span class="text-right">Produzione</span>
                <span class="text-right">Prelievo</span>
                <span class="text-right">Immissione</span>
                <span class="text-right">BESS</span>
                <span class="text-right">New Prel.</span>
                <span class="text-right">New Imm.</span>
              </div>
              
              <div class="p-tr-7" v-for="(row, index) in manualData" :key="index">
                <span class="p-td-lbl">{{ row.month }}</span>
                <span class="p-td-val text-right" style="color: #C8A850;">{{ row.prod.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 2}) }}</span>
                <span class="p-td-val text-right" style="color: #C87A50;">{{ row.import_old.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 2}) }}</span>
                <span class="p-td-val text-right" style="color: #4ABA6B;">{{ row.export_old.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 2}) }}</span>
                
                <span class="p-td-val text-right" style="color: #4A8BBA; font-weight: bold;">{{ calcBattery(row).toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: #C87A50;">{{ calcNewImport(row).toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: #4ABA6B;">{{ calcNewExport(row).toFixed(0) }}</span>
              </div>
              
              <div class="p-tr-7 total-row">
                <span>TOTALE</span>
                <span class="text-right">{{ annualProduction.toFixed(0) }}</span>
                <span class="text-right">{{ totalOldImport.toFixed(0) }}</span>
                <span class="text-right">{{ totalOldExport.toFixed(0) }}</span>
                <span class="text-right" style="color: #4A8BBA;">{{ totalBatteryCovered.toFixed(0) }}</span>
                <span class="text-right">{{ totalNewImport.toFixed(0) }}</span>
                <span class="text-right">{{ totalNewExport.toFixed(0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-show="tab === 'roi'" class="tab-content fade-in delay-1 print-section">
          <div class="p-card-grid mb-4">
            <div class="p-card">
              <div class="p-slabel">CAPEX (Investimento BESS)</div>
              <div class="p-big-val">€{{ grossCost.toLocaleString() }}</div>
              <div class="p-sub-text mt-2">Costo fornitura e posa sistema di accumulo.</div>
            </div>
            <div class="p-card" style="border-left: 2px solid #4ABA6B;">
              <div class="p-slabel" style="color: #4ABA6B;">Costo Netto (Detrazione 50%)</div>
              <div class="p-big-val" style="color: #4ABA6B;">€{{ netCost.toLocaleString() }}</div>
              <div class="p-sub-text mt-2">Recupero fiscale in 10 anni (Art. 16-bis TUIR).</div>
            </div>
          </div>

          <div class="p-card mb-4">
            <div class="p-slabel" style="color: #C8A850;">Piano di Rientro Economico</div>
            <div class="p-kpi-grid" style="grid-template-columns: repeat(3, 1fr); margin-top: 16px; background: #1A1D24; border-radius: 8px; border: 1px solid #232830;">
              <div class="p-kpi-cell" style="background: transparent;">
                <div class="p-kpi-lbl">Vantaggio Netto</div>
                <div class="p-kpi-val">€{{ netBatteryBenefit.toFixed(0) }}/a</div>
                <div class="p-kpi-sub">Utile annuo generato dall'accumulo.</div>
              </div>
              <div class="p-kpi-cell" style="background: transparent;">
                <div class="p-kpi-lbl">Payback Period</div>
                <div class="p-kpi-val" style="color: #4ABA6B;">{{ payback.toFixed(1) }} anni</div>
                <div class="p-kpi-sub">Tempo di ammortamento spesa netta.</div>
              </div>
              <div class="p-kpi-cell" style="background: transparent;">
                <div class="p-kpi-lbl">ROI Globale</div>
                <div class="p-kpi-val" style="color: #4A8BBA;">{{ roi15.toFixed(0) }}%</div>
                <div class="p-kpi-sub">Rendimento sul ciclo vita (15 anni).</div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <div class="print-footer">
        <div class="pf-left">E-surf</div>
        <div class="pf-center">Assessment retrofit accumulo su impianto esistente</div>
        <div class="pf-right">{{ currentDate }} <span class="page-num"></span></div>
      </div>
    </div>

    <div v-if="showRoiModal" class="p-modal-overlay no-print" @click.self="showRoiModal = false">
      <div class="p-modal-content fade-in">
        <div class="p-modal-header">
          <h3 style="margin: 0; color: white;">Logica Finanziaria Batteria</h3>
          <button @click="showRoiModal = false" class="p-modal-close">&times;</button>
        </div>
        <div class="p-modal-body">
          <p class="help-text">Il vantaggio netto della batteria è la differenza tra i soldi risparmiati in bolletta (€{{ costoKwh.toFixed(3) }}/kWh) e il ricavo perso per la mancata immissione in rete (€{{ SSP_PRICE }}/kWh) per ogni unità di energia catturata.</p>
        </div>
      </div>
    </div>

    <div v-if="showHelpModal" class="p-modal-overlay no-print" @click.self="showHelpModal = false">
      <div class="p-modal-content fade-in">
        <div class="p-modal-header">
          <h3 style="margin: 0; color: white;">Algoritmo BESS</h3>
          <button @click="showHelpModal = false" class="p-modal-close">&times;</button>
        </div>
        <div class="p-modal-body">
          <p class="help-text">L'energia stoccata viene calcolata mensilmente come il valore minimo tra l'eccedenza prodotta (export), il fabbisogno della casa (import) e il limite tecnologico dei cicli di ricarica giornalieri.</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/services/axios';
import * as XLSX from 'xlsx';
import GuideHeader from '@/components/layout/GuideHeader.vue';
import { extractAnalysisData } from '@/utils/analysisExtractor';

const loading = ref(true);
const entered = ref(false);
const tab = ref('dashboard');
const activeAddressName = ref('Caricamento...');
const currentDate = ref(new Date().toLocaleDateString('it-IT'));
const showRoiModal = ref(false);
const showHelpModal = ref(false);

const COST_PER_KWH_BAT = 700;
const SSP_PRICE = 0.09; 
const TAX_DEDUCTION = 0.50;

const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const TABS = [{ id: 'dashboard', label: '📊 Dashboard' }, { id: 'sizing', label: '📐 Dimensionamento' }, { id: 'roi', label: '💶 Finanziario' }];

const battery = ref(10);
const costoKwh = ref(0.28);
const tariffPlan = ref('N/D');
const contractPower = ref('N/D');
const marketType = ref('N/D');
const isGreen = ref(false);

const manualData = ref(months.map(m => ({
  month: m, prod: 0, import_old: 0, export_old: 0
})));

// --- MOTORE PARSING EXCEL (RAW DATA MAPPING) ---
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    let startIdx = 0;
    for(let i=0; i<rows.length; i++) {
        if (rows[i][0] && String(rows[i][0]).toLowerCase().match(/period|mese|gen/)) {
            startIdx = i + 1;
            break;
        }
    }

    const parseNum = (val) => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const clean = val.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
        return parseFloat(clean) || 0;
      }
      return 0;
    };

    for (let i = 0; i < 12; i++) {
      const excelRow = rows[i + startIdx];
      if (excelRow && excelRow.length >= 4) {
        manualData.value[i].prod = parseNum(excelRow[1]);
        manualData.value[i].export_old = parseNum(excelRow[2]);
        manualData.value[i].import_old = parseNum(excelRow[3]);
      }
    }
    event.target.value = '';
  };
  reader.readAsArrayBuffer(file);
};

// --- ESTRAZIONE FABBISOGNO REALE (LOAD) ---
// Fabbisogno Casa = Autoconsumo Diretto + Prelievo Rete
const getLoad = (r) => Math.max(0, r.prod - r.export_old) + r.import_old;
const getAutoDir = (r) => Math.max(0, r.prod - r.export_old);

// --- CALCOLI BESS ---
const calcBattery = (row) => Math.min(row.export_old, row.import_old, battery.value * 30);
const calcNewImport = (row) => Math.max(0, row.import_old - calcBattery(row));
const calcNewExport = (row) => Math.max(0, row.export_old - calcBattery(row));

const annualProduction = computed(() => manualData.value.reduce((s, r) => s + r.prod, 0));
const totalOldImport = computed(() => manualData.value.reduce((s, r) => s + r.import_old, 0));
const totalOldExport = computed(() => manualData.value.reduce((s, r) => s + r.export_old, 0));
const totalBatteryCovered = computed(() => manualData.value.reduce((s, r) => s + calcBattery(r), 0));
const totalNewImport = computed(() => manualData.value.reduce((s, r) => s + calcNewImport(r), 0));
const totalNewExport = computed(() => manualData.value.reduce((s, r) => s + calcNewExport(r), 0));

const capturePct = computed(() => totalOldExport.value > 0 ? (totalBatteryCovered.value / totalOldExport.value) * 100 : 0);
const savingPct = computed(() => totalOldImport.value > 0 ? (totalBatteryCovered.value / totalOldImport.value) * 100 : 0);

const grossBatterySavings = computed(() => totalBatteryCovered.value * costoKwh.value);
const lostGseRevenue = computed(() => totalBatteryCovered.value * SSP_PRICE);
const netBatteryBenefit = computed(() => grossBatterySavings.value - lostGseRevenue.value);

const grossCost = computed(() => battery.value * COST_PER_KWH_BAT);
const netCost = computed(() => grossCost.value * (1 - TAX_DEDUCTION));
const payback = computed(() => netBatteryBenefit.value > 0 ? netCost.value / netBatteryBenefit.value : 0);
const roi15 = computed(() => netCost.value > 0 ? ((netBatteryBenefit.value * 15 - netCost.value) / netCost.value) * 100 : 0);

// --- MATEMATICA GRAFICI AD AREA IMPILATA (STACKED AREA) ---
const maxChart = computed(() => {
  const loads = manualData.value.map(r => getLoad(r));
  const exports = manualData.value.map(r => r.export_old);
  return Math.max(...loads, ...exports, 10) * 1.1;
});

const getAreaPath = (data) => {
  const dx = 25.4, mx = maxChart.value || 1;
  let d = `M 30,100 `;
  data.forEach((v, i) => { d += `L ${30 + i * dx},${100 - (v / mx) * 70} `; });
  d += `L 310,100 Z`;
  return d;
};

const getTopLinePath = (data) => {
  const dx = 25.4, mx = maxChart.value || 1;
  return `M ` + data.map((v, i) => `${30 + i * dx},${100 - (v / mx) * 70}`).join(' L ');
};

// Vettori Grafico 1
const loadArr = computed(() => manualData.value.map(r => getLoad(r)));
const autoDirArr = computed(() => manualData.value.map(r => getAutoDir(r)));
const exportOldArr = computed(() => manualData.value.map(r => -r.export_old));

const pathLoadArea = computed(() => getAreaPath(loadArr.value));
const pathLoadLine = computed(() => getTopLinePath(loadArr.value));
const pathAutoDirArea = computed(() => getAreaPath(autoDirArr.value));
const pathAutoDirLine = computed(() => getTopLinePath(autoDirArr.value));
const pathExportOldArea = computed(() => getAreaPath(exportOldArr.value));
const pathExportOldLine = computed(() => getTopLinePath(exportOldArr.value));

// Vettori Grafico 2
const bessTopArr = computed(() => manualData.value.map((r, i) => autoDirArr.value[i] + calcBattery(r)));
const exportNewArr = computed(() => manualData.value.map(r => -calcNewExport(r)));

const pathBessTopArea = computed(() => getAreaPath(bessTopArr.value));
const pathBessTopLine = computed(() => getTopLinePath(bessTopArr.value));
const pathExportNewArea = computed(() => getAreaPath(exportNewArr.value));
const pathExportNewLine = computed(() => getTopLinePath(exportNewArr.value));

const printReport = () => window.print();

onMounted(async () => {
  try {
    const res = await axios.get('/api/resources');
    const data = extractAnalysisData(res.data.data || res.data, localStorage.getItem('esurf_active_address_id'));
    if (data?.rPower) {
        activeAddressName.value = data.activeAddressName;
        let pAi = typeof data.rPower.ai_analysis === 'string' ? JSON.parse(data.rPower.ai_analysis) : data.rPower.ai_analysis;
        costoKwh.value = parseFloat(pAi?.costo_medio_kwh || 0.28);
        contractPower.value = pAi?.committed_power_kw || '3.3';
        tariffPlan.value = pAi?.contract_type || 'N/D';
        isGreen.value = !!(pAi?.is_100_green || pAi?.isgreen);
    }
  } catch (e) { console.error(e); } finally { loading.value = false; setTimeout(() => entered.value = true, 100); }
});
</script>

<style>
@media print {
  @page { margin: 0; }
  html, body { background-color: #0A0C0E !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { padding: 15mm !important; padding-bottom: 60px !important; margin: 0 !important; }
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;600&display=swap');
.pv-app-wrapper { background: #0A0C0E; min-height: 100vh; font-family: 'Inter', sans-serif; color: #F0F2F5; }
.p-header { background: #111317; padding: 26px 22px 0; position: relative; border-bottom: 1px solid #232830; }
.p-header-bg { position: absolute; inset: 0; opacity: 0.03; stroke: white; stroke-width: 0.5; }
.p-header-content { position: relative; max-width: 860px; margin: 0 auto; }
.p-kicker { font-family: 'Space Mono', monospace; font-size: 9px; color: #8A8B90; text-transform: uppercase; letter-spacing: 0.2em; }
.p-title { font-size: 26px; margin: 0; font-weight: 400; }
.p-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: #2A2D35; border-radius: 6px; margin-top: 18px; overflow: hidden; }
.p-kpi-cell { background: #16181D; padding: 12px 14px; }
.p-kpi-lbl { font-family: 'Space Mono', monospace; font-size: 8px; text-transform: uppercase; color: #8A8B90; }
.p-kpi-val { font-size: 18px; font-family: 'Space Mono', monospace; font-weight: 700; }
.p-kpi-sub { font-size: 9px; color: #5A5D65; margin-top: 4px; }
.p-tabs { display: flex; margin-top: 20px; }
.p-tab-btn { background: none; border: none; padding: 12px 16px; font-family: 'Space Mono', monospace; font-size: 9px; color: #5A5D65; cursor: pointer; border-bottom: 2px solid transparent; }
.p-tab-btn.active { border-bottom-color: #C8A850; color: #C8A850; }
.p-body { max-width: 860px; margin: 0 auto; padding: 24px 20px 80px; }
.p-card { background: #16181D; border-radius: 8px; padding: 20px; border: 1px solid #232830; }
.p-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.p-slabel { font-family: 'Space Mono', monospace; font-size: 10px; color: #8A8B90; text-transform: uppercase; margin-bottom: 16px; }
.p-big-val { font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700; }
.p-bar-wrap { height: 6px; background: #232830; border-radius: 99px; overflow: hidden; margin-top: 12px; }
.p-bar-fill { height: 100%; transition: width 0.8s; }
.p-sub-text { font-size: 12px; color: #8A8B90; line-height: 1.6; }
.p-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.p-info-box { background: rgba(255,255,255,0.03); border: 1px solid #232830; border-radius: 6px; padding: 12px; }
.p-info-lbl { font-size: 8px; color: #8A8B90; text-transform: uppercase; }
.p-info-val { font-size: 14px; font-weight: 600; }
.p-info-sub { font-size: 10px; color: #5A5D65; }

/* GRAFICI */
.p-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.p-chart-title { font-size: 10px; font-weight: 600; color: #A09880; }
.p-chart-legend { font-size: 8px; margin-bottom: 12px; display: flex; gap: 12px; }
.p-chart-container { border-top: 1px solid #232830; padding-top: 16px; }
.p-chart-desc { font-size: 10px; line-height: 1.4; color: #8A8B90; margin-top: 12px; padding: 8px; background: rgba(255,255,255,0.02); border-radius: 4px; border-left: 2px solid #333; }
.p-chart-desc strong { color: #F0F2F5; display: block; margin-bottom: 2px; text-transform: uppercase; font-size: 9px; }

.p-input-row { display: grid; grid-template-columns: 1fr; gap: 24px; }
.p-input-lbl { font-size: 9px; color: #8A8B90; text-transform: uppercase; }
.p-input-val { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
.p-slider { width: 100%; height: 4px; background: #2A2D35; -webkit-appearance: none; border-radius: 99px; outline: none; }
.p-alert-box { background: rgba(200,168,80,0.05); border: 1px solid rgba(200,168,80,0.2); padding: 12px; border-radius: 6px; font-size: 12px; color: #A09880; }

.p-table { display: flex; flex-direction: column; font-size: 10px; font-family: 'Space Mono', monospace; }
.p-tr-7 { display: grid; grid-template-columns: 0.8fr 1fr 1fr 1fr 1fr 1fr 1fr; padding: 10px 12px; border-bottom: 0.5px solid #232830; align-items: center; }
.p-tr-7:nth-child(even) { background: #1A1D24; }
.header-row { font-weight: bold; background: rgba(255,255,255,0.03) !important; }
.total-row { border-top: 1px solid #4A8BBA; background: rgba(74, 139, 186, 0.1) !important; font-weight: bold; }
.p-td-val { font-weight: 700; }

.print-footer { display: none; }
@media print {
  .no-print { display: none !important; }
  .p-tabs { display: none !important; }
  .print-section { display: block !important; margin-bottom: 40px; page-break-inside: avoid; }
  .print-footer { display: flex; position: fixed; bottom: 0; left: 0; width: 100%; justify-content: space-between; font-size: 9px; color: #8A8B90; padding: 10px 15mm; border-top: 1px solid #232830; background: #0A0C0E !important; }
  .page-num::after { content: " - Pag. " counter(page); }
}

.p-help-btn { background: rgba(74, 139, 186, 0.1); border: 1px solid rgba(74, 139, 186, 0.3); color: #4A8BBA; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; }
.p-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.p-modal-content { background: #16181D; padding: 20px; border-radius: 8px; max-width: 500px; border: 1px solid #2A2D35; }
.p-modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #232830; margin-bottom: 15px; }
.p-modal-close { background: none; border: none; color: white; font-size: 20px; cursor: pointer; }

@media (max-width: 600px) {
  .p-kpi-grid, .p-grid-4, .p-charts-grid, .p-card-grid { grid-template-columns: 1fr; }
  .p-tr-7 { font-size: 8px; grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr; }
}
</style>
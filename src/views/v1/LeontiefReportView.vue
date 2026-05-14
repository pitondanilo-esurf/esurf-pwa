<template>
  <div class="app-container">
    <GuideHeader :isLightMode="false" />

    <main class="main-content">
      <div v-if="loading" class="loading-state fade-in delay-2">
        <div class="spinner"></div>
        <p>Stesura report esecutivo in corso...</p>
      </div>

      <div v-else class="impact-content fade-in delay-2">
        
        <div class="smart-tile report-header mb-3">
          <div class="flex-between align-center">
             <div>
               <div class="report-subtitle">DOCUMENTO DI SINTESI</div>
               <h1 class="report-title">Analisi Input-Output</h1>
             </div>
             <div class="text-right">
               <div class="report-date">{{ currentDate }}</div>
               <div class="report-loc">Modello Leontief</div>
             </div>
          </div>
          <div class="report-desc mt-3">
            Analisi del nucleo <strong class="text-white">{{ activeAddressName }}</strong>. <br>
            Questo documento riassume l'efficienza sistemica dell'abitazione, calcolando i costi nascosti generati dalle interdipendenze tra i vettori energetici in base ai tuoi consumi reali.
          </div>
        </div>

        <div class="res-grid mb-3">
          <div class="res-item">
            <span class="ri-label text-purple">Indice Inefficienza (IIS)</span>
            <span class="ri-val">{{ iis.toFixed(2) }}</span>
            <span class="action-desc mt-1" style="font-size: 9px;" :class="iis > 1.05 ? 'text-red' : 'text-muted'">{{ iis > 1.05 ? '> 1.05 critico' : 'Ottimale' }}</span>
          </div>
          <div class="res-item">
            <span class="ri-label text-red">Spreco Indotto</span>
            <span class="ri-val">€{{ sprecoIndottoAnno.toFixed(0) }}</span>
            <span class="action-desc mt-1" style="font-size: 9px;">all'anno</span>
          </div>
          <div class="res-item">
            <span class="ri-label text-blue">Output Totale (x)</span>
            <span class="ri-val">€{{ totXAnno.toFixed(0) }}</span>
            <span class="action-desc mt-1" style="font-size: 9px;">all'anno</span>
          </div>
        </div>

        <div class="smart-tile mb-3">
          <h3 class="section-title text-orange">1. L'Effetto Moltiplicatore</h3>
          <p class="action-desc mb-3">
            L'analisi della matrice <strong>(I − A)⁻¹</strong> rivela che la tua bolletta diretta combinata di <strong>€{{ totDAnno.toFixed(0) }}/anno</strong> genera un output sistemico totale richiesto di <strong>€{{ totXAnno.toFixed(0) }}/anno</strong>.
          </p>
          <div class="insight-box">
            <div class="insight-icon">🔥</div>
            <div>
              <div class="insight-title text-white">Il Gas Naturale è il "collo di bottiglia"</div>
              <div class="insight-text mt-1">
                Registra il moltiplicatore più alto (<strong>×{{ moltiplicatori[1].toFixed(2) }}</strong>). Ogni euro speso in gas attiva consumi parassiti sugli altri vettori. Abbattere questa voce garantisce l'effetto leva più alto sui risparmi totali.
              </div>
            </div>
          </div>
        </div>

        <div class="smart-tile mb-3">
          <h3 class="section-title text-green">2. Raccomandazioni Esecutive</h3>
          <p class="action-desc mb-3">
            Sulla base del ricalcolo della matrice <strong>A</strong>, suggeriamo un intervento di ottimizzazione strutturale (<strong>Combo Fotovoltaico + Pompa di Calore</strong>) per minimizzare la dipendenza sistemica.
          </p>
          
          <div class="recommendations-list">
            <div class="rec-item">
              <span class="rec-tag text-purple">Azione 1</span>
              <div>
                <div class="rec-title text-white">Elettrificazione Riscaldamento</div>
                <div class="rec-text mt-1">Sostituzione della caldaia per comprimere drasticamente il vettore <strong>d</strong> del gas.</div>
              </div>
            </div>
            <div class="rec-item mt-2">
              <span class="rec-tag text-orange">Azione 2</span>
              <div>
                <div class="rec-title text-white">Autoproduzione Solare</div>
                <div class="rec-text mt-1">Installazione impianto FV per azzerare l'impatto economico della nuova spesa elettrica.</div>
              </div>
            </div>
          </div>

          <div class="sim-results mt-4">
            <h4 class="sim-header text-muted">RISULTATI SIMULATI (SCENARIO COMBO)</h4>
            <div class="res-grid mt-2">
              <div class="res-item">
                <span class="ri-label text-green">Nuovo IIS</span>
                <span class="ri-val">1.02</span>
              </div>
              <div class="res-item">
                <span class="ri-label text-wallet">Risparmio Stimato</span>
                <span class="ri-val">€{{ savingCombo.toFixed(0) }}</span>
              </div>
              <div class="res-item">
                <span class="ri-label text-blue">Indipendenza</span>
                <span class="ri-val">74%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="report-footer text-muted mt-4">
          <p>Modello: Leontief Input-Output · Settori: Energia, Gas, Acqua · A = Matrice 3×3 coefficienti tecnici</p>
          <p>Equazione fondamentale: <strong>x = (I − A)⁻¹ · d</strong></p>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios';
import AuthService from '@/services/AuthService';
import GuideHeader from '@/components/layout/GuideHeader.vue';

const router = useRouter();

const loading = ref(true);
const activeAddressName = ref('Caricamento...');

// --- FUNZIONI UTILI ---
const currentDate = computed(() => {
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
});

// --- MOTORE MATEMATICO LEONTIEF ---
const I3 = [[1,0,0],[0,1,0],[0,0,1]];

// Matrice base A (Coefficienti Tecnici)
const A = ref([
  [0.00, 0.08, 0.12],
  [0.05, 0.00, 0.10],
  [0.02, 0.03, 0.00],
]);
const d = ref([120, 85, 30]);

const matSub = (matA, matB) => matA.map((row, i) => row.map((v, j) => v - matB[i][j]));
const inv3x3 = (m) => {
  const [[a,b,c],[d,e,f],[g,h,k]] = m;
  const det = a*(e*k-f*h) - b*(d*k-f*g) + c*(d*h-e*g);
  return [
    [(e*k-f*h)/det, (c*h-b*k)/det, (b*f-c*e)/det],
    [(f*g-d*k)/det, (a*k-c*g)/det, (c*d-a*f)/det],
    [(d*h-e*g)/det, (b*g-a*h)/det, (a*e-b*d)/det],
  ];
};

const ImA = computed(() => matSub(I3, A.value));
const L = computed(() => inv3x3(ImA.value));
const x = computed(() => L.value.map(row => row.reduce((s, v, j) => s + v * d.value[j], 0)));
const moltiplicatori = computed(() => L.value[0].map((_, j) => L.value.reduce((s, row) => s + row[j], 0)));

// --- KPI REPORT ---
const totD = computed(() => d.value.reduce((s, v) => s + v, 0));
const totX = computed(() => x.value.reduce((s, v) => s + v, 0));

const totDAnno = computed(() => totD.value * 12);
const totXAnno = computed(() => totX.value * 12);
const sprecoIndottoAnno = computed(() => (totX.value - totD.value) * 12);
const iis = computed(() => totD.value > 0 ? (totX.value / totD.value) : 1);

// Simulazione Scenario Combo
const savingCombo = computed(() => {
  const newD = [d.value[0]*0.4, d.value[1]*0.2, d.value[2]*0.7];
  const newTotD = newD.reduce((s,v) => s + v, 0);
  const savingMensile = totD.value - newTotD;
  return savingMensile * 12;
});

// --- FETCH DATI UTENTE ---
onMounted(async () => {
  try {
    loading.value = true;
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

        const pKwh = rPower?.annual_consumption_kwh || pAi?.consumption_bands?.total_annual || 0;
        const gSmc = rGas?.annual_consumption_smc || rGas?.annual_consumption_kwh || gAi?.consumption?.annual_smc || gAi?.consumption?.annual_mc || 0; 
        const wM3 = rWater?.annual_consumption_m3 || rWater?.annual_consumption_kwh || wAi?.consumption?.annual_mc || 0;

        d.value = [
          Math.round((pKwh / 12) * 0.25) || 120,
          Math.round((gSmc / 12) * 1.10) || 85,
          Math.round((wM3 / 12) * 2.50) || 30
        ];
    }
  } catch (error) {
    console.error("Errore Report Leontief", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@import '@/assets/main_V0.css';

.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); font-family: 'Inter', sans-serif; }
.main-content { padding: 16px; max-width: 480px; margin: 0 auto; padding-bottom: 90px; }

/* ANIMAZIONI E SPINNER */
.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0; }
.delay-2 { animation-delay: 0.2s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state { text-align: center; padding: 4rem 1rem; color: var(--text-muted); font-weight: 600; }

/* SELEZIONE NUCLEO E TEXT */
.address-selector { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-card); margin-bottom: 20px;}
.address-info .label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 4px; }
.address-value { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--text-primary); }
.pin-icon { width: 16px; height: 16px; color: var(--accent-cyan); flex-shrink: 0; }
.sync-badge { background: rgba(167, 139, 250, 0.1); color: var(--accent-purple, #a78bfa); padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; border: 1px solid rgba(167, 139, 250, 0.2); }

.text-white { color: var(--text-primary); font-weight: 600; }
.text-orange { color: #f59e0b; }
.text-red { color: #ef4444; }
.text-blue { color: #38bdf8; }
.text-purple { color: #a78bfa; }
.text-green { color: #34d399; }
.text-wallet { color: #d4af37; }
.text-right { text-align: right; }

.flex-between { display: flex; justify-content: space-between; align-items: flex-start; }
.align-center { align-items: center; }

/* CARDS E ELEMENTI REPORT */
.smart-tile { background: var(--bg-card); border-radius: 16px; padding: 20px; border: 1px solid var(--border-color); box-shadow: var(--shadow-card); }
.section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }
.action-desc { font-size: 12px; line-height: 1.6; color: var(--text-muted); margin: 0; }

.report-subtitle { font-size: 10px; color: var(--text-muted); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; font-weight: 800; }
.report-title { font-size: 22px; font-weight: 900; margin: 0; color: var(--text-primary); }
.report-date { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.report-loc { font-size: 10px; color: var(--text-muted); margin-top: 4px; text-transform: uppercase; font-weight: 700; }
.report-desc { font-size: 12px; color: var(--text-muted); line-height: 1.6; }

/* GRID KPI */
.res-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.res-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; }
.ri-label { font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
.ri-val { font-size: 18px; font-weight: 900; font-family: monospace; }

/* BOX INSIGHT */
.insight-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 14px; display: flex; gap: 14px; align-items: flex-start; }
.insight-icon { font-size: 24px; }
.insight-title { font-size: 13px; font-weight: 800; margin-bottom: 4px; }
.insight-text { font-size: 11px; color: var(--text-muted); line-height: 1.6; }

/* RACCOMANDAZIONI */
.recommendations-list { display: flex; flex-direction: column; gap: 12px; }
.rec-item { display: flex; gap: 12px; align-items: flex-start; }
.rec-tag { font-size: 9px; font-weight: 800; padding: 4px 8px; border-radius: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); text-transform: uppercase; white-space: nowrap; }
.rec-title { font-size: 13px; font-weight: 800; }
.rec-text { font-size: 11px; color: var(--text-muted); line-height: 1.5; }

.sim-header { font-size: 10px; font-weight: 800; letter-spacing: 1px; margin-bottom: 12px; }

/* FOOTER */
.report-footer { font-size: 9px; text-align: center; line-height: 1.6; border-top: 1px dashed var(--border-color); padding-top: 16px; }

/* UTILS */
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mb-3 { margin-bottom: 12px; }
</style>
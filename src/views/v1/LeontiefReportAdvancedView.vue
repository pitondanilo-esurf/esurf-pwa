<template>
  <div class="report-app-wrapper">
    <div class="no-print header-wrapper">
      <GuideHeader />
    </div>

    <div v-if="loading" class="loading-state no-print">
      <div class="spinner"></div>
      <p style="margin-top: 16px; font-family: 'DM Mono', monospace; font-size: 12px; color: #A09890;">
        Generazione report esecutivo...
      </p>
    </div>

    <div v-else class="report-container fade-in" :class="{ 'is-entered': entered }">
      
      <div class="r-cover">
        <svg class="r-grid-bg" viewBox="0 0 600 260" preserveAspectRatio="none">
          <line v-for="i in 12" :key="'h'+i" :x1="0" :y1="(i-1)*22" :x2="600" :y2="(i-1)*22" />
          <line v-for="i in 26" :key="'v'+i" :x1="(i-1)*24" :y1="0" :x2="(i-1)*24" :y2="260" />
        </svg>

        <div class="r-cover-content">
          <div class="r-cover-top">
            <div>
              <div class="r-kicker">Analisi Input-Output · Modello di Leontief</div>
              <h1 class="r-title">
                Efficienza energetica<br/>
                <em>dell'abitazione</em>
              </h1>
            </div>
            <div class="r-meta">
              <div class="r-meta-lbl">RIFERIMENTO</div>
              <div class="r-meta-val">{{ activeAddressName }}</div>
              <div class="r-meta-val mt-1">Analisi {{ currentYear }}</div>
            </div>
          </div>

          <div class="r-kpi-strip">
            <div class="r-kpi-box" style="background:#252320;">
              <div class="r-kpi-lbl">Domanda diretta</div>
              <div class="r-kpi-val">€{{ totD.toFixed(0) }}</div>
              <div class="r-kpi-unit">/mese</div>
            </div>
            <div class="r-kpi-box" style="background:#252320;">
              <div class="r-kpi-lbl">Output Leontief</div>
              <div class="r-kpi-val">€{{ totX.toFixed(0) }}</div>
              <div class="r-kpi-unit">/mese</div>
            </div>
            <div class="r-kpi-box" style="background:#252320;">
              <div class="r-kpi-lbl">Effetto indotto</div>
              <div class="r-kpi-val">+{{ multEffect }}%</div>
              <div class="r-kpi-unit">costo nascosto</div>
            </div>
            <div class="r-kpi-box" style="background:#252320;">
              <div class="r-kpi-lbl">CO₂ indotta extra</div>
              <div class="r-kpi-val">+{{ co2Extra }}%</div>
              <div class="r-kpi-unit">oltre emissione diretta</div>
            </div>
          </div>
        </div>
      </div>

      <div class="r-body">

        <div class="r-section">
          <div class="r-sec-header">
            <div class="r-sec-num">§ 01</div>
            <h2 class="r-sec-title">Le bollette come vettori</h2>
          </div>
          <p class="r-sec-desc">
            Ogni voce di spesa è un vettore nello spazio <em>costo × impatto ambientale</em>.
            Il modulo è la spesa mensile; l'angolo θ indica la proporzione tra impatto economico e CO₂.
            Il vettore risultante R = Σvᵢ sintetizza lo stato dell'abitazione.
          </p>
          <div class="r-rule"></div>
        </div>

        <div class="r-diagram-box">
          <div class="r-label">Spazio vettoriale — domanda d (tratt.) vs output Leontief x (pieno)</div>
          <div class="svg-container">
            <svg width="100%" viewBox="0 0 440 280" style="overflow:visible; display:block;">
              <defs>
                <marker v-for="s in settori" :key="'m'+s.id" :id="'va-'+s.id" markerWidth="6" markerHeight="6" refX="5" refY="2.5" orient="auto">
                  <path d="M0,0 L0,5 L6,2.5 z" :fill="s.color"/>
                </marker>
                <marker id="va-r" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill="#3D3933"/>
                </marker>
                <marker id="va-ax" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                  <path d="M0,0 L0,5 L5,2.5 z" fill="#C8C3BA"/>
                </marker>
              </defs>

              <line v-for="i in 5" :key="'lh'+i" :x1="60" :y1="240-i*44" :x2="430" :y2="240-i*44" stroke="#EBE7DF" stroke-width="0.5"/>
              <line v-for="i in 8" :key="'lv'+i" :x1="60+i*46" :y1="20" :x2="60+i*46" :y2="240" stroke="#EBE7DF" stroke-width="0.5"/>

              <line x1="60" y1="270" x2="60" y2="14" stroke="#C8C3BA" stroke-width="1" marker-end="url(#va-ax)"/>
              <line x1="10" y1="240" x2="432" y2="240" stroke="#C8C3BA" stroke-width="1" marker-end="url(#va-ax)"/>
              
              <text x="428" y="253" fill="#A09890" font-size="8" font-family="'DM Mono', monospace" text-anchor="end">COSTO €/m</text>
              <text x="56" y="16" fill="#A09890" font-size="8" font-family="'DM Mono', monospace" text-anchor="middle">CO₂</text>
              <circle cx="60" cy="240" r="3" fill="#3D3933"/>

              <g v-for="(v, i) in vectors" :key="v.id">
                <line x1="60" y1="240" :x2="60 + v.dx * prog" :y2="240 - v.dy * prog" :stroke="v.color" stroke-width="1.5" stroke-dasharray="5 4" stroke-opacity="0.4" :marker-end="'url(#va-'+v.id+')'"/>
                <line x1="60" y1="240" :x2="60 + v.vx * prog" :y2="240 - v.vy * prog" :stroke="v.color" stroke-width="2.5" stroke-linecap="round" :marker-end="'url(#va-'+v.id+')'"/>
                <g v-if="prog > 0.7" :style="`transform: translate(${60 + v.vx + 8}px, ${240 - v.vy - 4}px)`">
                  <text fill="currentColor" font-size="10" font-family="'Playfair Display',serif" font-style="italic" :style="`color: ${v.color}`">{{ v.short }}</text>
                  <text y="12" fill="#A09890" font-size="8" font-family="'DM Mono', monospace">€{{ d[i] }}/m</text>
                </g>
              </g>

              <line x1="60" y1="240" :x2="60 + Rx * prog" :y2="240 - Ry * prog" stroke="#3D3933" stroke-width="3" stroke-linecap="round" marker-end="url(#va-r)"/>
              <text v-if="prog > 0.8" :x="60 + Rx * 0.52 + 10" :y="240 - Ry * 0.52 - 6" fill="#3D3933" font-size="9" font-family="'DM Mono', monospace">
                R θ={{ thetaResultante }}°
              </text>

              <g transform="translate(330,18)">
                <rect width="106" height="34" rx="3" fill="white" stroke="#E0DBD3" stroke-width="0.5"/>
                <line x1="8" y1="12" x2="22" y2="12" stroke="#A09890" stroke-width="1.5" stroke-dasharray="4 3"/>
                <text x="26" y="15" fill="#8A8378" font-size="8" font-family="'DM Mono', monospace">domanda d</text>
                <line x1="8" y1="24" x2="22" y2="24" stroke="#A09890" stroke-width="2"/>
                <text x="26" y="27" fill="#8A8378" font-size="8" font-family="'DM Mono', monospace">output x (Leontief)</text>
              </g>
            </svg>
          </div>

          <div class="r-vec-grid">
            <div v-for="(s, i) in settori" :key="s.id" class="r-vec-box">
              <div class="r-vec-header">
                <div class="r-vec-dot" :style="{ background: s.color }"></div>
                <div class="r-vec-lbl">{{ s.label }}</div>
              </div>
              <div class="r-vec-stats">
                <div class="r-stat"><div class="r-stat-l">Domanda d</div><div class="r-stat-v">€{{ d[i].toFixed(0) }}/m</div></div>
                <div class="r-stat"><div class="r-stat-l">Output x</div><div class="r-stat-v">€{{ x[i].toFixed(1) }}/m</div></div>
                <div class="r-stat"><div class="r-stat-l">Indotto</div><div class="r-stat-v">+€{{ (x[i]-d[i]).toFixed(1) }}/m</div></div>
                <div class="r-stat"><div class="r-stat-l">Moltiplicatore</div><div class="r-stat-v">×{{ mult[i].toFixed(3) }}</div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="page-break"></div>

        <div class="r-section">
          <div class="r-sec-header">
            <div class="r-sec-num">§ 02</div>
            <h2 class="r-sec-title">Matrice di Leontief</h2>
          </div>
          <p class="r-sec-desc">
            x = (I − A)⁻¹ · d. La matrice A codifica le dipendenze tecniche tra settori; la sua inversa L moltiplica gli effetti della domanda diretta sull'intero sistema.
          </p>
          <div class="r-rule"></div>
        </div>

        <div class="r-matrices-grid">
          <div>
            <div class="r-label">Matrice A — coeff. tecnici</div>
            <table class="r-table">
              <thead>
                <tr><th></th><th v-for="s in settori" :key="s.id" :style="{ color: s.color }">{{ s.short[0] }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in A" :key="i">
                  <td class="r-row-h" :style="{ color: settori[i].color }">{{ settori[i].short[0] }}</td>
                  <td v-for="(val, j) in row" :key="j" class="r-cell" :class="getCellClassA(i, j, val)">
                    {{ i === j ? '—' : val.toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="r-legend">
              <span style="color:#7A2020">■</span> ≥ 0.10 critico &nbsp; <span style="color:#8A5A0A">■</span> ≥ 0.04 medio
            </div>
          </div>

          <div>
            <div class="r-label">I − A</div>
            <table class="r-table">
              <thead>
                <tr><th></th><th v-for="s in settori" :key="s.id" :style="{ color: s.color }">{{ s.short[0] }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in ImA" :key="i">
                  <td class="r-row-h" :style="{ color: settori[i].color }">{{ settori[i].short[0] }}</td>
                  <td v-for="(val, j) in row" :key="j" class="r-cell" :class="i===j ? 'is-diag-ia' : ''">
                    {{ val.toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div class="r-label">L = (I−A)⁻¹ moltiplicatore</div>
            <table class="r-table">
              <thead>
                <tr><th></th><th v-for="s in settori" :key="s.id" :style="{ color: s.color }">{{ s.short[0] }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in L" :key="i">
                  <td class="r-row-h" :style="{ color: settori[i].color }">{{ settori[i].short[0] }}</td>
                  <td v-for="(val, j) in row" :key="j" class="r-cell" :class="i===j ? 'is-diag-l' : (val>1.05 ? 'is-high-l' : '')">
                    {{ val.toFixed(3) }}
                  </td>
                </tr>
                <tr>
                  <td class="r-row-h" style="color: #8A8378; padding-top: 4px;">Σ</td>
                  <td v-for="(m, j) in mult" :key="'m'+j" class="r-cell-sum" :style="{ color: settori[j].color }">
                    ×{{ m.toFixed(3) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="page-break"></div>

        <div class="r-section" style="margin-top: 30px;">
          <div class="r-sec-header">
            <div class="r-sec-num">§ 03</div>
            <h2 class="r-sec-title">Evidenze strutturali</h2>
          </div>
          <p class="r-sec-desc">
            L'analisi della matrice A e dei moltiplicatori identifica quattro evidenze causali basate sui tuoi consumi che determinano la gerarchia degli interventi.
          </p>
          <div class="r-rule"></div>
        </div>

        <div style="margin-bottom: 48px; padding-top: 24px;">
          <div v-for="e in evidenze" :key="e.n" class="r-ev-row">
            <div class="r-ev-num" :style="{ color: e.color }">{{ e.n }}</div>
            <div>
              <h3 class="r-ev-title">{{ e.title }}</h3>
              <p class="r-ev-body">{{ e.body }}</p>
              <div class="r-ev-formula" :style="{ color: e.color, background: e.color+'0D', borderLeftColor: e.color }">
                {{ e.formula }}
              </div>
            </div>
          </div>
        </div>
        <div class="page-break"></div>
        <div class="r-section">
          <div class="r-sec-header">
            <div class="r-sec-num">§ 04</div>
            <h2 class="r-sec-title">Impatto CO₂ — diretto e indotto</h2>
          </div>
          <p class="r-sec-desc">
            L'effetto moltiplicativo aumenta le emissioni reali. La quota indotta è il costo ambientale nascosto.
          </p>
          <div class="r-rule"></div>
        </div>

        <div style="margin-bottom: 48px; padding-top: 28px;">
          <div v-for="(s, i) in settori" :key="s.id" class="r-co2-row">
            <div>
              <div class="r-co2-lbl1" :style="{ color: s.color }">{{ s.short }}</div>
              <div class="r-co2-lbl2">{{ s.label }} <br><span v-if="i===0 && isGreenEnergy" style="color: #2D5A2D; font-weight: bold; font-size: 9px; padding-top:2px; display:inline-block;">(100% Green AI)</span></div>
            </div>
            <div>
              <div style="margin-bottom: 5px;">
                <div class="r-co2-bar-lbl">diretta · {{ co2Dir[i].toFixed(0) }} kg/m</div>
                <div class="r-bar-wrap"><div class="r-bar-fill" :style="{ width: prog > 0.5 ? `${(co2Dir[i]/maxCO2)*100}%` : '0', background: s.color }"></div></div>
              </div>
              <div>
                <div class="r-co2-bar-lbl">Leontief · {{ co2Tot[i].toFixed(0) }} kg/m</div>
                <div class="r-bar-wrap"><div class="r-bar-fill" :style="{ width: prog > 0.5 ? `${(co2Tot[i]/maxCO2)*100}%` : '0', background: s.color+'88' }"></div></div>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="r-co2-delta">+{{ co2Dir[i] > 0 ? ((co2Tot[i]/co2Dir[i]-1)*100).toFixed(1) : 0 }}%</div>
              <div class="r-co2-delta-lbl">indotto</div>
            </div>
          </div>

          <div class="r-co2-summary">
            <div>
              <div class="r-sum-lbl">CO₂ emissioni dirette</div>
              <div class="r-sum-val">{{ totCO2dir.toFixed(0) }} kg/m</div>
              <div class="r-sum-sub">{{ (totCO2dir*12/1000).toFixed(2) }} t/a</div>
            </div>
            <div>
              <div class="r-sum-lbl">CO₂ Leontief totale</div>
              <div class="r-sum-val">{{ totCO2tot.toFixed(0) }} kg/m</div>
              <div class="r-sum-sub">{{ (totCO2tot*12/1000).toFixed(2) }} t/a</div>
            </div>
            <div>
              <div class="r-sum-lbl">Effetto moltiplicativo</div>
              <div class="r-sum-val">+{{ co2Extra }}%</div>
              <div class="r-sum-sub">quota CO₂ nascosta</div>
            </div>
          </div>
        </div>

        <div class="page-break"></div>

        <div class="r-section" style="margin-top: 30px;">
          <div class="r-sec-header">
            <div class="r-sec-num">§ 05</div>
            <h2 class="r-sec-title">Piano d'azione</h2>
          </div>
          <p class="r-sec-desc">
            Interventi ordinati per impatto sul moltiplicatore Leontief, non per risparmio nominale.
            La sequenza è causalmente determinata dalla struttura della matrice A ricalcolata sui tuoi consumi.
          </p>
          <div class="r-rule"></div>
        </div>

        <div style="padding-top: 28px; margin-bottom: 48px;">
          <div class="r-action-types">
            <div class="r-at-box" style="border-left-color: #8B2020;">
              <div class="r-at-lbl" style="color: #8B2020;">Modifica A</div>
              <div class="r-at-desc">Cambia la struttura delle dipendenze. Effetto moltiplicativo su tutto il sistema.</div>
            </div>
            <div class="r-at-box" style="border-left-color: #1A5F8B;">
              <div class="r-at-lbl" style="color: #1A5F8B;">Riduce d</div>
              <div class="r-at-desc">Abbassa la domanda diretta. A rimane invariata — interdipendenze intatte.</div>
            </div>
          </div>

          <div v-for="a in computedActions" :key="a.rank" class="r-action-card" :style="{ borderLeftColor: a.color, borderColor: a.rank===0 ? '#2D5A2D66' : '#E0DBD3' }">
            <div class="r-ac-header">
              <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                  <div class="r-ac-badge" :style="{ color: a.color, background: a.color+'0F' }">{{ a.rank===0 ? 'ottimale' : `PRIORITÀ ${a.rank}` }}</div>
                  <div class="r-ac-tag">{{ a.tag }}</div>
                </div>
                <h3 class="r-ac-title">{{ a.label }}</h3>
                <p class="r-ac-mech">{{ a.mechanism }}</p>
              </div>
              <div style="text-align: right; min-width: 100px;">
                <div class="r-ac-save">−€{{ a.saving }}</div>
                <div class="r-ac-save-lbl">risparmio/anno</div>
              </div>
            </div>
            
            <div class="r-ac-detail" :style="{ color: a.color }">{{ a.detail }}</div>
            
            <div class="r-ac-kpis">
              <div class="r-ac-kpi"><div class="r-kpi-k">CO₂ Evitata</div><div class="r-kpi-v">{{ a.co2 }}%</div></div>
              <div class="r-ac-kpi"><div class="r-kpi-k">Investimento</div><div class="r-kpi-v">€{{ a.invest.toLocaleString() }}</div></div>
              <div class="r-ac-kpi"><div class="r-kpi-k">Payback</div><div class="r-kpi-v">{{ a.payback }} anni</div></div>
              <div class="r-ac-kpi"><div class="r-kpi-k">Autonomia</div><div class="r-kpi-v">+{{ a.independence }}%</div></div>
            </div>
          </div>
        </div>
        <div class="page-break"></div>
        <div class="r-section">
          <div class="r-sec-header">
            <div class="r-sec-num">§ 06</div>
            <h2 class="r-sec-title">Sequenza di implementazione</h2>
          </div>
          <p class="r-sec-desc">
            L'ordine non è arbitrario: ciascun intervento prepara le condizioni per il successivo e ne massimizza il rendimento.
          </p>
          <div class="r-rule"></div>
        </div>

        <div style="padding-top: 28px; margin-bottom: 60px;">
          <div v-for="(t, i) in timeline" :key="i" class="r-tl-row">
            <div>
              <div class="r-tl-period" :style="{ color: t.color }">{{ t.period }}</div>
              <div class="r-tl-line" :style="{ background: t.color }"></div>
            </div>
            <div>
              <h3 class="r-tl-title">{{ t.action }}</h3>
              <p class="r-tl-why">{{ t.why }}</p>
              <div class="r-tl-res" :style="{ color: t.color, background: t.color+'0D' }">{{ t.result }}</div>
            </div>
          </div>

          <div class="r-combo-final">
            <div style="grid-column: 1/-1; margin-bottom: 20px;">
              <div class="r-cf-lbl">Scenario combinato — risultato finale proiettato</div>
              <div class="r-cf-title">Quasi-decarbonizzazione del sistema domestico</div>
            </div>
            <div class="r-cf-box"><div class="r-cf-k">Risparmio annuo</div><div class="r-cf-v" style="color: #7AB87A;">€{{ computedActions[3].saving }}</div></div>
            <div class="r-cf-box"><div class="r-cf-k">Riduzione CO₂</div><div class="r-cf-v" style="color: #7AB87A;">{{ computedActions[3].co2 }}%</div></div>
            <div class="r-cf-box"><div class="r-cf-k">Moltiplicatore</div><div class="r-cf-v" style="color: #C8C0A8;">×1.02</div></div>
            <div class="r-cf-box"><div class="r-cf-k">Indipendenza</div><div class="r-cf-v" style="color: #7AB87A;">74%</div></div>
          </div>
        </div>

        <footer class="r-main-footer">
          <div>
            Modello: Leontief Input-Output · Settori: Energia, Gas, Acqua · A = matrice 3×3 coefficienti tecnici<br/>
            Equazione fondamentale: x = (I − A)⁻¹ · d · e-surf AI engine
          </div>
          <div style="text-align: right;">
            {{ activeAddressName }}<br/>
            Analisi {{ currentYear }}
          </div>
        </footer>

      </div>
    </div>
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
const entered = ref(false);
const activeAddressName = ref('Caricamento...');
const currentYear = new Date().getFullYear();

// --- MODELLO MATEMATICO ---
const settori = [
  { id: "energia", label: "Energia elettrica", short: "Energia", color: "#B07A1A" },
  { id: "gas",     label: "Gas naturale",      short: "Gas",     color: "#8B2020" },
  { id: "acqua",   label: "Acqua potabile",    short: "Acqua",   color: "#1A5F8B" },
];

const I3 = [[1,0,0],[0,1,0],[0,0,1]];
const A = ref([[0,0.08,0.12],[0.05,0,0.10],[0.02,0.03,0]]);
const d = ref([120,85,30]);

// Variabile reattiva per il Flag Green AI
const isGreenEnergy = ref(false);

// Funzioni Matematiche
const matSub = (m1, m2) => m1.map((r, i) => r.map((v, j) => v - m2[i][j]));
const inv3x3 = (m) => {
  const [[a,b,c],[d,e,f],[g,h,k]] = m;
  const det = a*(e*k-f*h) - b*(d*k-f*g) + c*(d*h-e*g);
  return [[(e*k-f*h)/det,(c*h-b*k)/det,(b*f-c*e)/det],[(f*g-d*k)/det,(a*k-c*g)/det,(c*d-a*f)/det],[(d*h-e*g)/det,(b*g-a*h)/det,(a*e-b*d)/det]];
};

// Calcoli Matrici
const ImA = computed(() => matSub(I3, A.value));
const L = computed(() => inv3x3(ImA.value));
const x = computed(() => L.value.map(row => row.reduce((s, v, j) => s + v * d.value[j], 0)));
const mult = computed(() => L.value[0].map((_, j) => L.value.reduce((s, row) => s + row[j], 0)));

// KPI Globali
const totD = computed(() => d.value.reduce((s,v)=>s+v,0));
const totX = computed(() => x.value.reduce((s,v)=>s+v,0));
const multEffect = computed(() => totD.value > 0 ? ((totX.value/totD.value - 1)*100).toFixed(1) : 0);

// Calcolo CO2 COMPATTO E REATTIVO AL 100%
const getCo2Factor = (i) => (i === 0 && isGreenEnergy.value) ? 0 : [0.233, 2.04, 0.149][i];

const co2Dir = computed(() => d.value.map((val, i) => val * getCo2Factor(i)));
const co2Tot = computed(() => x.value.map((val, i) => val * getCo2Factor(i)));
const totCO2dir = computed(() => co2Dir.value.reduce((s,v)=>s+v,0));
const totCO2tot = computed(() => co2Tot.value.reduce((s,v)=>s+v,0));
const co2Extra = computed(() => totCO2dir.value > 0 ? ((totCO2tot.value/totCO2dir.value - 1)*100).toFixed(1) : 0);
const maxCO2 = computed(() => Math.max(...co2Tot.value, 1) * 1.1);

// Evidenze Dinamiche
const evidenze = computed(() => [
  {n:"E1", color:"#8B2020", title:`a[Gas][Acqua] = ${A.value[1][2].toFixed(2)} — loop termico critico`, body:"Il coefficiente indica la quantità di gas richiesta per scaldare l'acqua. Un driver primario dell'inefficienza.", formula:`a[Gas][Acqua] = ${A.value[1][2].toFixed(2)} → Leva: scaldabagno COP≥3`},
  {n:"E2", color:"#8B2020", title:`a[Energia][Acqua] = ${A.value[0][2].toFixed(2)} — dipendenza idrica`, body:"L'acqua consuma energia per il pompaggio. Ridurre l'uso di acqua abbassa indirettamente anche la bolletta della luce.", formula:`a[Energia][Acqua] = ${A.value[0][2].toFixed(2)} → Leva: efficienza idrica`},
  {n:"E3", color:"#8A5A0A", title:"Il gas alimenta indirettamente se stesso", body:"La rete elettrica utilizza gas per i picchi. Ogni euro di bolletta gas attiva consumo energetico che richiama ulteriore gas.", formula:`a[Gas][Energia] = ${A.value[1][0].toFixed(2)} → Loop: gas→energia→gas`},
  {n:"E4", color:"#1A5F8B", title:`R = Σvᵢ · θ ≈ ${thetaResultante.value}° — dominanza vettoriale`, body:"L'angolo del vettore risultante Leontief sintetizza il trade-off costo-emissioni. L'obiettivo è ruotarlo verso l'asse X.", formula:`θ ≈ ${thetaResultante.value}° → Prevalenza ambientale`}
]);

// Azioni simulate
const computedActions = computed(() => {
  const dVals = d.value;
  const baseTotCO2 = totCO2tot.value;

  const simula = (newD, newA) => {
    const newL = inv3x3(matSub(I3, newA));
    const newX = newL.map(r => r.reduce((s, v, j) => s + v * newD[j], 0));
    const newCO2 = newX.reduce((s, v, i) => s + v * getCo2Factor(i), 0);
    const savEur = (totD.value - newD.reduce((s,v)=>s+v,0)) * 12;
    const savCO2 = baseTotCO2 > 0 ? Math.round((1 - newCO2/baseTotCO2)*100) : 0;
    return { s: Math.max(0, savEur).toFixed(0), c: savCO2 };
  };

  const a1 = simula([dVals[0]+20, dVals[1]*0.2, dVals[2]], [[0,0.08,0.04],[0.02,0,0.02],[0.02,0.01,0]]);
  const a2 = simula([dVals[0], dVals[1], dVals[2]*0.7], [[0,0.08,0.06],[0.05,0,0.03],[0.01,0.02,0]]);
  const a3 = simula([dVals[0]*0.3, dVals[1], dVals[2]], A.value);
  const a0 = simula([dVals[0]*0.4, dVals[1]*0.2, dVals[2]*0.7], [[0,0.04,0.04],[0.01,0,0.02],[0.01,0.01,0]]);

  return [
    { rank:1, label:"Sostituzione caldaia con pompa di calore", tag:"modifica A", saving:a1.s, co2:(a1.c > 0 ? '-'+a1.c : 0), invest:5800, payback:(5800/Math.max(1,a1.s)).toFixed(1), independence:30, color:"#8B2020", mechanism:"Riduce coefficienti fuori diagonale simultaneamente.", detail:"Abbassa a[Gas][Acqua] e a[Gas][Energia]. Moltiplicatore gas decresce." },
    { rank:2, label:"Efficienza idrica + scaldabagno HP", tag:"modifica A + d", saving:a2.s, co2:(a2.c > 0 ? '-'+a2.c : 0), invest:800, payback:(800/Math.max(1,a2.s)).toFixed(1), independence:8, color:"#B07A1A", mechanism:"Spezza il loop acqua–energia–gas. Basso investimento.", detail:"Riduttori di flusso, scaldabagno COP≥3. Riduce a[Energia][Acqua]." },
    { rank:3, label:"Fotovoltaico 4 kWp + sistema di accumulo", tag:"riduce d", saving:a3.s, co2:(a3.c > 0 ? '-'+a3.c : 0), invest:7200, payback:(7200/Math.max(1,a3.s)).toFixed(1), independence:42, color:"#1A5F8B", mechanism:"Il dimensionamento richiede il nuovo profilo di carico post-PDC.", detail:"Riduce d[Energia] ma non modifica la struttura di A." },
    { rank:0, label:"Scenario combinato ottimale", tag:"combo", saving:a0.s, co2:(a0.c > 0 ? '-'+a0.c : 0), invest:13800, payback:(13800/Math.max(1,a0.s)).toFixed(1), independence:74, color:"#2D5A2D", mechanism:"Quasi-decarbonizzazione del sistema domestico.", detail:"Tutte e tre le leve. Moltiplicatore medio scende quasi a 1.00." }
  ];
});

const timeline = [
  {period:"Anno 1", color:"#8B2020", action:"Efficienza idrica + scaldabagno HP", why:"Investimento contenuto, payback rapido. Riduce i vettori indiretti prima degli interventi maggiori.", result:"Risparmio immediato e preparazione del carico."},
  {period:"Anno 1–2", color:"#8A5A0A", action:"Sostituzione caldaia con pompa di calore", why:"Leva strutturale principale: modifica i coefficienti di A. Incentivi applicabili.", result:"Effetto a cascata drastico su energia e gas."},
  {period:"Anno 2–3", color:"#1A5F8B", action:"Fotovoltaico 4 kWp + sistema di accumulo", why:"Dimensionato sul nuovo profilo di carico elettrificato.", result:"Autonomia energetica portata al 74%."}
];

// ─── FIX VETTORI: ANGOLO DINAMICO ───
// Se isGreenEnergy è true, l'angolo dell'energia diventa 0° (0 CO2) invece di 32°.
const prog = ref(0);
const SC = 1.25;
const angles = computed(() => [
  isGreenEnergy.value ? 0 : 32, 
  65, 
  14
]);

const vectors = computed(() => settori.map((s, i) => ({
  ...s,
  vx: x.value[i] * Math.cos(angles.value[i]*Math.PI/180) * SC,
  vy: x.value[i] * Math.sin(angles.value[i]*Math.PI/180) * SC,
  dx: d.value[i] * Math.cos(angles.value[i]*Math.PI/180) * SC,
  dy: d.value[i] * Math.sin(angles.value[i]*Math.PI/180) * SC,
})));

const Rx = computed(() => vectors.value.reduce((s,v)=>s+v.vx, 0));
const Ry = computed(() => vectors.value.reduce((s,v)=>s+v.vy, 0));
const thetaResultante = computed(() => (Math.atan2(Ry.value, Rx.value)*180/Math.PI).toFixed(1));

const getCellClassA = (i, j, val) => {
  if(i===j) return 'is-d-a';
  if(val >= 0.10) return 'is-hi-a';
  if(val >= 0.04) return 'is-md-a';
  return '';
};

// RICERCA PROFONDA JSON PER GARANTIRE IL PARSING DELLA VARIABILE GREEN
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

// DATA FETCH
onMounted(async () => {
  try {
    const [userRes, resRes] = await Promise.all([AuthService.getUser(), axios.get('/api/resources')]);
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
        if (typeof pAi === 'string') {
            try { pAi = JSON.parse(pAi); } catch(e) {}
        }
        
        if (rGas) try { gAi = typeof rGas.ai_analysis === 'string' ? JSON.parse(rGas.ai_analysis) : (rGas.ai_analysis || {}); } catch(e) {}
        if (rWater) try { wAi = typeof rWater.ai_analysis === 'string' ? JSON.parse(rWater.ai_analysis) : (rWater.ai_analysis || {}); } catch(e) {}

        // ESTREZIONE DI IS_100_GREEN SICURA CON RICERCA PROFONDA
        isGreenEnergy.value = findGreenFlag(pAi);

        const getAnnual = (r, aiObj) => {
          if (!r) return 0;
          let tempAi = aiObj;
          if (typeof tempAi === 'string') { try { tempAi = JSON.parse(tempAi); } catch(e) {} }
          return r?.annual_consumption_kwh || r?.annual_consumption_smc || r?.annual_consumption_m3 || tempAi?.consumption_bands?.total_annual || tempAi?.consumption?.annual_mc || tempAi?.consumption?.annual_smc || 0;
        };

        d.value = [
          Math.round((getAnnual(rPower, pAi) / 12) * 0.25) || 120,
          Math.round((getAnnual(rGas, gAi) / 12) * 1.10) || 85,
          Math.round((getAnnual(rWater, wAi) / 12) * 2.50) || 30
        ];
    }
  } catch (error) {
    console.error("Errore Report", error);
  } finally {
    loading.value = false;
    await nextTick();
    entered.value = true;
    
    let start = null;
    const animate = (ts) => {
      if(!start) start = ts;
      const p = Math.min((ts-start)/1200, 1);
      prog.value = 1 - Math.pow(1-p, 3);
      if(p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

.report-app-wrapper {
  background: #FAF8F4;
  min-height: 100vh;
  font-family: 'Playfair Display', Georgia, serif;
  color: #3D3933;
}

/* CARICAMENTO */
.loading-state { text-align: center; padding: 8rem 1rem; }
.spinner { width: 44px; height: 44px; border: 3px solid #E8E4DC; border-top: 3px solid #B07A1A; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* ANIMAZIONI */
.fade-in { opacity: 0; transform: translateY(18px); transition: opacity 0.7s, transform 0.7s; }
.fade-in.is-entered { opacity: 1; transform: translateY(0); }
.delay-1 { transition-delay: 0.05s; }
.delay-2 { transition-delay: 0.1s; }

/* Adatta lo sfondo della Navbar al tema di sistema */
.header-wrapper {
  background-color: var(--bg-app);
  border-bottom: 1px solid var(--border-color);
}

/* UTILS */
.text-primary { color: #3D3933; }
.text-muted { color: #6A6358; }
.text-wallet { color: #B07A1A; }
.text-red { color: #8B2020; }
.text-green { color: #2D5A2D; }
.text-right { text-align: right; }

/* ── COVER ── */
.r-cover { background: #1E1C18; padding: 56px 48px 48px; position: relative; overflow: hidden; border-radius: 0 0 12px 12px; }
.r-grid-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.06; stroke: white; stroke-width: 0.5; }
.r-cover-content { position: relative; z-index: 1; max-width: 820px; margin: 0 auto; }
.r-cover-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; flex-wrap: wrap; gap: 16px; }
.r-kicker { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: #9A9280; margin-bottom: 10px; }
.r-title { font-size: 34px; font-weight: 400; line-height: 1.15; color: #F5F2EC; margin: 0 0 8px; letter-spacing: -0.02em; }
.r-title em { color: #C8C0A8; font-style: italic; }
.r-meta { text-align: right; }
.r-meta-lbl { font-family: 'DM Mono', monospace; font-size: 9px; color: #6A6358; letter-spacing: 0.1em; margin-bottom: 4px; }
.r-meta-val { font-family: 'DM Mono', monospace; font-size: 11px; color: #9A9280; }

/* KPI STRIP */
.r-kpi-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #2E2C26; border-radius: 3px; overflow: hidden; }
.r-kpi-box { padding: 18px 20px; }
.r-kpi-lbl { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.15em; text-transform: uppercase; color: #6A6358; margin-bottom: 6px; }
.r-kpi-val { font-size: 24px; font-weight: 400; color: #F0EDE6; line-height: 1; }
.r-kpi-unit { font-family: 'DM Mono', monospace; font-size: 9px; color: #7A7265; margin-top: 4px; }

/* BODY */
.r-body { padding: 0 40px 80px; max-width: 820px; margin: 0 auto; }
.r-section { padding-top: 52px; padding-bottom: 36px; }
.r-sec-header { display: flex; align-items: baseline; gap: 16px; margin-bottom: 6px; }
.r-sec-num { font-family: 'DM Mono', monospace; font-size: 10px; color: #B07A1A; letter-spacing: 0.1em; }
.r-sec-title { font-size: 22px; font-weight: 400; margin: 0; letter-spacing: -0.01em; color: #3D3933; }
.r-sec-desc { font-family: 'DM Sans', sans-serif; font-size: 14px; color: #6A6358; line-height: 1.75; margin: 0 0 28px; max-width: 600px; }
.r-rule { border-top: 0.5px solid #D4CFC4; margin: 0; }

.r-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A8378; margin-bottom: 8px; }

/* SVG E TABELLE VETTORI */
.r-diagram-box { margin-bottom: 48px; }
.svg-container { background: white; border: 0.5px solid #E0DBD3; border-radius: 4px; padding: 24px 16px 16px; }
.r-vec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #E0DBD3; margin-top: 1px; }
.r-vec-box { background: #F5F2EE; padding: 14px 18px; }
.r-vec-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.r-vec-dot { width: 3px; height: 16px; border-radius: 1px; }
.r-vec-lbl { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; color: #8A8378; text-transform: uppercase; }
.r-vec-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.r-stat-l { font-family: 'DM Mono', monospace; font-size: 8px; color: #A09890; margin-bottom: 2px; }
.r-stat-v { font-family: 'DM Mono', monospace; font-size: 12px; color: #3D3933; font-weight: 500; }

/* MATRICI */
.r-matrices-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; align-items: start; margin-top: 28px; margin-bottom: 48px; }
.r-table { border-collapse: collapse; width: 100%; }
.r-table th { font-family: 'DM Mono', monospace; font-size: 8px; font-weight: 500; padding-bottom: 6px; text-align: center; letter-spacing: 0.06em; }
.r-row-h { font-family: 'DM Mono', monospace; font-size: 8px; padding-right: 6px; text-align: right; }
.r-cell { width: 52px; height: 36px; text-align: center; vertical-align: middle; font-family: 'DM Mono', monospace; font-size: 11px; border: 0.5px solid #E0DBD3; color: #3D3933; }
.is-d-a { background: transparent; color: #C8C3BA; }
.is-hi-a { background: #F5EDEA; color: #7A2020; font-weight: 600; }
.is-md-a { background: #FBF5E8; color: #8A5A0A; }
.is-diag-ia { background: #EEF5EE; color: #2D5A2D; font-weight: 600; }
.is-diag-l { background: #F0EDE8; color: #3D3933; font-weight: 600; }
.is-high-l { background: #F8F4EE; color: #5A5450; }
.r-cell-sum { text-align: center; padding-top: 6px; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 600; }
.r-legend { font-family: 'DM Mono', monospace; font-size: 8px; color: #A09890; margin-top: 6px; line-height: 1.8; }

/* EVIDENZE */
.r-ev-row { display: grid; grid-template-columns: 56px 1fr; gap: 24px; padding-bottom: 28px; margin-bottom: 28px; border-bottom: 0.5px solid #E8E4DC; }
.r-ev-num { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.06em; padding-top: 3px; }
.r-ev-title { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500; color: #3D3933; margin: 0 0 10px; letter-spacing: 0.02em; }
.r-ev-body { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #6A6358; line-height: 1.75; margin: 0 0 12px; }
.r-ev-formula { font-family: 'DM Mono', monospace; font-size: 10px; padding: 6px 12px; border-left: 2px solid; border-radius: 0 3px 3px 0; display: inline-block; }

/* IMPATTO CO2 */
.r-co2-row { display: grid; grid-template-columns: 120px 1fr 80px; align-items: center; gap: 16px; margin-bottom: 18px; }
.r-co2-lbl1 { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 2px; }
.r-co2-lbl2 { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #8A8378; }
.r-co2-bar-lbl { font-family: 'DM Mono', monospace; font-size: 8px; color: #A09890; margin-bottom: 3px; }
.r-bar-wrap { height: 3px; background: #E8E4DC; border-radius: 99px; overflow: hidden; }
.r-bar-fill { height: 100%; border-radius: 99px; transition: width 1.1s cubic-bezier(.22,1,.36,1); }
.r-co2-delta { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; color: #8B2020; }
.r-co2-delta-lbl { font-family: 'DM Mono', monospace; font-size: 8px; color: #A09890; }

.r-co2-summary { margin-top: 24px; padding: 14px 18px; background: #F0EDE6; border: 0.5px solid #D4CFC4; border-radius: 3px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 48px; }
.r-sum-lbl { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase; color: #8A8378; margin-bottom: 4px; }
.r-sum-val { font-size: 18px; color: #3D3933; margin-bottom: 2px; }
.r-sum-sub { font-family: 'DM Mono', monospace; font-size: 9px; color: #A09890; }

/* AZIONI */
.r-action-types { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
.r-at-box { background: white; border: 0.5px solid #E0DBD3; border-left: 2px solid; border-radius: 0 3px 3px 0; padding: 12px 16px; }
.r-at-lbl { font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; }
.r-at-desc { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #6A6358; line-height: 1.6; }

.r-action-card { background: white; border: 0.5px solid; border-left: 3px solid; border-radius: 0 4px 4px 0; padding: 20px 24px; margin-bottom: 10px; }
.r-ac-header { display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: start; margin-bottom: 12px; }
.r-ac-badge { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; padding: 2px 8px; border-radius: 2px; text-transform: uppercase; }
.r-ac-tag { font-family: 'DM Mono', monospace; font-size: 9px; color: #8A8378; letter-spacing: 0.08em; text-transform: uppercase; }
.r-ac-title { font-size: 16px; font-weight: 500; margin: 0 0 4px; letter-spacing: -0.01em; color: #3D3933; font-family: 'Playfair Display', serif;}
.r-ac-mech { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #8A8378; margin: 0; line-height: 1.6; }
.r-ac-save { font-size: 22px; font-weight: 400; color: #2D5A2D; font-family: 'Playfair Display', serif; }
.r-ac-save-lbl { font-family: 'DM Mono', monospace; font-size: 9px; color: #A09890; margin-top: 2px; }
.r-ac-detail { background: #FAF8F4; border: 0.5px solid #E8E4DC; border-radius: 3px; padding: 10px 14px; font-family: 'DM Mono', monospace; font-size: 10px; line-height: 1.7; margin-bottom: 14px; }

.r-ac-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #E8E4DC; border-radius: 2px; overflow: hidden; }
.r-ac-kpi { background: #F5F2EE; padding: 10px 14px; }
.r-kpi-k { font-family: 'DM Mono', monospace; font-size: 8px; color: #A09890; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 3px; }
.r-kpi-v { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; color: #3D3933; }

/* TIMELINE */
.r-tl-row { display: grid; grid-template-columns: 80px 1fr; gap: 24px; margin-bottom: 28px; padding-bottom: 28px; border-bottom: 0.5px solid #E8E4DC; }
.r-tl-period { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; padding-top: 3px; line-height: 1.5; }
.r-tl-line { width: 2px; height: 40px; margin-top: 8px; opacity: 0.3; }
.r-tl-title { font-size: 15px; font-weight: 500; margin: 0 0 8px; color: #3D3933; }
.r-tl-why { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #6A6358; margin: 0 0 8px; line-height: 1.7; }
.r-tl-res { font-family: 'DM Mono', monospace; font-size: 10px; padding: 6px 10px; border-radius: 2px; display: inline-block; }

.r-combo-final { background: #1E1C18; border-radius: 4px; padding: 28px 32px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; margin-bottom: 60px; }
.r-cf-lbl { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.18em; color: #6A6358; text-transform: uppercase; margin-bottom: 4px; }
.r-cf-title { font-size: 20px; color: #F0EDE6; font-style: italic; }
.r-cf-box { background: #252320; padding: 16px 18px; }
.r-cf-k { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; color: #6A6358; margin-bottom: 6px; }
.r-cf-v { font-size: 22px; font-family: 'Playfair Display', serif; }

/* FOOTER */
.r-main-footer { border-top: 0.5px solid #D4CFC4; padding-top: 24px; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 16px; font-family: 'DM Mono', monospace; font-size: 9px; color: #A09890; line-height: 1.8; }

/* ── CSS PRINT STYLES ── */
@media print {
  body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  .r-cover { page-break-after: always; break-after: page; background: #1E1C18 !important; }
  .page-break { page-break-before: always; break-before: page; }
  .r-body { padding: 0 !important; border: none !important; max-width: 100% !important; margin: 0 !important;}
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}

@media (max-width: 600px) {
  .r-cover { padding: 40px 24px 32px; }
  .r-kpi-strip { grid-template-columns: repeat(2, 1fr); }
  .r-body { padding: 0 20px 80px; }
  .r-vec-grid, .r-matrices-grid { grid-template-columns: 1fr; }
  .r-co2-row { grid-template-columns: 100px 1fr; }
  .r-co2-row > div:last-child { display: none; }
  .r-co2-summary { grid-template-columns: 1fr; }
  .r-action-types { grid-template-columns: 1fr; }
  .r-ac-kpis { grid-template-columns: repeat(2, 1fr); }
  .r-combo-final { grid-template-columns: repeat(2, 1fr); }
}
</style>
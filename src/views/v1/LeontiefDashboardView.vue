<template>
  <div class="app-container">
    <GuideHeader :isLightMode="false" />

    <main class="main-content">
      <section class="address-section fade-in" :class="{ 'is-entered': entered }">
        <div class="address-selector">
          <div class="address-info">
            <span class="label">MODELLO LEONTIEF:</span>
            <div class="address-value">
              <svg class="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{{ activeAddressName }}</span>
            </div>
          </div>
          <div class="sync-badge">Analisi I/O</div>
        </div>
        <p class="section-desc mt-2">
          <span class="text-white">x = (I − A)⁻¹ · d</span><br>
          Scopri l'impatto indotto: ogni bolletta consuma output delle altre.
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
        <p>Inizializzazione matrici...</p>
      </div>

      <div v-else class="impact-content fade-in delay-2" :class="{ 'is-entered': entered }">
        
        <div v-if="tab === 'evidenze'" class="tab-pane">
          
          <div class="res-grid mb-3">
            <div class="res-item">
              <span class="ri-label text-blue">Domanda d</span>
              <span class="ri-val">€{{ totD.toFixed(0) }}</span>
              <span class="action-desc mt-1" style="font-size: 9px;">/mese</span>
            </div>
            <div class="res-item">
              <span class="ri-label text-purple">Output x</span>
              <span class="ri-val">€{{ totX.toFixed(0) }}</span>
              <span class="action-desc mt-1" style="font-size: 9px;">/mese Leontief</span>
            </div>
            <div class="res-item">
              <span class="ri-label text-green">Indotto</span>
              <span class="ri-val">+€{{ (totX-totD).toFixed(1) }}</span>
              <span class="action-desc mt-1" style="font-size: 9px;">costo nascosto</span>
            </div>
            <div class="res-item">
              <span class="ri-label text-red">CO₂ extra</span>
              <span class="ri-val">+{{ ((co2Totale.reduce((s,v)=>s+v,0)/(co2Diretta.reduce((s,v)=>s+v,0)||1)-1)*100).toFixed(1) }}%</span>
              <span class="action-desc mt-1" style="font-size: 9px;">effetto A</span>
            </div>
          </div>

          <div class="smart-tile">
            <h3 class="section-title">Leve di Efficienza Dinamiche</h3>
            <p class="action-desc mb-3">Interventi ricalcolati sui tuoi consumi attuali per minimizzare l'effetto moltiplicatore.</p>

            <div class="interventions-list">
              <div v-for="iv in interventions" :key="iv.id" 
                   class="intervention-card"
                   :style="{ borderLeftColor: iv.accent }">
                <div class="flex-between">
                  <div>
                    <span class="badge-priority" :style="{ color: iv.accent, background: iv.accent + '22' }">
                      {{ iv.priority === 0 ? '★ Ottimale' : 'Leva ' + iv.priority }}
                    </span>
                    <h4 class="iv-title">{{ iv.label }}</h4>
                  </div>
                  <div class="text-right">
                    <div class="iv-saving text-green">-€{{ iv.saving }}</div>
                    <div class="iv-saving-lbl">risparmio annuo</div>
                  </div>
                </div>
                <p class="iv-desc">{{ iv.desc }}</p>
                <div class="iv-kpis">
                  <div class="iv-kpi"><span class="kpi-lbl">CO₂</span> <span class="text-green">{{ iv.co2 }}%</span></div>
                  <div class="iv-kpi"><span class="kpi-lbl">Indip.</span> <span class="text-blue">+{{ iv.independence }}%</span></div>
                  <div class="iv-kpi"><span class="kpi-lbl">Mult.</span> <span :style="{ color: iv.accent }">×{{ iv.avgAfter.toFixed(3) }}</span> <span class="text-muted" style="font-size:9px">(da ×{{ iv.avgBefore.toFixed(3) }})</span></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div v-if="tab === 'modello'" class="tab-pane">
          
          <div class="smart-tile equation-tile">
            <div class="res-header">Equazione fondamentale</div>
            <div class="eq-text">x = (I − A)⁻¹ · d</div>
            <div class="eq-desc">
              <div class="text-orange">x = output totale richiesto (€/mese)</div>
              <div class="text-red">A = matrice coeff. tecnici (interdipendenze)</div>
              <div class="text-blue">d = domanda finale (bollette dirette)</div>
              <div class="text-purple">(I−A)⁻¹ = moltiplicatore di Leontief</div>
            </div>
          </div>

          <div class="smart-tile mt-3">
            <h3 class="section-title text-red">Matrice A — coefficienti tecnici</h3>
            <p class="action-desc mb-3">aᵢⱼ = quota output di <span class="text-white">i</span> usata da <span class="text-white">j</span> (Tocca per modificare)</p>
            
            <div class="matrix-wrapper">
              <span class="matrix-bracket">[</span>
              <div class="matrix-body">
                <div v-for="(row, i) in A" :key="'r'+i" class="matrix-row">
                  <div v-for="(val, j) in row" :key="'c'+j" 
                       class="matrix-cell" 
                       :class="{ 'is-diag': i===j, 'is-high': val > 0.08 }"
                       @click="startEdit(i, j, val)">
                    <span v-if="editCell !== `${i}-${j}`" :class="{'text-white': val > 0 && i!==j}">{{ i===j ? '—' : val.toFixed(2) }}</span>
                    <input v-else v-model.number="editVal" @blur="saveEdit(i, j)" @keyup.enter="saveEdit(i, j)" class="cell-input" autofocus />
                  </div>
                </div>
              </div>
              <span class="matrix-bracket">]</span>
            </div>

            <div class="matrix-labels mt-2">
              <span v-for="s in settori" :key="s.id" :style="{ color: s.color }">{{ s.emoji }}</span>
            </div>

            <div class="interdip-list mt-3">
              <template v-for="(row, i) in A">
                <div v-for="(val, j) in row" :key="'rel'+i+'-'+j">
                  <div v-if="val > 0 && i !== j" class="interdip-item">
                    <span :style="{ color: settori[j].color }">{{ settori[j].emoji }}{{ settori[j].nome }}</span> usa <span class="text-white" :style="{ color: settori[i].color }">{{ (val*100).toFixed(0) }}%</span> di <span :style="{ color: settori[i].color }">{{ settori[i].emoji }}{{ settori[i].nome }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="smart-tile mt-3">
            <h3 class="section-title text-blue">Vettore d — domanda finale</h3>
            <div v-for="(s, i) in settori" :key="'d'+s.id" class="slider-wrap">
              <div class="slider-info">
                <span :style="{ color: s.color, fontWeight: 800 }">{{ s.emoji }} {{ s.nome }}</span>
                <span class="text-white font-mono">€{{ d[i] }}/m</span>
              </div>
              <input type="range" class="custom-slider" min="10" max="300" v-model.number="d[i]" :style="{ accentColor: s.color }" />
            </div>
          </div>
        </div>

        <div v-if="tab === 'leontief'" class="tab-pane">
          
          <div class="smart-tile">
            <h3 class="section-title text-purple">① Matrice (I − A)</h3>
            <div class="matrix-wrapper">
              <span class="matrix-bracket">[</span>
              <div class="matrix-body">
                <div v-for="(row, i) in ImA" :key="'ima'+i" class="matrix-row">
                  <div v-for="(val, j) in row" :key="'imac'+j" class="matrix-cell readonly">
                    <span class="text-white">{{ val.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
              <span class="matrix-bracket">]</span>
            </div>

            <h3 class="section-title text-purple mt-4">② Moltiplicatore (I − A)⁻¹</h3>
            <div class="matrix-wrapper">
              <span class="matrix-bracket text-purple">[</span>
              <div class="matrix-body">
                <div v-for="(row, i) in L" :key="'l'+i" class="matrix-row">
                  <div v-for="(val, j) in row" :key="'lc'+j" class="matrix-cell readonly l-cell">
                    <span>{{ val.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
              <span class="matrix-bracket text-purple">]</span>
            </div>
          </div>

          <div class="smart-tile resultant-tile mt-3">
            <div class="res-header">Moltiplicatori di output (somma colonne L)</div>
            <div v-for="(s, j) in settori" :key="'m'+s.id" class="mb-3">
              <div class="bar-info">
                <span :style="{ color: s.color }">{{ s.emoji }} {{ s.nome }}</span>
                <span class="text-white font-mono">×{{ moltiplicatori[j].toFixed(3) }}</span>
              </div>
              <div class="bar-track mt-1">
                <div class="bar-fill" :style="{ width: `${Math.min((moltiplicatori[j]-1)/0.4*100, 100)}%`, background: `linear-gradient(90deg, ${s.color}66, ${s.color})` }"></div>
              </div>
            </div>
          </div>

          <div class="smart-tile equation-tile mt-3">
            <div class="res-header">x = L · d (Output Totale)</div>
            <div class="vector-math-row">
              <div class="vector-col">
                <span class="v-lbl text-purple">x (output)</span>
                <span class="v-val text-purple" v-for="(vx, idx) in x" :key="'vx'+idx">€{{ vx.toFixed(1) }}</span>
              </div>
              <div class="v-math">=</div>
              <div class="vector-col">
                <span class="v-lbl text-blue">d (domanda)</span>
                <span class="v-val text-blue" v-for="(vd, idx) in d" :key="'vd'+idx">€{{ vd }}</span>
              </div>
              <div class="v-math">+</div>
              <div class="vector-col">
                <span class="v-lbl text-green">indotto</span>
                <span class="v-val text-green" v-for="(vi, idx) in indotto" :key="'vi'+idx">€{{ vi.toFixed(1) }}</span>
              </div>
            </div>
          </div>

        </div>

        <div v-if="tab === 'impatto'" class="tab-pane">
          
          <div class="smart-tile canvas-tile">
            <span class="canvas-badge">TRATTEGGIO=d PIENO=x</span>
            <div class="canvas-wrapper">
              <svg width="100%" viewBox="0 0 320 260" style="overflow: visible;">
                <line v-for="i in 6" :key="'hi'+i" :x1="0" :y1="oy - (i-1)*38" :x2="320" :y2="oy - (i-1)*38" stroke="var(--border-color)" stroke-width="1" />
                <line v-for="i in 8" :key="'vi'+i" :x1="ox + (i-1)*36" :y1="0" :x2="ox + (i-1)*36" :y2="260" stroke="var(--border-color)" stroke-width="1" />
                
                <defs>
                  <marker id="axisArr" markerWidth="6" markerHeight="6" refX="5" refY="2.5" orient="auto"><path d="M0,0 L0,5 L6,2.5 z" fill="var(--text-muted)"/></marker>
                  <marker v-for="s in settori" :key="'md'+s.id" :id="'md-'+s.id" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5 z" :fill="s.color" opacity="0.5"/></marker>
                  <marker v-for="s in settori" :key="'mx'+s.id" :id="'mx-'+s.id" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5 z" :fill="s.color"/></marker>
                  <marker id="mr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="var(--accent-purple)"/></marker>
                </defs>

                <line :x1="ox" :y1="250" :x2="ox" :y2="10" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#axisArr)" />
                <line :x1="10" :y1="oy" :x2="310" :y2="oy" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#axisArr)" />
                <text :x="310" :y="oy+14" fill="var(--text-muted)" font-size="9" font-weight="700" text-anchor="end">COSTO €</text>
                <text :x="ox-8" :y="14" fill="var(--text-muted)" font-size="9" font-weight="700" text-anchor="middle">CO₂</text>

                <circle :cx="ox" :cy="oy" r="4" fill="var(--accent-purple)" opacity="0.8" />

                <g v-for="(s, i) in settori" :key="'v'+s.id">
                  <line :x1="ox" :y1="oy" :x2="ox + vec(d[i], s.angle).x" :y2="oy - vec(d[i], s.angle).y" :stroke="s.color" stroke-width="1.5" stroke-dasharray="5 4" stroke-opacity="0.4" :marker-end="'url(#md-'+s.id+')'" />
                  <line :x1="ox" :y1="oy" :x2="ox + vec(x[i], s.angle).x" :y2="oy - vec(x[i], s.angle).y" :stroke="s.color" stroke-width="3" stroke-linecap="round" :marker-end="'url(#mx-'+s.id+')'" :style="`filter: drop-shadow(0 0 4px ${s.color}66)`" />
                  <text :x="ox + vec(x[i], s.angle).x + (vec(x[i], s.angle).x > 0 ? 8 : -8)" :y="oy - vec(x[i], s.angle).y - 4" :fill="s.color" font-size="11" font-weight="800" :text-anchor="vec(x[i], s.angle).x > 0 ? 'start' : 'end'">{{ s.emoji }} {{ s.nome }}</text>
                </g>

                <line :x1="ox" :y1="oy" :x2="ox + Rx" :y2="oy - Ry" stroke="var(--accent-purple)" stroke-width="4" stroke-linecap="round" marker-end="url(#mr)" style="filter: drop-shadow(0 0 8px rgba(167,139,250,0.6));" />
                <text :x="ox + Rx + 10" :y="oy - Ry" fill="var(--accent-purple)" font-size="10" font-weight="700">R (output)</text>
              </svg>
            </div>
          </div>

          <div class="smart-tile mt-3">
            <h3 class="section-title text-green">Impatto CO₂ — Diretto vs Indotto</h3>
            <div v-for="(s, i) in settori" :key="'co2'+s.id" class="mb-3">
              <div class="bar-info">
                <span :style="{ color: s.color }">{{ s.emoji }} {{ s.nome }} <span v-if="i===0 && isGreenEnergy" class="green-tag">Green</span></span>
                <span class="text-red font-mono">{{ co2Totale[i].toFixed(0) }} kg/m</span>
              </div>
              
              <div class="mt-1">
                <div class="action-desc mb-1" style="font-size: 9px;">Diretto: {{ co2Diretta[i].toFixed(0) }} kg</div>
                <div class="bar-track" style="height: 6px;">
                  <div class="bar-fill" :style="{ width: `${co2Diretta[i] / Math.max(...co2Totale, 1) * 85}%`, background: s.color, opacity: 0.6 }"></div>
                </div>
              </div>

              <div class="mt-1">
                <div class="action-desc mb-1" style="font-size: 9px;">Indotto (Leontief): +{{ co2Indotta[i].toFixed(0) }} kg</div>
                <div class="bar-track" style="height: 6px;">
                  <div class="bar-fill" :style="{ width: `${co2Totale[i] / Math.max(...co2Totale, 1) * 85}%`, background: `linear-gradient(90deg, ${s.color}88, ${s.color})`, boxShadow: `0 0 6px ${s.color}44` }"></div>
                </div>
              </div>
            </div>
            
            <div class="alert-tile mt-3">
              CO₂ totale (inclusa quota indotta): <strong class="text-green">{{ co2Totale.reduce((s,v)=>s+v,0).toFixed(0) }} kg/m</strong> vs diretta <strong>{{ co2Diretta.reduce((s,v)=>s+v,0).toFixed(0) }} kg/m</strong> — effetto Leontief <strong class="text-red">+{{ co2Diretta.reduce((s,v)=>s+v,0) > 0 ? ((co2Totale.reduce((s,v)=>s+v,0)/(co2Diretta.reduce((s,v)=>s+v,0))-1)*100).toFixed(1) : 0 }}%</strong>
            </div>
          </div>
        </div>

        <div v-if="tab === 'simula'" class="tab-pane">
          <p class="section-desc mb-3">
            Modifica domanda e coefficienti. Il modello ricalcola output e impatto indotto in tempo reale.
          </p>

          <div class="smart-tile">
            <div v-for="(s, i) in settori" :key="'sim'+s.id" class="slider-wrap">
              <div class="slider-info">
                <span :style="{ color: s.color, fontWeight: 800 }">{{ s.emoji }} {{ s.nome }}</span>
                <span class="text-white font-mono">d={{ d[i] }} → x={{ x[i].toFixed(1) }} <span class="text-green" style="font-size: 9px;">(+{{ indotto[i].toFixed(1) }})</span></span>
              </div>
              <input type="range" class="custom-slider" min="10" max="300" v-model.number="d[i]" :style="{ accentColor: s.color }" />
            </div>
          </div>

          <div class="res-grid mt-3">
            <div class="res-item">
              <span class="ri-label text-blue">💸 Domanda Totale</span>
              <span class="ri-val">€{{ totD.toFixed(0) }}/m</span>
            </div>
            <div class="res-item">
              <span class="ri-label text-purple">📐 Output Totale x</span>
              <span class="ri-val">€{{ totX.toFixed(0) }}/m</span>
            </div>
            <div class="res-item">
              <span class="ri-label text-green">🔀 Costo Indotto</span>
              <span class="ri-val">+€{{ (totX-totD).toFixed(1) }}</span>
            </div>
            <div class="res-item">
              <span class="ri-label text-red">🌱 CO₂ Indotta Extra</span>
              <span class="ri-val">+{{ (co2Totale.reduce((s,v)=>s+v,0)-co2Diretta.reduce((s,v)=>s+v,0)).toFixed(0) }}kg</span>
            </div>
          </div>

          <div class="smart-tile resultant-tile mt-3">
            <div class="res-header text-purple">💡 Lettura vettoriale + Leontief</div>
            <p class="action-desc">
              Ridurre la bolletta del gas non abbassa solo il suo vettore: tramite la matrice A, riduce anche la componente indotta sull'energia e sull'acqua. Il <strong class="text-white">vettore risultante si accorcia e ruota</strong> — meno impatto economico e ambientale globale.
            </p>
          </div>
        </div>

        <div v-if="tab === 'prompt'" class="tab-pane">
          
          <div class="smart-tile">
             <div class="flex-between align-center mb-3">
                <h3 class="section-title text-purple m-0" style="margin-bottom: 0;">Prompt AI Personalizzato</h3>
                <button @click="copyPrompt" class="btn-ghost-small" :class="{'btn-copied': copied}">
                  {{ copied ? '✓ Copiato!' : 'Copia Prompt' }}
                </button>
             </div>
             
             <p class="action-desc mb-3">Copia questo prompt e incollalo nel tuo assistente AI (ChatGPT, Claude, ecc.). Contiene i tuoi dati reali e la matrice di interdipendenza per generare un'analisi avanzata.</p>
             
             <div class="prompt-box">
{{ dynamicPrompt }}
             </div>
          </div>

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

// STATO UI
const loading = ref(true);
const entered = ref(false);
const tab = ref('evidenze');
const activeAddressName = ref('Caricamento...');
const copied = ref(false);

const tabs = [
  { id: 'evidenze', label: '💡 Evidenze' },
  { id: 'modello', label: '📐 Modello' },
  { id: 'leontief', label: '🔢 Leontief' },
  { id: 'impatto', label: '🌍 Impatto' },
  { id: 'simula', label: '🎛 Simula' },
  { id: 'prompt', label: '🤖 Prompt AI' }
];

// VARIABILI REATTIVE
const isGreenEnergy = ref(false);
const co2Factors = { energia: 0.233, gas: 2.04, acqua: 0.149 };

// MATRICI E VETTORI BASE
const A = ref([
  [0.00, 0.08, 0.12],
  [0.05, 0.00, 0.10],
  [0.02, 0.03, 0.00],
]);
const d = ref([120, 85, 30]);

// ─── SETTORI: RESI COMPUTED PER AGGIORNARE DINAMICAMENTE L'ANGOLO ───
const settori = computed(() => [
  { id: "energia", nome: "Energia", emoji: "⚡", color: "#f59e0b", angle: isGreenEnergy.value ? 0 : 32 },
  { id: "gas",     nome: "Gas",     emoji: "🔥", color: "#ef4444", angle: 68 },
  { id: "acqua",   nome: "Acqua",   emoji: "💧", color: "#38bdf8", angle: 12 },
]);

// EDIT MATRICE
const editCell = ref(null);
const editVal = ref(0);
const startEdit = (i, j, val) => { if (i !== j) { editCell.value = `${i}-${j}`; editVal.value = val; } };
const saveEdit = (i, j) => {
  if (editVal.value >= 0 && editVal.value < 1) A.value[i][j] = editVal.value;
  editCell.value = null;
};

// FUNZIONI MATEMATICHE PURE
const I3 = [[1,0,0],[0,1,0],[0,0,1]];
const matSub = (A, B) => A.map((row, i) => row.map((v, j) => v - B[i][j]));
const inv3x3 = (m) => {
  const [[a,b,c],[d,e,f],[g,h,k]] = m;
  const det = a*(e*k-f*h) - b*(d*k-f*g) + c*(d*h-e*g);
  return [
    [(e*k-f*h)/det, (c*h-b*k)/det, (b*f-c*e)/det],
    [(f*g-d*k)/det, (a*k-c*g)/det, (c*d-a*f)/det],
    [(d*h-e*g)/det, (b*g-a*h)/det, (a*e-b*d)/det],
  ];
};

const leontiefSolveFn = (matA, vecD) => {
  const imA = matSub(I3, matA);
  const lMat = inv3x3(imA);
  const outX = lMat.map(row => row.reduce((s, v, j) => s + v * vecD[j], 0));
  const mults = lMat[0].map((_, j) => lMat.reduce((s, row) => s + row[j], 0));
  return { L: lMat, x: outX, multipliers: mults };
};

// COMPUTED MATRICI CORE
const ImA = computed(() => matSub(I3, A.value));
const L = computed(() => inv3x3(ImA.value));
const x = computed(() => L.value.map(row => row.reduce((s, v, j) => s + v * d.value[j], 0)));
const moltiplicatori = computed(() => L.value[0].map((_, j) => L.value.reduce((s, row) => s + row[j], 0)));
const indotto = computed(() => x.value.map((xi, i) => xi - d.value[i]));

// COMPUTED KPI E CO2
const totD = computed(() => d.value.reduce((s, v) => s + v, 0));
const totX = computed(() => x.value.reduce((s, v) => s + v, 0));

const co2Arr = computed(() => [isGreenEnergy.value ? 0 : co2Factors.energia, co2Factors.gas, co2Factors.acqua]);
const co2Diretta = computed(() => d.value.map((di, i) => di * co2Arr.value[i]));
const co2Totale = computed(() => x.value.map((xi, i) => xi * co2Arr.value[i]));
const co2Indotta = computed(() => co2Totale.value.map((v, i) => v - co2Diretta.value[i]));

// COMPUTED INTERVENTI
const interventions = computed(() => {
  const { multipliers: mb } = leontiefSolveFn(A.value, d.value);
  const avgBefore = mb.reduce((s,v)=>s+v,0)/3;

  const calc = (name, desc, dA, dd, co2, ind, prio, acc) => {
    const { multipliers: ma } = leontiefSolveFn(dA, dd);
    const avgAfter = ma.reduce((s,v)=>s+v,0)/3;
    const savingMensile = totD.value - dd.reduce((s,v)=>s+v,0);
    return { 
      id: name, label: name, desc, 
      deltaA: dA, deltaD: dd, 
      saving: Math.max(0, savingMensile * 12).toFixed(0), 
      co2, independence: ind, priority: prio, accent: acc, 
      avgBefore, avgAfter 
    };
  };

  return [
    calc("Pompa di calore", "Sostituisce la caldaia. Azzera il loop del gas sull'acqua, riduce il gas sull'energia.", 
         [[0,0.08,0.04],[0.02,0,0.02],[0.02,0.01,0]], 
         [d.value[0]+20, d.value[1]*0.2, d.value[2]], 
         -55, 30, 1, "#ef4444"),
    calc("Fotovoltaico 4kWp", "Riduce la spesa diretta dell'energia dalla rete, lasciando la matrice inalterata.", 
         A.value, 
         [d.value[0]*0.3, d.value[1], d.value[2]], 
         -68, 42, 2, "#f59e0b"),
    calc("Efficienza idrica", "Riduttori di flusso e valvole. Comprime il vettore acqua alla base.", 
         [[0,0.08,0.06],[0.05,0,0.03],[0.01,0.02,0]], 
         [d.value[0], d.value[1], d.value[2]*0.7], 
         -18, 8, 3, "#38bdf8"),
    calc("Combo ottimale", "Fotovoltaico + Pompa di calore. Riscrive la matrice e minimizza la domanda.", 
         [[0,0.04,0.04],[0.01,0,0.02],[0.01,0.01,0]], 
         [d.value[0]*0.4, d.value[1]*0.2, d.value[2]*0.7], 
         -91, 74, 0, "#a78bfa")
  ].sort((a,b) => a.priority - b.priority);
});

// COMPUTED PROMPT AI
const dynamicPrompt = computed(() => {
  return `## Prompt — Analisi Leontief Input-Output per sistema multi-settoriale

Sei un analista esperto di sistemi economici complessi e sostenibilità. Il tuo compito è applicare il modello di Leontief Input-Output a questa utenza domestica.

---
### Contesto Specifico dell'Utente
**Abitazione/Nucleo:** ${activeAddressName.value}
**Energia 100% Green:** ${isGreenEnergy.value ? 'Sì, fattore CO2 azzerato' : 'No, fornitura standard'}

### 1. Definizione dei settori
Settori: [Energia Elettrica, Gas Naturale, Acqua]
Domanda finale (bollette mensili reali osservate): 
- Energia: €${d.value[0].toFixed(2)}/mese
- Gas: €${d.value[1].toFixed(2)}/mese
- Acqua: €${d.value[2].toFixed(2)}/mese

### 2. Matrice dei coefficienti tecnici A (Attuale)
A = [
  [${A.value[0].map(v => v.toFixed(2)).join(', ')}],
  [${A.value[1].map(v => v.toFixed(2)).join(', ')}],
  [${A.value[2].map(v => v.toFixed(2)).join(', ')}]
]

### 3. Istruzioni per l'analisi
x = (I − A)⁻¹ · d

Utilizzando questi dati:
1. Calcola l'output totale (x) per ogni settore, i moltiplicatori di Leontief e i costi indotti nascosti.
2. Identifica quale dei 3 settori funge da "collo di bottiglia" o moltiplicatore critico, analizzando l'impatto indiretto.
3. Suggerisci 3 interventi strategici (es. domotica, pompa di calore, accumuli) per ridurre la matrice A o il vettore d per questa casa.
4. Fornisci una stima su quanto l'intervento possa comprimere il moltiplicatore totale.`;
});

const copyPrompt = () => {
  navigator.clipboard.writeText(dynamicPrompt.value).then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2500);
  });
};

// CANVAS SVGs MATEMATICA (Con angle reattivo da settori.value)
const ox = 55;
const oy = 220;
const SCALE = 1.3;
const vec = (mag, deg) => { const r = deg * Math.PI / 180; return { x: mag * Math.cos(r) * SCALE, y: mag * Math.sin(r) * SCALE }; };
const Rx = computed(() => settori.value.reduce((s, e, i) => s + vec(x.value[i], e.angle).x, 0));
const Ry = computed(() => settori.value.reduce((s, e, i) => s + vec(x.value[i], e.angle).y, 0));

// ESTRAZIONE PROFONDA DATI AI
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

// FETCH DATI
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
        if (typeof pAi === 'string') { try { pAi = JSON.parse(pAi); } catch(e) {} }
        
        if (rGas) try { gAi = typeof rGas.ai_analysis === 'string' ? JSON.parse(rGas.ai_analysis) : (rGas.ai_analysis || {}); } catch(e) {}
        if (rWater) try { wAi = typeof rWater.ai_analysis === 'string' ? JSON.parse(rWater.ai_analysis) : (rWater.ai_analysis || {}); } catch(e) {}

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
    console.error("Errore Leontief Dashboard", error);
  } finally {
    loading.value = false;
    await nextTick();
    setTimeout(() => { entered.value = true; }, 50);
  }
});
</script>

<style scoped>
@import '@/assets/main_V0.css';

.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); font-family: 'Inter', sans-serif; }
.main-content { padding: 16px; max-width: 480px; margin: 0 auto; padding-bottom: 90px; }

/* ANIMAZIONI */
.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0; }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* SELEZIONE NUCLEO E TEXT */
.address-section { margin-bottom: 20px; }
.address-selector { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-card); }
.address-info .label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 4px; }
.address-value { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--text-primary); }
.pin-icon { width: 16px; height: 16px; color: var(--accent-cyan); flex-shrink: 0; }
.sync-badge { background: rgba(167, 139, 250, 0.1); color: var(--accent-purple, #a78bfa); padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; border: 1px solid rgba(167, 139, 250, 0.2); }
.section-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; margin: 0; }
.text-white { color: var(--text-primary); font-weight: 600; }
.text-orange { color: #f59e0b; }
.text-red { color: #ef4444; }
.text-blue { color: #38bdf8; }
.text-purple { color: #a78bfa; }
.text-green { color: #34d399; }
.font-mono { font-family: monospace; font-weight: 800; }
.text-right { text-align: right; }

/* FLEX LAYOUTS */
.flex-between { display: flex; justify-content: space-between; align-items: flex-start; }
.align-center { align-items: center; }

/* TABS FINTECH */
.tabs-section { margin-bottom: 20px; }
.fintech-tabs { display: flex; flex-wrap: wrap; background: var(--bg-card); padding: 4px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
.f-tab { flex: 1; min-width: 30%; text-align: center; padding: 10px 0; background: transparent; border: none; border-radius: 8px; font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px; }
.f-tab.active { background: var(--bg-app); color: var(--text-primary); box-shadow: 0 2px 6px rgba(0,0,0,0.1); border: 1px solid var(--border-color); }

/* SPINNER */
.loading-state { text-align: center; padding: 4rem 1rem; }
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

/* CARDS GLOBALI E PULSANTI */
.smart-tile { background: var(--bg-card); border-radius: 16px; padding: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-card); }
.section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }
.action-desc { font-size: 11px; line-height: 1.5; color: var(--text-muted); margin: 0; }
.btn-ghost-small { background: var(--bg-app); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 6px 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; cursor: pointer; transition: 0.2s; }
.btn-copied { background: rgba(52, 211, 153, 0.1); color: #34d399; border-color: rgba(52, 211, 153, 0.3); }

/* EQUAZIONI */
.equation-tile { background: linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(99, 102, 241, 0.02)); border-color: rgba(167, 139, 250, 0.2); }
.res-header { font-size: 10px; color: var(--accent-purple, #a78bfa); text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 8px; }
.eq-text { font-size: 20px; font-weight: 900; margin-bottom: 12px; }
.eq-desc { font-size: 10px; line-height: 1.8; font-family: monospace; font-weight: 600; }

/* MATRICE A */
.matrix-wrapper { display: flex; align-items: center; justify-content: center; margin: 10px 0; }
.matrix-bracket { font-size: 42px; font-weight: 300; color: var(--text-muted); opacity: 0.5; margin: 0 10px; }
.matrix-body { display: flex; flex-direction: column; gap: 4px; }
.matrix-row { display: flex; gap: 4px; }
.matrix-cell { width: 48px; height: 44px; display: flex; justify-content: center; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; font-family: monospace; font-size: 13px; font-weight: 700; color: var(--text-muted); transition: 0.2s; }
.matrix-cell.is-diag { background: rgba(255,255,255,0.01); border-color: transparent; }
.matrix-cell.is-high { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); }
.matrix-cell:not(.is-diag):not(.readonly) { cursor: pointer; }
.matrix-cell:not(.is-diag):not(.readonly):hover { border-color: var(--accent-blue); background: rgba(59, 130, 246, 0.1); }
.cell-input { width: 100%; height: 100%; background: transparent; border: none; outline: none; color: var(--text-primary); text-align: center; font-family: monospace; font-size: 13px; font-weight: 800; }
.matrix-labels { display: flex; justify-content: center; gap: 4px; padding: 0 28px; }
.matrix-labels span { width: 48px; text-align: center; font-size: 12px; }

.interdip-list { font-family: monospace; font-size: 10px; color: var(--text-muted); line-height: 1.8; }
.interdip-item { background: rgba(255,255,255,0.02); padding: 4px 8px; border-radius: 4px; margin-bottom: 4px; }

/* L MATRICE & VETTORI */
.l-cell { background: rgba(167, 139, 250, 0.05); color: var(--text-primary); }
.vector-math-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.vector-col { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.v-lbl { font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
.v-val { width: 56px; height: 38px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); border: 1px solid currentColor; border-radius: 8px; font-family: monospace; font-size: 12px; font-weight: 800; opacity: 0.9; }
.v-math { display: flex; align-items: center; font-size: 24px; color: var(--text-muted); opacity: 0.5; padding-top: 50px; }

/* SLIDERS E TRACKS */
.slider-wrap { margin-bottom: 16px; }
.slider-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
.custom-slider { width: 100%; height: 6px; border-radius: 99px; background: var(--bg-app); outline: none; -webkit-appearance: none; }
.custom-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: white; border: 2px solid currentColor; cursor: pointer; }

.bar-info { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 4px; }
.bar-track { height: 6px; background: var(--bg-app); border-radius: 99px; overflow: hidden; border: 1px solid var(--border-color); }
.bar-fill { height: 100%; border-radius: 99px; transition: width 0.8s; }

/* CANVAS SVGs */
.canvas-tile { position: relative; overflow: hidden; padding: 10px; background: linear-gradient(180deg, var(--bg-card) 0%, rgba(255,255,255,0.01) 100%); }
.canvas-badge { position: absolute; top: 12px; right: 14px; font-size: 9px; color: var(--text-muted); font-weight: 800; letter-spacing: 1px; }

/* RISULTANTE E GRID */
.resultant-tile { background: linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(167, 139, 250, 0.02)); border-color: rgba(167, 139, 250, 0.3); }
.res-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.res-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; }
.ri-label { font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
.ri-val { font-size: 18px; font-weight: 900; font-family: monospace; }
.alert-tile { background: rgba(52, 211, 153, 0.05); border-color: rgba(52, 211, 153, 0.2); font-size: 10px; line-height: 1.6; color: var(--text-muted); padding: 12px; border-radius: 8px; }
.green-tag { background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 2px 4px; border-radius: 4px; font-size: 8px; font-weight: 800; text-transform: uppercase; border: 1px solid rgba(16, 185, 129, 0.3); margin-left: 4px; }

/* ════════════════════ NUOVI STILI PER EVIDENZE E PROMPT ════════════════════ */
.interventions-list { display: flex; flex-direction: column; gap: 12px; }
.intervention-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-left-width: 4px; border-radius: 12px; padding: 16px; }
.badge-priority { font-size: 9px; padding: 3px 8px; border-radius: 4px; font-weight: 800; text-transform: uppercase; display: inline-block; margin-bottom: 6px; }
.iv-title { font-size: 15px; font-weight: 800; margin: 0; color: var(--text-primary); }
.iv-saving { font-size: 18px; font-weight: 900; }
.iv-saving-lbl { font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
.iv-desc { font-size: 11px; color: var(--text-muted); line-height: 1.6; margin: 10px 0; }
.iv-kpis { display: flex; gap: 8px; flex-wrap: wrap; }
.iv-kpi { background: rgba(255,255,255,0.04); padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; font-family: monospace; display: flex; align-items: center; gap: 4px; }
.kpi-lbl { color: var(--text-muted); font-size: 9px; text-transform: uppercase; font-family: sans-serif; }

.prompt-box { background: #0a0b14; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; font-family: monospace; font-size: 11px; line-height: 1.6; color: rgba(255,255,255,0.7); white-space: pre-wrap; overflow-y: auto; max-height: 400px; }

/* UTILS */
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mb-1 { margin-bottom: 4px; }
.mb-3 { margin-bottom: 12px; }
</style>
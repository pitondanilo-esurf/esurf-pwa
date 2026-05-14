<template>
  <div class="cer-app-wrapper">
    <div class="no-print">
      <GuideHeader :isLightMode="true" />
    </div>

    <div v-if="loading" class="loading-state no-print">
      <div class="spinner"></div>
      <p class="loader-text">SINCRONIZZAZIONE DATI SATELLITARI E MODELLO CER...</p>
    </div>

    <div v-else class="cer-container" :class="{ 'is-entered': entered }">
      
      <div class="c-header">
        <svg class="c-header-bg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
          <line v-for="i in 11" :key="'h'+i" x1="0" :y1="(i-1)*20" x2="400" :y2="(i-1)*20" />
          <line v-for="i in 21" :key="'v'+i" :x1="(i-1)*20" y1="0" :x2="(i-1)*20" y2="200" />
        </svg>

        <div class="c-header-content">
          <div class="c-header-top">
            <div>
              <div class="c-kicker">Comunità Energetica Rinnovabile · D.Lgs 199/2021</div>
              <h1 class="c-title">Analisi benefici CER</h1>
              <div class="c-subtitle">Integrazione Leontief · Nucleo abitativo</div>
            </div>
            
            <div class="c-coord-box">
              <div class="c-coord-lbl">Coordinate POD (Database)</div>
              <div class="c-coord-val">
                <div>φ {{ safeLat.toFixed(5) }}° N</div>
                <div>λ {{ safeLon.toFixed(5) }}° E</div>
                <div class="c-coord-zone text-green" v-if="hasRealPvData">✓ Dati Satellitari PVGIS</div>
                <div class="c-coord-zone" v-else>{{ zoneLabel }} (Stima Base)</div>
              </div>
            </div>
          </div>

          <div class="c-kpi-grid">
            <div class="c-kpi-cell">
              <div class="c-kpi-lbl">Score geo CER</div>
              <div class="c-kpi-val" style="color: #B07A1A;">{{ geoScore }}</div>
              <div class="c-kpi-unit">/ 100</div>
            </div>
            <div class="c-kpi-cell">
              <div class="c-kpi-lbl">Irradiazione PVGIS</div>
              <div class="c-kpi-val" style="color: #C8A850;">{{ res.irr.toFixed(0) }}</div>
              <div class="c-kpi-unit">kWh/m²/a</div>
            </div>
            <div class="c-kpi-cell">
              <div class="c-kpi-lbl">Risparmio totale</div>
              <div class="c-kpi-val" style="color: #5A9A5A;">€{{ res.totalSaving.toFixed(0) }}</div>
              <div class="c-kpi-unit">/mese</div>
            </div>
            <div class="c-kpi-cell">
              <div class="c-kpi-lbl">CO₂ evitata</div>
              <div class="c-kpi-val" style="color: #5A9A5A;">{{ res.co2Saved }}</div>
              <div class="c-kpi-unit">kg/anno</div>
            </div>
          </div>
        </div>
      </div>

      <div class="c-body">
        
        <div class="c-report-section fade-in delay-1">
          <div class="c-section-header">
            <div class="c-section-num">§ 01</div>
            <h2 class="c-section-title">Localizzazione e Profili di Produzione</h2>
          </div>

          <div class="c-card mb-4" style="padding: 0; overflow: hidden; position: relative;">
            <div class="c-map-header" style="position: absolute; top:0; left:0; width: 100%; z-index: 10; background: rgba(250,248,244,0.9); backdrop-filter: blur(4px);">
              <span>Mappa Satellitare POD</span>
              <span style="color: #B07A1A;">{{ safeLat.toFixed(4) }}, {{ safeLon.toFixed(4) }}</span>
            </div>
            <iframe 
              width="100%" 
              height="280" 
              frameborder="0" 
              scrolling="no" 
              marginheight="0" 
              marginwidth="0" 
              :src="`https://www.openstreetmap.org/export/embed.html?bbox=${safeLon-0.015}%2C${safeLat-0.015}%2C${safeLon+0.015}%2C${safeLat+0.015}&amp;layer=mapnik&amp;marker=${safeLat}%2C${safeLon}`" 
              style="border: none; display: block; filter: grayscale(0.2) contrast(0.95); margin-top: 32px;">
            </iframe>
          </div>

          <div v-if="hasRealPvData" class="c-card mb-4" style="border-left: 3px solid #C8A850;">
            <div class="flex-between align-center mb-3">
              <div>
                <div class="c-slabel" style="margin: 0; color: #B07A1A;">Produzione Impianto (3kWp) vs Profili di Consumo (AI)</div>
                <div class="c-text-std" style="margin: 2px 0 0; font-size: 11px;">
                  Confronto tra la capacità produttiva locale e l'assorbimento domestico.
                </div>
              </div>
            </div>

            <div class="c-charts-grid mt-4">
              <div>
                <div class="c-chart-title">Consumo Totale Mensile</div>
                <div class="c-chart-legend">
                  <span style="color: #3D3933;">■ Consumo ({{ monthlyConsTotal.reduce((a,b)=>a+b,0).toFixed(0) }} kWh)</span>
                  <span style="color: #C8A850;">■ PVGIS ({{ actualProd.toFixed(0) }} kWh)</span>
                </div>
                <div class="area-chart-container">
                  <svg width="100%" viewBox="0 0 320 160" style="overflow: visible;">
                    <line v-for="i in 5" :key="'h1'+i" x1="30" :y1="10 + (i-1)*30" x2="310" :y2="10 + (i-1)*30" stroke="#E8E4DC" stroke-width="0.5" stroke-dasharray="3 3"/>
                    <text v-for="i in 5" :key="'yt1'+i" x="25" :y="13 + (i-1)*30" fill="#A09880" font-size="8" font-family="monospace" text-anchor="end">
                      {{ Math.max(0, (maxChartValTotal - (i-1)*(maxChartValTotal/4))).toFixed(0) }}
                    </text>

                    <path :d="consTotalAreaPath" fill="rgba(61, 57, 51, 0.08)" />
                    <path :d="consTotalLinePath" fill="none" stroke="#3D3933" stroke-width="1.5" stroke-dasharray="4 4" />

                    <path :d="prodAreaPathTotal" fill="url(#solargrad)" />
                    <path :d="prodLinePathTotal" fill="none" stroke="#C8A850" stroke-width="2.5" />

                    <text v-for="(m, i) in months" :key="'xt1'+i" :x="30 + i*25.4" y="145" fill="#8A8070" font-size="8" font-family="monospace" text-anchor="middle">
                      {{ m }}
                    </text>
                  </svg>
                </div>
              </div>

              <div>
                <div class="c-chart-title">Consumo Fascia F1 (Giorno)</div>
                <div class="c-chart-legend">
                  <span style="color: #4A7A4A;">■ Consumo F1 ({{ monthlyConsF1.reduce((a,b)=>a+b,0).toFixed(0) }} kWh)</span>
                  <span style="color: #C8A850;">■ PVGIS ({{ actualProd.toFixed(0) }} kWh)</span>
                </div>
                <div class="area-chart-container">
                  <svg width="100%" viewBox="0 0 320 160" style="overflow: visible;">
                    <line v-for="i in 5" :key="'h2'+i" x1="30" :y1="10 + (i-1)*30" x2="310" :y2="10 + (i-1)*30" stroke="#E8E4DC" stroke-width="0.5" stroke-dasharray="3 3"/>
                    <text v-for="i in 5" :key="'yt2'+i" x="25" :y="13 + (i-1)*30" fill="#A09880" font-size="8" font-family="monospace" text-anchor="end">
                      {{ Math.max(0, (maxChartValF1 - (i-1)*(maxChartValF1/4))).toFixed(0) }}
                    </text>

                    <path :d="consF1AreaPath" fill="rgba(74, 122, 74, 0.15)" />
                    <path :d="consF1LinePath" fill="none" stroke="#4A7A4A" stroke-width="1.5" stroke-dasharray="4 4" />

                    <path :d="prodAreaPathF1" fill="url(#solargrad)" />
                    <path :d="prodLinePathF1" fill="none" stroke="#C8A850" stroke-width="2.5" />

                    <text v-for="(m, i) in months" :key="'xt2'+i" :x="30 + i*25.4" y="145" fill="#8A8070" font-size="8" font-family="monospace" text-anchor="middle">
                      {{ m }}
                    </text>
                  </svg>
                </div>
              </div>
            </div>
            
            <svg width="0" height="0">
              <defs>
                <linearGradient id="solargrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(200, 168, 80, 0.4)" />
                  <stop offset="100%" stop-color="rgba(200, 168, 80, 0.0)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div class="c-card mb-4" v-else>
            <div class="c-slabel" style="color: #8B2020;">⚠️ Dati PVGIS non rilevati — Stima Manuale Attiva</div>
            <div class="c-input-grid">
              <div>
                <label class="c-input-lbl">Latitudine φ</label>
                <input type="number" v-model.number="lat" step="0.0001" class="c-input" />
              </div>
              <div>
                <label class="c-input-lbl">Longitudine λ</label>
                <input type="number" v-model.number="lon" step="0.0001" class="c-input" />
              </div>
            </div>
            <div class="c-geo-summary">
              Nessun profilo "pv_production_profile" trovato nel DB per il POD elettrico. I calcoli solari si basano su interpolazione geografica standard.
            </div>
          </div>

          <div class="c-card mb-4">
            <div class="c-score-grid">
              <div class="c-ring-wrap">
                <svg width="76" height="76" viewBox="0 0 76 76">
                  <circle cx="38" cy="38" r="30" fill="none" stroke="#E0D8C8" stroke-width="5" />
                  <circle cx="38" cy="38" r="30" fill="none" :stroke="mapColor" stroke-width="5" stroke-linecap="round"
                    :stroke-dasharray="188.49"
                    :stroke-dashoffset="188.49 * (1 - (geoScore/100) * animProg)"
                    transform="rotate(-90 38 38)" style="transition: stroke-dashoffset 0.8s ease-out;" />
                  <text x="38" y="43" text-anchor="middle" :fill="mapColor" font-size="14" font-family="Georgia,serif">
                    {{ Math.round(geoScore * animProg) }}
                  </text>
                </svg>
                <div class="c-ring-lbl">GEO SCORE</div>
              </div>
              <div>
                <div class="c-score-title">
                  {{ geoScore >= 70 ? "Alta compatibilità CER" : geoScore >= 45 ? "Compatibilità media CER" : "Compatibilità limitata" }}
                </div>
                <div class="c-score-desc">
                  Con irradiazione PVGIS {{ res.irr.toFixed(0) }} kWh/m²/a e quota di condivisione al {{ cerSharePct }}%, il risparmio tariffario mensile stimato è 
                  <strong style="color: #4A7A4A">€{{ res.savingTariff.toFixed(1) }}</strong> con un incentivo GSE aggiunto di 
                  <strong style="color: #7B6B3A">€{{ res.incentiveGSE.toFixed(1) }}</strong>.
                </div>
              </div>
            </div>
          </div>

          <div class="c-card mb-4">
            <div class="c-slabel">Dimensionamento CER (Modificabile)</div>
            <div class="c-sliders-grid">
              <div>
                <div class="c-slider-lbl">Quota energia condivisa: {{ cerSharePct }}%</div>
                <input type="range" min="5" max="80" step="5" v-model.number="cerSharePct" class="c-slider" />
                <div class="c-slider-bounds"><span>5%</span><span>80%</span></div>
              </div>
              <div>
                <div class="c-slider-lbl">Membri stimati CER: {{ cerSize }}</div>
                <input type="range" min="2" max="50" step="1" v-model.number="cerSize" class="c-slider" />
                <div class="c-slider-bounds"><span>2</span><span>50</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="page-break"></div>

        <div class="c-report-section fade-in delay-2">
          <div class="c-section-header">
            <div class="c-section-num">§ 02</div>
            <h2 class="c-section-title">Modifica delle Interdipendenze di Leontief</h2>
          </div>
          
          <div class="c-card mb-4">
            <div class="c-slabel">Effetto Strutturale della Comunità</div>
            <p class="c-text-std mb-3">
              La CER introduce energia condivisa che riduce la dipendenza dalla rete. I coefficienti della riga 
              <strong>Energia</strong> si abbassano proporzionalmente alla quota CER ({{ cerSharePct }}%), 
              comprimendo il moltiplicatore di Leontief dell'intero sistema.
            </p>
            <div class="c-formula-box">
              A_cer[Energia][j] = A[Energia][j] × (1 − {{ (cerSharePct / 100 * 0.7).toFixed(2) }}) ∀j<br/>
              d_cer[Energia] = d[Energia] − €{{ res.totalSaving.toFixed(1) }}/m
            </div>
          </div>

          <div class="c-card mb-4" style="overflow-x: auto;">
            <div class="c-slabel">Delta Matrice A — baseline vs con CER (▼ verde = riduzione)</div>
            <table style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th style="width: 28px;"></th>
                  <th v-for="s in SECTORS" :key="s.id" :style="{ color: s.color }" class="c-mat-th">{{ s.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in A_BASE" :key="i">
                  <td class="c-mat-th-row" :style="{ color: SECTORS[i].color }">{{ SECTORS[i].short }}</td>
                  <td v-for="(vBefore, j) in row" :key="j" class="c-mat-cell" :style="getDeltaStyle(i, j, vBefore, res.A_cer[i][j])">
                    {{ i === j ? '—' : res.A_cer[i][j].toFixed(2) }}
                    <div v-if="i !== j && Math.abs(res.A_cer[i][j] - vBefore) > 0.004" class="c-mat-delta" :style="{ color: res.A_cer[i][j] < vBefore ? '#4A7A4A' : '#7A4A4A' }">
                      {{ res.A_cer[i][j] < vBefore ? '▼' : '▲' }}{{ Math.abs(res.A_cer[i][j] - vBefore).toFixed(3) }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="c-card mb-4">
            <div class="c-slabel">Moltiplicatori di Leontief — prima e dopo CER</div>
            
            <div v-for="(s, i) in SECTORS" :key="s.id" class="c-mult-bar-wrap">
              <div class="c-mb-header">
                <span class="c-mb-lbl">{{ s.label }}</span>
                <span class="c-mb-vals">
                  <span class="c-mb-old">×{{ res.base.mult[i].toFixed(3) }}</span>
                  <span class="c-mb-new" :style="{ color: s.color }">×{{ res.cer.mult[i].toFixed(3) }}</span>
                  <span v-if="res.base.mult[i] > res.cer.mult[i]" class="c-mb-delta">
                    −{{ ((1 - res.cer.mult[i]/res.base.mult[i])*100).toFixed(1) }}%
                  </span>
                </span>
              </div>
              <div class="mb-1">
                <div class="c-bar-title">baseline</div>
                <div class="c-bar-bg"><div class="c-bar-fill" :style="{ width: entered ? `${(res.base.mult[i]/1.5)*100}%` : '0', background: '#C8C0A8' }"></div></div>
              </div>
              <div>
                <div class="c-bar-title">con CER</div>
                <div class="c-bar-bg"><div class="c-bar-fill" :style="{ width: entered ? `${(res.cer.mult[i]/1.5)*100}%` : '0', background: s.color }"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="page-break"></div>

        <div class="c-report-section fade-in delay-3">
          <div class="c-section-header">
            <div class="c-section-num">§ 03</div>
            <h2 class="c-section-title">Benefici e Indicatori di Sostenibilità</h2>
          </div>
          
          <div class="c-ben-grid mb-4">
            <div v-for="(b, i) in benefici" :key="i" class="c-ben-box" :style="{ borderLeftColor: b.c }">
              <div class="c-ben-lbl">{{ b.l }}</div>
              <div class="c-ben-val" :style="{ color: b.c }">{{ b.v }} <span class="c-ben-u">{{ b.u }}</span></div>
              <div class="c-ben-sub">{{ b.sub }}</div>
            </div>
          </div>

          <div class="c-card mb-4">
            <div class="c-slabel">Variazione del Moltiplicatore Leontief Globale</div>
            <div class="c-avg-mult-wrap">
              <div>
                <div class="c-am-lbl">Baseline</div>
                <div class="c-am-val" style="color: #7A2A2A;">×{{ res.avgBase.toFixed(3) }}</div>
              </div>
              <div class="c-am-val" style="color: #A09880; font-style: normal;">→</div>
              <div>
                <div class="c-am-lbl">Con CER</div>
                <div class="c-am-val" style="color: #4A7A4A;">×{{ res.avgCer.toFixed(3) }}</div>
              </div>
              <div>
                <div class="c-am-lbl">Riduzione Totale</div>
                <div class="c-am-val" style="color: #4A7A4A;">−{{ Math.abs(res.interdepRed).toFixed(2) }}%</div>
              </div>
            </div>
          </div>

          <div class="c-card mb-4">
            <div class="c-slabel">Insight Strategici del Modello Input/Output</div>
            <div class="c-ctx-row">
              <div class="c-ctx-icon" style="color: #7B6B3A;">CER</div>
              <div>
                <div class="c-ctx-title">Pre-condizione strutturale</div>
                <div class="c-ctx-desc">L'ingresso in una CER riduce i coefficienti passivi del {{ (cerSharePct*0.7).toFixed(0) }}% su tutti i settori. Agisce come uno "scudo" contro l'inefficienza.</div>
              </div>
            </div>
            <div class="c-ctx-row border-none">
              <div class="c-ctx-icon" style="color: #4A7A4A;">∑</div>
              <div>
                <div class="c-ctx-title">Sinergia con Elettrificazione</div>
                <div class="c-ctx-desc">Se in futuro installerai una Pompa di Calore (aumentando la dipendenza elettrica), la CER ne attutirà drasticamente il costo.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="page-break"></div>

        <div class="c-report-section fade-in delay-4">
          <div class="c-section-header">
            <div class="c-section-num">§ 04</div>
            <h2 class="c-section-title">Profilo Economico Domestico</h2>
          </div>
          
          <div class="c-card mb-4">
            <div class="c-slabel">Variazione del Vettore della Domanda Finale (d)</div>
            
            <div v-for="(s, i) in SECTORS" :key="'vc'+s.id" class="c-mult-bar-wrap">
              <div class="c-mb-header">
                <span class="c-mb-lbl">{{ s.label }}</span>
                <span class="c-mb-vals">
                  <span class="c-mb-old">€{{ safeD[i] }}/m</span>
                  <span class="c-mb-new" :style="{ color: s.color }">€{{ (res.d_cer[i]||safeD[i]).toFixed(0) }}/m</span>
                  <span v-if="i === 0 && safeD[i] > 0" class="c-mb-delta">
                    −{{ ((1 - (res.d_cer[i]||safeD[i])/safeD[i])*100).toFixed(1) }}%
                  </span>
                </span>
              </div>
              <div class="mb-1">
                <div class="c-bar-title">baseline</div>
                <div class="c-bar-bg"><div class="c-bar-fill" :style="{ width: entered ? `${(safeD[i]/maxD)*100}%` : '0', background: '#C8C0A8' }"></div></div>
              </div>
              <div>
                <div class="c-bar-title">con CER</div>
                <div class="c-bar-bg"><div class="c-bar-fill" :style="{ width: entered ? `${((res.d_cer[i]||safeD[i])/maxD)*100}%` : '0', background: s.color }"></div></div>
              </div>
            </div>

            <div class="c-bol-totals">
              <div class="c-bt-box">
                <div class="c-bt-lbl">Spesa Base (d)</div>
                <div class="c-bt-val" style="color: #5A5248;">€{{ totD }}/m</div>
              </div>
              <div class="c-bt-box">
                <div class="c-bt-lbl">Spesa Indotta (x)</div>
                <div class="c-bt-val" style="color: #7A2A2A;">€{{ totXBase.toFixed(0) }}/m</div>
              </div>
              <div class="c-bt-box">
                <div class="c-bt-lbl">Nuovo Costo Reale (x_cer)</div>
                <div class="c-bt-val" style="color: #4A7A4A;">€{{ totXCer.toFixed(0) }}/m</div>
              </div>
            </div>
          </div>

          <div class="c-syn-box mb-4">
            <div class="c-slabel" style="color: #A09880;">Sintesi dei parametri utilizzati</div>
            <div class="c-syn-grid">
              <div class="c-syn-cell">
                <div class="c-syn-k">Zona Climatica</div><div class="c-syn-v" style="color:#C8A850;">{{ safeLat>=44?'Nord':safeLat>=41?'Centro':'Sud' }}</div>
              </div>
              <div class="c-syn-cell">
                <div class="c-syn-k">Irradiazione</div><div class="c-syn-v" style="color:#C8A850;">{{ res.irr.toFixed(0) }} kWh/m²</div>
              </div>
              <div class="c-syn-cell">
                <div class="c-syn-k">Geoscore</div><div class="c-syn-v" :style="{ color: geoScore>70?'#7AB87A':geoScore>40?'#C8A850':'#C87A7A' }">{{ geoScore }}/100</div>
              </div>
              <div class="c-syn-cell">
                <div class="c-syn-k">Autoconsumo Coll.</div><div class="c-syn-v" style="color:#C8A850;">{{ cerSharePct }}%</div>
              </div>
              <div class="c-syn-cell">
                <div class="c-syn-k">Membri attivi</div><div class="c-syn-v" style="color:#C8A850;">{{ cerSize }}</div>
              </div>
              <div class="c-syn-cell">
                <div class="c-syn-k">Ritorno (ROI)</div><div class="c-syn-v" style="color:#C8A850;">{{ res.totalSaving>0 ? (13800/(res.totalSaving*12)).toFixed(1) : '—' }} anni</div>
              </div>
            </div>
            
            <div class="c-note-text mt-4">
              <strong>Nota:</strong> I dati PVGIS e i corrispettivi GSE calcolati a €0.11/kWh sono puramente indicativi a scopo accademico.
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import axios from '@/services/axios';
import AuthService from '@/services/AuthService';
import GuideHeader from '@/components/layout/GuideHeader.vue';
import { extractAnalysisData } from '@/utils/analysisExtractor'; // IMPORTIAMO LA FUNZIONE ESTERNA

const loading = ref(true);
const entered = ref(false);
const activeAddressName = ref('Caricamento...');

// Parametri Geo, CER e PVGIS
const lat = ref(41.9028);
const lon = ref(12.4964);
const cerSharePct = ref(35);
const cerSize = ref(12);

const hasRealPvData = ref(false);
const actualIrr = ref(0);
const actualProd = ref(0);
const monthlyProd = ref([]);
const monthlyConsTotal = ref(Array(12).fill(0));
const monthlyConsF1 = ref(Array(12).fill(0));

const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

const SECTORS = [
  { id: "energia", label: "Energia", short: "E", color: "#7B6B3A" },
  { id: "gas",     label: "Gas",     short: "G", color: "#7A2A2A" },
  { id: "acqua",   label: "Acqua",   short: "A", color: "#2A4A7A" },
];

const A_BASE = [
  [0.00, 0.08, 0.12],
  [0.05, 0.00, 0.10],
  [0.02, 0.03, 0.00],
];
const d = ref([120, 85, 30]);

// Sicurezza input
const safeLat = computed(() => isNaN(lat.value) || !lat.value ? 41.9 : Math.max(35, Math.min(48, lat.value)));
const safeLon = computed(() => isNaN(lon.value) || !lon.value ? 12.5 : Math.max(5,  Math.min(20, lon.value)));
const safeD   = computed(() => d.value.map(v => (isNaN(v) || v < 5) ? 10 : v));
const maxD    = computed(() => Math.max(...safeD.value, 1));

// Animazione Ring
const animProg = ref(0);

// --- CALCOLO PATH SVG (GRAFICI AD AREA MENSILE) ---
const maxChartValTotal = computed(() => {
  const mp = hasRealPvData.value && monthlyProd.value.length ? Math.max(...monthlyProd.value.map(m => m.E_m)) : 10;
  const mc = Math.max(...monthlyConsTotal.value, 10); 
  return Math.max(mp, mc) * 1.2; 
});

const maxChartValF1 = computed(() => {
  const mp = hasRealPvData.value && monthlyProd.value.length ? Math.max(...monthlyProd.value.map(m => m.E_m)) : 10;
  const mc = Math.max(...monthlyConsF1.value, 10); 
  return Math.max(mp, mc) * 1.2; 
});

const getPath = (dataArr, isArea, maxVal) => {
  if (!dataArr || !dataArr.length) return '';
  const w = 280; 
  const h = 120; 
  const dx = w / 11;
  const mx = maxVal || 1;
  
  let dStr = isArea ? `M 30,130 ` : `M 30,${130 - (dataArr[0] / mx) * h} `;
  
  dataArr.forEach((val, i) => {
    const x = 30 + i * dx;
    const y = 130 - (val / mx) * h;
    if(isArea && i===0) dStr += `L ${x},${y} `;
    else dStr += `L ${x},${y} `;
  });

  if (isArea) dStr += `L ${30 + 11*dx},130 Z`;
  return dStr;
};

const prodDataArray = computed(() => {
  if (monthlyProd.value.length === 12) return monthlyProd.value.map(m => m.E_m);
  return Array(12).fill(0);
});

const consTotalAreaPath = computed(() => getPath(monthlyConsTotal.value, true, maxChartValTotal.value));
const consTotalLinePath = computed(() => getPath(monthlyConsTotal.value, false, maxChartValTotal.value));
const prodAreaPathTotal = computed(() => getPath(prodDataArray.value, true, maxChartValTotal.value));
const prodLinePathTotal = computed(() => getPath(prodDataArray.value, false, maxChartValTotal.value));

const consF1AreaPath = computed(() => getPath(monthlyConsF1.value, true, maxChartValF1.value));
const consF1LinePath = computed(() => getPath(monthlyConsF1.value, false, maxChartValF1.value));
const prodAreaPathF1 = computed(() => getPath(prodDataArray.value, true, maxChartValF1.value));
const prodLinePathF1 = computed(() => getPath(prodDataArray.value, false, maxChartValF1.value));

// --- MOTORE LEONTIEF ---
const I3 = [[1,0,0],[0,1,0],[0,0,1]];
const matSub = (A, B) => A.map((r, i) => r.map((v, j) => v - B[i][j]));
const inv3 = (m) => {
  const [[a,b,c],[d,e,f],[g,h,k]] = m;
  const det = a*(e*k-f*h) - b*(d*k-f*g) + c*(d*h-e*g);
  if (Math.abs(det) < 1e-10) return I3;
  return [
    [(e*k-f*h)/det, (c*h-b*k)/det, (b*f-c*e)/det],
    [(f*g-d*k)/det, (a*k-c*g)/det, (c*d-a*f)/det],
    [(d*h-e*g)/det, (b*g-a*h)/det, (a*e-b*d)/det],
  ];
};

const leontief = (matA, vecD) => {
  try {
    const ImA = matSub(I3, matA);
    const L   = inv3(ImA);
    const x   = [0,1,2].map(i => L[i][0]*(vecD[0]||0) + L[i][1]*(vecD[1]||0) + L[i][2]*(vecD[2]||0));
    const mult = [0,1,2].map(j => L[0][j] + L[1][j] + L[2][j]);
    return { L, x, mult };
  } catch(err) {
    return { L: I3, x: [vecD[0]||0, vecD[1]||0, vecD[2]||0], mult: [1,1,1] };
  }
};

// --- MODELLO GEO-SOLARE DINAMICO ---
const computeCER = (lati, long, vecD, sharePct, realIrr, realProd) => {
  const clamped = Math.max(36, Math.min(47, lati));
  const irr = realIrr > 0 ? realIrr : Math.round(1200 + ((47 - clamped) / 11) * 500);
  const coastal = Math.abs(long - 12) < 4 ? 1.12 : 1.0;
  
  const share = sharePct / 100;
  const e0 = Math.max(10, vecD[0] || 120);

  let savingTariff = 0;
  let incentiveGSE = 0;

  if (realProd > 0) {
      const monthlyProdAvg = realProd / 12;
      const sharedKwh = monthlyProdAvg * share;
      savingTariff = sharedKwh * 0.16; 
      incentiveGSE = sharedKwh * 0.11; 
  } else {
      savingTariff  = e0 * share * 0.65;
      incentiveGSE  = e0 * share * 0.11 / 0.33 * coastal;
  }
  
  const totalSaving = savingTariff + incentiveGSE;

  const A_cer = [
    A_BASE[0].map(v => v * (1 - share * 0.7)),
    [...A_BASE[1]],
    [...A_BASE[2]],
  ];

  const d_cer = [
    Math.max(10, e0 - totalSaving),
    vecD[1] || 85,
    vecD[2] || 30,
  ];

  const base = leontief(A_BASE, vecD);
  const cer  = leontief(A_cer, d_cer);

  const avgBase = (base.mult[0] + base.mult[1] + base.mult[2]) / 3;
  const avgCer  = (cer.mult[0]  + cer.mult[1]  + cer.mult[2])  / 3;
  const interdepRed = avgBase > 0 ? ((avgBase - avgCer) / avgBase) * 100 : 0;
  const co2Saved = Math.round(totalSaving * 12 * 3.2 * 2.4);

  return { irr, coastal, savingTariff, incentiveGSE, totalSaving, A_cer, d_cer, base, cer, avgBase, avgCer, interdepRed, co2Saved };
};

const res = computed(() => computeCER(safeLat.value, safeLon.value, safeD.value, cerSharePct.value, actualIrr.value, actualProd.value));

const geoScore = computed(() => {
  return Math.min(100, Math.round(
    ((res.value.irr - 1200) / 500) * 40 +
    (cerSharePct.value / 100) * 35 +
    (res.value.coastal > 1 ? 12 : 0) +
    Math.min(13, Math.floor(cerSize.value / 4))
  ));
});

const mapColor = computed(() => geoScore.value > 70 ? "#4A7A4A" : geoScore.value > 40 ? "#7B6B3A" : "#7A2A2A");
const zoneLabel = computed(() => safeLat.value >= 44 ? "Nord · Pianura padana / Alpi" : safeLat.value >= 41 ? "Centro · Appennino / Tirreno" : "Sud · Area mediterranea");

const totD = computed(() => safeD.value[0] + safeD.value[1] + safeD.value[2]);
const totXBase = computed(() => res.value.base.x[0] + res.value.base.x[1] + res.value.base.x[2]);
const totXCer  = computed(() => res.value.cer.x[0]  + res.value.cer.x[1]  + res.value.cer.x[2]);

const benefici = computed(() => [
  { l: "Risparmio tariffario", v: `€${res.value.savingTariff.toFixed(1)}`, u: "/mese", sub: `€${(res.value.savingTariff*12).toFixed(0)}/anno`, c: "#4A7A4A" },
  { l: "Incentivo GSE virtuale", v: `€${res.value.incentiveGSE.toFixed(1)}`, u: "/mese", sub: "D.Lgs 199/2021", c: "#7B6B3A" },
  { l: "Risparmio totale", v: `€${res.value.totalSaving.toFixed(1)}`, u: "/mese", sub: `€${(res.value.totalSaving*12).toFixed(0)}/anno`, c: "#3A6A3A" },
  { l: "CO₂ evitata", v: res.value.co2Saved, u: "kg/anno", sub: `≈ ${Math.max(1,Math.round(res.value.co2Saved/120))} auto/anno`, c: "#2A5A2A" },
]);

const getDeltaStyle = (i, j, vBefore, vAfter) => {
  const delta = vAfter - vBefore;
  const isDiag = i === j;
  let bg = isDiag ? "#F5F2EA" : (delta < -0.005 ? "#EDF5ED" : (delta > 0.005 ? "#F5EDED" : "#FAF8F4"));
  let color = isDiag ? "#C0B8A8" : (delta < -0.005 ? "#3A6A3A" : (delta > 0.005 ? "#7A2A2A" : "#5A5248"));
  let fw = Math.abs(delta) > 0.005 ? 600 : 400;
  return { background: bg, color: color, fontWeight: fw };
};

// ─── INIT PRINCIPALE TRAMITE ESTRATTORE COMUNE ───
onMounted(async () => {
  try {
    const [userRes, resRes] = await Promise.all([AuthService.getUser(), axios.get('/api/resources')]);
    const resources = resRes.data.data || resRes.data || [];
    
    // USIAMO IL MODULO ESTERNO PER NON SBAGLIARE MAI PIÙ
    const data = extractAnalysisData(resources, localStorage.getItem('esurf_active_address_id'));
    
    console.log("🔴 [DEBUG] DATI ESTRATTI DAL COMPONENTE COMUNE:", data);

    if (data) {
        activeAddressName.value = data.activeAddressName;
        
        if (data.lat) lat.value = data.lat;
        if (data.lon) lon.value = data.lon;
        d.value = data.d;
        
        monthlyConsTotal.value = data.monthlyConsTotal;
        monthlyConsF1.value = data.monthlyConsF1;
        console.log("🔴 [DEBUG] Array Consumi Totali:", monthlyConsTotal.value);
        console.log("🔴 [DEBUG] Array Consumi F1:", monthlyConsF1.value);

        if (data.pvProfile?.outputs?.totals?.fixed) {
            hasRealPvData.value = true;
            actualIrr.value = parseFloat(data.pvProfile.outputs.totals.fixed["H(i)_y"]) || 0;
            actualProd.value = parseFloat(data.pvProfile.outputs.totals.fixed["E_y"]) || 0;
        }

        if (data.pvProfile?.outputs?.monthly?.fixed && Array.isArray(data.pvProfile.outputs.monthly.fixed)) {
            monthlyProd.value = data.pvProfile.outputs.monthly.fixed;
        }
    }
  } catch (error) {
    console.error("Errore CER Leontief", error);
  } finally {
    loading.value = false;
    await nextTick();
    setTimeout(() => { entered.value = true; }, 100);
    
    let start = null;
    const animate = (ts) => {
      if(!start) start = ts;
      const p = Math.min((ts-start)/900, 1);
      animProg.value = 1 - Math.pow(1-p, 3);
      if(p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

.cer-app-wrapper {
  background: #FAF8F4;
  min-height: 100vh;
  font-family: Georgia, serif;
  color: #2A2520;
}

/* UTILS E MARGINI */
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 24px; }
.mt-4 { margin-top: 24px; }
.c-text-std { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #6A6050; line-height: 1.75; margin: 0 0 14px; }
.flex-between { display: flex; justify-content: space-between; }
.align-center { align-items: center; }
.text-green { color: #4A7A4A; font-weight: 600; }

/* CARICAMENTO */
.loading-state { text-align: center; padding: 8rem 1rem; }
.spinner { width: 44px; height: 44px; border: 3px solid #E8E4DC; border-top: 3px solid #7B6B3A; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
.loader-text { margin-top: 16px; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em; color: #A09890; text-transform: uppercase; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* ANIMAZIONI */
.fade-in { opacity: 0; transition: opacity 0.6s ease; }
.fade-in.is-entered, .c-report-section.fade-in { opacity: 1; }
.fade-up { opacity: 0; transform: translateY(14px); transition: opacity 0.55s ease, transform 0.55s ease; }
.is-entered .fade-up, .c-report-section .fade-up { opacity: 1; transform: none; }
.delay-1 { transition-delay: 0.05s; }
.delay-2 { transition-delay: 0.15s; }
.delay-3 { transition-delay: 0.25s; }
.delay-4 { transition-delay: 0.35s; }

/* ── HEADER ── */
.c-header { background: #1E1A14; padding: 26px 22px 30px; position: relative; overflow: hidden; border-radius: 0 0 12px 12px; }
.c-header-bg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.04; pointer-events: none; stroke: white; stroke-width: 0.5; }
.c-header-content { position: relative; z-index: 1; max-width: 820px; margin: 0 auto; }
.c-header-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
.c-kicker { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: #7A7060; text-transform: uppercase; margin-bottom: 6px; }
.c-title { font-size: 26px; font-weight: 400; font-style: italic; color: #F0EDE4; margin: 0 0 4px; line-height: 1.25; }
.c-subtitle { font-family: 'DM Mono', monospace; font-size: 11px; color: #9A9070; }

.c-coord-box { background: #2A2520; border: 0.5px solid #3A3528; border-radius: 3px; padding: 12px 16px; }
.c-coord-lbl { font-family: 'DM Mono', monospace; font-size: 8px; color: #5A5040; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
.c-coord-val { font-family: 'DM Mono', monospace; font-size: 11px; color: #C8C0A8; line-height: 1.9; }
.c-coord-zone { color: #7B6B4A; margin-top: 4px; font-size: 9px; }

.c-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #3A3020; }
.c-kpi-cell { background: #252018; padding: 13px 15px; }
.c-kpi-lbl { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; color: #504838; margin-bottom: 5px; }
.c-kpi-val { font-size: 20px; line-height: 1; font-family: Georgia, serif; }
.c-kpi-unit { font-family: 'DM Mono', monospace; font-size: 8px; color: #504838; margin-top: 4px; }

/* ── BODY ── */
.c-body { max-width: 820px; margin: 0 auto; padding: 10px 22px 80px; }

/* TITOLI SEZIONE */
.c-section-header { margin: 40px 0 20px; border-bottom: 1px solid #D8D0BC; padding-bottom: 12px; }
.c-section-num { font-family: 'DM Mono', monospace; font-size: 10px; color: #B07A1A; letter-spacing: 0.1em; margin-bottom: 4px; }
.c-section-title { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 400; color: #2A2520; margin: 0; }

.c-card { background: white; border: 0.5px solid #D8D0BC; border-radius: 4px; padding: 20px; }
.c-slabel { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: #8A8070; margin-bottom: 14px; }

/* GRAFICI A DOPPIA AREA */
.c-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.c-chart-title { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #5A5248; margin-bottom: 4px; }
.c-chart-legend { font-family: 'DM Mono', monospace; font-size: 8px; margin-bottom: 12px; display: flex; gap: 12px; }
.area-chart-container { width: 100%; border-top: 1px solid #E8E4DC; padding-top: 16px; }

/* MAPPA */
.c-map-header { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: #8A8070; padding: 10px 16px; display: flex; justify-content: space-between; }

/* GEO E INPUT */
.c-input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
.c-input-lbl { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: #8A8070; display: block; margin-bottom: 5px; }
.c-input { width: 100%; padding: 9px 12px; background: #FAF7F0; border: 0.5px solid #C8C0A8; border-radius: 3px; outline: none; font-family: 'DM Mono', monospace; font-size: 13px; color: #2A2520; box-sizing: border-box; }
.c-geo-summary { padding: 9px 12px; background: #F5F1E8; border: 0.5px solid #D0C8B0; border-radius: 3px; font-family: 'DM Mono', monospace; font-size: 10px; color: #6A6050; }

/* SCORE RING */
.c-score-grid { display: grid; grid-template-columns: 76px 1fr; gap: 18px; align-items: center; }
.c-ring-wrap { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.c-ring-lbl { font-family: 'DM Mono', monospace; font-size: 7px; color: #8A8070; text-align: center; letter-spacing: 0.08em; }
.c-score-title { font-style: italic; font-size: 17px; margin-bottom: 8px; color: #2A2520; }
.c-score-desc { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #6A6050; line-height: 1.7; }

/* SLIDERS */
.c-sliders-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.c-slider-lbl { font-family: 'DM Mono', monospace; font-size: 10px; color: #5A5248; margin-bottom: 8px; }
.c-slider { width: 100%; height: 4px; border-radius: 99px; background: #E0D8C8; outline: none; -webkit-appearance: none; cursor: pointer; accent-color: #7B6B3A; }
.c-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: white; border: 2px solid #F5F1E8; }
.c-slider-bounds { display: flex; justify-content: space-between; font-family: 'DM Mono', monospace; font-size: 8px; color: #A09880; margin-top: 2px; }

/* LEONTIEF MATRICE E BARRE */
.c-formula-box { background: #F5F1E8; border: 0.5px solid #D0C8B0; border-left: 2px solid #7B6B3A; border-radius: 0 3px 3px 0; padding: 9px 14px; font-family: 'DM Mono', monospace; font-size: 10px; color: #5A5248; line-height: 1.9; }

.c-mat-th { font-family: monospace; font-size: 9px; font-weight: 500; padding: 4px 8px; text-align: center; }
.c-mat-th-row { font-family: monospace; font-size: 9px; text-align: right; padding-right: 6px; font-weight: 600; }
.c-mat-cell { padding: 8px 6px; text-align: center; border: 0.5px solid #E0D8C8; font-family: monospace; font-size: 11px; }
.c-mat-delta { font-size: 7px; margin-top: 1px; }

.c-mult-bar-wrap { margin-bottom: 16px; }
.c-mb-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
.c-mb-lbl { font-family: monospace; font-size: 10px; color: #6A6050; }
.c-mb-vals { font-family: monospace; font-size: 10px; }
.c-mb-old { color: #A09880; text-decoration: line-through; }
.c-mb-new { margin-left: 8px; font-weight: 600; }
.c-mb-delta { color: #4A7A4A; margin-left: 6px; font-size: 9px; }
.c-bar-title { font-size: 8px; font-family: monospace; color: #A09880; margin-bottom: 2px; }
.c-bar-bg { height: 5px; background: #EBE7DC; border-radius: 99px; overflow: hidden; }
.c-bar-fill { height: 100%; border-radius: 99px; transition: width 0.9s cubic-bezier(.22,1,.36,1); }

.c-out-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #E8E4DC; border-radius: 3px; overflow: hidden; }
.c-out-box { background: #FAF8F4; padding: 14px 16px; }
.c-out-dot { width: 3px; height: 12px; border-radius: 1px; margin-bottom: 8px; }
.c-out-lbl { font-family: monospace; font-size: 9px; color: #8A8070; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
.c-out-vold { font-family: monospace; font-size: 10px; color: #A09880; margin-bottom: 2px; }
.c-out-vnew { font-family: monospace; font-size: 14px; font-weight: 600; }
.c-out-delta { font-family: monospace; font-size: 10px; color: #4A7A4A; margin-top: 4px; }

/* BENEFICI E INDICATORI */
.c-ben-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.c-ben-box { background: white; border: 0.5px solid #D8D0BC; border-left-width: 3px; border-radius: 0 4px 4px 0; padding: 16px 18px; }
.c-ben-lbl { font-family: monospace; font-size: 9px; color: #8A8070; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
.c-ben-val { font-style: italic; font-size: 22px; line-height: 1; margin-bottom: 4px; }
.c-ben-u { font-family: monospace; font-size: 11px; color: #8A8070; font-style: normal; }
.c-ben-sub { font-family: monospace; font-size: 9px; color: #A09880; }

.c-avg-mult-wrap { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.c-am-lbl { font-family: monospace; font-size: 8px; color: #8A8070; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
.c-am-val { font-size: 20px; font-style: italic; }

.c-ctx-row { display: grid; grid-template-columns: 34px 1fr; gap: 14px; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 0.5px solid #E8E4DC; }
.border-none { border-bottom: none !important; margin-bottom: 0 !important; padding-bottom: 0 !important; }
.c-ctx-icon { font-style: italic; font-size: 18px; padding-top: 2px; }
.c-ctx-title { font-family: monospace; font-size: 11px; font-weight: 500; color: #2A2520; margin-bottom: 5px; }
.c-ctx-desc { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #6A6050; line-height: 1.7; }

/* BOLLETTE E SINTESI */
.c-bol-totals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; padding-top: 14px; border-top: 0.5px solid #E8E4DC; }
.c-bt-box { background: #F5F1E8; border-radius: 3px; padding: 10px 12px; }
.c-bt-lbl { font-family: monospace; font-size: 8px; color: #8A8070; margin-bottom: 4px; }
.c-bt-val { font-family: monospace; font-size: 13px; font-weight: 600; }

.c-syn-box { background: #1E1A14; border-radius: 4px; padding: 20px; }
.c-syn-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #3A3020; }
.c-syn-cell { background: #252018; padding: 12px 14px; }
.c-syn-k { font-family: monospace; font-size: 8px; color: #504838; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; }
.c-syn-v { font-size: 16px; font-family: Georgia, serif; color: #F0EDE6; }

.c-note-text { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #7A7060; line-height: 1.8; }

/* ── CSS PRINT STYLES ── */
@media print {
  body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  .c-header { background: #1E1A14 !important; border-radius: 0 !important; }
  .page-break { page-break-before: always; break-before: page; }
  .c-body { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}

@media (max-width: 600px) {
  .c-header-top, .c-kpi-grid { flex-direction: column; grid-template-columns: repeat(2, 1fr); }
  .c-input-grid, .c-sliders-grid, .c-ben-grid, .c-syn-grid { grid-template-columns: 1fr; }
  .c-charts-grid { grid-template-columns: 1fr; }
  .c-out-grid, .c-bol-totals { grid-template-columns: 1fr; }
}
</style>
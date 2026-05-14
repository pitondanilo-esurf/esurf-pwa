<template>
  <div class="pv-app-wrapper" :class="{ 'light-mode': isLightMode }">
    
    <CopertinaReport
      v-if="!loading"
      class="print-only"
      titolo="Assessment Fotovoltaico e CER"
      :sottotitolo="activeAddressName"
      :isLightMode="isLightMode"
    />

    <div class="no-print">
      <GuideHeader :isLightMode="isLightMode" />
    </div>

    <div v-if="loading" class="loading-state no-print">
      <div class="spinner"></div>
      <p class="loader-text">SINCRONIZZAZIONE DATI SATELLITARI E MODELLO CER...</p>
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
              <div class="p-kicker">ASSESSMENT FINANZIARIO ED ENERGETICO</div>
              <h1 class="p-title">ROI Impianto Fotovoltaico</h1>
              <div class="p-subtitle">{{ activeAddressName }}</div>
            </div>
            
            <div class="p-kpi-grid">
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: var(--accent-gold);">Produzione FV</div>
                <div class="p-kpi-val" style="color: var(--accent-gold-light);">{{ annualProduction.toFixed(0) }} <span style="font-size: 10px;">kWh</span></div>
              </div>
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: var(--accent-green);">Risparmio Bolletta</div>
                <div class="p-kpi-val" style="color: var(--accent-green);">€{{ directSavings.toFixed(0) }} <span style="font-size: 10px;">/a</span></div>
              </div>
              <div class="p-kpi-cell" :style="{ background: isCerActive ? 'rgba(147, 51, 234, 0.05)' : 'rgba(74, 139, 186, 0.05)', borderBottom: isCerActive ? '2px solid var(--accent-purple)' : '2px solid var(--accent-blue)' }">
                <div class="p-kpi-lbl" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--accent-blue)' }">Beneficio Totale {{ isCerActive ? '(CER)' : '(RID)' }}</div>
                <div class="p-kpi-val" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--accent-blue)' }">€{{ activeAnnualBenefit.toFixed(0) }} <span style="font-size: 10px;">/a</span></div>
              </div>
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                  Payback
                  <button @click="showRoiModal = true" class="p-help-btn no-print" style="width:14px; height:14px; font-size:8px;">?</button>
                </div>
                <div class="p-kpi-val" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--text-primary)' }">{{ activePayback > 0 ? activePayback.toFixed(1) : '—' }} <span style="font-size: 10px;">anni</span></div>
              </div>
              <div class="p-kpi-cell">
                <div class="p-kpi-lbl" style="color: var(--text-muted);">ROI (20 anni)</div>
                <div class="p-kpi-val" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--text-primary)' }">{{ activeRoi20 > 0 ? activeRoi20.toFixed(0) : '—' }}%</div>
              </div>
            </div>
          </div>

          <div class="p-tabs" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              <button v-for="t in TABS" :key="t.id" @click="tab = t.id" class="p-tab-btn" :class="{ active: tab === t.id }">
                {{ t.label }}
              </button>
            </div>
            <button @click="printReport" class="p-tab-btn no-print" style="color: var(--accent-gold); font-weight: bold; border: 1px solid var(--accent-gold); border-radius: 4px; padding: 6px 12px; transition: 0.2s;" onmouseover="this.style.background='rgba(200, 168, 80, 0.1)'" onmouseout="this.style.background='transparent'">
              🖨️ STAMPA
            </button>
          </div>
        </div>
      </div>

      <div class="p-body">
        
        <div v-show="tab === 'dashboard'" class="tab-content fade-in delay-1 print-section">
          <h2 class="section-main-title">📊 Dashboard</h2>
          
          <div class="p-card mb-4" style="border-left: 2px solid var(--accent-gold);">
            <div class="p-slabel" style="display: flex; justify-content: space-between;">
              <span>Profilo Fornitura Attuale (Estratto da Bolletta)</span>
              <span v-if="hasRealPvData" style="color: var(--accent-green); font-weight: bold;">✓ Dati Satellitari PVGIS Attivi</span>
              <span v-else style="color: var(--accent-gold-light); font-weight: bold;">⚠️ Profilo PVGIS Assente (Stima Media)</span>
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
                <div class="p-info-lbl">Sostenibilità (Origine)</div>
                <div class="p-info-val" :style="{ color: isGreen ? 'var(--accent-green)' : 'var(--text-primary)' }">
                  {{ isGreen ? '100% Green' : 'Mix Standard' }}
                </div>
                <div class="p-info-sub">{{ isGreen ? 'Energia certificata' : 'Fonti fossili incluse' }}</div>
              </div>
              <div class="p-info-box">
                <div class="p-info-lbl">Efficienza Rete (Cos-φ)</div>
                <div class="p-info-val" :style="{ color: reactivePowerIssue === 'Ottimale' ? 'var(--accent-green)' : 'var(--accent-gold-light)' }">
                  {{ reactivePowerIssue }}
                </div>
                <div class="p-info-sub">Impatto energia reattiva</div>
              </div>
            </div>
          </div>
          
          <div class="p-card mb-4">
            <div class="p-slabel" style="display: flex; justify-content: space-between;">
              <span>Analisi Vettoriale: Fasce Orarie vs Produzione PVGIS</span>
              <span style="color: var(--accent-gold); font-weight: bold;">Costo stimato bolletta: €{{ costoKwh.toFixed(3) }}/kWh</span>
            </div>
            
            <div class="p-charts-grid mt-4">
              <div>
                <div class="p-chart-title">Profilo Consumi per Fascia (F1, F2, F3)</div>
                <div class="p-chart-legend">
                  <span style="color: var(--accent-gold);">■ F1 Giorno</span>
                  <span style="color: var(--accent-blue);">■ F2 Sera/Sab</span>
                  <span style="color: var(--text-light);">■ F3 Notte/Dom</span>
                </div>
                <div class="p-chart-container">
                  <svg width="100%" viewBox="0 0 320 140" style="overflow: visible;">
                    <line v-for="i in 5" :key="'g1'+i" x1="30" :y1="10+(i-1)*25" x2="310" :y2="10+(i-1)*25" stroke="var(--border-color-light)" stroke-width="0.5" stroke-dasharray="2 4"/>
                    <text v-for="i in 5" :key="'gt1'+i" x="25" :y="13+(i-1)*25" fill="var(--text-light)" font-size="8" font-family="monospace" text-anchor="end">
                      {{ Math.round(maxChart1 - (i-1)*(maxChart1/4)) }}
                    </text>
                    <path :d="pathF123" fill="rgba(156, 163, 175, 0.4)" />
                    <path :d="pathF12" fill="rgba(37, 99, 235, 0.4)" />
                    <path :d="pathF1" fill="rgba(200, 168, 80, 0.5)" />
                    <text v-for="(m, i) in months" :key="'mt1'+i" :x="30 + i*25.4" y="125" fill="var(--text-light)" font-size="8" font-family="monospace" text-anchor="middle">{{ m }}</text>
                  </svg>
                </div>
                <div style="font-size: 10px; color: var(--text-muted); text-align: center; margin-top: 8px;">
                  Consumo Annuo Totale: {{ totalConsumption.toFixed(0) }} kWh
                </div>
              </div>

              <div>
                <div class="p-chart-title">Copertura Fabbisogno: Diretto + Accumulo vs Prod. FV</div>
                <div class="p-chart-legend">
                  <span style="color: var(--accent-green);">■ Prod. PVGIS</span>
                  <span style="color: var(--accent-blue);">■ + Batteria</span>
                  <span style="color: var(--accent-gold);">■ Autocons. Diretto</span>
                </div>
                <div class="p-chart-container">
                  <svg width="100%" viewBox="0 0 320 140" style="overflow: visible;">
                    <line v-for="i in 5" :key="'g2'+i" x1="30" :y1="10+(i-1)*25" x2="310" :y2="10+(i-1)*25" stroke="var(--border-color-light)" stroke-width="0.5" stroke-dasharray="2 4"/>
                    <text v-for="i in 5" :key="'gt2'+i" x="25" :y="13+(i-1)*25" fill="var(--text-light)" font-size="8" font-family="monospace" text-anchor="end">
                      {{ Math.round(maxChart2 - (i-1)*(maxChart2/4)) }}
                    </text>
                    <path :d="pathProdArea" fill="url(#solargrad)" />
                    <path :d="pathProdLine" fill="none" stroke="var(--accent-green)" stroke-width="2" />
                    <path :d="pathDirectBatArea" fill="rgba(37, 99, 235, 0.3)" />
                    <path :d="pathDirectBatLine" fill="none" stroke="var(--accent-blue)" stroke-width="1.5" stroke-dasharray="4 4" />
                    <path :d="pathDirectArea" fill="rgba(200, 168, 80, 0.5)" />
                    <path :d="pathDirectLine" fill="none" stroke="var(--accent-gold)" stroke-width="1.5" />
                    <text v-for="(m, i) in months" :key="'mt2'+i" :x="30 + i*25.4" y="125" fill="var(--text-light)" font-size="8" font-family="monospace" text-anchor="middle">{{ m }}</text>
                    <defs>
                      <linearGradient id="solargrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgba(16, 185, 129, 0.3)" />
                        <stop offset="100%" stop-color="rgba(16, 185, 129, 0.0)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div style="font-size: 10px; color: var(--accent-green); text-align: center; margin-top: 8px;">
                  Grafico dinamico derivato dalla Tabella: mostra energia autoconsumata e immagazzinata.
                </div>
              </div>
            </div>
          </div>

          <div class="p-card-grid">
            <div class="p-card">
              <div style="display: flex; gap: 24px;">
                <div style="flex: 1;">
                  <div class="p-slabel" style="color: var(--accent-blue);">Autoconsumo</div>
                  <div class="p-big-val" style="color: var(--accent-blue);">{{ totalSelfConsPct.toFixed(0) }}%</div>
                  <div class="p-bar-wrap mb-2">
                    <div class="p-bar-fill" :style="{ width: `${totalSelfConsPct}%`, background: 'var(--accent-blue)' }"></div>
                  </div>
                </div>
                <div style="flex: 1;">
                  <div class="p-slabel" style="color: var(--accent-gold);">Indipendenza Rete</div>
                  <div class="p-big-val" style="color: var(--accent-gold);">{{ independencePct.toFixed(0) }}%</div>
                  <div class="p-bar-wrap mb-2">
                    <div class="p-bar-fill" :style="{ width: `${independencePct}%`, background: 'var(--accent-gold)' }"></div>
                  </div>
                </div>
              </div>
              <div class="p-sub-text mt-3">
                Fabbisogno coperto: <strong>{{ selfConsKwh.toFixed(0) }} kWh</strong> su {{ totalConsumption.toFixed(0) }} kWh annui.<br/>
                Surplus (Immesso in Rete): <strong>{{ exportKwh.toFixed(0) }} kWh</strong>
              </div>
            </div>
            
            <div class="p-card" :style="{ borderLeft: isCerActive ? '2px solid var(--accent-purple)' : '2px solid transparent' }">
              <div class="p-slabel" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--accent-green)' }">Risparmio e Ricavi Generati</div>
              <div class="p-big-val" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--accent-green)' }">€{{ activeAnnualBenefit.toLocaleString(undefined, {maximumFractionDigits: 0}) }}<span style="font-size: 14px; font-weight: normal;">/anno</span></div>
              <div class="p-sub-text mt-2">
                Di cui risparmio diretto: €{{ directSavings.toFixed(0) }}/a<br/>
                Valorizzazione surplus: <strong>€{{ activeEarnings.toFixed(0) }}/a</strong> {{ isCerActive ? '(Tariffa CER)' : '(Tariffa GSE)' }}
              </div>
            </div>
          </div>
        </div>

        <div v-show="tab === 'sizing'" class="tab-content fade-in delay-1 print-section">
          <h2 class="section-main-title">📐 Sizing & Rischi</h2>
          
          <div class="p-card mb-4">
            <div class="p-slabel" style="color: var(--accent-gold);">Configurazione Impianto e Tecnologia</div>
            
            <div class="p-input-row mb-4">
              <div>
                <div class="p-input-lbl">Modello Pannelli Solari</div>
                <select v-model="selectedTech" class="p-select" style="width:100%; padding: 10px; border-radius: 4px;">
                  <option v-for="t in PV_TECHS" :key="t.id" :value="t">{{ t.label }} ({{ t.efficiency }} kW/m²)</option>
                </select>
                <div class="p-sub-text mt-2">Resa: {{ selectedTech.efficiency }} kWp/m² | Costo Componente base: €{{ selectedTech.costPerKwp }}/kWp</div>
              </div>
              <div>
                <div class="p-input-lbl">Potenza Impianto FV Desiderata</div>
                <div class="p-input-val" style="color: var(--accent-gold);">{{ pvKw.toFixed(1) }} kWp</div>
                <input type="range" min="1" max="20" step="0.5" v-model.number="pvKw" class="p-slider" style="accent-color: var(--accent-gold);" />
                <div class="p-sub-text mt-1">Moduli previsti: <strong>{{ numPanels }} pannelli</strong> (stima su modulo std. da 1.95m²)</div>
              </div>
            </div>

            <div class="p-input-row mt-4 pt-4" style="border-top: 1px solid var(--border-color);">
              <div>
                <div class="p-input-lbl">Superficie Tetto Necessaria</div>
                <div class="p-input-val">{{ requiredArea.toFixed(1) }} m²</div>
                <div class="p-sub-text mt-1">Spazio fisico minimo stimato in base alla potenza e tecnologia.</div>
              </div>
              <div>
                <div class="p-input-lbl">Batteria di Accumulo (kWh)</div>
                <div class="p-input-val" style="color: var(--accent-blue);">{{ battery }} kWh</div>
                <input type="range" min="0" max="40" step="1" v-model.number="battery" class="p-slider" style="accent-color: var(--accent-blue);" />
                <div class="p-sub-text mt-1">Cattura il surplus per coprire le fasce serali F2/F3.</div>
              </div>
            </div>

            <div class="p-input-row mt-4 pt-4" style="border-top: 1px solid var(--border-color);">
              <div>
                <div class="p-input-lbl">Esposizione e Tipo Installazione</div>
                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                  <select v-model="orientation" class="p-select" style="flex: 1; padding: 10px; border-radius: 4px;">
                    <option v-for="o in ORIENTATIONS" :key="o.id" :value="o.id">{{ o.label }}</option>
                  </select>
                  <select v-model="installType" class="p-select" style="flex: 2; padding: 10px; border-radius: 4px;">
                    <option v-for="t in INSTALL_TYPES" :key="t.id" :value="t.id">{{ t.label }} (+€{{ t.extraCost }}/kWp)</option>
                  </select>
                </div>
                <div class="p-sub-text mt-1">L'orientamento e l'installazione determinano i costi di struttura e l'efficienza.</div>
              </div>
              
              <div>
                <div v-if="installType === 'falda'">
                  <div class="p-input-lbl">Inclinazione Falda (Gradi)</div>
                  <div class="p-input-val">{{ inclination }}°</div>
                  <input type="range" min="0" max="90" step="1" v-model.number="inclination" class="p-slider" style="accent-color: var(--accent-gold);" />
                  <div class="p-sub-text mt-1">Ottimale: ~35°. Efficienza stimata: <strong style="color: var(--accent-green);">{{ (productionFactor * 100).toFixed(0) }}%</strong></div>
                </div>
                <div v-else-if="installType === 'piano'">
                  <div class="p-input-lbl">Inclinazione Zavorre</div>
                  <div class="p-input-val" style="color: var(--text-muted);">10° (Fissa)</div>
                  <div class="p-sub-text mt-1">Tetto piano con zavorre inclinate. Efficienza stimata: <strong style="color: var(--accent-green);">{{ (productionFactor * 100).toFixed(0) }}%</strong></div>
                </div>
                <div v-else>
                  <div class="p-input-lbl">Inclinazione Struttura</div>
                  <div class="p-input-val" style="color: var(--text-muted);">30° (Fissa/Ottimale)</div>
                  <div class="p-sub-text mt-1">Campo a terra ottimizzato. Efficienza stimata: <strong style="color: var(--accent-green);">{{ (productionFactor * 100).toFixed(0) }}%</strong></div>
                </div>
              </div>
            </div>
            
            <div class="p-alert-box mt-4">
              Il calcolo del Bilancio Energetico integra un <strong>modello empirico di mismatch orario</strong>. Poiché i picchi di produzione e consumo non sono allineati istante per istante, l'autoconsumo diretto è statisticamente limitato al 45% del potenziale. Inserire una batteria sposta drasticamente il surplus a vantaggio del consumo notturno.
            </div>

            <div class="p-input-row mt-4 pt-4" style="border-top: 1px solid var(--border-color);">
              <div>
                <div class="p-input-lbl" style="color: var(--accent-red);">Oscillazione Ritiro Dedicato (PUN base)</div>
                <div class="p-input-val" style="color: var(--accent-red);">€{{ sspPrice.toFixed(3) }} /kWh</div>
                <input type="range" min="0" max="0.10" step="0.01" v-model.number="sspPrice" class="p-slider" style="accent-color: var(--accent-red);" />
                <div class="p-sub-text mt-1">Stima la tariffa base di ritiro del mercato. Storicamente volatile.</div>
              </div>
              
              <div>
                <div class="p-alert-box mt-0" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05); padding: 16px;">
                  <strong style="color: var(--accent-red); display: block; margin-bottom: 6px;">Il Vero Trade-Off (Rischio Regolatorio)</strong>
                  <span style="color: var(--text-primary);">La domanda reale che devi farti è: sei a posto con un investimento il cui rendimento dipende per una buona fetta da una tariffa pubblica (PUN/RID) che può cambiare? L'adesione a una CER aiuta a stabilizzare questo rientro.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-card mb-4">
            <div class="p-slabel" style="color: var(--accent-blue); display: flex; align-items: center; gap: 8px;">
              <span>Bilancio Energetico Mensile Dettagliato</span>
              <button @click="showHelpModal = true" class="p-help-btn no-print" title="Spiegazione Bilancio">?</button>
            </div>
            <div class="p-table" style="margin-top: 10px;">
              <div class="p-tr-6" style="background: var(--hover-bg); font-weight: bold; border-top-left-radius: 6px; border-top-right-radius: 6px;">
                <span class="p-td-lbl" style="color: var(--text-primary);">Mese</span>
                <span class="p-td-val text-right" style="color: var(--accent-gold);">Prod.</span>
                <span class="p-td-val text-right" style="color: var(--text-muted);">Tot. Cons</span>
                <span class="p-td-val text-right" style="color: var(--text-muted);">F1+F2</span>
                <span class="p-td-val text-right" style="color: var(--accent-blue);">Batteria</span>
                <span class="p-td-val text-right" style="color: var(--accent-green);">Surplus RID</span>
              </div>
              <div class="p-tr-6" v-for="(row, index) in monthlyTableData" :key="index">
                <span class="p-td-lbl" style="color: var(--text-primary);">{{ row.month }}</span>
                <span class="p-td-val text-right" style="color: var(--accent-gold-light);">{{ row.prod.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: var(--text-muted);">{{ row.cons.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: var(--text-muted);">{{ row.consF1F2.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: var(--accent-blue);">{{ row.batCovered.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: var(--accent-green);">{{ row.exported.toFixed(0) }}</span>
              </div>
              <div class="p-tr-6" style="border-top: 1px solid var(--accent-blue); background: rgba(37, 99, 235, 0.05); border-bottom-left-radius: 6px; border-bottom-right-radius: 6px;">
                <span class="p-td-lbl" style="color: var(--text-primary); font-weight: bold;">TOTALE</span>
                <span class="p-td-val text-right" style="color: var(--accent-gold-light); font-weight: bold;">{{ annualProduction.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: var(--text-muted); font-weight: bold;">{{ totalConsumption.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: var(--text-muted); font-weight: bold;">{{ totalConsF1F2.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: var(--accent-blue); font-weight: bold;">{{ totalBatteryCovered.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: var(--accent-green); font-weight: bold;">{{ exportKwh.toFixed(0) }}</span>
              </div>
            </div>
            <div class="p-sub-text mt-3" style="text-align: right;">*I valori sono espressi in kWh. Il Surplus Reale (RID) è calcolato come: Produzione - (Autoconsumo Diretto + Ricarica Batteria).</div>
          </div>

          <div class="p-card mb-4">
            <div class="p-slabel" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--accent-red)' }">
              Scenari di Rischio su Payback Netto {{ isCerActive ? '(Con CER Attiva)' : '(RID Puro)' }}
            </div>
            <div class="p-table" style="margin-top: 10px;">
              <div class="p-tr-6" style="background: var(--hover-bg); font-weight: bold; border-top-left-radius: 6px; border-top-right-radius: 6px; grid-template-columns: 1fr 1fr 1fr;">
                <span class="p-td-lbl" style="color: var(--text-primary);">Scenario (Base PUN)</span>
                <span class="p-td-val text-right" style="color: var(--accent-gold);">Beneficio Annuo</span>
                <span class="p-td-val text-right" style="color: var(--accent-green);">Payback Netto</span>
              </div>
              <div class="p-tr-6" style="grid-template-columns: 1fr 1fr 1fr;" :style="{ background: sspPrice === 0.09 ? (isCerActive ? 'rgba(147, 51, 234, 0.15)' : 'rgba(239,68,68,0.1)') : 'transparent' }">
                <span class="p-td-lbl" style="color: var(--text-primary);">PUN a €0,09 (Ipotesi ottimistica)</span>
                <span class="p-td-val text-right" style="color: var(--accent-gold-light);">€{{ scenario09.benefit.toLocaleString(undefined, {maximumFractionDigits:0}) }}</span>
                <span class="p-td-val text-right" style="color: var(--text-muted);">{{ scenario09.pb > 0 ? scenario09.pb.toFixed(1) : '—' }} anni</span>
              </div>
              <div class="p-tr-6" style="grid-template-columns: 1fr 1fr 1fr;" :style="{ background: sspPrice === 0.07 ? (isCerActive ? 'rgba(147, 51, 234, 0.15)' : 'rgba(239,68,68,0.1)') : 'transparent' }">
                <span class="p-td-lbl" style="color: var(--text-primary);">PUN scende a €0,07</span>
                <span class="p-td-val text-right" style="color: var(--accent-gold-light);">€{{ scenario07.benefit.toLocaleString(undefined, {maximumFractionDigits:0}) }}</span>
                <span class="p-td-val text-right" style="color: var(--text-muted);">{{ scenario07.pb > 0 ? scenario07.pb.toFixed(1) : '—' }} anni</span>
              </div>
              <div class="p-tr-6" style="grid-template-columns: 1fr 1fr 1fr;" :style="{ background: sspPrice === 0.05 ? (isCerActive ? 'rgba(147, 51, 234, 0.15)' : 'rgba(239,68,68,0.1)') : 'transparent' }">
                <span class="p-td-lbl" style="color: var(--text-primary);">PUN scende a €0,05</span>
                <span class="p-td-val text-right" style="color: var(--accent-gold-light);">€{{ scenario05.benefit.toLocaleString(undefined, {maximumFractionDigits:0}) }}</span>
                <span class="p-td-val text-right" style="color: var(--text-muted);">{{ scenario05.pb > 0 ? scenario05.pb.toFixed(1) : '—' }} anni</span>
              </div>
            </div>
            <div class="p-sub-text mt-4">
              <strong>Verdetto Sintetico:</strong> Con un orizzonte di 10+ anni e costo netto di €{{ netCost.toLocaleString() }}, l'investimento regge anche in scenari conservativi. {{ isCerActive ? "L'attivazione della CER riduce enormemente la volatilità del mercato garantendo un rientro nettamente più rapido." : "Ma se i prezzi dell'energia scendono, il tempo di rientro si allunga." }}
            </div>
          </div>
        </div>

        <div v-show="tab === 'roi'" class="tab-content fade-in delay-1 print-section">
          <h2 class="section-main-title">💶 Finanziario</h2>
          
          <div class="p-card-grid mb-4">
            <div class="p-card">
              <div class="p-slabel">CAPEX (Costo Impianto Chiavi in Mano)</div>
              <div class="p-big-val">€{{ grossCost.toLocaleString() }}</div>
              <div class="p-sub-text mt-2">
                Pannelli e Struttura ({{ pvKw }} kWp): <strong style="color: var(--text-primary);">€{{ (Number(pvKw) * (Number(selectedTech.costPerKwp) + installCostExtra)).toLocaleString() }}</strong><br/>
                Storage ({{ battery }} kWh): <strong style="color: var(--text-primary);">€{{ (Number(battery) * COST_PER_KWH_BAT).toLocaleString() }}</strong><br/>
                <em>*Incluso ricarico stimato 20% (margine, installazione, iter burocratico).</em>
              </div>
            </div>
            <div class="p-card" style="border-left: 2px solid var(--accent-green);">
              <div class="p-slabel" style="color: var(--accent-green);">Costo Netto (Detrazione Fiscale 50%)</div>
              <div class="p-big-val" style="color: var(--accent-green);">€{{ netCost.toLocaleString() }}</div>
              <div class="p-sub-text mt-2">
                Recupero IRPEF/IRES in 10 anni.<br/>
                Investimento reale a carico dell'utente.
              </div>
            </div>
          </div>

          <div class="p-card mb-4">
            <div class="p-slabel" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }">
              <span>Flusso di Cassa e Rientro Economico {{ isCerActive ? '(Assetto CER)' : '(Assetto Standard RID)' }}</span>
              <button @click="showRoiModal = true" class="p-help-btn no-print" title="Spiegazione Calcolo ROI">?</button>
            </div>
            <div class="p-kpi-grid" style="grid-template-columns: repeat(4, 1fr); margin-top: 16px; background: var(--bg-card-alt); border-radius: 8px; border: 1px solid var(--border-color);">
              <div class="p-kpi-cell" style="background: transparent;">
                <div class="p-kpi-lbl">Risparmio Bolletta</div>
                <div class="p-kpi-val">€{{ directSavings.toLocaleString(undefined, {maximumFractionDigits: 0}) }}/a</div>
                <div class="p-kpi-sub">Risparmio generato dall'autoconsumo diretto e dalla batteria.</div>
              </div>
              <div class="p-kpi-cell" style="background: transparent;">
                <div class="p-kpi-lbl" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--text-muted)' }">{{ isCerActive ? 'Ricavo Condivisione (CER)' : 'Pagamento GSE (Ritiro)' }}</div>
                <div class="p-kpi-val" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--text-primary)' }">€{{ activeEarnings.toLocaleString(undefined, {maximumFractionDigits: 0}) }}/a</div>
                <div class="p-kpi-sub">Valorizzazione del surplus immesso ({{ exportKwh.toFixed(0) }} kWh a ~€{{ currentExportRate.toFixed(2) }}).</div>
              </div>
              <div class="p-kpi-cell" style="background: transparent;">
                <div class="p-kpi-lbl">Tempo di Payback</div>
                <div class="p-kpi-val" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--accent-green)' }">{{ activePayback > 0 ? activePayback.toFixed(1) : '—' }} anni</div>
                <div class="p-kpi-sub">Tempo per azzerare l'investimento netto.</div>
              </div>
              <div class="p-kpi-cell" style="background: transparent;">
                <div class="p-kpi-lbl">ROI Globale (20 anni)</div>
                <div class="p-kpi-val" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--accent-blue)' }">{{ activeRoi20 > 0 ? activeRoi20.toFixed(0) : '—' }}%</div>
                <div class="p-kpi-sub">Rendimento atteso sul ciclo di vita.</div>
              </div>
            </div>
          </div>
          
          <div class="p-card">
            <div class="p-slabel">Dettaglio Tecnico Parametri Finanziari</div>
            <div class="p-table">
              <div class="p-tr-6"><span class="p-td-lbl">Costo Energia (Estratto AI)</span><span class="p-td-val">€{{ costoKwh.toFixed(3) }}/kWh</span></div>
              <div class="p-tr-6"><span class="p-td-lbl">Incentivo GSE Stimato (RID/PUN)</span><span class="p-td-val">€{{ sspPrice.toFixed(3) }}/kWh</span></div>
              <div class="p-tr-6"><span class="p-td-lbl">Costo Componente (Pannelli Scelti)</span><span class="p-td-val">€{{ selectedTech.costPerKwp }}/kWp</span></div>
              <div class="p-tr-6"><span class="p-td-lbl">Costo Struttura ({{ INSTALL_TYPES.find(t=>t.id===installType)?.label }})</span><span class="p-td-val">+€{{ installCostExtra }}/kWp</span></div>
              <div class="p-tr-6"><span class="p-td-lbl">Costo Componente (Batterie Litio)</span><span class="p-td-val">€{{ COST_PER_KWH_BAT }}/kWh</span></div>
              <div class="p-tr-6"><span class="p-td-lbl">Ricarico Chiavi in Mano (Stima)</span><span class="p-td-val">+20%</span></div>
              <div class="p-tr-6"><span class="p-td-lbl">Perdite Fisiche di Sistema (BOS + Cavi)</span><span class="p-td-val">{{ (SYSTEM_LOSSES * 100).toFixed(0) }}%</span></div>
            </div>
          </div>

        </div>

        <div v-show="tab === 'cer'" class="tab-content fade-in delay-1 print-section">
          <h2 class="section-main-title">🤝 Dettaglio CER</h2>
          
          <div class="p-card mb-4" style="border-left: 2px solid var(--accent-purple); background: var(--bg-card);">
            
            <div style="background: var(--bg-card-alt); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
              <div>
                <div class="p-input-lbl" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--accent-purple)' }">Simulazione Community Energetica</div>
                <label class="custom-toggle mt-2">
                  <input type="checkbox" v-model="isCerActive">
                  <span class="toggle-slider"></span>
                  <span class="toggle-text" :style="{ color: isCerActive ? 'var(--accent-purple-light)' : 'var(--text-muted)' }">
                    {{ isCerActive ? 'CER Attiva' : 'Nessuna CER (Solo RID)' }}
                  </span>
                </label>
              </div>
              
              <div v-if="isCerActive" style="flex: 1; min-width: 200px;">
                <div class="p-input-lbl" style="color: var(--accent-purple-light);">Valore stimato energia immessa (CER)</div>
                <div class="p-input-val" style="color: var(--accent-purple-light);">€{{ cerTotalRate.toFixed(3) }} /kWh</div>
                <input type="range" min="0.05" max="0.50" step="0.01" v-model.number="cerTotalRate" @input="userModifiedCerRate = true" class="p-slider" style="accent-color: var(--accent-purple);" />
                <div class="p-sub-text mt-1">Default (PUN + 0.11): €{{ (sspPrice + 0.11).toFixed(3) }}</div>
              </div>
              <div v-else style="text-align: right;">
                <div class="p-sub-text">Valore stimato dell'energia immessa:</div>
                <strong :style="{ color: 'var(--text-primary)', fontSize: '18px' }">~€{{ currentExportRate.toFixed(2) }}/kWh</strong>
              </div>
            </div>
            
            <div class="p-slabel" style="color: var(--accent-purple);">Meccanismo di Valorizzazione CER</div>
            <p style="font-size: 14px; line-height: 1.6; margin-top: 10px; margin-bottom: 20px;">
              In una CER sotto la <strong>stessa cabina primaria</strong>, l'energia che immetti in rete — invece di essere pagata dal GSE al solo prezzo di mercato (PUN base) — viene valorizzata con un incentivo GSE aggiuntivo dedicato che vale circa €0,11–0,12/kWh.
            </p>
            
            <div class="p-table" style="margin-bottom: 24px;">
              <div class="p-tr-6" style="background: rgba(147, 51, 234, 0.05); font-weight: bold; border-radius: 6px 6px 0 0; grid-template-columns: 1.5fr 1fr 1fr;">
                <span class="p-td-lbl" style="color: var(--text-primary);">Comparazione Commerciale</span>
                <span class="p-td-val text-right" style="color: var(--text-muted);">Assenza CER (RID)</span>
                <span class="p-td-val text-right" style="color: var(--accent-purple);">Membro CER</span>
              </div>
              <div class="p-tr-6" style="grid-template-columns: 1.5fr 1fr 1fr; border-bottom: 1px solid var(--border-color-light);">
                <span class="p-td-lbl" style="color: var(--text-primary);">Prezzo energia immessa</span>
                <span class="p-td-val text-right" style="color: var(--text-muted);">€{{ sspPrice.toFixed(2) }}/kWh (PUN)</span>
                <span class="p-td-val text-right" style="color: var(--accent-purple-light);">
                  {{ userModifiedCerRate ? 'Tariffa Personalizzata' : '€' + sspPrice.toFixed(2) + ' PUN + €0,11' }}
                </span>
              </div>
              <div class="p-tr-6" style="grid-template-columns: 1.5fr 1fr 1fr; border-bottom: 1px solid var(--border-color-light);">
                <span class="p-td-lbl" style="color: var(--text-primary);">Totale per kWh condiviso</span>
                <span class="p-td-val text-right" style="color: var(--text-muted);">~€{{ sspPrice.toFixed(2) }}</span>
                <span class="p-td-val text-right" style="color: var(--accent-purple-light);">~€{{ cerTotalRate.toFixed(2) }}/kWh</span>
              </div>
              <div class="p-tr-6" style="grid-template-columns: 1.5fr 1fr 1fr;">
                <span class="p-td-lbl" style="color: var(--text-primary);">Durata incentivo</span>
                <span class="p-td-val text-right" style="color: var(--text-muted);">Variabile (Rischio Regolatorio)</span>
                <span class="p-td-val text-right" style="color: var(--accent-purple-light);">20 anni fissi (D.Lgs. 199/2021)</span>
              </div>
            </div>

            <div class="p-slabel" style="color: var(--accent-red);">Le Cautele che Restano</div>
            <ul style="font-size: 13px; line-height: 1.6; color: var(--text-muted); padding-left: 16px; margin: 0;">
              <li style="margin-bottom: 12px;">
                <strong style="color: var(--text-primary); display: block;">1. La quota CER non è tutta tua</strong>
                L'incentivo GSE viene erogato alla CER come soggetto giuridico, non a te direttamente. Devi sapere quale percentuale spetta a te come "Prosumer" in base allo statuto.
              </li>
              <li style="margin-bottom: 12px;">
                <strong style="color: var(--text-primary); display: block;">2. Il tuo profilo è un "Produttore Netto"</strong>
                Con {{ totalConsumption.toFixed(0) }} kWh consumati e {{ annualProduction.toFixed(0) }} prodotti, il tuo surplus ({{ exportKwh.toFixed(0) }} kWh) è enorme. Questo è un vantaggio per la comunità se ci sono "Consumatori Puri" che lo assorbono, ma se tutti hanno i pannelli, l'energia "condivisa" e incentivata si riduce.
              </li>
              <li>
                <strong style="color: var(--text-primary); display: block;">3. Requisito della Cabina Primaria</strong>
                Per poter scambiare l'energia e ricevere l'incentivo, i membri devono essere fisicamente connessi sotto la stessa cabina primaria della rete elettrica nazionale.
              </li>
            </ul>
          </div>
        </div>

        <div v-show="tab === 'environment'" class="tab-content fade-in delay-1 print-section">
          <h2 class="section-main-title">🌱 Impatto Ambientale</h2>
          
          <div class="p-card mb-4" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🌳</div>
            <div class="p-slabel" style="color: var(--accent-green); font-size: 14px;">Impatto Ecologico Annuo</div>
            <div style="font-family: 'Playfair Display', serif; font-size: 36px; color: var(--text-primary); margin-bottom: 8px;">
              {{ (annualProduction * 0.25).toLocaleString(undefined, {maximumFractionDigits: 0}) }} kg CO₂ evitati
            </div>
            <div class="p-sub-text" style="font-size: 14px;">
              Equivale a piantare circa <strong>{{ ((annualProduction * 0.25) / 20).toLocaleString(undefined, {maximumFractionDigits: 0}) }} alberi</strong> ogni anno.
            </div>
          </div>
        </div>

      </div>
      
      <div class="print-footer">
        <div class="pf-left"><span style="color: var(--accent-gold); font-weight: bold; font-size: 14px;">E-surf</span></div>
        <div class="pf-center">dimensionamento stimato in base ai dati di consumo forniti</div>
        <div class="pf-right">{{ currentDate }} <span class="page-num"></span></div>
      </div>

    </div>

    <ChiusuraReport
      v-if="!loading"
      class="print-only"
      :isLightMode="isLightMode"
    />

    <div v-if="showHelpModal" class="p-modal-overlay no-print" @click.self="showHelpModal = false">
      <div class="p-modal-content fade-in">
        <div class="p-modal-header">
          <h3 style="margin: 0; color: var(--text-primary); font-family: 'Space Mono', monospace; font-size: 14px;">Guida al Bilancio Energetico</h3>
          <button @click="showHelpModal = false" class="p-modal-close">&times;</button>
        </div>
        <div class="p-modal-body">
          <div class="help-section">
            <h4 class="help-title">1. I valori sono espressi in kWh</h4>
            <p class="help-text">Specifica l'unità di misura. In bolletta e nei calcoli di resa non si usa la potenza istantanea dell'impianto (i <strong>kW</strong>, che indicano la "forza" dei pannelli), ma l'energia effettivamente accumulata e consumata nel tempo, ovvero i <strong>kWh</strong> (chilowattora).</p>
          </div>
          <div class="help-section">
            <h4 class="help-title">2. Cos'è il "Surplus Reale"</h4>
            <p class="help-text">Il surplus è l'energia "in avanzo" che il tuo impianto fotovoltaico produce, ma che tu non riesci ad utilizzare in casa. Poiché l'energia elettrica non può svanire nel nulla, se non viene usata o immagazzinata, viene obbligatoriamente "spinta" fuori da casa tua e immessa nella rete elettrica pubblica nazionale.</p>
          </div>
          <div class="help-section">
            <h4 class="help-title">3. Cos'è il "RID"</h4>
            <p class="help-text">RID sta per <strong>Ritiro Dedicato</strong>. È la convenzione commerciale del GSE (Gestore Servizi Energetici) che ti permette di guadagnare da quell'energia in avanzo. Il GSE "ritira" la tua energia immessa in rete e te la paga (stimata nel tool a circa 0.09€ al kWh).</p>
          </div>
          <div class="help-section">
            <h4 class="help-title">4. La formula di calcolo</h4>
            <p class="help-text" style="color: var(--accent-blue); font-family: 'Space Mono', monospace; background: rgba(74, 139, 186, 0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(74, 139, 186, 0.3);">Produzione - (Autoconsumo Diretto + Ricarica Batteria)</p>
            <p class="help-text" style="margin-top: 12px;">Questa formula descrive l'ordine di priorità con cui l'inverter gestisce l'energia solare prodotta:</p>
            <ul class="help-list">
              <li><strong>Produzione:</strong> È il 100% dell'energia generata dai pannelli sul tetto in quel mese.</li>
              <li><strong>Priorità 1 - Autoconsumo Diretto:</strong> Appena i pannelli producono, l'energia va <em>immediatamente</em> a coprire i consumi della casa.</li>
              <li><strong>Priorità 2 - Ricarica Batteria:</strong> Se c'è tanto sole e la casa sta consumando poco, l'energia avanza e riempie la batteria.</li>
              <li><strong>Il risultato (Lo scarto):</strong> Solo se la casa è già alimentata <strong>E</strong> la batteria è arrivata al 100%, l'energia prodotta in più diventa il Surplus Reale che finisce in rete.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRoiModal" class="p-modal-overlay no-print" @click.self="showRoiModal = false">
      <div class="p-modal-content fade-in">
        <div class="p-modal-header">
          <h3 style="margin: 0; color: var(--text-primary); font-family: 'Space Mono', monospace; font-size: 14px;">Calcolo Finanziario (ROI & Payback)</h3>
          <button @click="showRoiModal = false" class="p-modal-close">&times;</button>
        </div>
        <div class="p-modal-body">
          <div class="help-section">
            <h4 class="help-title">1. Beneficio Annuo (Flusso di Cassa)</h4>
            <p class="help-text">È il totale della ricchezza generata in un anno. Si ottiene sommando il <strong>Risparmio in Bolletta</strong> (i soldi che eviti di spendere) e il <strong>Guadagno GSE</strong> (i bonifici che ricevi per l'energia in surplus).</p>
          </div>
          <div class="help-section">
            <h4 class="help-title">2. Tempo di Payback</h4>
            <p class="help-text" style="color: var(--accent-blue); font-family: 'Space Mono', monospace; background: rgba(74, 139, 186, 0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(74, 139, 186, 0.3);">Costo Netto Impianto ÷ Beneficio Annuo</p>
            <p class="help-text" style="margin-top: 12px;">Indica in quanti anni i risparmi e i guadagni generati dall'impianto ripagheranno completamente la spesa iniziale (già decurtata delle detrazioni fiscali).</p>
          </div>
          <div class="help-section">
            <h4 class="help-title">3. ROI (Ritorno sull'Investimento a 20 anni)</h4>
            <p class="help-text" style="color: var(--accent-green); font-family: 'Space Mono', monospace; background: rgba(74, 186, 107, 0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(74, 186, 107, 0.3);">[ (Beneficio Annuo × 20) - Costo Netto ] ÷ Costo Netto × 100</p>
            <ul class="help-list" style="margin-top: 12px;">
              <li><strong>Generato in 20 anni:</strong> Moltiplichiamo il Beneficio Annuo per 20 (vita utile standard di un impianto).</li>
              <li><strong>Utile Puro:</strong> Sottraiamo il Costo Netto iniziale per trovare il vero guadagno ripulito dalla spesa.</li>
              <li><strong>Percentuale:</strong> Un ROI del 200% significa che non solo hai recuperato l'investimento, ma hai generato una ricchezza aggiuntiva pari al doppio di quanto speso.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from '@/services/axios';
import GuideHeader from '@/components/layout/GuideHeader.vue';
import { extractAnalysisData } from '@/utils/analysisExtractor';
import CopertinaReport from '@/components/reports/CopertinaReport.vue';
import ChiusuraReport from '@/components/reports/ChiusuraReport.vue';

// Theme Reactive State
const isLightMode = ref(false);

const loading = ref(true);
const entered = ref(false);
const tab = ref('dashboard');
const activeAddressName = ref('Caricamento...');

const currentDate = ref(new Date().toLocaleDateString('it-IT'));
const showHelpModal = ref(false);
const showRoiModal = ref(false);

const printReport = () => { window.print(); };

// --- STATI GLOBALI & TOGGLE CER ---
const isCerActive = ref(false);

const PV_TECHS = [
  { id: 'sunpower', label: 'SunPower Maxeon 6', costPerKwp: 1950, efficiency: 0.228 },
  { id: 'rec',      label: 'REC Alpha Pure-R',    costPerKwp: 1825, efficiency: 0.223 },
  { id: 'qcells',   label: 'Qcells Q.TRON',       costPerKwp: 1400, efficiency: 0.217 },
  { id: 'jinko',    label: 'Jinko Tiger Neo',     costPerKwp: 1200, efficiency: 0.215 },
  { id: 'longi',    label: 'Longi Hi-MO 7',       costPerKwp: 1250, efficiency: 0.221 },
  { id: 'canadian', label: 'Canadian Solar',      costPerKwp: 1175, efficiency: 0.213 },
  { id: 'trina',    label: 'Trina Vertex N',      costPerKwp: 1125, efficiency: 0.218 },
  { id: 'ja',       label: 'JA Solar',            costPerKwp: 1075, efficiency: 0.210 }
];

const selectedTech = ref(PV_TECHS[3]); 
const COST_PER_KWH_BAT = 700;
const sspPrice = ref(0.09); 

// CER Dinamico
const cerIncentivePremium = 0.11; 
const userModifiedCerRate = ref(false);
const cerTotalRate = ref(sspPrice.value + cerIncentivePremium);

// Se l'utente cambia PUN, aggiorna il CER di default (se non l'ha sovrascritto)
watch(sspPrice, (newVal) => {
  if (!userModifiedCerRate.value) {
    cerTotalRate.value = newVal + cerIncentivePremium;
  }
});

const TAX_DEDUCTION = 0.50;
const SYSTEM_LOSSES = 0.15;

const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' }, 
  { id: 'sizing', label: '📐 Sizing & Rischi' }, 
  { id: 'roi', label: '💶 Finanziario' },
  { id: 'cer', label: '🤝 Dettaglio CER' },
  { id: 'environment', label: '🌱 Impatto' }
];

const orientation = ref('S');
const installType = ref('falda');
const inclination = ref(35);

const ORIENTATIONS = [
  { id: 'E', label: 'Est (E)', factor: 0.85 },
  { id: 'SE', label: 'Sud-Est (SE)', factor: 0.95 },
  { id: 'S', label: 'Sud (S)', factor: 1.0 },
  { id: 'SO', label: 'Sud-Ovest (SO)', factor: 0.95 },
  { id: 'O', label: 'Ovest (O)', factor: 0.85 }
];

const INSTALL_TYPES = [
  { id: 'falda', label: 'Tetto a Falda', extraCost: 0 },
  { id: 'piano', label: 'Tetto Piano (Zavorre)', extraCost: 150 },
  { id: 'campo', label: 'Campo a Terra', extraCost: 250 }
];

const pvKw = ref(4);
const battery = ref(0);

const arrF1 = ref(Array(12).fill(0));
const arrF2 = ref(Array(12).fill(0));
const arrF3 = ref(Array(12).fill(0));
const profileMonthlyProduction = ref([]); 
const refPower = ref(3); 
const costoKwh = ref(0.28);
const hasRealPvData = ref(false);

const tariffPlan = ref('N/D');
const contractPower = ref('N/D');
const marketType = ref('N/D');
const isGreen = ref(false);
const reactivePowerIssue = ref('Ottimale');

// --- MOTORE DI CALCOLO DINAMICO ---
const requiredArea = computed(() => (pvKw.value || 0) / selectedTech.value.efficiency);
const numPanels = computed(() => Math.ceil(requiredArea.value / 1.95));

const installCostExtra = computed(() => {
  const type = INSTALL_TYPES.find(t => t.id === installType.value);
  return type ? type.extraCost : 0;
});

const productionFactor = computed(() => {
  const ori = ORIENTATIONS.find(o => o.id === orientation.value) || ORIENTATIONS.find(o=>o.id==='S');
  let baseFactor = ori.factor;
  let currentInc = installType.value === 'falda' ? inclination.value : (installType.value === 'piano' ? 10 : 30);
  const incPenalty = Math.abs(currentInc - 35) * 0.005;
  return Math.max(0.4, Math.min(1.0, baseFactor - incPenalty));
});

const arrProd = computed(() => {
  let baseArr = [];
  if (hasRealPvData.value && profileMonthlyProduction.value.length === 12) {
    baseArr = profileMonthlyProduction.value.map(v => v * (pvKw.value / refPower.value));
  } else {
    const defaultIrr = [2.1, 2.9, 4.1, 5.2, 6.0, 6.8, 7.2, 6.5, 5.0, 3.5, 2.2, 1.8];
    baseArr = defaultIrr.map(i => i * 30 * pvKw.value * (1 - SYSTEM_LOSSES));
  }
  return baseArr.map(v => v * productionFactor.value);
});

const monthlyTableData = computed(() => {
  return months.map((month, i) => {
    const prod = arrProd.value[i];
    const cons = arrF1.value[i] + arrF2.value[i] + arrF3.value[i];
    const consF1F2 = arrF1.value[i] + arrF2.value[i];
    
    const dayDemand = arrF1.value[i] + (arrF2.value[i] * 0.3);
    const nightDemand = arrF3.value[i] + (arrF2.value[i] * 0.7);
    
    const directCovered = Math.min(dayDemand, prod * 0.45);
    const surplusPotenziale = Math.max(0, prod - directCovered);
    
    const maxBatDischarge = battery.value * 30;
    const batCovered = battery.value > 0 ? Math.min(nightDemand, surplusPotenziale, maxBatDischarge) : 0;
    const exported = Math.max(0, prod - (directCovered + batCovered));

    return { month, prod, cons, consF1F2, dayDemand, directCovered, batCovered, exported };
  });
});

const annualProduction = computed(() => arrProd.value.reduce((a,b)=>a+b,0));
const totalConsumption = computed(() => arrF1.value.reduce((a,b)=>a+b,0) + arrF2.value.reduce((a,b)=>a+b,0) + arrF3.value.reduce((a,b)=>a+b,0));
const totalConsF1F2 = computed(() => monthlyTableData.value.reduce((a, b) => a + b.consF1F2, 0));
const exportKwh = computed(() => monthlyTableData.value.reduce((a, b) => a + b.exported, 0));
const totalBatteryCovered = computed(() => monthlyTableData.value.reduce((a, b) => a + b.batCovered, 0));
const selfConsKwh = computed(() => monthlyTableData.value.reduce((a, b) => a + b.directCovered + b.batCovered, 0));
const totalSelfConsPct = computed(() => annualProduction.value > 0 ? (selfConsKwh.value / annualProduction.value) * 100 : 0);
const independencePct = computed(() => totalConsumption.value > 0 ? (selfConsKwh.value / totalConsumption.value) * 100 : 0);

// --- MOTORE FINANZIARIO REATTIVO (RID vs CER) ---

const grossCost = computed(() => ((Number(pvKw.value) * (Number(selectedTech.value.costPerKwp) + installCostExtra.value)) + (Number(battery.value) * COST_PER_KWH_BAT)) * 1.20);
const netCost = computed(() => grossCost.value * (1 - TAX_DEDUCTION));
const directSavings = computed(() => selfConsKwh.value * costoKwh.value);
const batteryAdvantage = computed(() => totalBatteryCovered.value * costoKwh.value);

const currentExportRate = computed(() => isCerActive.value ? cerTotalRate.value : sspPrice.value);

// Computeds Attivi (Si adattano automaticamente in base al Toggle CER e allo Slider CER)
const activeEarnings = computed(() => exportKwh.value * currentExportRate.value);
const activeAnnualBenefit = computed(() => directSavings.value + activeEarnings.value);
const activePayback = computed(() => activeAnnualBenefit.value > 0 ? netCost.value / activeAnnualBenefit.value : 0);
const activeRoi20 = computed(() => netCost.value > 0 ? ((activeAnnualBenefit.value * 20 - netCost.value) / netCost.value) * 100 : 0);

// SCENARI GSE PER TABELLA TRADE-OFF
const getScenarioBenefit = (basePun) => {
  // Se CER attiva, applichiamo lo spread dell'utente rispetto al PUN base, altrimenti solo PUN
  const rate = basePun + (isCerActive.value ? cerIncentivePremium : 0);
  const b = directSavings.value + (exportKwh.value * rate); 
  return { benefit: b, pb: b>0 ? netCost.value/b : 0 };
};

const scenario09 = computed(() => getScenarioBenefit(0.09));
const scenario07 = computed(() => getScenarioBenefit(0.07));
const scenario05 = computed(() => getScenarioBenefit(0.05));

// --- GRAFICI ESTETICI ---
const arrF123 = computed(() => arrF1.value.map((v, i) => v + arrF2.value[i] + arrF3.value[i]));
const maxChart1 = computed(() => Math.max(...arrF123.value, 10) * 1.2);
const arrProdChart = computed(() => monthlyTableData.value.map(r => r.prod));
const arrDirectCoveredChart = computed(() => monthlyTableData.value.map(r => r.directCovered));
const arrDirectBatChart = computed(() => monthlyTableData.value.map(r => r.directCovered + r.batCovered));
const arrDayDemandChart = computed(() => monthlyTableData.value.map(r => r.dayDemand));
const maxChart2 = computed(() => Math.max(...arrDayDemandChart.value, ...arrProdChart.value, 10) * 1.2);

const getPath = (dataArr, isArea, mx) => {
  const w = 280, h = 100, dx = w / 11, maxV = mx || 1;
  let dStr = isArea ? `M 30,110 ` : `M 30,${110 - (dataArr[0] / maxV) * h} `;
  dataArr.forEach((val, i) => { dStr += `L ${30 + i * dx},${110 - (val / maxV) * h} `; });
  if (isArea) dStr += `L ${310},110 Z`;
  return dStr;
};

const pathF1 = computed(() => getPath(arrF1.value, true, maxChart1.value));
const pathF12 = computed(() => getPath(arrF1.value.map((v,i)=>v+arrF2.value[i]), true, maxChart1.value));
const pathF123 = computed(() => getPath(arrF123.value, true, maxChart1.value));
const pathProdArea = computed(() => getPath(arrProdChart.value, true, maxChart2.value));
const pathProdLine = computed(() => getPath(arrProdChart.value, false, maxChart2.value));
const pathDirectBatArea = computed(() => getPath(arrDirectBatChart.value, true, maxChart2.value));
const pathDirectBatLine = computed(() => getPath(arrDirectBatChart.value, false, maxChart2.value));
const pathDirectArea = computed(() => getPath(arrDirectCoveredChart.value, true, maxChart2.value));
const pathDirectLine = computed(() => getPath(arrDirectCoveredChart.value, false, maxChart2.value));

onMounted(async () => {
  isLightMode.value = localStorage.getItem('theme') === 'light';

  try {
    const resRes = await axios.get('/api/resources');
    const resources = resRes.data.data || resRes.data || [];
    const data = extractAnalysisData(resources, localStorage.getItem('esurf_active_address_id'));
    if (data && data.rPower) {
        activeAddressName.value = data.activeAddressName;
        let pAi = {};
        try { pAi = typeof data.rPower.ai_analysis === 'string' ? JSON.parse(data.rPower.ai_analysis) : (data.rPower.ai_analysis || {}); } catch(e) {}
        
        if (data.rPower.pv_production_profile) {
            let pvProf = typeof data.rPower.pv_production_profile === 'string' ? JSON.parse(data.rPower.pv_production_profile) : data.rPower.pv_production_profile;
            if (pvProf?.outputs?.monthly?.fixed) {
                profileMonthlyProduction.value = pvProf.outputs.monthly.fixed.map(m => m.E_m);
                refPower.value = pvProf.inputs?.pv_module?.peak_power || 3;
                hasRealPvData.value = true;
            }
        }

        const mKeys = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
        let fasce = pAi?.last_year_fasce || pAi?.consumi?.last_year_fasce;
        if (fasce) {
            arrF1.value = mKeys.map(m => parseFloat(fasce[m]?.F1) || 0);
            arrF2.value = mKeys.map(m => parseFloat(fasce[m]?.F2) || 0);
            arrF3.value = mKeys.map(m => parseFloat(fasce[m]?.F3) || 0);
        }
        costoKwh.value = parseFloat(pAi.costo_medio_kwh || pAi.sintesi?.costo_medio_kwh || 0.28);
        contractPower.value = pAi.committed_power_kw || '3.3';
        tariffPlan.value = pAi.contract_type || 'N/D';
        
        const findGreenFlag = (obj) => {
          if (!obj || typeof obj !== 'object') return false;
          if (obj.is_100_green === true || String(obj.is_100_green).toLowerCase() === 'true') return true;
          if (obj.isgreen === true || String(obj.isgreen).toLowerCase() === 'true') return true;
          for (const key in obj) if (typeof obj[key] === 'object' && findGreenFlag(obj[key])) return true;
          return false;
        };
        isGreen.value = findGreenFlag(pAi);

        const penaliReattiva = pAi.spese_reattiva || pAi.penali_reattiva || pAi.importo_reattiva || pAi.sintesi?.penali || 0;
        const cosfi = pAi.cosfi || pAi.fattore_potenza || pAi.dati_tecnici?.cosfi || 1;
        if (parseFloat(penaliReattiva) > 0 || parseFloat(cosfi) < 0.90) {
            reactivePowerIssue.value = "Anomalia (Penali Rilevate)";
        } else {
            reactivePowerIssue.value = "Ottimale";
        }
    }
  } catch (e) { console.error(e); } finally { loading.value = false; setTimeout(() => entered.value = true, 100); }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;600&display=swap');

/* VARIABILI CSS PER DARK/LIGHT MODE */
.pv-app-wrapper { 
  --bg-app: #0A0C0E;
  --bg-header: #111317;
  --bg-card: #16181D;
  --bg-card-alt: #1A1D24;
  --border-color: #232830;
  --border-color-light: #2A2D35;
  --text-primary: #F0F2F5;
  --text-muted: #8A8B90;
  --text-light: #5A5D65;
  --accent-gold: #C8A850;
  --accent-gold-light: #C8A050;
  --accent-green: #4ABA6B;
  --accent-blue: #4A8BBA;
  --accent-purple: #9333EA;
  --accent-purple-light: #D8B4FE;
  --accent-red: #EF4444;
  --hover-bg: rgba(255, 255, 255, 0.03);

  background: var(--bg-app); 
  min-height: 100vh; 
  font-family: 'Inter', sans-serif; 
  color: var(--text-primary); 
  counter-reset: page; 
}

.pv-app-wrapper.light-mode {
  --bg-app: #F9FAFB;
  --bg-header: #FFFFFF;
  --bg-card: #FFFFFF;
  --bg-card-alt: #F3F4F6;
  --border-color: #E5E7EB;
  --border-color-light: #D1D5DB;
  --text-primary: #111827;
  --text-muted: #6B7280;
  --text-light: #9CA3AF;
  --accent-gold: #B4933B;
  --accent-gold-light: #927221;
  --accent-green: #059669;
  --accent-blue: #2563EB;
  --accent-purple: #7E22CE;
  --accent-purple-light: #6B21A8;
  --accent-red: #DC2626;
  --hover-bg: rgba(0, 0, 0, 0.03);
}

.section-main-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.p-header { background: var(--bg-header); padding: 26px 22px 0; position: relative; overflow: hidden; border-bottom: 1px solid var(--border-color); }
.p-header-bg { position: absolute; inset: 0; opacity: 0.03; pointer-events: none; stroke: var(--text-primary); stroke-width: 0.5; }
.p-header-content { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; }
.p-kicker { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: var(--text-muted); text-transform: uppercase; }
.p-title { font-size: 26px; font-weight: 400; margin: 0; color: var(--text-primary); }
.p-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: var(--border-color-light); border-radius: 6px; overflow: hidden; margin-top: 18px; }
.p-kpi-cell { background: var(--bg-card); padding: 12px 14px; position: relative; transition: all 0.3s ease; }
.p-kpi-lbl { font-family: 'Space Mono', monospace; font-size: 8px; text-transform: uppercase; margin-bottom: 4px; transition: color 0.3s ease;}
.p-kpi-val { font-size: 18px; font-family: 'Space Mono', monospace; font-weight: 700; transition: color 0.3s ease;}
.p-kpi-sub { font-size: 9px; color: var(--text-light); margin-top: 4px; line-height: 1.3; }
.p-tabs { display: flex; gap: 4px; margin-top: 20px; }
.p-tab-btn { background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; padding: 12px 16px; font-family: 'Space Mono', monospace; font-size: 9px; color: var(--text-light); }
.p-tab-btn.active { border-bottom-color: var(--accent-gold); color: var(--accent-gold); }
.p-body { max-width: 860px; margin: 0 auto; padding: 24px 20px 80px; }
.p-card { background: var(--bg-card); border-radius: 8px; padding: 20px; border: 1px solid var(--border-color); transition: border-color 0.3s ease; }
.p-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.p-slabel { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px; }
.p-big-val { font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700; transition: color 0.3s ease; }
.p-sub-text { font-size: 12px; color: var(--text-muted); line-height: 1.6; }
.p-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.p-info-box { background: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; }
.p-info-lbl { font-size: 8px; color: var(--text-muted); text-transform: uppercase; }
.p-info-val { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.p-info-sub { font-size: 10px; color: var(--text-light); }
.p-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.p-chart-title { font-size: 10px; font-weight: 600; color: var(--accent-gold-light); }
.p-chart-legend { font-size: 8px; margin-bottom: 12px; display: flex; gap: 12px; }
.p-chart-container { width: 100%; border-top: 1px solid var(--border-color); padding-top: 16px; }
.p-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.p-input-lbl { font-size: 9px; color: var(--text-muted); text-transform: uppercase; }
.p-input-val { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
.p-slider { width: 100%; height: 4px; border-radius: 99px; background: var(--border-color-light); outline: none; -webkit-appearance: none; cursor: pointer; }
.p-bar-wrap { height: 6px; background: var(--border-color); border-radius: 99px; overflow: hidden; margin-top: 12px; }
.p-bar-fill { height: 100%; transition: width 0.8s ease-out; }
.p-alert-box { background: rgba(200,168,80,0.05); border: 1px solid rgba(200,168,80,0.2); border-radius: 6px; padding: 12px; font-size: 12px; color: var(--accent-gold-light); margin-top: 20px; }
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-gold); border-radius: 50%; animation: spin 1s linear infinite; margin: auto; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* CUSTOM TOGGLE CER */
.custom-toggle { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
.custom-toggle input { opacity: 0; width: 0; height: 0; position: absolute;}
.toggle-slider { position: relative; display: inline-block; width: 44px; height: 24px; background-color: var(--border-color-light); border-radius: 24px; transition: .4s; margin-right: 12px; }
.toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: var(--text-muted); border-radius: 50%; transition: .4s; }
.custom-toggle input:checked + .toggle-slider { background-color: var(--accent-purple); }
.custom-toggle input:checked + .toggle-slider:before { transform: translateX(20px); background-color: #fff; }
.toggle-text { font-size: 13px; font-weight: 700; transition: color 0.3s; }

/* TABELLA */
.p-table { display: flex; flex-direction: column; font-size: 10px; font-family: 'Space Mono', monospace; }
.p-tr-6 { display: grid; grid-template-columns: 0.8fr 1fr 1fr 1fr 1fr 1.2fr; padding: 10px 12px; border-bottom: 0.5px solid var(--border-color); transition: background 0.3s; }
.p-tr-6:nth-child(even) { background: var(--bg-card-alt); }
.text-right { text-align: right; justify-content: flex-end; }
.p-td-lbl { color: var(--text-muted); }
.p-td-val { font-weight: 700; color: var(--accent-gold); }

/* MODALS */
.p-help-btn { background: rgba(74, 139, 186, 0.1); border: 1px solid rgba(74, 139, 186, 0.3); color: var(--accent-blue); border-radius: 50%; width: 18px; height: 18px; font-size: 10px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; font-weight: bold; }
.p-help-btn:hover { background: var(--accent-blue); color: var(--bg-card); }
.p-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 12, 14, 0.85); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.p-modal-content { background: var(--bg-card); border: 1px solid var(--border-color-light); border-radius: 8px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.p-modal-header { padding: 16px 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.p-modal-close { background: none; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer; line-height: 1; padding: 0; }
.p-modal-close:hover { color: var(--text-primary); }
.p-modal-body { padding: 20px; }
.help-section { margin-bottom: 20px; }
.help-section:last-child { margin-bottom: 0; }
.help-title { color: var(--accent-gold); font-size: 12px; font-family: 'Space Mono', monospace; text-transform: uppercase; margin: 0 0 8px 0; }
.help-text { color: var(--text-muted); font-size: 13px; line-height: 1.6; margin: 0; font-family: 'Inter', sans-serif; }
.help-list { margin: 8px 0 0 20px; padding: 0; color: var(--text-muted); font-size: 13px; line-height: 1.6; font-family: 'Inter', sans-serif; }
.help-list li { margin-bottom: 6px; }
.help-list strong { color: var(--text-primary); }

/* PRINT RULES: GESTIONE REPORT E COPERTINE */
@media screen {
  .print-only { display: none !important; }
}

.print-footer { display: none; }

@media print {
  body { background: var(--bg-app) !important; padding-bottom: 40px !important; }
  .no-print, .p-tabs { display: none !important; }
  
  /* Facciamo vedere le pagine di copertina come flex container (rispettano il loro layout) */
  .print-only { display: flex !important; }
  
  .print-section { display: block !important; opacity: 1 !important; page-break-inside: avoid; margin-bottom: 40px; }
  .pv-app-wrapper { background: var(--bg-app) !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .p-card { page-break-inside: avoid; break-inside: avoid; border: 1px solid var(--border-color) !important; }
  .p-body { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
  .p-slider { display: none !important; }
  .p-select { appearance: none; -webkit-appearance: none; border: none; padding: 0; }
  .print-footer { display: flex; position: fixed; bottom: 0; left: 0; width: 100%; justify-content: space-between; align-items: center; font-family: 'Inter', sans-serif; font-size: 9px; color: #8A8B90; padding: 10px 20px; background: var(--bg-app); border-top: 1px solid var(--border-color); z-index: 9999; }
  .page-num::after { content: " - Pag. " counter(page); }
}

@media (max-width: 600px) { 
  .p-kpi-grid { grid-template-columns: repeat(2, 1fr); } 
  .p-grid-4, .p-charts-grid, .p-input-row, .p-card-grid { grid-template-columns: 1fr; } 
  .p-tr-6 { font-size: 8px; grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr; padding: 8px; }
}
</style>
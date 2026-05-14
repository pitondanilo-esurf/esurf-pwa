<template>
  <div class="pv-app-wrapper">
    <div class="no-print">
      <GuideHeader :isLightMode="false" />
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
                <div class="p-kpi-lbl" style="color: #8A8B90; display: flex; align-items: center; gap: 4px;">
                  Payback
                  <button @click="showRoiModal = true" class="p-help-btn no-print" style="width:14px; height:14px; font-size:8px;">?</button>
                </div>
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
              <span>Profilo Fornitura Attuale (Estratto da Bolletta)</span>
              <span v-if="hasRealPvData" style="color: #4ABA6B; font-weight: bold;">✓ Dati Satellitari PVGIS Attivi</span>
              <span v-else style="color: #C87A50; font-weight: bold;">⚠️ Profilo PVGIS Assente (Stima Media)</span>
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
                <div class="p-info-val" :style="{ color: isGreen ? '#4ABA6B' : '#F0F2F5' }">
                  {{ isGreen ? '100% Green' : 'Mix Standard' }}
                </div>
                <div class="p-info-sub">{{ isGreen ? 'Energia certificata' : 'Fonti fossili incluse' }}</div>
              </div>
              <div class="p-info-box">
                <div class="p-info-lbl">Efficienza Rete (Cos-φ)</div>
                <div class="p-info-val" :style="{ color: reactivePowerIssue === 'Ottimale' ? '#4ABA6B' : '#C87A50' }">
                  {{ reactivePowerIssue }}
                </div>
                <div class="p-info-sub">Impatto energia reattiva</div>
              </div>
            </div>
          </div>
          
          <div class="p-card mb-4">
            <div class="p-slabel" style="display: flex; justify-content: space-between;">
              <span>Analisi Vettoriale: Fasce Orarie vs Produzione PVGIS</span>
              <span style="color: #C8A850; font-weight: bold;">Costo stimato bolletta: €{{ costoKwh.toFixed(3) }}/kWh</span>
            </div>
            
            <div class="p-charts-grid mt-4">
              <div>
                <div class="p-chart-title">Profilo Consumi per Fascia (F1, F2, F3)</div>
                <div class="p-chart-legend">
                  <span style="color: #C8A850;">■ F1 Giorno</span>
                  <span style="color: #4A8BBA;">■ F2 Sera/Sab</span>
                  <span style="color: #5A5D65;">■ F3 Notte/Dom</span>
                </div>
                <div class="p-chart-container">
                  <svg width="100%" viewBox="0 0 320 140" style="overflow: visible;">
                    <line v-for="i in 5" :key="'g1'+i" x1="30" :y1="10+(i-1)*25" x2="310" :y2="10+(i-1)*25" stroke="#2A2D35" stroke-width="0.5" stroke-dasharray="2 4"/>
                    <text v-for="i in 5" :key="'gt1'+i" x="25" :y="13+(i-1)*25" fill="#5A5D65" font-size="8" font-family="monospace" text-anchor="end">
                      {{ Math.round(maxChart1 - (i-1)*(maxChart1/4)) }}
                    </text>
                    <path :d="pathF123" fill="rgba(90, 93, 101, 0.4)" />
                    <path :d="pathF12" fill="rgba(74, 139, 186, 0.5)" />
                    <path :d="pathF1" fill="rgba(200, 168, 80, 0.6)" />
                    <text v-for="(m, i) in months" :key="'mt1'+i" :x="30 + i*25.4" y="125" fill="#5A5D65" font-size="8" font-family="monospace" text-anchor="middle">{{ m }}</text>
                  </svg>
                </div>
                <div style="font-size: 10px; color: #8A8B90; text-align: center; margin-top: 8px;">
                  Consumo Annuo Totale: {{ totalConsumption.toFixed(0) }} kWh
                </div>
              </div>

              <div>
                <div class="p-chart-title">Copertura Fabbisogno: Diretto + Accumulo vs Prod. FV</div>
                <div class="p-chart-legend">
                  <span style="color: #4ABA6B;">■ Prod. PVGIS</span>
                  <span style="color: #4A8BBA;">■ + Batteria</span>
                  <span style="color: #C8A850;">■ Autocons. Diretto</span>
                </div>
                <div class="p-chart-container">
                  <svg width="100%" viewBox="0 0 320 140" style="overflow: visible;">
                    <line v-for="i in 5" :key="'g2'+i" x1="30" :y1="10+(i-1)*25" x2="310" :y2="10+(i-1)*25" stroke="#2A2D35" stroke-width="0.5" stroke-dasharray="2 4"/>
                    <text v-for="i in 5" :key="'gt2'+i" x="25" :y="13+(i-1)*25" fill="#5A5D65" font-size="8" font-family="monospace" text-anchor="end">
                      {{ Math.round(maxChart2 - (i-1)*(maxChart2/4)) }}
                    </text>
                    <path :d="pathProdArea" fill="url(#solargrad)" />
                    <path :d="pathProdLine" fill="none" stroke="#4ABA6B" stroke-width="2" />
                    <path :d="pathDirectBatArea" fill="rgba(74, 139, 186, 0.4)" />
                    <path :d="pathDirectBatLine" fill="none" stroke="#4A8BBA" stroke-width="1.5" stroke-dasharray="4 4" />
                    <path :d="pathDirectArea" fill="rgba(200, 168, 80, 0.6)" />
                    <path :d="pathDirectLine" fill="none" stroke="#C8A850" stroke-width="1.5" />
                    <text v-for="(m, i) in months" :key="'mt2'+i" :x="30 + i*25.4" y="125" fill="#5A5D65" font-size="8" font-family="monospace" text-anchor="middle">{{ m }}</text>
                    <defs>
                      <linearGradient id="solargrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgba(74, 186, 107, 0.3)" />
                        <stop offset="100%" stop-color="rgba(74, 186, 107, 0.0)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div style="font-size: 10px; color: #4ABA6B; text-align: center; margin-top: 8px;">
                  Grafico dinamico derivato dalla Tabella: mostra energia autoconsumata e immagazzinata.
                </div>
              </div>
            </div>
          </div>

          <div class="p-card-grid">
            <div class="p-card">
              <div style="display: flex; gap: 24px;">
                <div style="flex: 1;">
                  <div class="p-slabel" style="color: #4A8BBA;">Autoconsumo</div>
                  <div class="p-big-val" style="color: #4A8BBA;">{{ totalSelfConsPct.toFixed(0) }}%</div>
                  <div class="p-bar-wrap mb-2">
                    <div class="p-bar-fill" :style="{ width: `${totalSelfConsPct}%`, background: '#4A8BBA' }"></div>
                  </div>
                </div>
                <div style="flex: 1;">
                  <div class="p-slabel" style="color: #C8A850;">Indipendenza Rete</div>
                  <div class="p-big-val" style="color: #C8A850;">{{ independencePct.toFixed(0) }}%</div>
                  <div class="p-bar-wrap mb-2">
                    <div class="p-bar-fill" :style="{ width: `${independencePct}%`, background: '#C8A850' }"></div>
                  </div>
                </div>
              </div>
              <div class="p-sub-text mt-3">
                Fabbisogno coperto: <strong>{{ selfConsKwh.toFixed(0) }} kWh</strong> su {{ totalConsumption.toFixed(0) }} kWh annui.<br/>
                Surplus (Immesso in Rete): <strong>{{ exportKwh.toFixed(0) }} kWh</strong>
              </div>
            </div>
            
            <div class="p-card">
              <div class="p-slabel" style="color: #4ABA6B;">Risparmio Annuo Generato</div>
              <div class="p-big-val" style="color: #4ABA6B;">€{{ directSavings.toLocaleString(undefined, {maximumFractionDigits: 0}) }}<span style="font-size: 14px; font-weight: normal;">/anno</span></div>
              <div class="p-sub-text mt-2">
                + €{{ earnings.toFixed(0) }}/a erogati dal GSE (Ritiro/SSP)<br/>
                Beneficio Finanziario Totale: <strong>€{{ annualBenefit.toLocaleString(undefined, {maximumFractionDigits: 0}) }}/anno</strong>
              </div>
            </div>
          </div>
        </div>

        <div v-show="tab === 'sizing'" class="tab-content fade-in delay-1 print-section">
          <div class="p-card mb-4">
            <div class="p-slabel" style="color: #C8A850;">Configurazione Impianto e Tecnologia</div>
            
            <div class="p-input-row mb-4">
              <div>
                <div class="p-input-lbl">Modello Pannelli Solari</div>
                <select v-model="selectedTech" class="p-select" style="width:100%; padding: 10px; background:#1A1D24; color:white; border:1px solid #2A2D35; border-radius: 4px;">
                  <option v-for="t in PV_TECHS" :key="t.id" :value="t">{{ t.label }} ({{ t.efficiency }} kW/m²)</option>
                </select>
                <div class="p-sub-text mt-2">Resa: {{ selectedTech.efficiency }} kWp/m² | Costo Componente: €{{ selectedTech.costPerKwp }}/kWp</div>
              </div>
              <div>
                <div class="p-input-lbl">Potenza Impianto FV Desiderata</div>
                <div class="p-input-val" style="color: #C8A850;">{{ pvKw.toFixed(1) }} kWp</div>
                <input type="range" min="1" max="200" step="0.5" v-model.number="pvKw" class="p-slider" style="accent-color: #C8A850;" />
                <div class="p-sub-text mt-1">Moduli previsti: <strong>{{ numPanels }} pannelli</strong> (stima su modulo std. da 1.95m²)</div>
              </div>
            </div>

            <div class="p-input-row mt-4 pt-4" style="border-top: 1px solid #232830;">
              <div>
                <div class="p-input-lbl">Superficie Tetto Necessaria</div>
                <div class="p-input-val">{{ requiredArea.toFixed(1) }} m²</div>
                <div class="p-sub-text mt-1">Spazio fisico minimo stimato in base alla potenza e tecnologia.</div>
              </div>
              <div>
                <div class="p-input-lbl">Batteria di Accumulo (kWh)</div>
                <div class="p-input-val" style="color: #4A8BBA;">{{ battery }} kWh</div>
                <input type="range" min="0" max="200" step="1" v-model.number="battery" class="p-slider" style="accent-color: #4A8BBA;" />
                <div class="p-sub-text mt-1">Cattura il surplus per coprire le fasce serali F2/F3.</div>
              </div>
            </div>

            <div class="p-input-row mt-4 pt-4" style="border-top: 1px solid #232830;">
              <div>
                <div class="p-input-lbl">Esposizione e Tipo Installazione</div>
                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                  <select v-model="orientation" class="p-select" style="flex: 1; padding: 10px; background:#1A1D24; color:white; border:1px solid #2A2D35; border-radius: 4px;">
                    <option v-for="o in ORIENTATIONS" :key="o.id" :value="o.id">{{ o.label }}</option>
                  </select>
                  <select v-model="installType" class="p-select" style="flex: 2; padding: 10px; background:#1A1D24; color:white; border:1px solid #2A2D35; border-radius: 4px;">
                    <option v-for="t in INSTALL_TYPES" :key="t.id" :value="t.id">{{ t.label }} (+€{{ t.extraCost }}/kWp)</option>
                  </select>
                </div>
                <div class="p-sub-text mt-1">L'orientamento e l'installazione determinano i costi di struttura e l'efficienza.</div>
              </div>
              
              <div>
                <div v-if="installType === 'falda'">
                  <div class="p-input-lbl">Inclinazione Falda (Gradi)</div>
                  <div class="p-input-val">{{ inclination }}°</div>
                  <input type="range" min="0" max="90" step="1" v-model.number="inclination" class="p-slider" style="accent-color: #C8A850;" />
                  <div class="p-sub-text mt-1">Ottimale: ~35°. Efficienza stimata: <strong style="color: #4ABA6B;">{{ (productionFactor * 100).toFixed(0) }}%</strong></div>
                </div>
                <div v-else-if="installType === 'piano'">
                  <div class="p-input-lbl">Inclinazione Zavorre</div>
                  <div class="p-input-val" style="color:#8A8B90;">10° (Fissa)</div>
                  <div class="p-sub-text mt-1">Tetto piano con zavorre inclinate. Efficienza stimata: <strong style="color: #4ABA6B;">{{ (productionFactor * 100).toFixed(0) }}%</strong></div>
                </div>
                <div v-else>
                  <div class="p-input-lbl">Inclinazione Struttura</div>
                  <div class="p-input-val" style="color:#8A8B90;">30° (Fissa/Ottimale)</div>
                  <div class="p-sub-text mt-1">Campo a terra ottimizzato. Efficienza stimata: <strong style="color: #4ABA6B;">{{ (productionFactor * 100).toFixed(0) }}%</strong></div>
                </div>
              </div>
            </div>

            <div class="p-alert-box mt-4">
              Il calcolo del Bilancio Energetico integra un <strong>modello empirico di mismatch orario</strong>. Poiché i picchi di produzione e consumo non sono allineati istante per istante, l'autoconsumo diretto è statisticamente limitato al 45% del potenziale. Inserire una batteria sposta drasticamente il surplus a vantaggio del consumo notturno.
            </div>
          </div>

          <div class="p-card mb-4">
            <div class="p-slabel" style="color: #4A8BBA; display: flex; align-items: center; gap: 8px;">
              <span>Bilancio Energetico Mensile Dettagliato</span>
              <button @click="showHelpModal = true" class="p-help-btn no-print" title="Spiegazione Bilancio">?</button>
            </div>
            <div class="p-table" style="margin-top: 10px;">
              <div class="p-tr-6" style="background: rgba(255,255,255,0.03); font-weight: bold; border-top-left-radius: 6px; border-top-right-radius: 6px;">
                <span class="p-td-lbl" style="color: #F0F2F5;">Mese</span>
                <span class="p-td-val text-right" style="color: #C8A850;">Prod.</span>
                <span class="p-td-val text-right" style="color: #8A8B90;">Tot. Cons</span>
                <span class="p-td-val text-right" style="color: #8A8B90;">F1+F2</span>
                <span class="p-td-val text-right" style="color: #4A8BBA;">Batteria</span>
                <span class="p-td-val text-right" style="color: #4ABA6B;">Surplus RID</span>
              </div>
              <div class="p-tr-6" v-for="(row, index) in monthlyTableData" :key="index">
                <span class="p-td-lbl" style="color: #F0F2F5;">{{ row.month }}</span>
                <span class="p-td-val text-right" style="color: #C8A050;">{{ row.prod.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: #8A8B90;">{{ row.cons.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: #8A8B90;">{{ row.consF1F2.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: #4A8BBA;">{{ row.batCovered.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: #4ABA6B;">{{ row.exported.toFixed(0) }}</span>
              </div>
              <div class="p-tr-6" style="border-top: 1px solid #4A8BBA; background: rgba(74, 139, 186, 0.1); border-bottom-left-radius: 6px; border-bottom-right-radius: 6px;">
                <span class="p-td-lbl" style="color: #F0F2F5; font-weight: bold;">TOTALE</span>
                <span class="p-td-val text-right" style="color: #C8A050; font-weight: bold;">{{ annualProduction.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: #8A8B90; font-weight: bold;">{{ totalConsumption.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: #8A8B90; font-weight: bold;">{{ totalConsF1F2.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: #4A8BBA; font-weight: bold;">{{ totalBatteryCovered.toFixed(0) }}</span>
                <span class="p-td-val text-right" style="color: #4ABA6B; font-weight: bold;">{{ exportKwh.toFixed(0) }}</span>
              </div>
            </div>
            <div class="p-sub-text mt-3" style="text-align: right;">*I valori sono espressi in kWh. Il Surplus Reale (RID) è calcolato come: Produzione - (Autoconsumo Diretto + Ricarica Batteria).</div>
          </div>
        </div>

        <div v-show="tab === 'roi'" class="tab-content fade-in delay-1 print-section">
          <div class="p-card-grid mb-4">
            <div class="p-card">
              <div class="p-slabel">CAPEX (Costo Impianto Totale)</div>
              <div class="p-big-val">€{{ grossCost.toLocaleString() }}</div>
              <div class="p-sub-text mt-2">
                Pannelli e Struttura ({{ pvKw }} kWp): <strong style="color: #E0E0E0;">€{{ (Number(pvKw) * (Number(selectedTech.costPerKwp) + installCostExtra)).toLocaleString() }}</strong><br/>
                Storage ({{ battery }} kWh): <strong style="color: #E0E0E0;">€{{ (Number(battery) * COST_PER_KWH_BAT).toLocaleString() }}</strong>
              </div>
            </div>
            <div class="p-card" style="border-left: 2px solid #4ABA6B;">
              <div class="p-slabel" style="color: #4ABA6B;">Costo Netto (Detrazione Fiscale 50%)</div>
              <div class="p-big-val" style="color: #4ABA6B;">€{{ netCost.toLocaleString() }}</div>
              <div class="p-sub-text mt-2">
                Recupero IRPEF/IRES in 10 anni.<br/>
                Investimento reale a carico dell'utente.
              </div>
            </div>
          </div>

          <div class="p-card mb-4">
            <div class="p-slabel" style="color: #C8A850; display: flex; align-items: center; gap: 8px;">
              <span>Flusso di Cassa e Rientro Economico</span>
              <button @click="showRoiModal = true" class="p-help-btn no-print" title="Spiegazione Calcolo ROI">?</button>
            </div>
            <div class="p-kpi-grid" style="grid-template-columns: repeat(4, 1fr); margin-top: 16px; background: #1A1D24; border-radius: 8px; border: 1px solid #232830;">
              <div class="p-kpi-cell" style="background: transparent;">
                <div class="p-kpi-lbl">Risparmio Diretto Bolletta</div>
                <div class="p-kpi-val">€{{ directSavings.toLocaleString(undefined, {maximumFractionDigits: 0}) }}/a</div>
                <div class="p-kpi-sub">Di cui <strong style="color: #E0E0E0;">€{{ batteryAdvantage.toLocaleString(undefined, {maximumFractionDigits: 0}) }}</strong> generati specificamente dall'accumulo.</div>
              </div>
              <div class="p-kpi-cell" style="background: transparent;">
                <div class="p-kpi-lbl">Pagamento GSE (Ritiro/SSP)</div>
                <div class="p-kpi-val">€{{ earnings.toLocaleString(undefined, {maximumFractionDigits: 0}) }}/a</div>
                <div class="p-kpi-sub">Valorizzazione energia in surplus immessa in rete pubblica (stima €{{ SSP_PRICE }}/kWh).</div>
              </div>
              <div class="p-kpi-cell" style="background: transparent;">
                <div class="p-kpi-lbl">Tempo di Payback</div>
                <div class="p-kpi-val" style="color: #4ABA6B;">{{ payback > 0 ? payback.toFixed(1) : '—' }} anni</div>
                <div class="p-kpi-sub">Tempo per azzerare l'investimento netto.</div>
              </div>
              <div class="p-kpi-cell" style="background: transparent;">
                <div class="p-kpi-lbl">ROI Globale (20 anni)</div>
                <div class="p-kpi-val" style="color: #4A8BBA;">{{ roi20 > 0 ? roi20.toFixed(0) : '—' }}%</div>
                <div class="p-kpi-sub">Rendimento atteso sul ciclo di vita.</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-show="tab === 'environment'" class="tab-content fade-in delay-1 print-section">
          <div class="p-card mb-4" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🌳</div>
            <div class="p-slabel" style="color: #4ABA6B; font-size: 14px;">Impatto Ecologico Annuo</div>
            <div style="font-family: 'Playfair Display', serif; font-size: 36px; color: #F0F2F5; margin-bottom: 8px;">
              {{ (annualProduction * 0.25).toLocaleString(undefined, {maximumFractionDigits: 0}) }} kg CO₂ evitati
            </div>
            <div class="p-sub-text" style="font-size: 14px;">
              Equivale a piantare circa <strong>{{ ((annualProduction * 0.25) / 20).toLocaleString(undefined, {maximumFractionDigits: 0}) }} alberi</strong> ogni anno.
            </div>
          </div>

          <div class="p-card">
            <div class="p-slabel">Dettaglio Tecnico Parametri Finanziari</div>
            <div class="p-table">
              <div class="p-tr"><span class="p-td-lbl">Costo Energia (Estratto AI)</span><span class="p-td-val">€{{ costoKwh.toFixed(3) }}/kWh</span></div>
              <div class="p-tr"><span class="p-td-lbl">Prezzo Ritiro GSE Stimato (PUN base)</span><span class="p-td-val">€{{ SSP_PRICE }}/kWh</span></div>
              <div class="p-tr"><span class="p-td-lbl">Costo Componente (Pannelli Scelti)</span><span class="p-td-val">€{{ selectedTech.costPerKwp }}/kWp</span></div>
              <div class="p-tr"><span class="p-td-lbl">Costo Struttura ({{ INSTALL_TYPES.find(t=>t.id===installType)?.label }})</span><span class="p-td-val">+€{{ installCostExtra }}/kWp</span></div>
              <div class="p-tr"><span class="p-td-lbl">Costo Componente (Batterie Litio)</span><span class="p-td-val">€{{ COST_PER_KWH_BAT }}/kWh</span></div>
              <div class="p-tr"><span class="p-td-lbl">Perdite Fisiche di Sistema (BOS + Cavi)</span><span class="p-td-val">{{ (SYSTEM_LOSSES * 100).toFixed(0) }}%</span></div>
            </div>
          </div>
        </div>

      </div>
      
      <div class="print-footer">
        <div class="pf-left"><span style="color: #C8A850; font-weight: bold; font-size: 14px;">E-surf</span></div>
        <div class="pf-center">dimensionamento stimato in base ai dati di consumo forniti</div>
        <div class="pf-right">{{ currentDate }} <span class="page-num"></span></div>
      </div>

    </div>

    <div v-if="showHelpModal" class="p-modal-overlay no-print" @click.self="showHelpModal = false">
      <div class="p-modal-content fade-in">
        <div class="p-modal-header">
          <h3 style="margin: 0; color: #F0F2F5; font-family: 'Space Mono', monospace; font-size: 14px;">Guida al Bilancio Energetico</h3>
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
            <p class="help-text" style="color: #4A8BBA; font-family: 'Space Mono', monospace; background: rgba(74, 139, 186, 0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(74, 139, 186, 0.3);">Produzione - (Autoconsumo Diretto + Ricarica Batteria)</p>
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
          <h3 style="margin: 0; color: #F0F2F5; font-family: 'Space Mono', monospace; font-size: 14px;">Calcolo Finanziario (ROI & Payback)</h3>
          <button @click="showRoiModal = false" class="p-modal-close">&times;</button>
        </div>
        <div class="p-modal-body">
          <div class="help-section">
            <h4 class="help-title">1. Beneficio Annuo (Flusso di Cassa)</h4>
            <p class="help-text">È il totale della ricchezza generata in un anno. Si ottiene sommando il <strong>Risparmio in Bolletta</strong> (i soldi che eviti di spendere) e il <strong>Guadagno GSE</strong> (i bonifici che ricevi per l'energia in surplus).</p>
          </div>
          <div class="help-section">
            <h4 class="help-title">2. Tempo di Payback</h4>
            <p class="help-text" style="color: #4A8BBA; font-family: 'Space Mono', monospace; background: rgba(74, 139, 186, 0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(74, 139, 186, 0.3);">Costo Netto Impianto ÷ Beneficio Annuo</p>
            <p class="help-text" style="margin-top: 12px;">Indica in quanti anni i risparmi e i guadagni generati dall'impianto ripagheranno completamente la spesa iniziale (già decurtata delle detrazioni fiscali).</p>
          </div>
          <div class="help-section">
            <h4 class="help-title">3. ROI (Ritorno sull'Investimento a 20 anni)</h4>
            <p class="help-text" style="color: #4ABA6B; font-family: 'Space Mono', monospace; background: rgba(74, 186, 107, 0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(74, 186, 107, 0.3);">[ (Beneficio Annuo × 20) - Costo Netto ] ÷ Costo Netto × 100</p>
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
import { ref, computed, onMounted, nextTick } from 'vue';
import axios from '@/services/axios';
import AuthService from '@/services/AuthService';
import GuideHeader from '@/components/layout/GuideHeader.vue';
import { extractAnalysisData } from '@/utils/analysisExtractor';

const loading = ref(true);
const entered = ref(false);
const tab = ref('dashboard');
const activeAddressName = ref('Caricamento...');

// Data Odierna per il Footer di stampa
const currentDate = ref(new Date().toLocaleDateString('it-IT'));

// Stati Modali di Aiuto
const showHelpModal = ref(false);
const showRoiModal = ref(false);

const printReport = () => {
  window.print();
};

// --- DATABASE TECNOLOGIE ---
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

const selectedTech = ref(PV_TECHS[3]); // Jinko Default
const COST_PER_KWH_BAT = 700;
const SSP_PRICE = 0.09; 
const TAX_DEDUCTION = 0.50;
const SYSTEM_LOSSES = 0.15;

const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' }, 
  { id: 'sizing', label: '📐 Dimensionamento' }, 
  { id: 'roi', label: '💶 Finanziario' },
  { id: 'environment', label: '🌱 Impatto' }
];

// --- NUOVI STATI PER ORIENTAMENTO E INSTALLAZIONE ---
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

// --- STATI DIMENSIONAMENTO ---
const pvKw = ref(4);
const battery = ref(0);

const arrF1 = ref(Array(12).fill(0));
const arrF2 = ref(Array(12).fill(0));
const arrF3 = ref(Array(12).fill(0));
const profileMonthlyProduction = ref([]); 
const refPower = ref(3); 
const costoKwh = ref(0.28);
const hasRealPvData = ref(false);

// --- FORNITURA DATA ---
const tariffPlan = ref('Non specificato');
const contractPower = ref('N/D');
const marketType = ref('Non specificato');
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

  let currentInc = 35;
  if (installType.value === 'falda') {
    currentInc = inclination.value;
  } else if (installType.value === 'piano') {
    currentInc = 10; 
  } else {
    currentInc = 30;
  }

  // Penalità empirica: ~0.5% per ogni grado di scarto dai 35° ottimali
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
  // Applica il fattore di de-rating per orientamento/inclinazione
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
const totalBatteryCovered = computed(() => monthlyTableData.value.reduce((a, b) => a + b.batCovered, 0));
const exportKwh = computed(() => monthlyTableData.value.reduce((a, b) => a + b.exported, 0));

const selfConsKwh = computed(() => monthlyTableData.value.reduce((a, b) => a + b.directCovered + b.batCovered, 0));
const totalSelfConsPct = computed(() => annualProduction.value > 0 ? (selfConsKwh.value / annualProduction.value) * 100 : 0);
const independencePct = computed(() => totalConsumption.value > 0 ? (selfConsKwh.value / totalConsumption.value) * 100 : 0);

// BENEFICI E ROI
const directSavings = computed(() => selfConsKwh.value * costoKwh.value);
const batteryAdvantage = computed(() => totalBatteryCovered.value * costoKwh.value);
const earnings = computed(() => exportKwh.value * SSP_PRICE);
const annualBenefit = computed(() => directSavings.value + earnings.value);

const grossCost = computed(() => (Number(pvKw.value) * (Number(selectedTech.value.costPerKwp) + installCostExtra.value)) + (Number(battery.value) * COST_PER_KWH_BAT));
const netCost = computed(() => grossCost.value * (1 - TAX_DEDUCTION));
const payback = computed(() => annualBenefit.value > 0 ? netCost.value / annualBenefit.value : 0);
const roi20 = computed(() => netCost.value > 0 ? ((annualBenefit.value * 20 - netCost.value) / netCost.value) * 100 : 0);

// --- GRAFICI ---
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
.pv-app-wrapper { background: #0A0C0E; min-height: 100vh; font-family: 'Inter', sans-serif; color: #F0F2F5; counter-reset: page; }
.p-header { background: #111317; padding: 26px 22px 0; position: relative; overflow: hidden; border-bottom: 1px solid #232830; }
.p-header-bg { position: absolute; inset: 0; opacity: 0.03; pointer-events: none; stroke: white; stroke-width: 0.5; }
.p-header-content { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; }
.p-kicker { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: #8A8B90; text-transform: uppercase; }
.p-title { font-size: 26px; font-weight: 400; margin: 0; }
.p-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: #2A2D35; border-radius: 6px; overflow: hidden; margin-top: 18px; }
.p-kpi-cell { background: #16181D; padding: 12px 14px; position: relative; }
.p-kpi-lbl { font-family: 'Space Mono', monospace; font-size: 8px; text-transform: uppercase; margin-bottom: 4px; }
.p-kpi-val { font-size: 18px; font-family: 'Space Mono', monospace; font-weight: 700; }
.p-kpi-sub { font-size: 9px; color: #5A5D65; margin-top: 4px; line-height: 1.3; }
.p-tabs { display: flex; gap: 4px; margin-top: 20px; }
.p-tab-btn { background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; padding: 12px 16px; font-family: 'Space Mono', monospace; font-size: 9px; color: #5A5D65; }
.p-tab-btn.active { border-bottom-color: #C8A850; color: #C8A850; }
.p-body { max-width: 860px; margin: 0 auto; padding: 24px 20px 80px; }
.p-card { background: #16181D; border-radius: 8px; padding: 20px; border: 1px solid #232830; }
.p-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.p-slabel { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #8A8B90; margin-bottom: 16px; }
.p-big-val { font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700; }
.p-sub-text { font-size: 12px; color: #8A8B90; line-height: 1.6; }
.p-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.p-info-box { background: rgba(255,255,255,0.03); border: 1px solid #232830; border-radius: 6px; padding: 12px; }
.p-info-lbl { font-size: 8px; color: #8A8B90; text-transform: uppercase; }
.p-info-val { font-size: 14px; font-weight: 600; }
.p-info-sub { font-size: 10px; color: #5A5D65; }
.p-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.p-chart-title { font-size: 10px; font-weight: 600; color: #A09880; }
.p-chart-legend { font-size: 8px; margin-bottom: 12px; display: flex; gap: 12px; }
.p-chart-container { width: 100%; border-top: 1px solid #232830; padding-top: 16px; }
.p-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.p-input-lbl { font-size: 9px; color: #8A8B90; text-transform: uppercase; }
.p-input-val { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
.p-slider { width: 100%; height: 4px; border-radius: 99px; background: #2A2D35; outline: none; -webkit-appearance: none; cursor: pointer; }
.p-bar-wrap { height: 6px; background: #232830; border-radius: 99px; overflow: hidden; margin-top: 12px; }
.p-bar-fill { height: 100%; transition: width 0.8s ease-out; }
.p-alert-box { background: rgba(200,168,80,0.05); border: 1px solid rgba(200,168,80,0.2); border-radius: 6px; padding: 12px; font-size: 12px; color: #A09880; margin-top: 20px; }
.spinner { width: 40px; height: 40px; border: 4px solid #232830; border-top: 4px solid #C8A850; border-radius: 50%; animation: spin 1s linear infinite; margin: auto; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* TABELLA MENSILE */
.p-table { display: flex; flex-direction: column; font-size: 10px; font-family: 'Space Mono', monospace; }
.p-tr-6 { display: grid; grid-template-columns: 0.8fr 1fr 1fr 1fr 1fr 1.2fr; padding: 10px 12px; border-bottom: 0.5px solid #232830; }
.p-tr-6:nth-child(even) { background: #1A1D24; }
.text-right { text-align: right; justify-content: flex-end; }
.p-td-lbl { color: #8A8B90; }
.p-td-val { font-weight: 700; color: #C8A850; }

/* MODAL FINTECH STYLE */
.p-help-btn {
  background: rgba(74, 139, 186, 0.1); border: 1px solid rgba(74, 139, 186, 0.3);
  color: #4A8BBA; border-radius: 50%; width: 18px; height: 18px; font-size: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; font-weight: bold;
}
.p-help-btn:hover { background: #4A8BBA; color: #16181D; }

.p-modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(10, 12, 14, 0.85); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.p-modal-content {
  background: #16181D; border: 1px solid #2A2D35; border-radius: 8px;
  width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.p-modal-header {
  padding: 16px 20px; border-bottom: 1px solid #232830;
  display: flex; justify-content: space-between; align-items: center;
}
.p-modal-close {
  background: none; border: none; color: #8A8B90; font-size: 24px; cursor: pointer; line-height: 1; padding: 0;
}
.p-modal-close:hover { color: #F0F2F5; }
.p-modal-body { padding: 20px; }
.help-section { margin-bottom: 20px; }
.help-section:last-child { margin-bottom: 0; }
.help-title { color: #C8A850; font-size: 12px; font-family: 'Space Mono', monospace; text-transform: uppercase; margin: 0 0 8px 0; }
.help-text { color: #A0A2A8; font-size: 13px; line-height: 1.6; margin: 0; font-family: 'Inter', sans-serif; }
.help-list { margin: 8px 0 0 20px; padding: 0; color: #A0A2A8; font-size: 13px; line-height: 1.6; font-family: 'Inter', sans-serif; }
.help-list li { margin-bottom: 6px; }
.help-list strong { color: #F0F2F5; }

/* PRINT FOOTER STYLE (Hidden on screen) */
.print-footer { display: none; }

/* REGOLE DI STAMPA PER REPORT UNICO */
@media print {
  body { background: #0A0C0E !important; padding-bottom: 40px !important; }
  .no-print { display: none !important; }
  .p-tabs { display: none !important; }
  .print-section { 
    display: block !important; 
    opacity: 1 !important; 
    page-break-inside: avoid; 
    margin-bottom: 40px; 
  }
  .pv-app-wrapper { 
    background: #0A0C0E !important; 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
  }
  .p-card { 
    page-break-inside: avoid; 
    break-inside: avoid;
    border: 1px solid #232830 !important;
  }
  .p-body { 
    padding: 0 !important; 
    margin: 0 !important; 
    max-width: 100% !important; 
  }
  .p-slider { display: none !important; }
  .p-select { appearance: none; -webkit-appearance: none; border: none; padding: 0; }

  /* FOOTER STAMPA IN BASSO */
  .print-footer {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    color: #8A8B90;
    padding: 10px 20px;
    background: #0A0C0E;
    border-top: 1px solid #232830;
    z-index: 9999;
  }
  .page-num::after {
    content: " - Pag. " counter(page);
  }
}

@media (max-width: 600px) { 
  .p-kpi-grid { grid-template-columns: repeat(2, 1fr); } 
  .p-grid-4, .p-charts-grid, .p-input-row, .p-card-grid { grid-template-columns: 1fr; } 
  .p-tr-6 { font-size: 8px; grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr; padding: 8px; }
}
</style>
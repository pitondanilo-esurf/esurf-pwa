<template>
  <div class="app-container">
    
    <header class="top-bar fade-in delay-0" style="margin-bottom: 2rem;">
      <button class="back-btn" @click="router.back()" aria-label="Torna indietro" style="margin-bottom: 1rem;">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <div class="header-titles">
        <h1>Simulatore Business Model ESCO</h1>
        <p class="subtitle">Calcola il ROI confrontando i ricavi da sblocco lead (Upfront) e le commissioni di successo (Success Fee).</p>
      </div>
    </header>

    <main class="main-content fade-in delay-1">
      <div class="dashboard-grid">
        
        <section class="controls-section card">
          <h2 class="card-title">Parametri di Simulazione</h2>
          
          <div class="control-group">
            <div class="control-header">
              <label>Valore Medio Progetto (€)</label>
              <span class="val-display">{{ formatCurrency(valoreMedio) }}</span>
            </div>
            <input type="range" v-model.number="valoreMedio" min="5000" max="500000" step="1000" class="slider" />
            <p class="help-text">Valore stimato del contratto ESCO (es. PPA o Relamping)</p>
          </div>

          <div class="control-group">
            <div class="control-header">
              <label>Lead Generati al Mese</label>
              <span class="val-display">{{ leadMensili }}</span>
            </div>
            <input type="range" v-model.number="leadMensili" min="10" max="1000" step="10" class="slider" />
            <p class="help-text">Numero di aziende scoperte dall'algoritmo</p>
          </div>

          <div class="control-group">
            <div class="control-header">
              <label>Costo Sblocco Lead (€)</label>
              <span class="val-display">{{ formatCurrency(costoSblocco) }}</span>
            </div>
            <input type="range" v-model.number="costoSblocco" min="0" max="200" step="5" class="slider" />
            <p class="help-text">Quanto paga l'ESCO upfront per vedere i dati in chiaro</p>
          </div>

          <div class="control-group highlight-control">
            <div class="control-header">
              <label>Tasso di Conversione ESCO (%)</label>
              <span class="val-display">{{ tassoConversione }}%</span>
            </div>
            <input type="range" v-model.number="tassoConversione" min="1" max="50" step="1" class="slider" />
            <p class="help-text">Percentuale di lead che diventano contratti firmati</p>
          </div>

          <div class="control-group highlight-control">
            <div class="control-header">
              <label>Success Fee Piattaforma (%)</label>
              <span class="val-display">{{ successFee }}%</span>
            </div>
            <input type="range" v-model.number="successFee" min="0.5" max="15" step="0.5" class="slider" />
            <p class="help-text">La tua provvigione sul contratto chiuso</p>
          </div>
        </section>

        <section class="results-section">
          
          <div class="kpi-grid">
            <div class="kpi-card glass">
              <h3>Contratti Mensili</h3>
              <div class="value neutral">{{ contrattiChiusi.toFixed(1) }}</div>
              <p class="kpi-sub">su {{ leadMensili }} lead forniti</p>
            </div>
            <div class="kpi-card glass highlight-total">
              <h3>Fatturato Totale Stimato</h3>
              <div class="value total">{{ formatCurrency(fatturatoTotale) }}</div>
              <p class="kpi-sub">Al mese, per questi lead</p>
            </div>
          </div>

          <div class="comparison-card card mt-4">
            <h2 class="card-title">Confronto Flussi di Cassa</h2>
            
            <div class="bar-chart-container">
              <div class="chart-row">
                <div class="chart-label">
                  <span>Ricavi Upfront (Garantiti)</span>
                  <strong>{{ formatCurrency(fatturatoUpfront) }}</strong>
                </div>
                <div class="bar-track">
                  <div class="bar-fill bg-blue" :style="{ width: upfrontWidth + '%' }"></div>
                </div>
              </div>
              
              <div class="chart-row">
                <div class="chart-label">
                  <span>Ricavi Success Fee (Performance)</span>
                  <strong class="text-green">{{ formatCurrency(fatturatoSuccessFee) }}</strong>
                </div>
                <div class="bar-track">
                  <div class="bar-fill bg-green" :style="{ width: successFeeWidth + '%' }"></div>
                </div>
              </div>
            </div>

            <div class="insight-box mt-4">
              <div class="insight-icon">💡</div>
              <p v-if="fatturatoSuccessFee > fatturatoUpfront * 5">
                Il modello a <strong>Success Fee</strong> genera profitti massicci. Puoi permetterti di abbassare il "Costo Sblocco Lead" per attirare più ESCO.
              </p>
              <p v-else-if="fatturatoUpfront > fatturatoSuccessFee">
                Attualmente stai guadagnando di più dalla vendita dei lead base. Ottimo per il flusso di cassa immediato, ma potresti alzare la Success Fee.
              </p>
              <p v-else>
                Modello bilanciato: i ricavi Upfront coprono i costi, le Success Fee generano l'utile puro.
              </p>
            </div>
          </div>

        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- STATE (Valori di default dalla discussione) ---
const valoreMedio = ref(50000);
const leadMensili = ref(100);
const costoSblocco = ref(30);
const tassoConversione = ref(5);
const successFee = ref(5);

// --- COMPUTED: LOGICA DI CALCOLO ---
const contrattiChiusi = computed(() => {
  return (leadMensili.value * tassoConversione.value) / 100;
});

const fatturatoUpfront = computed(() => {
  return leadMensili.value * costoSblocco.value;
});

const fatturatoSuccessFee = computed(() => {
  return contrattiChiusi.value * valoreMedio.value * (successFee.value / 100);
});

const fatturatoTotale = computed(() => {
  return fatturatoUpfront.value + fatturatoSuccessFee.value;
});

// Calcoli per le barre percentuali del grafico visivo
const upfrontWidth = computed(() => {
  if (fatturatoTotale.value === 0) return 0;
  return (fatturatoUpfront.value / fatturatoTotale.value) * 100;
});

const successFeeWidth = computed(() => {
  if (fatturatoTotale.value === 0) return 0;
  return (fatturatoSuccessFee.value / fatturatoTotale.value) * 100;
});

// --- UTILS ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
};
</script>

<style scoped>
/* Layout Base */
.app-container { padding: 2rem; max-width: 1200px; margin: 0 auto; color: var(--text-main); }
.dashboard-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
.card { background: var(--bg-card); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.card-title { margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
.mt-4 { margin-top: 1.5rem; }

/* Controlli */
.controls-section { display: flex; flex-direction: column; gap: 1.5rem; }
.control-group { display: flex; flex-direction: column; gap: 0.5rem; }
.control-header { display: flex; justify-content: space-between; align-items: center; }
.control-header label { font-weight: 600; font-size: 0.95rem; }
.val-display { font-weight: 800; color: var(--accent-blue); background: rgba(59, 130, 246, 0.1); padding: 4px 10px; border-radius: 8px; }
.help-text { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
.highlight-control { padding: 1rem; background: rgba(16, 185, 129, 0.05); border-radius: 12px; border: 1px dashed rgba(16, 185, 129, 0.3); }
.highlight-control .val-display { color: #10b981; background: rgba(16, 185, 129, 0.1); }

/* Slider Styling Moderno */
.slider { -webkit-appearance: none; width: 100%; height: 6px; border-radius: 3px; background: var(--border-color); outline: none; margin: 10px 0; }
.slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--accent-blue); cursor: pointer; transition: transform 0.1s; }
.slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
.highlight-control .slider::-webkit-slider-thumb { background: #10b981; }

/* KPI Grid */
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.kpi-card { padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color); background: var(--bg-card); display: flex; flex-direction: column; justify-content: center; }
.kpi-card h3 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.kpi-card .value { font-size: 2.5rem; font-weight: 800; line-height: 1; margin-bottom: 0.5rem; }
.neutral { color: var(--text-main); }
.total { color: var(--accent-blue); }
.kpi-sub { margin: 0; font-size: 0.85rem; color: var(--text-muted); }
.highlight-total { background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.0) 100%); border-color: rgba(59, 130, 246, 0.3); }

/* Grafico a barre in CSS */
.bar-chart-container { display: flex; flex-direction: column; gap: 1.5rem; }
.chart-row { display: flex; flex-direction: column; gap: 0.5rem; }
.chart-label { display: flex; justify-content: space-between; font-size: 1rem; font-weight: 600; }
.text-green { color: #10b981; }
.bar-track { width: 100%; height: 24px; background: var(--bg-app); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); }
.bar-fill { height: 100%; border-radius: 12px; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.bg-blue { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.bg-green { background: linear-gradient(90deg, #10b981, #34d399); }

/* Insight Box */
.insight-box { display: flex; gap: 12px; padding: 1rem; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; }
.insight-icon { font-size: 1.5rem; }
.insight-box p { margin: 0; font-size: 0.95rem; line-height: 1.4; color: var(--text-main); }

/* Utility */
.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0; }
.delay-0 { animation-delay: 0.1s; }
.delay-1 { animation-delay: 0.2s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Header Utilities (riprese dal tuo stile standard) */
.back-btn { background: none; border: none; color: var(--text-main); cursor: pointer; display: flex; padding: 0; transition: transform 0.2s; }
.back-btn:hover { transform: translateX(-4px); }
.top-bar h1 { margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
.subtitle { margin: 5px 0 0 0; color: var(--text-muted); font-size: 1rem; }

@media (max-width: 900px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>
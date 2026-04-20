<template>
  <div class="app-container">
    
    <GuideHeader :isLightMode="isLightMode" backRoute="/owner/dashboard" />

    <main class="main-content bills-container fade-in delay-0">
        
        <div class="section-card mb-4" v-if="communityInfo">
          
          <div class="header-titles" style="margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px dashed var(--border-color);">
              <h2 style="margin:0; font-size: 2rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em;">
                  {{ $t('ownerDashboard.actions.historyBills', 'Storico Bollette Community') }}
              </h2>
              <p style="margin: 5px 0 0 0; color: var(--text-muted); font-size: 1rem;">
                  {{ $t('ownerDashboard.actions.historyBillsDesc', 'Visualizza e filtra i documenti analizzati dall\'Intelligenza Artificiale') }}
              </p>
              
              <div class="community-info-badge fade-in" style="margin-top: 12px;">
                  <span class="badge-icon">🏢</span>
                  <span>Community: <strong>{{ communityInfo.name }}</strong> (ID: {{ communityInfo.id }})</span>
              </div>
          </div>

          <h3 style="margin: 0 0 1.5rem 0; font-size: 1.1rem; color: var(--text-main); font-weight: 700;">Filtra Risultati</h3>
          
          <div class="filters-grid">
            <div class="input-group">
              <label>Tipo Fornitura</label>
              <select v-model="filters.type" class="compact-input">
                <option value="">Tutti i tipi</option>
                <option value="energia_elettrica">Energia Elettrica</option>
                <option value="gas">Gas</option>
                <option value="acqua">Acqua</option>
              </select>
            </div>

            <div class="input-group">
              <label>Periodo</label>
              <select v-model="filters.period" class="compact-input" :disabled="loadingPeriods">
                <option value="">{{ loadingPeriods ? 'Caricamento...' : 'Tutti i periodi' }}</option>
                <option v-for="p in availablePeriods" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>

            <div class="input-group">
              <label>Data Bolletta (Da)</label>
              <input type="date" v-model="filters.date_from" class="compact-input">
            </div>

            <div class="input-group">
              <label>Data Bolletta (A)</label>
              <input type="date" v-model="filters.date_to" class="compact-input">
            </div>
          </div>

          <div class="filters-actions">
            
            <div class="logic-selector">
              <span>Applica filtri in logica:</span>
              <div class="logic-toggle">
                <button @click="filters.logic = 'AND'" :class="['logic-btn', { active: filters.logic === 'AND' }]">AND (Tutte)</button>
                <button @click="filters.logic = 'OR'" :class="['logic-btn', { active: filters.logic === 'OR' }]">OR (Almeno una)</button>
              </div>
            </div>

            <div class="action-buttons">
              <button @click="openExportModal" class="btn-secondary flex items-center gap-2" :disabled="bills.length === 0">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Esporta
              </button>
              <button @click="resetFilters" class="btn-secondary">Azzera</button>
              <button @click="fetchBills" class="btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-small"></span>
                Cerca Bollette
              </button>
            </div>
          </div>
        </div>

        <div class="section-card" v-if="communityInfo">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Codice POD/PDR</th>
                  <th>Tipo (Clicca per Report)</th>
                  <th>Periodo</th>
                  <th>Data Bolletta</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="4" class="empty-state">
                    <div class="spinner"></div>
                    <p>Caricamento in corso...</p>
                  </td>
                </tr>
                <tr v-else-if="bills.length === 0">
                  <td colspan="4" class="empty-state">Nessuna bolletta trovata.</td>
                </tr>
                <tr v-for="bill in bills" :key="bill.id">
                  <td class="code-cell">{{ bill.pod_code }}</td>
                  <td>
                      <button @click="openAiModal(bill)" :class="['type-badge-btn', getTypeBadgeClass(bill.type)]" title="Visualizza Report AI">
                          {{ formatType(bill.type) }} 🔍
                      </button>
                  </td>
                  <td>{{ bill.period || 'N/D' }}</td>
                  <td><span class="date-chip">{{ formatDate(bill.bill_date) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    </main>

    <div v-if="showExportModal" class="modal-overlay fade-in">
      <div class="modal-content section-card">
        <div class="modal-header">
            <h3>Anteprima Esportazione CSV</h3>
            <button @click="showExportModal = false" class="close-btn">&times;</button>
        </div>
        
        <p class="modal-desc">
            Verranno esportati <strong>{{ exportData.length }}</strong> record basati sui filtri attuali.
            <span v-if="filters.type === 'energia_elettrica'" class="text-accent"> (Formato Esteso Energia Elettrica)</span>
            <span v-else-if="filters.type === 'gas'" class="text-accent"> (Formato Esteso Gas)</span>
            <span v-else-if="filters.type === 'acqua'" class="text-accent"> (Formato Esteso Acqua)</span>
        </p>

        <div class="table-container preview-table">
          <table>
            <thead>
              <tr>
                <th v-for="col in exportColumns" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in exportData" :key="idx">
                <td v-for="col in exportColumns" :key="col">{{ row[col] }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-actions">
          <button @click="showExportModal = false" class="btn-secondary">Annulla</button>
          <button @click="downloadCsv" class="btn-primary">Conferma e Scarica</button>
        </div>
      </div>
    </div>

    <PodAiModal 
        :show="showAiModal" 
        :aiData="selectedAiData" 
        @close="showAiModal = false" 
    />
    <PdrAiModal 
        :show="showPdrAiModal" 
        :aiData="selectedAiData" 
        @close="showPdrAiModal = false" 
    />
    <WaterAiModal 
        :show="showWaterAiModal" 
        :aiData="selectedAiData" 
        @close="showWaterAiModal = false" 
    />

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from '@/services/axios'; 
import CommunityService from '@/services/CommunityService'; 
import GuideHeader from '@/components/layout/GuideHeader.vue'; 

// Importa i componenti Modali
import PodAiModal from '@/components/pods/PodAiModal.vue';
import PdrAiModal from '@/components/pods/PdrAiModal.vue';
import WaterAiModal from '@/components/pods/WaterAiModal.vue';

const isLightMode = ref(false); 

const bills = ref([]);
const communityInfo = ref(null);
const loadingInit = ref(true); 
const loading = ref(false);    

const availablePeriods = ref([]);
const loadingPeriods = ref(false);

const filters = ref({
  type: '',
  period: '',
  date_from: '',
  date_to: '',
  logic: 'AND' 
});

const showExportModal = ref(false);
const exportData = ref([]);
const exportColumns = ref([]);

// Variabili per la gestione delle Modali AI
const showAiModal = ref(false);
const showPdrAiModal = ref(false);
const showWaterAiModal = ref(false);
const selectedAiData = ref(null);

onMounted(async () => {
    const savedTheme = localStorage.getItem('theme');
    isLightMode.value = savedTheme === 'light';
    if (isLightMode.value) document.body.classList.add('light-mode');

    await loadCommunity();
    if (communityInfo.value && communityInfo.value.id) {
        await fetchPeriods(); 
        await fetchBills();
    }
});

watch(() => filters.value.type, async () => {
    if (communityInfo.value) {
        filters.value.period = ''; 
        await fetchPeriods();
    }
});

const loadCommunity = async () => {
    try {
        const commRes = await CommunityService.getMyCommunity();
        if (commRes.data) {
            if (Array.isArray(commRes.data)) {
                if (commRes.data.length > 0) communityInfo.value = commRes.data[0];
            } else if (commRes.data.id) {
                communityInfo.value = commRes.data;
            }
        }
    } catch (e) {
        console.error("Errore nel caricamento della community", e);
    } finally {
        loadingInit.value = false;
    }
};

const fetchPeriods = async () => {
    loadingPeriods.value = true;
    try {
        const params = { community_id: communityInfo.value.id, type: filters.value.type };
        const response = await axios.get('/api/owner/community-bills/periods', { params });
        availablePeriods.value = response.data;
    } catch (error) {
        console.error("Errore nel caricamento dei periodi:", error);
    } finally {
        loadingPeriods.value = false;
    }
};

const fetchBills = async () => {
  loading.value = true;
  try {
    const params = { ...filters.value, community_id: communityInfo.value.id };
    const response = await axios.get('/api/owner/community-bills', { params });
    
    if (response.data.bills) {
        bills.value = response.data.bills.data || response.data.bills;
    } else {
        bills.value = response.data.data || response.data;
    }
  } catch (error) {
    console.error("Errore:", error);
    alert("Errore durante il caricamento delle bollette.");
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = { type: '', period: '', date_from: '', date_to: '', logic: 'AND' };
  fetchPeriods(); 
  fetchBills();
};

/* =========================================================
   APERTURA MODALE AI
========================================================= */
const openAiModal = (bill) => {
    let parsedData = bill.ai_analysis;
    
    // Assicuriamoci che i dati siano un oggetto JSON
    if (typeof parsedData === 'string') {
        try {
            parsedData = JSON.parse(parsedData);
        } catch (e) {
            console.error("Errore nel parsing ai_analysis", e);
            parsedData = {};
        }
    }
    
    selectedAiData.value = parsedData;

    // Apri la modale corrispondente al tipo
    if (bill.type === 'energia_elettrica') {
        showAiModal.value = true;
    } else if (bill.type === 'gas') {
        showPdrAiModal.value = true;
    } else if (bill.type === 'acqua') {
        showWaterAiModal.value = true;
    }
};

/* =========================================================
   LOGICA ESPORTAZIONE
========================================================= */

const sumJsonValues = (data) => {
    let sum = 0;
    if (data === null || data === undefined || data === '') return ''; 
    
    if (typeof data === 'number') return data;
    
    if (typeof data === 'string') {
        const parsed = parseFloat(data.replace(',', '.'));
        if (!isNaN(parsed)) return parsed;
        return '';
    }
    
    if (Array.isArray(data)) {
        for (let item of data) sum += Number(sumJsonValues(item)) || 0;
    } else if (typeof data === 'object') {
        for (let key in data) sum += Number(sumJsonValues(data[key])) || 0;
    }
    
    return sum;
};

const getMonthSum = (aiData, monthName) => {
    const fasce = aiData['last year_fasce'] || aiData['last_year_fasce'] || {};
    const monthData = fasce[monthName];
    return monthData !== undefined ? sumJsonValues(monthData) : '';
};

const openExportModal = () => {
    exportData.value = [];
    exportColumns.value = [];

    // CASO 1: Energia Elettrica
    if (filters.value.type === 'energia_elettrica') {
        exportColumns.value = [
            'pod_id', 'user_type', 'exact_usage_type', 'DSO', 'utility', 
            'contract_type', 'price_type', 'end_date', 'committed_power_kw', 
            'consumption_bands_F1', 'consumption_bands_F2', 'consumption_bands_F3', 'consumption_bands_total_annual', 
            'last_year_gennaio', 'last_year_febbraio', 'last_year_marzo', 'last_year_aprile', 'last_year_maggio', 
            'last_year_giugno', 'last_year_luglio', 'last_year_agosto', 'last_year_settembre', 
            'last_year_ottobre', 'last_year_novembre', 'last_year_dicembre'
        ];
        
        exportData.value = bills.value.map(bill => {
            let aiData = {};
            if (typeof bill.ai_analysis === 'string') {
                try { aiData = JSON.parse(bill.ai_analysis); } catch (e) {}
            } else if (typeof bill.ai_analysis === 'object' && bill.ai_analysis !== null) {
                aiData = bill.ai_analysis;
            }

            const bands = aiData.consumption_bands || {};
            const getBand = (b) => bands[b.toLowerCase()] || bands[b.toUpperCase()] || '';

            return {
                'pod_id': aiData.pod_id || bill.pod_code || '',
                'user_type': aiData.user_type || '',
                'exact_usage_type': aiData.exact_usage_type || '',
                'DSO': aiData.DSO || '',
                'utility': aiData.utility || '',
                'contract_type': aiData.contract_type || '',
                'price_type': aiData.price_type || '',
                'end_date': aiData.end_date || '',
                'committed_power_kw': aiData.committed_power_kw || '',
                'consumption_bands_F1': getBand('f1'),
                'consumption_bands_F2': getBand('f2'),
                'consumption_bands_F3': getBand('f3'),
                'consumption_bands_total_annual': bands.total_annual || aiData.consumption_bands_total_annual || '',
                'last_year_gennaio': getMonthSum(aiData, 'gennaio'),
                'last_year_febbraio': getMonthSum(aiData, 'febbraio'),
                'last_year_marzo': getMonthSum(aiData, 'marzo'),
                'last_year_aprile': getMonthSum(aiData, 'aprile'),
                'last_year_maggio': getMonthSum(aiData, 'maggio'),
                'last_year_giugno': getMonthSum(aiData, 'giugno'),
                'last_year_luglio': getMonthSum(aiData, 'luglio'),
                'last_year_agosto': getMonthSum(aiData, 'agosto'),
                'last_year_settembre': getMonthSum(aiData, 'settembre'),
                'last_year_ottobre': getMonthSum(aiData, 'ottobre'),
                'last_year_novembre': getMonthSum(aiData, 'novembre'),
                'last_year_dicembre': getMonthSum(aiData, 'dicembre')
            };
        });
    } 
    // CASO 2: Gas
    else if (filters.value.type === 'gas') {
        exportColumns.value = [
            'pdr_id', 'customer_name', 'fiscal_code_or_vat', 'user_type', 'usage_type',
            'DSO', 'utility', 'contract_type', 'price_type', 'end_date',
            'meter_class', 'meter_type', 'coefficient_c', 'pcs',
            'consumption_annual_smc', 'consumption_period_smc',
            'cost_total_amount', 'average_unit_cost_smc',
            'last_year_gennaio', 'last_year_febbraio', 'last_year_marzo', 'last_year_aprile',
            'last_year_maggio', 'last_year_giugno', 'last_year_luglio', 'last_year_agosto',
            'last_year_settembre', 'last_year_ottobre', 'last_year_novembre', 'last_year_dicembre'
        ];

        exportData.value = bills.value.map(bill => {
            let aiData = {};
            if (typeof bill.ai_analysis === 'string') {
                try { aiData = JSON.parse(bill.ai_analysis); } catch (e) {}
            } else if (typeof bill.ai_analysis === 'object' && bill.ai_analysis !== null) {
                aiData = bill.ai_analysis;
            }

            const consumption = aiData.consumption || {};
            const payment = aiData.payment || {};
            const lastYear = aiData.last_year_monthly_smc || {};

            return {
                'pdr_id': aiData.pdr_id || bill.pod_code || '',
                'customer_name': aiData.customer_name || '',
                'fiscal_code_or_vat': aiData.fiscal_code_or_vat || '',
                'user_type': aiData.user_type || '',
                'usage_type': aiData.usage_type || '',
                'DSO': aiData.DSO || '',
                'utility': aiData.utility || '',
                'contract_type': aiData.contract_type || '',
                'price_type': aiData.price_type || '',
                'end_date': aiData.end_date || '',
                'meter_class': aiData.meter_class || '',
                'meter_type': aiData.meter_type || '',
                'coefficient_c': aiData.coefficient_c !== undefined && aiData.coefficient_c !== null ? String(aiData.coefficient_c).replace('.', ',') : '',
                'pcs': aiData.pcs !== undefined && aiData.pcs !== null ? String(aiData.pcs).replace('.', ',') : '',
                'consumption_annual_smc': consumption.annual_smc !== undefined && consumption.annual_smc !== null ? String(consumption.annual_smc).replace('.', ',') : '',
                'consumption_period_smc': consumption.period_smc !== undefined && consumption.period_smc !== null ? String(consumption.period_smc).replace('.', ',') : '',
                'cost_total_amount': payment.total_amount !== undefined && payment.total_amount !== null ? String(payment.total_amount).replace('.', ',') : '',
                'average_unit_cost_smc': aiData.average_unit_cost_smc !== undefined && aiData.average_unit_cost_smc !== null ? String(aiData.average_unit_cost_smc).replace('.', ',') : '',
                'last_year_gennaio': lastYear.gennaio !== undefined && lastYear.gennaio !== null ? String(lastYear.gennaio).replace('.', ',') : '',
                'last_year_febbraio': lastYear.febbraio !== undefined && lastYear.febbraio !== null ? String(lastYear.febbraio).replace('.', ',') : '',
                'last_year_marzo': lastYear.marzo !== undefined && lastYear.marzo !== null ? String(lastYear.marzo).replace('.', ',') : '',
                'last_year_aprile': lastYear.aprile !== undefined && lastYear.aprile !== null ? String(lastYear.aprile).replace('.', ',') : '',
                'last_year_maggio': lastYear.maggio !== undefined && lastYear.maggio !== null ? String(lastYear.maggio).replace('.', ',') : '',
                'last_year_giugno': lastYear.giugno !== undefined && lastYear.giugno !== null ? String(lastYear.giugno).replace('.', ',') : '',
                'last_year_luglio': lastYear.luglio !== undefined && lastYear.luglio !== null ? String(lastYear.luglio).replace('.', ',') : '',
                'last_year_agosto': lastYear.agosto !== undefined && lastYear.agosto !== null ? String(lastYear.agosto).replace('.', ',') : '',
                'last_year_settembre': lastYear.settembre !== undefined && lastYear.settembre !== null ? String(lastYear.settembre).replace('.', ',') : '',
                'last_year_ottobre': lastYear.ottobre !== undefined && lastYear.ottobre !== null ? String(lastYear.ottobre).replace('.', ',') : '',
                'last_year_novembre': lastYear.novembre !== undefined && lastYear.novembre !== null ? String(lastYear.novembre).replace('.', ',') : '',
                'last_year_dicembre': lastYear.dicembre !== undefined && lastYear.dicembre !== null ? String(lastYear.dicembre).replace('.', ',') : ''
            };
        });
    }
    // CASO 3: Acqua
    else if (filters.value.type === 'acqua') {
        exportColumns.value = [
            'pdp_id', 'customer_name', 'fiscal_code_or_vat', 'user_type', 'usage_type',
            'provider', 'contract_code', 'tariff_type', 'meter_serial', 'meter_type',
            'components_num', 'consumption_annual_mc', 'consumption_period_mc', 'consumption_reference_volume_mc',
            'cost_acquedotto', 'cost_fognatura', 'cost_depurazione', 'cost_quote_fisse',
            'cost_oneri_perequazione', 'cost_imposte_iva', 'cost_total_amount'
        ];

        exportData.value = bills.value.map(bill => {
            let aiData = {};
            if (typeof bill.ai_analysis === 'string') {
                try { aiData = JSON.parse(bill.ai_analysis); } catch (e) {}
            } else if (typeof bill.ai_analysis === 'object' && bill.ai_analysis !== null) {
                aiData = bill.ai_analysis;
            }

            const consumption = aiData.consumption || {};
            const payment = aiData.payment || {};
            const costBreakdown = aiData.cost_breakdown || {};

            return {
                'pdp_id': aiData.pdp_id || bill.pod_code || '',
                'customer_name': aiData.customer_name || '',
                'fiscal_code_or_vat': aiData.fiscal_code_or_vat || '',
                'user_type': aiData.user_type || '',
                'usage_type': aiData.usage_type || '',
                'provider': aiData.provider || '',
                'contract_code': aiData.contract_code || '',
                'tariff_type': aiData.tariff_type || '',
                'meter_serial': aiData.meter_serial || '',
                'meter_type': aiData.meter_type || '',
                'components_num': aiData.components_num !== undefined && aiData.components_num !== null ? String(aiData.components_num) : '',
                'consumption_annual_mc': consumption.annual_mc !== undefined && consumption.annual_mc !== null ? String(consumption.annual_mc).replace('.', ',') : '',
                'consumption_period_mc': consumption.period_mc !== undefined && consumption.period_mc !== null ? String(consumption.period_mc).replace('.', ',') : '',
                'consumption_reference_volume_mc': consumption.reference_volume_mc !== undefined && consumption.reference_volume_mc !== null ? String(consumption.reference_volume_mc).replace('.', ',') : '',
                'cost_acquedotto': costBreakdown.acquedotto !== undefined && costBreakdown.acquedotto !== null ? String(costBreakdown.acquedotto).replace('.', ',') : '',
                'cost_fognatura': costBreakdown.fognatura !== undefined && costBreakdown.fognatura !== null ? String(costBreakdown.fognatura).replace('.', ',') : '',
                'cost_depurazione': costBreakdown.depurazione !== undefined && costBreakdown.depurazione !== null ? String(costBreakdown.depurazione).replace('.', ',') : '',
                'cost_quote_fisse': costBreakdown.quote_fisse !== undefined && costBreakdown.quote_fisse !== null ? String(costBreakdown.quote_fisse).replace('.', ',') : '',
                'cost_oneri_perequazione': costBreakdown.oneri_perequazione !== undefined && costBreakdown.oneri_perequazione !== null ? String(costBreakdown.oneri_perequazione).replace('.', ',') : '',
                'cost_imposte_iva': costBreakdown.imposte_iva !== undefined && costBreakdown.imposte_iva !== null ? String(costBreakdown.imposte_iva).replace('.', ',') : '',
                'cost_total_amount': payment.total_amount !== undefined && payment.total_amount !== null ? String(payment.total_amount).replace('.', ',') : ''
            };
        });
    }
    // CASO 4: Generale (Tutti i tipi misti)
    else {
        exportColumns.value = ['Codice POD/PDR', 'Tipo Fornitura', 'Periodo', 'Data Bolletta', 'Costo Analisi'];
        
        exportData.value = bills.value.map(bill => ({
            'Codice POD/PDR': bill.pod_code,
            'Tipo Fornitura': formatType(bill.type),
            'Periodo': bill.period || '',
            'Data Bolletta': formatDate(bill.bill_date),
            'Costo Analisi': bill.cost ? `$ ${Number(bill.cost).toFixed(6)}` : ''
        }));
    }

    showExportModal.value = true;
};

const downloadCsv = () => {
    if (exportData.value.length === 0) return;

    let csvContent = exportColumns.value.join(';') + '\n';

    exportData.value.forEach(row => {
        const rowString = exportColumns.value.map(col => {
            let cellValue = row[col] !== null && row[col] !== undefined && row[col] !== '' ? String(row[col]) : '';
            cellValue = cellValue.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '');
            return cellValue === '' ? '' : `"${cellValue}"`;
        }).join(';');
        csvContent += rowString + '\n';
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `esportazione_${filters.value.type || 'generale'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showExportModal.value = false;
};

/* =========================================================
   UTILS DI FORMATTAZIONE
========================================================= */
const formatType = (type) => {
  if (!type) return 'N/D';
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'energia_elettrica': return 'badge-luce';
    case 'gas': return 'badge-gas';
    case 'acqua': return 'badge-acqua';
    default: return 'badge-default';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/D';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};
</script>

<style scoped>
/* CONTENITORE PRINCIPALE E UTILS */
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 1rem 1.5rem 4rem 1.5rem; max-width: 1000px; margin: 0 auto; }
.bills-container { width: 100%; }
.mb-4 { margin-bottom: 1.5rem; }

/* HEADER CUSTOM E BOTTONI */
.btn-ghost-small { background: var(--bg-card); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; color: var(--text-muted); transition: 0.2s; }
.btn-ghost-small:hover { color: var(--text-main); border-color: var(--text-main); }

/* BADGE COMMUNITY */
.community-info-badge { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(59, 130, 246, 0.2); }
.community-error-badge { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(239, 68, 68, 0.2); font-weight: 600; }

/* SEZIONE CARD */
.section-card { background: var(--bg-card); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color); }
.section-card h3 { margin: 0 0 1.5rem 0; font-size: 1.1rem; color: var(--text-main); font-weight: 700; }

/* FILTRI E INPUT */
.filters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.2rem; margin-bottom: 1.5rem; }
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
.compact-input { width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-app); color: var(--text-main); font-size: 0.95rem; transition: 0.2s; }
.compact-input:focus { border-color: var(--accent-blue); outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.compact-input:disabled { opacity: 0.6; cursor: not-allowed; }

/* AZIONI DEI FILTRI */
.filters-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px dashed var(--border-color); flex-wrap: wrap; gap: 1rem; }
.logic-selector { display: flex; align-items: center; gap: 12px; }
.logic-selector span { font-size: 0.9rem; font-weight: 500; color: var(--text-main); }
.logic-toggle { display: inline-flex; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
.logic-btn { background: transparent; border: none; padding: 6px 14px; color: var(--text-muted); font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
.logic-btn.active { background: var(--accent-blue); color: white; }

.action-buttons { display: flex; gap: 12px; }
.btn-primary { display: flex; align-items: center; gap: 8px; background: var(--accent-blue); color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; transition: 0.2s; }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-secondary { background: var(--bg-app); color: var(--text-main); padding: 10px 20px; border-radius: 8px; font-weight: 600; border: 1px solid var(--border-color); cursor: pointer; transition: 0.2s; display: flex; align-items: center;}
.btn-secondary:hover:not(:disabled) { border-color: var(--accent-blue); color: var(--accent-blue); }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

/* TABELLA CUSTOM E BOTTONI BADGE */
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: 12px 16px; border-bottom: 2px solid var(--border-color); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
td { padding: 16px; border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.95rem; font-weight: 500; transition: background-color 0.2s; }
tr:hover td { background-color: var(--bg-app); }
tr:last-child td { border-bottom: none; }
.code-cell { color: var(--text-main); font-weight: 700; letter-spacing: 0.5px; }

/* Stile per i badge trasformati in bottoni */
.type-badge-btn { 
    font-size: 0.75rem; 
    padding: 6px 12px; 
    border-radius: 20px; 
    font-weight: 700; 
    text-transform: uppercase; 
    letter-spacing: 0.5px; 
    border: 1px solid transparent; 
    cursor: pointer; 
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.type-badge-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.badge-luce { background: rgba(245, 158, 11, 0.1); color: #d97706; border-color: rgba(245, 158, 11, 0.3); }
.badge-gas { background: rgba(249, 115, 22, 0.1); color: #ea580c; border-color: rgba(249, 115, 22, 0.3); }
.badge-acqua { background: rgba(59, 130, 246, 0.1); color: #2563eb; border-color: rgba(59, 130, 246, 0.3); }
.badge-default { background: var(--bg-app); color: var(--text-muted); border-color: var(--border-color); }
.date-chip { font-weight: 600; color: var(--text-muted); background: var(--bg-app); padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border-color); }

/* MODALE ESPORTAZIONE */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(3px);}
.modal-content { max-width: 900px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.modal-header h3 { margin: 0; }
.close-btn { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
.close-btn:hover { color: #ef4444; }
.modal-desc { margin-bottom: 20px; color: var(--text-muted); font-size: 0.95rem;}
.text-accent { color: var(--accent-blue); font-weight: 600;}
.preview-table { max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 20px; }
.preview-table th, .preview-table td { padding: 10px; font-size: 0.85rem; white-space: nowrap; }
.modal-actions { display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid var(--border-color); padding-top: 15px; }

/* UTILS */
.empty-state { text-align: center; padding: 3rem !important; color: var(--text-muted); }
.spinner-small { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite; }
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0;}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.delay-0 { animation-delay: 0.1s; }

@media (max-width: 768px) {
    .filters-actions { flex-direction: column; align-items: flex-start; }
    .action-buttons { width: 100%; justify-content: space-between; flex-wrap: wrap; }
    .btn-primary, .btn-secondary { flex: 1; justify-content: center; }
}
</style>
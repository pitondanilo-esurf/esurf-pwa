<template>
  <div class="owner-layout">
    <header class="page-header">
        <div>
            <h1>Importazione Massiva POD</h1>
            <p class="subtitle">Carica, verifica e conferma i tuoi impianti</p>
        </div>
        <button @click="$router.push('/owner/dashboard')" class="btn-secondary">
            &larr; Dashboard
        </button>
    </header>

    <div class="main-container">
        
        <div class="card upload-card" :class="{ 'collapsed': pendingPods.length > 0 }">
            <div class="card-header">
                <h3>📂 Importazione Dati</h3>
                
                <button @click="downloadTemplate" class="btn-outline" :disabled="isDownloading">
                    <span v-if="isDownloading">Scaricamento...</span>
                    <span v-else>⬇️ Scarica Template {{ communityType }}</span>
                </button>
            </div>
            
            <div class="card-body">
                <p class="text-sm help-text">
                    Scarica il modello Excel precompilato per configurazioni <strong>{{ communityType }}</strong>, compilalo e ricaricalo qui sotto.
                </p>

                <div class="upload-area">
                    <input type="file" ref="fileInput" @change="handleFileSelect" accept=".xlsx, .xls, .csv" class="file-input" />
                    <button @click="uploadFile" class="btn-primary" :disabled="!selectedFile || isUploading">
                        <span v-if="isUploading">Caricamento...</span>
                        <span v-else>Carica Excel Compilato</span>
                    </button>
                </div>
                
                <div v-if="message" :class="['alert', isError ? 'alert-error' : 'alert-success']">{{ message }}</div>
            </div>
        </div>

        <div class="card table-card">
            <div class="table-header">
                <div class="header-left">
                    <h3>📋 Storico Importazioni</h3>
                    <span class="badge">{{ filteredPods.length }} record</span>
                </div>
                
                <div class="header-actions">
                    <select v-model="filterStatus" class="status-filter">
                        <option value="all">Tutti gli stati</option>
                        <option value="pending">⏳ In Elaborazione</option>
                        <option value="processed">✅ Completati</option>
                        <option value="failed">❌ Errori</option>
                    </select>

                    <div v-if="hasPendingSelection" class="bulk-actions">
                        <span class="selection-info">{{ selectedIds.length }} selezionati</span>
                        <button 
                            @click="confirmSelection" 
                            class="btn-success" 
                            :disabled="selectedIds.length === 0 || isProcessing"
                        >
                            {{ isProcessing ? 'Elaborazione...' : 'Conferma Selezionati' }}
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="loadingTable" class="loading-box">
                <div class="spinner"></div> Caricamento dati...
            </div>

            <div v-else-if="filteredPods.length === 0" class="empty-state">
                <p>Nessun dato trovato per il filtro selezionato.</p>
            </div>

            <div v-else class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th class="w-checkbox">
                                <input 
                                    type="checkbox" 
                                    :checked="isAllSelected" 
                                    @change="toggleSelectAll"
                                    :disabled="filterStatus === 'processed' || filterStatus === 'failed'"
                                >
                            </th>
                            <th>Data</th> <th>Stato</th> <th>POD ID</th>
                            <th>Titolare</th>
                            <th>Località</th>
                            <th class="text-right">Dati Tecnici</th>
                            <th class="text-center">Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="pod in filteredPods" :key="pod.id" :class="{ 'selected-row': selectedIds.includes(pod.id) }">
                            
                            <td>
                                <input 
                                    type="checkbox" 
                                    :value="pod.id" 
                                    v-model="selectedIds"
                                    :disabled="pod.status !== 'pending'"
                                >
                            </td>

                            <td class="text-sm text-muted whitespace-nowrap">
                                {{ formatDate(pod.created_at) }}
                            </td>

                            <td>
                                <span :class="['status-badge', pod.status]">
                                    {{ getStatusLabel(pod.status) }}
                                </span>
                            </td>

                            <td class="font-mono">{{ pod.pod_code }}</td>
                            
                            <td>
                                <div class="fw-bold">{{ pod.titolare_nominativo }}</div>
                                <div class="text-xs text-muted">{{ pod.titolare_email }}</div>
                            </td>
                            
                            <td>
                                {{ pod.city }}
                                <span v-if="pod.province" class="text-muted text-xs">
                                    ({{ pod.province }})
                                </span>
                            </td>
                            
                            <td class="text-right">
                                <div class="tech-grid">
                                    <span title="Prelievo">📉 {{ pod.consumer_power_kw }}</span>
                                    <span title="Immissione" v-if="Number(pod.producer_power_kw) > 0" class="text-green">📈 {{ pod.producer_power_kw }}</span>
                                    <span title="Accumulo" v-if="Number(pod.storage_power_kw) > 0" class="text-blue">🔋 {{ pod.storage_power_kw }}</span>
                                    <span title="Remoto" v-if="pod.remote_control_inverter">📡</span>
                                </div>
                            </td>

                            <td class="text-center actions-cell">
                                <div v-if="pod.status === 'pending'">
                                    <button @click="openEditModal(pod)" class="btn-icon" title="Modifica">✏️</button>
                                    <button @click="deletePod(pod.id)" class="btn-icon danger" title="Elimina">🗑️</button>
                                </div>
                                <div v-else-if="pod.status === 'failed'" class="error-tooltip" :title="pod.error_log">
                                    ⚠️ Errore
                                </div>
                                <div v-else class="text-green text-xs">
                                    OK
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Modifica Dati POD</h3>
                <button @click="closeModal" class="close-btn">&times;</button>
            </div>
            
            <form @submit.prevent="saveEdit" class="modal-form">
                
                <div class="form-section-title">Anagrafica e Localizzazione</div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>POD ID (Codice)</label>
                        <input v-model="editingPod.pod_code" required class="input-field font-mono">
                    </div>
                    <div class="form-group">
                        <label>Nominativo Titolare</label>
                        <input v-model="editingPod.titolare_nominativo" required class="input-field">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Indirizzo</label> <input v-model="editingPod.address" class="input-field" placeholder="Via Roma 10">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Comune</label>
                        <input v-model="editingPod.city" required class="input-field">
                    </div>
                    <div class="form-group">
                        <label>Provincia</label> <input v-model="editingPod.province" class="input-field" maxlength="2" placeholder="MI">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Email Titolare</label>
                        <input v-model="editingPod.titolare_email" type="email" required class="input-field">
                    </div>
                    <div class="form-group">
                        <label>Email Operativa</label>
                        <input v-model="editingPod.operative_email" type="email" class="input-field">
                    </div>
                </div>

                <div class="form-section-title">Dati Tecnici</div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Potenza Prelievo (kW)</label>
                        <input v-model="editingPod.consumer_power_kw" type="number" step="0.01" class="input-field">
                    </div>
                    <div class="form-group">
                        <label>Potenza Immissione (kW)</label>
                        <input v-model="editingPod.producer_power_kw" type="number" step="0.01" class="input-field">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Accumulo (kW)</label>
                        <input v-model="editingPod.storage_power_kw" type="number" step="0.01" class="input-field">
                    </div>
                    <div class="form-group checkbox-wrapper">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="editingPod.remote_control_inverter">
                            Inverter Remoto
                        </label>
                    </div>
                </div>

                <div class="form-section-title">Dettagli PNRR e Impianto</div>
                
                <div v-if="editingPod.extra_attributes">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tipo POD</label>
                            <input v-model="editingPod.extra_attributes.tipo_pod" class="input-field">
                        </div>
                        <div class="form-group">
                            <label>Tipo Impianto</label>
                            <input v-model="editingPod.extra_attributes.producer_tipo_impianto" class="input-field">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>PNRR</label>
                            <select v-model="editingPod.extra_attributes.pnrr" class="input-field">
                                <option value="">- Seleziona -</option>
                                <option value="SI">Sì</option>
                                <option value="NO">No</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Altri Contributi</label>
                            <input v-model="editingPod.extra_attributes.altri_contributi" class="input-field">
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" @click="closeModal" class="btn-secondary">Annulla</button>
                    <button type="submit" class="btn-primary">Salva Modifiche</button>
                </div>
            </form>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/services/axios'; // Assicurati di usare l'istanza configurata
import PodBulkLoader from '@/services/PodBulkLoader';
import CommunityService from '@/services/CommunityService'; 

// --- STATO ---
const selectedFile = ref(null);
const isUploading = ref(false);
const isDownloading = ref(false); 
const isProcessing = ref(false);
const message = ref('');
const isError = ref(false);
const fileInput = ref(null);

// Inizializza come array vuoto per evitare errori prima del caricamento
const pendingPods = ref([]); 
const loadingTable = ref(false);
const selectedIds = ref([]);
const showModal = ref(false);
const editingPod = ref({});

const filterStatus = ref('all');
const communityType = ref('Standard'); 

// --- INIT ---
onMounted(async () => {
    await loadCommunityInfo();
    await loadStagingData();
});

// --- API: Load Data & Info ---
const loadCommunityInfo = async () => {
    try {
        const res = await CommunityService.getMyCommunity();
        if(res.data && res.data.type) {
            communityType.value = res.data.type;
        }
    } catch (e) { 
        console.warn("Impossibile recuperare info community per il template."); 
    }
};

const loadStagingData = async () => {
  loadingTable.value = true; // Fix: usa la variabile loading corretta
  try {
    const response = await axios.get('/api/pods/staging');
    
    // --- GESTIONE ROBUSTA DELLA RISPOSTA ---
    let incomingData = response.data;

    // Se la risposta è un oggetto avvolto da 'data' (Laravel Resource / Pagination)
    if (incomingData && incomingData.data && Array.isArray(incomingData.data)) {
        pendingPods.value = incomingData.data;
    } 
    // Se la risposta è direttamente un array
    else if (Array.isArray(incomingData)) {
        pendingPods.value = incomingData;
    } 
    // Fallback di sicurezza
    else {
        console.warn("API Staging: Formato dati non riconosciuto, atteso Array.", incomingData);
        pendingPods.value = [];
    }

  } catch (error) {
    console.error("Errore caricamento staging:", error);
    pendingPods.value = []; 
  } finally {
    loadingTable.value = false;
  }
};

// --- ACTION: Download Template ---
const downloadTemplate = async () => {
    isDownloading.value = true;
    try {
        const response = await PodBulkLoader.downloadTemplate();
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Template_Import_${communityType.value}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (e) {
        alert("Errore durante il download del template.");
    } finally {
        isDownloading.value = false;
    }
};

// --- ACTION: Upload File ---
const handleFileSelect = (event) => { 
    if (event.target.files.length > 0) selectedFile.value = event.target.files[0]; 
};

const uploadFile = async () => {
    if (!selectedFile.value) return;
    isUploading.value = true;
    message.value = '';
    isError.value = false;
    try {
        const res = await PodBulkLoader.uploadExcel(selectedFile.value);
        message.value = `✅ ${res.data.imported_count} record caricati in staging.`;
        selectedFile.value = null;
        if (fileInput.value) fileInput.value.value = "";
        filterStatus.value = 'pending'; 
        await loadStagingData(); // Ricarica la tabella
    } catch (e) {
        isError.value = true;
        message.value = e.response?.data?.message || "Errore durante l'upload.";
    } finally { isUploading.value = false; }
};

// --- ACTION: Modale & Editing ---
const openEditModal = (pod) => {
    // Deep copy per non modificare la riga finché non si salva
    editingPod.value = JSON.parse(JSON.stringify(pod));
    
    // Fix booleani
    editingPod.value.remote_control_inverter = !!editingPod.value.remote_control_inverter;

    // [IMPORTANTE] Inizializza extra_attributes se mancante
    if (!editingPod.value.extra_attributes) {
        editingPod.value.extra_attributes = {};
    }

    showModal.value = true;
};

const closeModal = () => { showModal.value = false; editingPod.value = {}; };

const saveEdit = async () => {
    try {
        await PodBulkLoader.updateStagingPod(editingPod.value.id, editingPod.value);
        closeModal();
        await loadStagingData();
    } catch (e) { alert("Errore salvataggio: " + e.message); }
};

const deletePod = async (id) => {
    if(!confirm("Sei sicuro di voler eliminare questa riga?")) return;
    try { 
        await PodBulkLoader.deleteStagingPod(id); 
        await loadStagingData(); 
    } catch(e) {
        alert("Errore cancellazione");
    }
};

const confirmSelection = async () => {
    if (selectedIds.value.length === 0) return;
    if(!confirm(`Confermi l'importazione di ${selectedIds.value.length} POD? Verranno inviate le email di invito.`)) return;

    isProcessing.value = true;
    try {
        const res = await PodBulkLoader.processSelection(selectedIds.value);
        alert(res.data.message);
        
        // Pulizia selezione
        selectedIds.value = [];
        
        await loadStagingData();
        filterStatus.value = 'processed'; // Sposta vista sui completati
    } catch (e) { 
        console.error(e);
        alert("Errore durante l'elaborazione. Controlla la console."); 
    } finally { isProcessing.value = false; }
};

// --- COMPUTED & UTILS ---
const filteredPods = computed(() => {
    // [FIX] Protezione se pendingPods non è array
    if (!Array.isArray(pendingPods.value)) return [];

    if (filterStatus.value === 'all') {
        return pendingPods.value;
    }
    return pendingPods.value.filter(pod => pod.status === filterStatus.value);
});

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('it-IT', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
};

const getStatusLabel = (status) => {
    const map = {
        'pending': 'In Attesa',
        'processed': 'Completato',
        'failed': 'Fallito'
    };
    return map[status] || status;
};

const hasPendingSelection = computed(() => selectedIds.value.length > 0);

const isAllSelected = computed(() => {
    // [FIX] Usa sempre l'array sicuro
    const pods = filteredPods.value || [];
    const selectable = pods.filter(p => p.status === 'pending');
    
    if (selectable.length === 0) return false;
    return selectable.every(p => selectedIds.value.includes(p.id));
});

const toggleSelectAll = () => {
    const pods = filteredPods.value || [];
    const selectable = pods.filter(p => p.status === 'pending');
    
    if (selectable.length === 0) return;

    if (isAllSelected.value) {
        // Deseleziona tutti quelli visibili
        const idsToRemove = selectable.map(p => p.id);
        selectedIds.value = selectedIds.value.filter(id => !idsToRemove.includes(id));
    } else {
        // Seleziona tutti quelli visibili
        const newIds = selectable.map(p => p.id);
        // Set per evitare duplicati
        selectedIds.value = [...new Set([...selectedIds.value, ...newIds])];
    }
};
</script>

<style scoped>
/* Layout */
.owner-layout { padding: 2rem; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.subtitle { color: #64748b; margin-top: 0.5rem; }

/* Cards */
.card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; margin-bottom: 2rem; }
.card-header { padding: 1.25rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.card-body { padding: 1.5rem; }
.upload-card.collapsed .card-body { padding: 1rem; }

/* Upload & Buttons */
.upload-area { display: flex; gap: 1rem; align-items: center; }
.file-input { flex: 1; border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; }

.btn-primary { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
.btn-success { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-success:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline { background: white; border: 1px solid #3b82f6; color: #3b82f6; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; font-size: 0.9rem; }
.btn-outline:hover { background: #eff6ff; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 4px; }
.btn-icon.danger { color: #ef4444; }

/* Table */
.table-responsive { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th { text-align: left; padding: 12px 16px; background: #f8fafc; color: #64748b; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
.selected-row { background-color: #eff6ff; }

.header-actions { display: flex; align-items: center; gap: 1rem; }
.status-filter { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; background: white; }
.bulk-actions { display: flex; align-items: center; gap: 10px; }

.status-badge { padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-badge.pending { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
.status-badge.processed { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.status-badge.failed { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

.tech-grid { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 0.75rem; }
.text-green { color: #16a34a; font-weight: 600; }
.text-blue { color: #2563eb; font-weight: 600; }
.text-muted { color: #94a3b8; }
.text-sm { font-size: 0.85rem; }
.whitespace-nowrap { white-space: nowrap; }
.font-mono { font-family: 'Roboto Mono', monospace; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; width: 90%; max-width: 600px; border-radius: 12px; max-height: 90vh; overflow-y: auto; }
.modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.input-field { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; width: 100%; box-sizing: border-box; }
.form-row { display: flex; gap: 1rem; }
.form-group { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.form-section-title { font-weight: 700; color: #334155; margin-top: 0.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 5px; }

.checkbox-wrapper { justify-content: center; }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer; }

.modal-footer { padding: 1rem; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px; }
.modal-header { padding: 1rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }

.alert { padding: 10px; margin-top: 10px; border-radius: 6px; }
.alert-success { background: #ecfdf5; color: #065f46; }
.alert-error { background: #fef2f2; color: #991b1b; }
.help-text { color: #64748b; margin-bottom: 1rem; }
.loading-box { text-align: center; padding: 2rem; color: #64748b; }
.empty-state { text-align: center; padding: 2rem; color: #94a3b8; }
.spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; display: inline-block; margin-right: 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
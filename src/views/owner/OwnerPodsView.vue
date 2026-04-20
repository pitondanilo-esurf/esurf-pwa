<template>
  <div class="app-container">
    
    <GuideHeader :isLightMode="isLightMode"backRoute="/owner/dashboard" />

    <main class="main-content">
        <header class="page-header-compact fade-in delay-1" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <div class="header-left">
                <h2 style="margin:0; font-size: 1.8rem;">{{ $t('ownerPods.title') }}</h2>
                <p style="margin: 5px 0 0 0; color: var(--text-muted);">{{ $t('ownerPods.subtitle') }}</p>
            </div>
        </header>

        <div class="content-area fade-in delay-2">
            
            <div class="card upload-card" :class="{ 'collapsed': pendingPods.length > 0 }">
                <div class="card-header">
                    <h3>{{ $t('ownerPods.uploadCard.title') }}</h3>
                    <button @click="downloadTemplate" class="btn-outline" :disabled="isDownloading">
                        <span v-if="isDownloading">{{ $t('ownerPods.uploadCard.downloading') }}</span>
                        <span v-else>{{ $t('ownerPods.uploadCard.downloadBtn', { type: communityType }) }}</span>
                    </button>
                </div>
                
                <div class="card-body">
                    <p class="text-sm help-text" v-html="$t('ownerPods.uploadCard.helpText', { type: '<strong>' + communityType + '</strong>' })"></p>

                    <div class="upload-area">
                        <input type="file" ref="fileInput" @change="handleFileSelect" accept=".xlsx, .xls, .csv" class="file-input" />
                        <button @click="uploadFile" class="btn-primary-small" :disabled="!selectedFile || isUploading">
                            <span v-if="isUploading">{{ $t('ownerPods.uploadCard.uploading') }}</span>
                            <span v-else>{{ $t('ownerPods.uploadCard.uploadBtn') }}</span>
                        </button>
                    </div>
                    
                    <div v-if="message" :class="['alert', isError ? 'alert-error' : 'alert-success']" style="white-space: pre-line;">{{ message }}</div>
                </div>
            </div>

            <div class="card table-card">
                <div class="table-header">
                    <div class="header-left">
                        <h3>{{ $t('ownerPods.table.title') }}</h3>
                        <span class="badge">{{ $t('ownerPods.table.records', { count: filteredPods.length }) }}</span>
                    </div>
                    
                    <div class="header-actions">
                        <select v-model="filterStatus" class="status-filter compact-input">
                            <option value="all">{{ $t('ownerPods.table.filterAll', 'Tutti') }}</option>
                            <option value="pending">{{ $t('ownerPods.table.filterPending', 'In Attesa (Pronti)') }}</option>
                            <option value="incomplete">{{ $t('ownerPods.table.filterIncomplete', 'Incompleti') }}</option>
                            <option value="processed">{{ $t('ownerPods.table.filterProcessed', 'Completati') }}</option>
                            <option value="failed">{{ $t('ownerPods.table.filterFailed', 'Falliti') }}</option>
                        </select>

                        <div v-if="hasPendingSelection" class="bulk-actions">
                            <span class="selection-info">{{ $t('ownerPods.table.selected', { count: selectedIds.length }) }}</span>
                            <button 
                                @click="confirmSelection" 
                                class="btn-success-small" 
                                :disabled="selectedIds.length === 0 || isProcessing"
                            >
                                {{ isProcessing ? $t('ownerPods.table.processing') : $t('ownerPods.table.confirmBtn') }}
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="loadingTable" class="loading-box">
                    <div class="spinner-small"></div> {{ $t('ownerPods.table.loading') }}
                </div>

                <div v-else-if="filteredPods.length === 0" class="empty-state">
                    <p>{{ $t('ownerPods.table.empty') }}</p>
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
                                        :disabled="selectablePods.length === 0"
                                    >
                                </th>
                                <th>{{ $t('ownerPods.table.colDate') }}</th> 
                                <th>{{ $t('ownerPods.table.colStatus') }}</th> 
                                <th>{{ $t('ownerPods.table.colCode') }}</th>
                                <th>{{ $t('ownerPods.table.colOwner') }}</th>
                                <th>{{ $t('ownerPods.table.colCity') }}</th>
                                <th class="text-right">{{ $t('ownerPods.table.colTech') }}</th>
                                <th class="text-center">{{ $t('ownerPods.table.colActions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="pod in filteredPods" :key="pod.id" :class="{ 'selected-row': selectedIds.includes(pod.id), 'row-error': pod.status === 'failed' }">
                                
                                <td>
                                    <input 
                                        type="checkbox" 
                                        :value="pod.id" 
                                        v-model="selectedIds"
                                        :disabled="pod.status !== 'pending' || isPodIncomplete(pod)"
                                    >
                                </td>

                                <td class="text-sm text-muted whitespace-nowrap">
                                    {{ formatDate(pod.created_at) }}
                                </td>

                                <td>
                                    <span :class="['status-badge', getDisplayStatus(pod)]">
                                        {{ getStatusLabel(getDisplayStatus(pod)) }}
                                    </span>
                                    <div v-if="pod.status === 'failed'" class="error-text" :title="pod.error_log">
                                        {{ pod.error_log }}
                                    </div>
                                </td>

                                <td>
                                    <div class="font-mono">{{ pod.pod_code }}</div>
                                    <button 
                                        v-if="pod.ai_analysis"
                                        :class="['type-badge', 'badge-btn', getTypeBadgeClass(pod.resource_type)]"
                                        @click="openAiModal(pod)"
                                        title="Clicca per visualizzare l'Analisi AI"
                                    >
                                        {{ formatType(pod.resource_type) }} ✨
                                    </button>
                                    
                                    <span 
                                        v-else 
                                        :class="['type-badge', getTypeBadgeClass(pod.resource_type)]"
                                        title="Dati inseriti manualmente"
                                    >
                                        {{ formatType(pod.resource_type) }}
                                    </span>
                                </td>
                                
                                <td>
                                    <div class="fw-bold">{{ pod.titolare_nominativo }}</div>
                                    <div class="text-xs text-muted">{{ pod.titolare_email || '⚠️ Email mancante' }}</div>
                                    <div v-if="!pod.operative_email" class="text-xs error-text">⚠️ Op. Email mancante</div>
                                </td>
                                
                                <td>
                                    {{ pod.city }}
                                    <span v-if="pod.province" class="text-muted text-xs">
                                        ({{ pod.province }})
                                    </span>
                                </td>
                                
                                <td class="text-right">
                                    <div class="tech-grid">
                                        <span title="Prelievo" v-if="pod.resource_type === 'energia_elettrica' || !pod.resource_type">📉 {{ pod.consumer_power_kw }} kW</span>
                                        <span title="Immissione" v-if="Number(pod.producer_power_kw) > 0" class="text-green">📈 {{ pod.producer_power_kw }} kW</span>
                                        <span title="Accumulo" v-if="Number(pod.storage_power_kw) > 0" class="text-blue">🔋 {{ pod.storage_power_kw }} kW</span>
                                        <span title="Remoto" v-if="pod.remote_control_inverter">📡</span>
                                    </div>
                                </td>

                                <td class="text-center actions-cell">
                                    <div style="display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
                                        
                                        <button v-if="pod.bill_file" @click="openPdfModal(pod.bill_file)" class="btn-icon" title="Visualizza PDF Originale" style="color: #8b5cf6;">📄</button>
                                        <template v-if="pod.status === 'pending'">
                                            <button @click="openEditModal(pod)" class="btn-icon" title="Modifica">✏️</button>
                                            <button @click="deletePod(pod.id)" class="btn-icon danger" title="Elimina">🗑️</button>
                                        </template>
                                        <template v-else-if="pod.status === 'failed'">
                                            <button @click="deletePod(pod.id)" class="btn-icon danger" title="Elimina Riga Fallita">🗑️</button>
                                        </template>
                                        <template v-else>
                                            <span class="text-green text-xs" style="align-self: center;">OK</span>
                                        </template>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </main>

    <transition name="modal-fade">
        <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
            <div class="glass-modal edit-modal">
                <div class="modal-header">
                    <h3>{{ $t('ownerPods.modal.title') }}</h3>
                    <button @click="closeModal" class="btn-close-modal">✕</button>
                </div>
                
                <div class="modal-body">
                    <form @submit.prevent="saveEdit" class="compact-form">
                        
                        <div class="form-section-title">{{ $t('ownerPods.modal.registrySection') }}</div>
                        <div class="form-grid-2">
                            <div class="form-group">
                                <label>{{ $t('ownerPods.modal.podCode') }}</label>
                                <input v-model="editingPod.pod_code" required class="compact-input font-mono">
                            </div>
                            <div class="form-group">
                                <label>{{ $t('ownerPods.modal.ownerName') }}</label>
                                <input v-model="editingPod.titolare_nominativo" required class="compact-input">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>{{ $t('ownerPods.modal.address') }}</label> 
                            <input v-model="editingPod.address" class="compact-input" placeholder="Via Roma 10">
                        </div>

                        <div class="form-grid-2">
                            <div class="form-group">
                                <label>{{ $t('ownerPods.modal.city') }}</label>
                                <input v-model="editingPod.city" required class="compact-input">
                            </div>
                            <div class="form-group">
                                <label>{{ $t('ownerPods.modal.province') }}</label> 
                                <input v-model="editingPod.province" class="compact-input" maxlength="2" placeholder="MI">
                            </div>
                        </div>

                        <div class="form-grid-2">
                            <div class="form-group">
                                <label>{{ $t('ownerPods.modal.ownerEmail') }}</label>
                                <input v-model="editingPod.titolare_email" type="email" required class="compact-input">
                            </div>
                            <div class="form-group">
                                <label>{{ $t('ownerPods.modal.opEmail') }}</label>
                                <input v-model="editingPod.operative_email" type="email" class="compact-input">
                            </div>
                        </div>

                        <div class="form-section-title">{{ $t('ownerPods.modal.techSection') }}</div>
                        <div class="form-grid-2">
                            <div class="form-group">
                                <label>{{ $t('ownerPods.modal.consumerPower') }}</label>
                                <input v-model="editingPod.consumer_power_kw" type="number" step="0.01" class="compact-input">
                            </div>
                            <div class="form-group">
                                <label>{{ $t('ownerPods.modal.producerPower') }}</label>
                                <input v-model="editingPod.producer_power_kw" type="number" step="0.01" class="compact-input">
                            </div>
                        </div>

                        <div class="form-grid-2">
                            <div class="form-group">
                                <label>{{ $t('ownerPods.modal.storagePower') }}</label>
                                <input v-model="editingPod.storage_power_kw" type="number" step="0.01" class="compact-input">
                            </div>
                            <div class="form-group checkbox-wrapper">
                                <label class="check-label">
                                    <input type="checkbox" v-model="editingPod.remote_control_inverter">
                                    {{ $t('ownerPods.modal.remoteInverter') }}
                                </label>
                            </div>
                        </div>

                        <div class="form-section-title">{{ $t('ownerPods.modal.pnrrSection') }}</div>
                        <div v-if="editingPod.extra_attributes">
                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>{{ $t('ownerPods.modal.podType') }}</label>
                                    <input v-model="editingPod.extra_attributes.tipo_pod" class="compact-input">
                                </div>
                                <div class="form-group">
                                    <label>{{ $t('ownerPods.modal.plantType') }}</label>
                                    <input v-model="editingPod.extra_attributes.producer_tipo_impianto" class="compact-input">
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>{{ $t('ownerPods.modal.pnrr') }}</label>
                                    <select v-model="editingPod.extra_attributes.pnrr" class="compact-input">
                                        <option value="">{{ $t('ownerPods.modal.select') }}</option>
                                        <option value="SI">{{ $t('ownerPods.modal.yes') }}</option>
                                        <option value="NO">{{ $t('ownerPods.modal.no') }}</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>{{ $t('ownerPods.modal.otherContributions') }}</label>
                                    <input v-model="editingPod.extra_attributes.altri_contributi" class="compact-input">
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" @click="closeModal" class="btn-ghost-small">{{ $t('ownerPods.modal.cancel') }}</button>
                    <button type="button" @click="saveEdit" class="btn-save-small">{{ $t('ownerPods.modal.save') }}</button>
                </div>
            </div>
        </div>
    </transition>

    <PodAiModal 
        v-if="activeResourceType === 'energia_elettrica'"
        :show="showAiModal" 
        :aiData="activeAiData" 
        @close="showAiModal = false" 
    />

    <PdrAiModal 
        v-if="activeResourceType === 'gas'"
        :show="showPdrAiModal" 
        :aiData="activeAiData" 
        @close="showPdrAiModal = false" 
    />

    <WaterAiModal 
        v-if="activeResourceType === 'acqua'"
        :show="showWaterAiModal" 
        :aiData="activeAiData" 
        @close="showWaterAiModal = false" 
    />

  </div>

    <transition name="modal-fade">
        <div v-if="showPdfModal" class="modal-backdrop" @click.self="closePdfModal">
            <div class="glass-modal pdf-modal">
                <div class="modal-header">
                    <h3>Documento Originale</h3>
                    <button @click="closePdfModal" class="btn-close-modal">✕</button>
                </div>
                <div class="modal-body" style="padding: 0; display: flex; flex-direction: column;">
                    <iframe 
                        v-if="currentPdfUrl" 
                        :src="currentPdfUrl" 
                        width="100%" 
                        height="100%" 
                        style="border: none; flex-grow: 1;"
                        title="Visualizzatore PDF"
                    ></iframe>
                </div>
            </div>
        </div>
    </transition>


</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from '@/services/axios';
import CommunityService from '@/services/CommunityService';
import PodBulkLoader from '@/services/PodBulkLoader';
import GuideHeader from '@/components/layout/GuideHeader.vue';

// Importazione Modali AI
import PodAiModal from '@/components/pods/PodAiModal.vue';
import PdrAiModal from '@/components/pods/PdrAiModal.vue';
import WaterAiModal from '@/components/pods/WaterAiModal.vue';

// --- STATO MODALE PDF ---
const showPdfModal = ref(false);
const currentPdfUrl = ref('');

const { t } = useI18n();

// --- TEMA E HEADER ---
const isLightMode = ref(false);

// --- STATO UPLOAD ---
const selectedFile = ref(null);
const isUploading = ref(false);
const isDownloading = ref(false); 
const isProcessing = ref(false);
const message = ref('');
const isError = ref(false);
const fileInput = ref(null);

const pendingPods = ref([]); 
const loadingTable = ref(false);
const selectedIds = ref([]);
const showModal = ref(false);
const editingPod = ref({});

const filterStatus = ref('all');
const communityType = ref('Standard'); 

// --- STATO MODALI AI ---
const activeAiData = ref(null);
const activeResourceType = ref('energia_elettrica');
const showAiModal = ref(false);
const showPdrAiModal = ref(false);
const showWaterAiModal = ref(false);

// --- INIT ---
onMounted(async () => {
    const savedTheme = localStorage.getItem('theme');
    isLightMode.value = savedTheme === 'light';
    if (isLightMode.value) document.body.classList.add('light-mode');

    await loadCommunityInfo();
    await loadStagingData();
});

// --- API ---
const loadCommunityInfo = async () => {
    try {
        const res = await CommunityService.getMyCommunity();
        if(res.data && res.data.type) communityType.value = res.data.type;
    } catch (e) { console.warn("Info community non disponibili"); }
};

const loadStagingData = async () => {
  loadingTable.value = true;
  try {
    const response = await axios.get('/api/pods/staging');
    let incomingData = response.data;
    if (incomingData && incomingData.data && Array.isArray(incomingData.data)) {
        pendingPods.value = incomingData.data;
    } else if (Array.isArray(incomingData)) {
        pendingPods.value = incomingData;
    } else {
        pendingPods.value = [];
    }
  } catch (error) {
    console.error("Errore staging:", error);
    pendingPods.value = []; 
  } finally {
    loadingTable.value = false;
  }
};

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
        alert(t('ownerPods.uploadCard.errorDownload'));
    } finally {
        isDownloading.value = false;
    }
};

const handleFileSelect = (event) => { 
    if (event.target.files.length > 0) selectedFile.value = event.target.files[0]; 
};

const uploadFile = async () => {
    if (!selectedFile.value) return;

    isUploading.value = true;
    message.value = '';

    try {
        const response = await PodBulkLoader.uploadExcel(selectedFile.value); 
        
        const warnings = response.data.warnings || [];
        
        if (warnings.length > 0) {
            const msg = `Importazione con ${warnings.length} avvisi:\n` + warnings.join('\n');
            alert("⚠️ " + msg);
            message.value = msg;
            isError.value = true;
        } else {
            alert(t('ownerPods.uploadCard.success'));
            message.value = t('ownerPods.uploadCard.fileLoaded');
            isError.value = false;
        }
        
        await loadStagingData();
        selectedFile.value = null;
        if (fileInput.value) fileInput.value.value = '';

    } catch (e) {
        console.error(e);
        const errMsg = e.response?.data?.message || e.message;
        alert(t('ownerPods.uploadCard.errorUpload') + errMsg);
        message.value = "Errore: " + errMsg;
        isError.value = true;
    } finally {
        isUploading.value = false;
    }
};

// --- GESTIONE VISUALIZZAZIONE AI & PDF ---
const openPdfModal = (path) => {
    if (!path) return;
    const baseUrl = axios.defaults.baseURL || '';
    
    // Costruisce l'URL completo del file
    if (path.startsWith('http')) {
        currentPdfUrl.value = path;
    } else {
        const cleanPath = path.replace('public/', '');
        currentPdfUrl.value = `${baseUrl}/storage/${cleanPath}`;
    }
    
    // Apre la modale
    showPdfModal.value = true;
};

const closePdfModal = () => {
    showPdfModal.value = false;
    setTimeout(() => { currentPdfUrl.value = ''; }, 300); // Pulisce l'url dopo l'animazione
};

const openAiModal = (pod) => {
    try {
        // Parsifica il JSON dell'AI che si trova nel database
        activeAiData.value = typeof pod.ai_analysis === 'string' ? JSON.parse(pod.ai_analysis) : pod.ai_analysis;
        activeResourceType.value = pod.resource_type || 'energia_elettrica';

        // Attiva la modale giusta in base al tipo
        if (activeResourceType.value === 'energia_elettrica') showAiModal.value = true;
        else if (activeResourceType.value === 'gas') showPdrAiModal.value = true;
        else if (activeResourceType.value === 'acqua') showWaterAiModal.value = true;

    } catch (e) {
        console.error("Errore apertura Report AI:", e);
        alert("Dati AI non formattati correttamente nel database.");
    }
};

const formatType = (type) => {
  if (!type) return 'Luce';
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'energia_elettrica': return 'badge-luce';
    case 'gas': return 'badge-gas';
    case 'acqua': return 'badge-acqua';
    default: return 'badge-luce'; // Valore di default
  }
};

// --- LOGICA MODIFICA E CONFERMA ---
const openEditModal = (pod) => {
    editingPod.value = JSON.parse(JSON.stringify(pod));
    editingPod.value.remote_control_inverter = !!editingPod.value.remote_control_inverter;
    if (!editingPod.value.extra_attributes) editingPod.value.extra_attributes = {};
    showModal.value = true;
};

const closeModal = () => { showModal.value = false; editingPod.value = {}; };

const saveEdit = async () => {
    try {
        await PodBulkLoader.updateStagingPod(editingPod.value.id, editingPod.value);
        closeModal();
        await loadStagingData();
    } catch (e) { alert(t('ownerPods.alerts.errorSave') + ": " + e.message); }
};

const deletePod = async (id) => {
    if(!confirm(t('ownerPods.alerts.deleteConfirm'))) return;
    try { 
        await PodBulkLoader.deleteStagingPod(id); 
        await loadStagingData(); 
    } catch(e) { alert(t('ownerPods.alerts.errorDelete')); }
};

const confirmSelection = async () => {
    if (selectedIds.value.length === 0) return;

    const selectedPodsList = pendingPods.value.filter(p => selectedIds.value.includes(p.id));
    const invalidPods = selectedPodsList.filter(p => isPodIncomplete(p));

    if (invalidPods.length > 0) {
        const codes = invalidPods.map(p => p.pod_code || 'Codice Mancante').join('\n- ');
        alert(
            `Impossibile procedere.\n\n` +
            `I seguenti POD hanno dati mancanti o non validi (Manca Email Titolare, Manca Email Operatore, o Nome = "Da verificare"):\n\n` +
            `- ${codes}\n\n` +
            `Modifica questi record tramite l'icona della matita prima di confermarli.`
        );
        return;
    }

    if(!confirm(t('ownerPods.alerts.processConfirm', { count: selectedIds.value.length }))) return;

    isProcessing.value = true;
    try {
        const res = await PodBulkLoader.processSelection(selectedIds.value);
        alert(res.data.message);
        selectedIds.value = [];
        await loadStagingData();
        filterStatus.value = 'processed';
    } catch (e) { 
        alert(t('ownerPods.alerts.errorProcess')); 
    } finally { isProcessing.value = false; }
};

// --- LOGICA DI VALIDAZIONE INCOMPLETEZZA ---
const isPodIncomplete = (pod) => {
    const hasTitolareEmail = pod.titolare_email && pod.titolare_email.trim() !== '';
    const hasOperativeEmail = pod.operative_email && pod.operative_email.trim() !== '';
    const isNameValid = pod.titolare_nominativo && pod.titolare_nominativo.trim().toLowerCase() !== 'da verificare';
    
    return !(hasTitolareEmail && hasOperativeEmail && isNameValid);
};

const getDisplayStatus = (pod) => {
    if (pod.status === 'pending' && isPodIncomplete(pod)) return 'incomplete';
    return pod.status;
};

// --- COMPUTED AGGIORNATI CON LOGICA INCOMPLETO ---
const filteredPods = computed(() => {
    if (!Array.isArray(pendingPods.value)) return [];
    if (filterStatus.value === 'all') return pendingPods.value;
    
    if (filterStatus.value === 'incomplete') {
        return pendingPods.value.filter(pod => pod.status === 'pending' && isPodIncomplete(pod));
    }
    
    if (filterStatus.value === 'pending') {
        return pendingPods.value.filter(pod => pod.status === 'pending' && !isPodIncomplete(pod));
    }

    return pendingPods.value.filter(pod => pod.status === filterStatus.value);
});

const selectablePods = computed(() => {
    const pods = filteredPods.value || [];
    return pods.filter(p => p.status === 'pending' && !isPodIncomplete(p));
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
        'pending': t('ownerPods.table.statusPending', 'In Attesa'), 
        'incomplete': 'Incompleto',
        'processed': t('ownerPods.table.statusProcessed', 'Completato'), 
        'failed': t('ownerPods.table.statusFailed', 'Fallito') 
    };
    return map[status] || status;
};

const hasPendingSelection = computed(() => selectedIds.value.length > 0);

const isAllSelected = computed(() => {
    const selectable = selectablePods.value;
    if (selectable.length === 0) return false;
    return selectable.every(p => selectedIds.value.includes(p.id));
});

const toggleSelectAll = () => {
    const selectable = selectablePods.value;
    if (selectable.length === 0) return;

    if (isAllSelected.value) {
        const idsToRemove = selectable.map(p => p.id);
        selectedIds.value = selectedIds.value.filter(id => !idsToRemove.includes(id));
    } else {
        const newIds = selectable.map(p => p.id);
        selectedIds.value = [...new Set([...selectedIds.value, ...newIds])];
    }
};
</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
/* BASE STYLES ADATTATI A MAIN.CSS */
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 1rem 1.5rem 4rem 1.5rem; max-width: 1000px; margin: 0 auto; }

.page-header-compact h2 { color: var(--text-main); font-weight: 800; }
.subtitle { color: var(--text-muted); }

/* CARDS */
.card { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 2rem; overflow: hidden; }
.card-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-app);}
.card-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
.card-body { padding: 1.5rem; }
.upload-card.collapsed .card-body { padding: 1rem; }

/* PULSANTI E INPUT CONDIVISI (Mappati su css globale) */
.btn-primary-small { background-color: var(--accent-blue); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s;}
.btn-primary-small:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-outline { background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; font-size: 0.9rem; }
.btn-outline:hover { background: rgba(59, 130, 246, 0.1); }
.btn-ghost-small { background: var(--bg-card); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; color: var(--text-muted); transition: 0.2s; }
.btn-ghost-small:hover { color: var(--text-main); border-color: var(--text-main); }
.btn-save-small { background-color: var(--accent-blue); color: white; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
.btn-success-small { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-success-small:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 4px; border-radius: 4px; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center;}
.btn-icon:hover { background: var(--bg-app); transform: scale(1.1); }
.btn-icon.danger { color: #ef4444; }

.compact-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.9rem; background: var(--bg-app); color: var(--text-main); transition: border 0.2s; }
.compact-input:focus { border-color: var(--accent-blue); outline: none; }
.file-input { flex: 1; border: 1px dashed var(--border-color); padding: 10px; border-radius: 6px; background: var(--bg-app); color: var(--text-main); cursor: pointer;}

.upload-area { display: flex; gap: 1rem; align-items: center; margin-top: 10px;}

/* TABELLA E LISTA */
.table-header { padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 10px; }
.header-left { display: flex; align-items: center; gap: 10px; }
.header-left h3 { margin: 0; color: var(--text-main); font-size: 1.1rem; }
.badge { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
/* BADGE CLICCABILE COME BOTTONE */
button.type-badge {
    cursor: pointer;
    transition: transform 0.2s, filter 0.2s;
    font-family: inherit;
    line-height: normal;
}
button.badge-btn:hover {
    transform: translateY(-1px) scale(1.02);
    filter: brightness(0.9);
}

/* STILE SPECIFICO PER LA MODALE PDF (A TUTTO SCHERMO) */
.pdf-modal {
    width: 95vw !important;         /* 95% della larghezza dello schermo */
    max-width: 1600px !important;   /* Limite larghissimo per schermi grandi */
    height: 92vh !important;        /* 92% dell'altezza dello schermo */
    max-height: 95vh !important;
    display: flex !important;
    flex-direction: column !important;
}

.pdf-modal .modal-body {
    flex: 1 !important;             /* Costringe il body a occupare tutto lo spazio verticale */
    padding: 0 !important;
    overflow: hidden !important;    /* Rimuove le scrollbar esterne, lasciando solo quella del PDF */
}

.header-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;}
.bulk-actions { display: flex; align-items: center; gap: 10px; }
.selection-info { font-size: 0.85rem; color: var(--text-muted); }

.table-responsive { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
th { text-align: left; padding: 12px 16px; background: var(--bg-app); color: var(--text-muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
td { padding: 12px 16px; border-bottom: 1px solid var(--border-color); color: var(--text-main); vertical-align: middle; }
.selected-row td { background-color: rgba(59, 130, 246, 0.05); }

/* STATI E COLORI TABELLA */
.status-badge { padding: 4px 10px; border-radius: 99px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; display: inline-block;}
.status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
.status-badge.incomplete { background: rgba(100, 116, 139, 0.1); color: #64748b; border: 1px solid rgba(100, 116, 139, 0.2); }
.status-badge.processed { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.status-badge.failed { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

.row-error td { background-color: rgba(239, 68, 68, 0.03) !important; }
.error-text { color: #ef4444; font-size: 0.7rem; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px; cursor: help; }

/* BADGES TIPO RISORSA */
.type-badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 12px; font-weight: 800; text-transform: uppercase; display: inline-block; margin-top: 4px; border: 1px solid transparent;}
.badge-luce { background: rgba(245, 158, 11, 0.1); color: #d97706; border-color: rgba(245, 158, 11, 0.3); }
.badge-gas { background: rgba(249, 115, 22, 0.1); color: #ea580c; border-color: rgba(249, 115, 22, 0.3); }
.badge-acqua { background: rgba(59, 130, 246, 0.1); color: #2563eb; border-color: rgba(59, 130, 246, 0.3); }

.tech-grid { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 0.75rem; }
.text-green { color: #10b981; font-weight: 600; }
.text-blue { color: var(--accent-blue); font-weight: 600; }
.text-purple { color: #a855f7; font-weight: 600; }
.text-muted { color: var(--text-muted); }
.text-sm { font-size: 0.85rem; }
.fw-bold { font-weight: 600; }
.font-mono { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem;}

/* MODALE (STILE EREDITATO DA PODSVIEW) */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 600px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; color: var(--text-main); background: var(--bg-app);}
.modal-header h3 { margin: 0; font-size: 1.1rem; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; color: var(--text-main); }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; background: var(--bg-app); flex-shrink: 0; }

.compact-form { display: flex; flex-direction: column; gap: 12px; }
.form-section-title { font-size: 0.8rem; font-weight: 800; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px dashed var(--border-color); padding-bottom: 5px; margin-top: 10px; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
.checkbox-wrapper { justify-content: flex-end; padding-bottom: 8px;}
.check-label { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; color: var(--text-main); }

/* UTILS */
.alert { padding: 12px; margin-top: 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 500; }
.alert-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.alert-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
.help-text { margin-top: 0; }
.loading-box, .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.9rem; }
.spinner-small { width: 20px; height: 20px; border: 3px solid var(--border-color); border-top: 3px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; margin-right: 8px; vertical-align: middle; }

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.5s ease forwards; opacity: 0;}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }

/* RESPONSIVE */
@media (max-width: 768px) {
    .form-grid-2 { grid-template-columns: 1fr; }
    .upload-area { flex-direction: column; align-items: stretch; }
    .header-actions { flex-direction: column; align-items: flex-start; width: 100%; }
    .status-filter { width: 100%; }
}
</style>
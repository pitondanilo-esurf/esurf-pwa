<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
      <div class="glass-modal form-modal compact-modal">
        
        <div class="modal-header compact-header">
          <h3>{{ $t('pods.formModal.editTitle') || 'Modifica POD Elettrico' }}</h3>
          <button @click="$emit('close')" class="btn-close-modal">✕</button>
        </div>
        
        <div class="modal-body compact-body">
          <form id="podForm" @submit.prevent class="compact-form fade-in">
            
            <div class="role-selector-tiny">
                <label class="role-opt" :class="{ active: form.pod_role === 'consumer' }">
                    <input type="radio" v-model="form.pod_role" value="consumer"> Consumer
                </label>
                <label class="role-opt" :class="{ active: form.pod_role === 'producer' }">
                    <input type="radio" v-model="form.pod_role" value="producer"> Producer
                </label>
                <label class="role-opt" :class="{ active: form.pod_role === 'prosumer' }">
                    <input type="radio" v-model="form.pod_role" value="prosumer"> Prosumer
                </label>
            </div>

            <div class="form-grid-2">
                <div class="form-group">
                    <label>{{ $t('pods.formModal.fields.podCode') || 'Codice POD' }}</label>
                    <input v-model="form.pod_code" maxlength="14" required class="compact-input monospace" disabled title="Il codice POD non può essere modificato">
                </div>
                <div class="form-group">
                    <label>{{ $t('pods.formModal.fields.address') || 'Indirizzo' }}</label>
                    <input v-model="form.address" required class="compact-input">
                </div>
            </div>
            
            <div class="form-grid-3">
                <div class="form-group">
                    <label>{{ $t('pods.formModal.fields.city') || 'Città' }}</label>
                    <input v-model="form.city" required class="compact-input">
                </div>
                <div class="form-group">
                    <label>{{ $t('pods.formModal.fields.prov') || 'Prov.' }}</label>
                    <input v-model="form.province" maxlength="2" class="compact-input uppercase">
                </div>
                <div class="form-group">
                    <label>{{ $t('pods.formModal.fields.zip') || 'CAP' }}</label>
                    <input v-model="form.zip_code" maxlength="5" class="compact-input">
                </div>
            </div>
            
            <div class="divider-micro"></div>
            
            <div class="form-grid-2">
                <template v-if="form.pod_role !== 'producer'">
                    <div class="form-group">
                        <label>{{ $t('pods.formModal.fields.powerKw') || 'Potenza (kW)' }}</label>
                        <input v-model.number="form.contract_power" type="number" step="0.5" class="compact-input">
                    </div>
                    <div class="form-group">
                        <label>{{ $t('pods.formModal.fields.consumptionKwh') || 'Consumo (kWh)' }}</label>
                        <input v-model.number="form.annual_consumption_kwh" type="number" class="compact-input">
                    </div>
                </template>
                <template v-if="form.pod_role !== 'consumer'">
                    <div class="form-group">
                        <label>{{ $t('pods.formModal.fields.plantKwp') || 'Impianto (kWp)' }}</label>
                        <input v-model.number="form.production_capacity" type="number" step="0.1" class="compact-input">
                    </div>
                    <div class="form-group">
                        <label>{{ $t('pods.formModal.fields.gseCode') || 'Cod. GSE' }}</label>
                        <input v-model="form.gse_convention_code" class="compact-input">
                    </div>
                </template>
            </div>
            
            <div v-if="form.pod_role !== 'consumer'" class="storage-row">
                <label class="check-label">
                    <input type="checkbox" v-model="form.has_storage"> 
                    {{ $t('pods.formModal.fields.hasStorage') || 'Accumulo?' }}
                </label>
                <input v-if="form.has_storage" v-model.number="form.storage_capacity" type="number" placeholder="kWh" class="compact-input storage-input">
            </div>
            
            <div class="upload-section">
                <div class="section-title">{{ $t('pods.formModal.fields.documents') || 'Documenti' }}</div>
                <div class="edit-upload-grid">
                    
                    <div class="upload-row">
                        <div class="u-info">
                            <label>{{ $t('pods.labels.bill') || 'Bolletta' }}</label>
                            <span class="u-status" :class="{present: form.bill_file}">
                                {{ form.bill_file ? '✔ ' + ($t('pods.labels.present') || 'Presente') : '❌ ' + ($t('pods.formModal.missing') || 'Mancante') }}
                            </span>
                        </div>
                        <div class="u-actions">
                            <input type="file" accept="application/pdf,image/*" class="file-input-compact" @change="handleFileSelect('bill', $event)">
                            <button type="button" @click="uploadSingleFile('bill')" class="btn-upload-action" :disabled="!billFile || uploadingFile">
                                {{ uploadingFile ? '...' : '⬆ ' + ($t('pods.formModal.uploadAndAnalyze') || 'Carica') }}
                            </button>
                        </div>
                    </div>
                    
                    <div class="divider-micro"></div>
                    
                    <div class="upload-row">
                        <div class="u-info">
                            <label>{{ $t('pods.labels.curves') || 'Curve di Carico' }}</label>
                            <span class="u-status" :class="{present: form.load_curve_file}">
                                {{ form.load_curve_file ? '✔ ' + ($t('pods.labels.presents') || 'Presenti') : '❌ ' + ($t('pods.formModal.missings') || 'Mancanti') }}
                            </span>
                        </div>
                        <div class="u-actions">
                            <input type="file" accept=".pdf,.xls,.xlsx,.csv" class="file-input-compact" @change="handleFileSelect('curve', $event)">
                            <button type="button" @click="uploadSingleFile('curve')" class="btn-upload-action" :disabled="!curveFile || uploadingFile">
                                {{ uploadingFile ? '...' : '⬆ ' + ($t('pods.formModal.upload') || 'Carica') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="errorMsg" class="error-text mt-2">{{ errorMsg }}</div>
          </form>
        </div>

        <div class="modal-footer compact-footer">
            <button type="button" @click="$emit('close')" class="btn-ghost-small">{{ $t('pods.actions.cancel') || 'Annulla' }}</button>
            <button type="button" @click="handleSave" class="btn-save-small" :disabled="submitting">
                {{ submitting ? ($t('pods.status.waiting') || 'Attendere...') : ($t('pods.formModal.updateData') || 'Aggiorna Dati') }}
            </button>
        </div>
        
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from '@/services/axios'; 

const { t } = useI18n();

const props = defineProps({
  show: Boolean,
  podData: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['close', 'saved']);

// Inizializzazione sicura: preveniamo il crash di Vue dando valori di default
const initForm = (data) => {
    // 1. Estrazione sicura dei dati AI
    let aiData = {};
    try {
        aiData = typeof data?.ai_analysis === 'string' ? JSON.parse(data.ai_analysis) : (data?.ai_analysis || {});
    } catch (e) {}

    // 2. Logica intelligente per il ruolo: 
    // Se nel DB è salvato 'consumer', ma l'AI ha dedotto che è un 'PROSUMER', forziamo l'interfaccia!
    let determinedRole = data?.pod_role || 'consumer';
    if (determinedRole === 'consumer' && aiData.pod_type === 'PROSUMER') {
        determinedRole = 'prosumer';
    }

    return {
        id: data?.id || null,
        pod_code: data?.pod_code || '',
        pod_role: determinedRole, // <-- Usiamo il ruolo calcolato intelligentemente
        address: data?.address || '',
        city: data?.city || '',
        province: data?.province || '',
        zip_code: data?.zip_code || '',
        contract_power: data?.contract_power || 0,
        annual_consumption_kwh: data?.annual_consumption_kwh || 0,
        production_capacity: data?.production_capacity || 0,
        gse_convention_code: data?.gse_convention_code || '',
        has_storage: !!data?.has_storage,
        storage_capacity: data?.storage_capacity || 0,
        bill_file: data?.bill_file || null,
        load_curve_file: data?.load_curve_file || null
    };
};

// Stato locale
const form = ref(initForm({}));
const submitting = ref(false);
const errorMsg = ref('');
const billFile = ref(null);
const curveFile = ref(null);
const uploadingFile = ref(false);

// Sincronizza i dati QUANDO si apre la modale, garantendo che i dati siano sempre sicuri
watch(() => props.show, (isShowing) => {
    if (isShowing && props.podData) {
        form.value = initForm(props.podData);
        billFile.value = null;
        curveFile.value = null;
        errorMsg.value = '';
    }
}, { immediate: true });

// Gestione selezione file inline
const handleFileSelect = (type, event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (type === 'bill') { billFile.value = file; } 
    else if (type === 'curve') { curveFile.value = file; }
};

// SALVATAGGIO DEI SOLI DATI TESTUALI
const handleSave = async () => {
    submitting.value = true;
    errorMsg.value = '';
    try {
        const dataToSend = { ...form.value };
        delete dataToSend.bill_file; 
        delete dataToSend.load_curve_file; 

        // Invia i dati al backend
        await axios.put(`/api/pods/${form.value.id}`, dataToSend);
        
        emit('saved');
        emit('close');
    } catch (e) {
        // Uso le doppie virgolette per sicurezza
        errorMsg.value = e.response?.data?.message || "Errore durante l'aggiornamento dei dati.";
    } finally {
        submitting.value = false;
    }
};

// UPLOAD SINGOLO FILE (E ricalcolo AI backend se è bolletta)
const uploadSingleFile = async (type) => {
    uploadingFile.value = true; 
    errorMsg.value = ''; 
    
    const formData = new FormData(); 
    formData.append('_method', 'PUT'); 
    
    formData.append('pod_code', form.value.pod_code);
    formData.append('address', form.value.address);
    formData.append('city', form.value.city);
    formData.append('zip_code', form.value.zip_code);

    if (type === 'bill') { 
        if (!billFile.value) return; 
        formData.append('bill_file', billFile.value); 
    } else { 
        if (!curveFile.value) return; 
        formData.append('load_curve_file', curveFile.value); 
    }

    try { 
        const res = await axios.post(`/api/pods/${form.value.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (type === 'bill') form.value.bill_file = 'uploaded';
        if (type === 'curve') form.value.load_curve_file = 'uploaded';
        
        emit('saved');
        alert(t('pods.alerts.fileAnalyzed') || "File caricato ed elaborato con successo!"); 
    } catch (e) { 
        errorMsg.value = e.response?.data?.message || "Errore durante il caricamento del file.";
    } finally { 
        uploadingFile.value = false; 
        billFile.value = null;
        curveFile.value = null;
        document.querySelectorAll('.file-input-compact').forEach(el => el.value = '');
    }
};
</script>

<style scoped>
/* Stili Modale Compatti */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 550px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.compact-modal { max-width: 480px; }
.compact-header { padding: 0.8rem 1rem; background: var(--bg-app); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;}
.compact-header h3 { font-size: 1.1rem; margin: 0; color: var(--text-main); }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.compact-body { padding: 1rem; overflow-y: auto; max-height: 60vh; background: var(--bg-card); color: var(--text-main);}

.compact-form { display: flex; flex-direction: column; gap: 8px; }
.role-selector-tiny { display: flex; background: var(--bg-app); padding: 3px; border-radius: 6px; margin-bottom: 10px; }
.role-opt { flex: 1; text-align: center; padding: 6px; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); cursor: pointer; border-radius: 5px; transition: 0.2s; }
.role-opt.active { background: var(--bg-card); color: var(--accent-blue); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.role-opt input { display: none; }
.form-group label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px; font-weight: 600; }
.compact-input { width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); }
.compact-input:focus { border-color: var(--accent-blue); outline: none; }
.compact-input:disabled { opacity: 0.6; cursor: not-allowed; }
.monospace { font-family: 'JetBrains Mono', monospace; }
.uppercase { text-transform: uppercase; }

.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.form-grid-3 { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; }
.divider-micro { height: 1px; background: var(--border-color); margin: 8px 0; }

.storage-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: var(--bg-app); padding: 6px 10px; border-radius: 6px; }
.check-label { font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; color: var(--text-main); }
.storage-input { width: 80px; padding: 6px; font-size: 0.8rem; }

.upload-section { background: var(--bg-app); padding: 10px; border-radius: 6px; margin-top: 5px; border: 1px dashed var(--border-color); }
.section-title { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; }

.edit-upload-grid { display: flex; flex-direction: column; gap: 10px; }
.upload-row { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; }
.u-info { display: flex; flex-direction: column; }
.u-status { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); }
.u-status.present { color: #16a34a; }
.u-actions { display: flex; align-items: center; gap: 8px; }
.file-input-compact { font-size: 0.75rem; max-width: 140px; color: var(--text-main); }
.btn-upload-action { background: var(--accent-blue); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-upload-action:disabled { background: var(--border-color); cursor: not-allowed; }

.error-text { color: #ef4444; font-weight: 600; font-size: 0.85rem; text-align: center; }

.compact-footer { padding: 0.8rem 1rem; background: var(--bg-app); border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; }
.btn-save-small { background-color: var(--accent-blue); color: white; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; font-size: 0.9rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.btn-save-small:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-ghost-small { background: var(--bg-card); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; color: var(--text-muted); }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
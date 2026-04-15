<template>
  <transition name="modal-slide">
    <div v-if="show" class="modal-backdrop" @click.self="closeModal">
      <div class="glass-modal form-modal">
        
        <div class="modal-header">
          <h3>{{ isEditing ? 'Modifica Risorsa' : 'Aggiungi Nuova Risorsa' }}</h3>
          <button @click="closeModal" class="btn-close-modal">✕</button>
        </div>
        
        <div class="modal-body">
          
          <div v-if="formMode === 'selection'" class="magic-selection fade-in">
             <h4 class="text-center mb-3">Come vuoi procedere?</h4>
             <p class="text-center text-muted mb-4">Carica una bolletta per far compilare tutto all'Intelligenza Artificiale, oppure procedi manualmente.</p>

             <input type="file" ref="fileInput" accept="application/pdf" style="display:none" @change="handleMagicUpload">
             
             <div class="magic-card hover-scale" @click="$refs.fileInput.click()">
                 <div class="m-icon">📄✨</div>
                 <div class="m-text">
                     <strong>Caricamento Magico (Consigliato)</strong>
                     <span>Carica l'ultima bolletta in PDF</span>
                 </div>
             </div>
             
             <div class="divider"><span>OPPURE</span></div>

             <div class="manual-card hover-scale" @click="startManualForm">
                 <div class="m-icon">✍️</div>
                 <div class="m-text">
                     <strong>Inserimento Manuale</strong>
                     <span>Compila i campi da solo</span>
                 </div>
             </div>

             <div v-if="errorMsg" class="alert alert-error mt-3">{{ errorMsg }}</div>
          </div>

          <div v-else-if="formMode === 'ai_loading'" class="ai-loading fade-in">
              <div class="spinner-large"></div>
              <h4>Analisi in corso...</h4>
              <p class="text-muted">L'Intelligenza Artificiale sta leggendo la tua bolletta.</p>
          </div>

          <form v-else-if="formMode === 'manual'" @submit.prevent="submitForm" class="fade-in compact-form">
              
              <div class="form-group mb-3">
                  <label>Tipo di Risorsa *</label>
                  <div class="type-selector">
                      <label class="type-option" :class="{'active': form.resource_type === 'energia_elettrica'}">
                          <input type="radio" v-model="form.resource_type" value="energia_elettrica" :disabled="isEditing"> ⚡ Luce
                      </label>
                      <label class="type-option" :class="{'active': form.resource_type === 'gas'}">
                          <input type="radio" v-model="form.resource_type" value="gas" :disabled="isEditing"> 🔥 Gas
                      </label>
                      <label class="type-option" :class="{'active': form.resource_type === 'acqua'}">
                          <input type="radio" v-model="form.resource_type" value="acqua" :disabled="isEditing"> 💧 Acqua
                      </label>
                  </div>
              </div>

              <div class="form-section-title">Dati Principali</div>
              <div class="form-grid-2">
                  <div class="form-group">
                      <label>Codice Identificativo (POD/PDR/PDP) *</label>
                      <input v-model="form.pod_code" required class="compact-input font-mono" placeholder="Es. IT001E...">
                  </div>
                  <div class="form-group">
                      <label>Nome Titolare *</label>
                      <input v-model="form.titolare_nominativo" required class="compact-input" placeholder="Mario Rossi">
                  </div>
              </div>

              <div class="form-grid-2">
                  <div class="form-group">
                      <label>Email Titolare *</label>
                      <input v-model="form.titolare_email" type="email" required class="compact-input" placeholder="mario@email.it">
                  </div>
                  <div class="form-group">
                      <label>Email Operativa *</label>
                      <input v-model="form.operative_email" type="email" required class="compact-input" placeholder="amministrazione@email.it">
                  </div>
              </div>

              <div class="form-section-title">Indirizzo Fornitura</div>
              <div class="form-group">
                  <label>Indirizzo *</label> 
                  <input v-model="form.address" required class="compact-input" placeholder="Via Roma 10">
              </div>
              <div class="form-grid-2">
                  <div class="form-group">
                      <label>Città *</label>
                      <input v-model="form.city" required class="compact-input" placeholder="Milano">
                  </div>
                  <div class="form-group">
                      <label>Provincia (Sigla)</label> 
                      <input v-model="form.province" class="compact-input" maxlength="2" placeholder="MI">
                  </div>
              </div>

              <template v-if="form.resource_type === 'energia_elettrica'">
                  <div class="form-section-title">Dati Tecnici (Solo Luce)</div>
                  <div class="form-grid-3">
                      <div class="form-group">
                          <label>Prelievo (kW)</label>
                          <input v-model="form.consumer_power_kw" type="number" step="0.01" class="compact-input">
                      </div>
                      <div class="form-group">
                          <label>Immissione (kW)</label>
                          <input v-model="form.producer_power_kw" type="number" step="0.01" class="compact-input">
                      </div>
                      <div class="form-group">
                          <label>Accumulo (kW)</label>
                          <input v-model="form.storage_power_kw" type="number" step="0.01" class="compact-input">
                      </div>
                  </div>
              </template>

              <div v-if="errorMsg" class="alert alert-error mt-3">{{ errorMsg }}</div>
          </form>

        </div>

        <div class="modal-footer" v-if="formMode === 'manual'">
          <button type="button" @click="closeModal" class="btn-ghost-small">Annulla</button>
          <button type="button" @click="submitForm" class="btn-save-small" :disabled="isSubmitting">
              {{ isSubmitting ? 'Salvataggio...' : 'Salva Risorsa' }}
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from '@/services/axios';

const props = defineProps({
  show: { type: Boolean, default: false },
  resourceToEdit: { type: Object, default: null } // Se null, siamo in "Creazione"
});

const emit = defineEmits(['close', 'saved']);

// --- STATO DEL FORM ---
const formMode = ref('selection'); // 'selection' | 'ai_loading' | 'manual'
const isSubmitting = ref(false);
const errorMsg = ref('');
const fileInput = ref(null);

const initialFormState = {
    resource_type: 'energia_elettrica',
    pod_code: '',
    titolare_nominativo: '',
    titolare_email: '',
    operative_email: '',
    address: '',
    city: '',
    province: '',
    consumer_power_kw: 0,
    producer_power_kw: 0,
    storage_power_kw: 0
};

const form = ref({ ...initialFormState });
const isEditing = computed(() => !!props.resourceToEdit);

// --- WATCHERS ---
// Reagisce quando la modale viene aperta o quando cambia la risorsa da modificare
watch(() => props.show, (newVal) => {
    if (newVal) {
        errorMsg.value = '';
        if (props.resourceToEdit) {
            // MODIFICA: Pre-compila il form e salta la selezione
            form.value = JSON.parse(JSON.stringify(props.resourceToEdit));
            formMode.value = 'manual';
        } else {
            // NUOVO: Resetta il form e mostra la selezione
            form.value = { ...initialFormState };
            formMode.value = 'selection';
        }
    }
});

// --- AZIONI ---
const closeModal = () => {
    emit('close');
};

const startManualForm = () => {
    formMode.value = 'manual';
};

// --- CARICAMENTO MAGICO (AI) ---
const handleMagicUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    formMode.value = 'ai_loading';
    errorMsg.value = '';

    const formData = new FormData();
    formData.append('bill_file', file);

    try {
        // Sostituisci con l'endpoint reale della tua API per l'estrazione AI
        const response = await axios.post('/api/ai/extract-bill', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const aiData = response.data.ai_data;
        
        // Mappa i dati dell'AI sul nostro form
        form.value.resource_type = response.data.type || 'energia_elettrica';
        form.value.pod_code = aiData.pod_id || aiData.pdp_id || aiData.pdr_id || response.data.code;
        form.value.titolare_nominativo = aiData.customer_name;
        form.value.address = aiData.indirizzo?.Via || '';
        form.value.city = aiData.indirizzo?.Città || '';
        form.value.province = aiData.indirizzo?.Provincia || '';
        
        // Passa al form manuale per far controllare i dati all'utente
        formMode.value = 'manual';

    } catch (error) {
        console.error("Errore Lettura AI:", error);
        errorMsg.value = "Impossibile leggere la bolletta. Procedi con l'inserimento manuale.";
        formMode.value = 'selection';
    } finally {
        if (fileInput.value) fileInput.value.value = '';
    }
};

// --- SALVATAGGIO ---
const submitForm = async () => {
    isSubmitting.value = true;
    errorMsg.value = '';

    try {
        if (isEditing.value) {
            // Chiamata PUT per aggiornare
            await axios.put(`/api/resources/${form.value.id}`, form.value);
        } else {
            // Chiamata POST per creare
            await axios.post('/api/resources', form.value);
        }
        
        emit('saved'); // Avvisa il padre di ricaricare la lista
        closeModal();

    } catch (error) {
        errorMsg.value = error.response?.data?.message || "Errore durante il salvataggio.";
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
/* CONTENITORE E MODALE */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.form-modal { width: 95%; max-width: 650px; background: var(--bg-card); border-radius: 16px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }

.modal-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-app); color: var(--text-main); }
.modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); transition: 0.2s;}
.btn-close-modal:hover { color: var(--text-main); }

.modal-body { padding: 1.5rem; overflow-y: auto; color: var(--text-main); }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; background: var(--bg-app); }

/* SELEZIONE MAGICA */
.magic-card, .manual-card { display: flex; align-items: center; gap: 15px; padding: 20px; border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; background: var(--bg-app); transition: all 0.3s ease; margin-bottom: 15px; }
.magic-card { border-color: var(--accent-blue); background: rgba(59, 130, 246, 0.03); }
.magic-card:hover { background: rgba(59, 130, 246, 0.08); transform: translateY(-2px); }
.manual-card:hover { border-color: var(--text-muted); transform: translateY(-2px); }

.m-icon { font-size: 2rem; }
.m-text { display: flex; flex-direction: column; }
.m-text strong { font-size: 1.05rem; }
.m-text span { font-size: 0.85rem; color: var(--text-muted); }

.divider { text-align: center; margin: 20px 0; position: relative; }
.divider::before { content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: var(--border-color); z-index: 1; }
.divider span { position: relative; background: var(--bg-card); padding: 0 15px; color: var(--text-muted); font-size: 0.8rem; font-weight: 700; z-index: 2; }

/* SELETTORE TIPO RISORSA */
.type-selector { display: flex; gap: 10px; }
.type-option { flex: 1; text-align: center; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 600; font-size: 0.9rem; background: var(--bg-app); }
.type-option input { display: none; }
.type-option:hover:not(.active) { background: var(--bg-card); }
.type-option.active { border-color: var(--accent-blue); background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
.type-option input:disabled ~ * { opacity: 0.6; cursor: not-allowed; }

/* FORM STYLES */
.compact-form { display: flex; flex-direction: column; gap: 12px; }
.form-section-title { font-size: 0.8rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px dashed var(--border-color); padding-bottom: 5px; margin-top: 10px; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
.compact-input { padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.9rem; background: var(--bg-app); color: var(--text-main); transition: border 0.2s; }
.compact-input:focus { border-color: var(--accent-blue); outline: none; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

/* PULSANTI E UTILS */
.btn-save-small { background-color: var(--accent-blue); color: white; padding: 10px 20px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-save-small:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost-small { background: transparent; border: 1px solid var(--border-color); padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; color: var(--text-main); }
.btn-ghost-small:hover { border-color: var(--text-muted); }

.alert { padding: 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 500; }
.alert-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
.text-muted { color: var(--text-muted); }

/* ANIMAZIONI */
.fade-in { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.modal-slide-enter-active, .modal-slide-leave-active { transition: opacity 0.3s, transform 0.3s; }
.modal-slide-enter-from, .modal-slide-leave-to { opacity: 0; transform: translateY(-20px); }

/* LOADING AI */
.ai-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 0; text-align: center; }
.spinner-large { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* RESPONSIVE */
@media (max-width: 600px) {
    .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
}
</style>
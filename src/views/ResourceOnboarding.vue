<template>
  <div class="app-container">
    <main class="main-content flex-center">
      <div class="glass-modal form-modal compact-modal">
        
        <div class="modal-header compact-header">
          <h3>{{ $t('onboarding.title') }}</h3>
          <button @click="$router.push('/resources')" class="btn-close-modal">✕</button>
        </div>
        
        <div class="modal-body compact-body">
          
          <div v-if="formMode === 'selection'" class="magic-selection fade-in">
             <h4 class="text-center mb-3">{{ $t('onboarding.magicTitle') }}</h4>
             <p class="text-center text-muted" style="font-size: 0.9rem; margin-bottom: 20px;">
                 {{ $t('onboarding.magicDesc') }}
             </p>

             <input type="file" id="magicBillInput" accept="application/pdf,image/*" style="display:none" @change="handleMagicUpload">
             <div class="magic-card hover-scale" @click="triggerMagicUpload">
                 <div class="m-icon">📄✨</div>
                 <div class="m-text">
                     <strong>{{ $t('onboarding.uploadBtn') }}</strong>
                     <span>{{ $t('onboarding.uploadFormat') }}</span>
                 </div>
             </div>
             
             <div v-if="errorMsg" class="error-text text-center mt-3">{{ errorMsg }}</div>
          </div>

          <div v-else-if="formMode === 'ai_loading'" class="ai-processing-state fade-in">
              <div class="ai-animation-box"><div class="magic-ring"><div class="magic-sparkle">✨</div></div></div>
              <h3>{{ $t('onboarding.analyzingTitle') }}</h3>
              <p class="sub-text">{{ $t('onboarding.analyzingDesc') }}</p>
              <div class="loader-bar"><div class="bar-fill"></div></div>
          </div>

          <div v-else-if="formMode === 'result' && analyzedData" class="fade-in result-container">
              <div class="result-header text-center mb-4">
                  <div style="font-size: 3rem; margin-bottom: 10px;">✅</div>
                  <h3 style="margin:0;">{{ $t('onboarding.successTitle') }}</h3>
                  <span :class="['type-badge', getTypeBadgeClass(analyzedData.type)]" style="margin-top:10px; display:inline-block;">
                      {{ formatType(analyzedData.type) }}
                  </span>
              </div>

              <div class="ai-insights-panel mb-4">
                  <div class="panel-header">
                      <span class="icon">🔍</span>
                      <strong>{{ $t('onboarding.extractedData') }}</strong>
                  </div>
                  
                  <div class="panel-grid">
                      <div class="insight-item">
                          <label>{{ $t('onboarding.idCode') }}</label>
                          <span class="badge badge-neutral monospace">{{ analyzedData.code || $t('pdrAiModal.nd') }}</span>
                      </div>
                      
                      <div v-if="analyzedData.type === 'energia_elettrica'" style="display: contents;">
                          <div class="insight-item" style="grid-column: 1 / -1; margin-top: 10px;">
                              <button @click.prevent="showAiModal = true" class="btn-ai-indicator hover-scale" style="width: 100%; padding: 12px; font-size: 0.95rem; justify-content: center; display: flex; align-items: center; gap: 8px;">
                                  {{ $t('onboarding.viewElectricReport') }}
                              </button>
                          </div>
                      </div>

                      <div v-else-if="analyzedData.type === 'gas'" style="display: contents;">
                          <div class="insight-item">
                              <label>{{ $t('onboarding.annualConsumptionSmc') }}</label>
                              <span class="badge badge-gas-color">{{ getNestedData('consumption', 'annual_smc') }} SMC</span>
                          </div>
                          <div class="insight-item">
                              <label>{{ $t('onboarding.totalCost') }}</label>
                              <span class="badge badge-neutral">€ {{ getNestedData('payment', 'total_amount') }}</span>
                          </div>
                          <div class="insight-item" style="grid-column: 1 / -1; margin-top: 15px;">
                              <button @click.prevent="showPdrAiModal = true" class="hover-scale" style="width: 100%; padding: 12px; font-size: 0.95rem; justify-content: center; display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2);">
                                  {{ $t('onboarding.viewGasReport') }}
                              </button>
                          </div>
                      </div>

                      <div v-else-if="analyzedData.type === 'acqua'" style="display: contents;">
                          <div class="insight-item">
                              <label>{{ $t('onboarding.annualConsumptionMc') }}</label>
                              <span class="badge badge-water-color">{{ getNestedData('consumption', 'annual_mc') }} MC</span>
                          </div>
                          <div class="insight-item">
                              <label>{{ $t('onboarding.totalCost') }}</label>
                              <span class="badge badge-neutral">€ {{ getNestedData('payment', 'total_amount') }}</span>
                          </div>
                          <div class="insight-item" style="grid-column: 1 / -1; margin-top: 15px;">
                              <button @click.prevent="showWaterAiModal = true" class="hover-scale" style="width: 100%; padding: 12px; font-size: 0.95rem; justify-content: center; display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);">
                                  {{ $t('onboarding.viewWaterReport') || '💧 Visualizza Report Acqua AI' }}
                              </button>
                          </div>
                      </div>
                  </div>
                  
                  <div class="ai-notes" v-if="analyzedData.ai_cost">
                      <small style="opacity: 0.6">{{ $t('onboarding.aiCost') }} $ {{ Number(analyzedData.ai_cost).toFixed(5) }}</small>
                  </div>
              </div>

              <div v-if="errorMsg && formMode === 'result'" class="error-text text-center mt-3 mb-2">{{ errorMsg }}</div>
              <div v-if="successMsg" class="success-text text-center mt-3 mb-2" style="color: #10b981; font-weight: 700; font-size: 1.1rem; background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);">
                  🎉 {{ successMsg }}
              </div>
              <div class="compact-footer" style="justify-content: center; border-top: none; padding-top: 0;">
                  <button @click="resetForm" class="btn-ghost-small" :disabled="isSaving">{{ $t('onboarding.uploadAnother') }}</button>
                  <button @click="confirmAndSave" class="btn-save-small" :disabled="isSaving">
                      {{ isSaving ? 'Salvataggio...' : $t('onboarding.confirmSave') }}
                  </button>
              </div>
          </div>

        </div>
      </div>
    </main>

    <PodAiModal 
        v-if="analyzedData && analyzedData.type === 'energia_elettrica'"
        :show="showAiModal" 
        :aiData="analyzedData.ai_data" 
        @close="showAiModal = false" 
    />

    <PdrAiModal 
        v-if="analyzedData && analyzedData.type === 'gas'"
        :show="showPdrAiModal" 
        :aiData="analyzedData.ai_data" 
        @close="showPdrAiModal = false" 
    />

    <WaterAiModal 
        v-if="analyzedData && analyzedData.type === 'acqua'"
        :show="showWaterAiModal" 
        :aiData="analyzedData.ai_data" 
        @close="showWaterAiModal = false" 
    />

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from '@/services/axios';


import PodAiModal from '@/components/pods/PodAiModal.vue';
import PdrAiModal from '@/components/pods/PdrAiModal.vue';
import WaterAiModal from '@/components/pods/WaterAiModal.vue';

const router = useRouter();
const { t } = useI18n();

const formMode = ref('selection');
const errorMsg = ref('');
const successMsg = ref(''); // <-- NUOVA VARIABILE AGGIUNTA
const analyzedData = ref(null);

const billFile = ref(null); 
const isSaving = ref(false); 

const showAiModal = ref(false);
const showPdrAiModal = ref(false);
const showWaterAiModal = ref(false);

const triggerMagicUpload = () => { document.getElementById('magicBillInput').click(); };

const handleMagicUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    billFile.value = file;
    formMode.value = 'ai_loading';
    errorMsg.value = '';
    
    try {
        const formData = new FormData(); 
        formData.append('bill_file', file);
        
        const res = await axios.post('/api/pods/analyze-resource', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (res.data && res.data.type && res.data.code) {
            analyzedData.value = res.data;
            formMode.value = 'result';
        } else {
            throw new Error(t('onboarding.errors.notRecognized'));
        }
    } catch (e) {
        formMode.value = 'selection';
        errorMsg.value = e.response?.data?.message || t('onboarding.errors.analysisFailed');
        billFile.value = null;
    } finally {
        event.target.value = ''; 
    }
};

const getNestedData = (group, key) => {
    if (!analyzedData.value || !analyzedData.value.ai_data) return t('pdrAiModal.nd');
    if (!analyzedData.value.ai_data[group]) return t('pdrAiModal.nd');
    return analyzedData.value.ai_data[group][key] || t('pdrAiModal.nd');
};

const formatType = (type) => {
  if (!type) return t('pdrAiModal.nd');
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

const confirmAndSave = async () => {
    // 1. DEBUG FRONTEND: Vediamo se il click parte e cosa ha in memoria
    console.log("👉 Click su Conferma e Salva!");
    console.log("Dati analizzati (analyzedData):", analyzedData.value);
    console.log("File in memoria (billFile):", billFile.value);

    // Controlli di sicurezza con Alert visivi
    if (!analyzedData.value) {
        alert("⚠️ ERRORE INTERNO: Mancano i dati analizzati dall'AI.");
        return;
    }
    if (!billFile.value) {
        alert("⚠️ ERRORE INTERNO: Il file PDF/Immagine della bolletta è andato perso dalla memoria!");
        return;
    }

    isSaving.value = true;
    errorMsg.value = '';
    successMsg.value = ''; 

    try {
        console.log("🚀 Preparazione dati per l'invio al backend...");
        const formData = new FormData();
        formData.append('bill_file', billFile.value);
        formData.append('resource_type', analyzedData.value.type);
        formData.append('code', analyzedData.value.code);
        formData.append('ai_data', JSON.stringify(analyzedData.value.ai_data));

        console.log("📡 Chiamata API a /api/resources/store-onboarding in corso...");
        
        // La chiamata vera e propria
        const res = await axios.post('/api/resources/store-onboarding', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        console.log("✅ Risposta dal server ricevuta:", res.data);
        
        successMsg.value = res.data.message || 'Risorsa salvata con successo!';

        // Aspettiamo 2.5 secondi prima di cambiare pagina, così hai il tempo di leggere il successo
        setTimeout(() => {
            console.log("🔄 Reindirizzamento a /resources...");
            // MODIFICA QUI: Da '/pods' a '/resources'
            router.push('/resources'); 
        }, 2500);
        
    } catch (e) {
        // Se c'è un errore di rotta (404) o validazione (422), lo becchiamo qui!
        console.error("❌ Errore API Frontend:", e);
        errorMsg.value = e.response?.data?.message || 'Errore di connessione al server.';
    } finally {
        isSaving.value = false;
    }
};

const resetForm = () => {
    analyzedData.value = null;
    billFile.value = null;
    showAiModal.value = false;
    showPdrAiModal.value = false;
    showWaterAiModal.value = false;
    formMode.value = 'selection';
    errorMsg.value = '';
    successMsg.value = ''; // <-- RESETTA IL MESSAGGIO QUI
};
</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
/* Contenitore Base */
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.flex-center { display: flex; justify-content: center; align-items: center; min-height: 85vh; padding: 20px;}

/* Modale Compatta */
.glass-modal { background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; }
.compact-modal { width: 100%; max-width: 550px; }
.compact-header { padding: 1.2rem 1.5rem; background: var(--bg-app); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.compact-header h3 { margin: 0; color: var(--text-main); font-size: 1.2rem; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }
.compact-body { padding: 2rem 1.5rem; }

/* Magic Upload */
.magic-selection { display: flex; flex-direction: column; align-items: center; }
.magic-card { width: 100%; background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 30px; display: flex; align-items: center; justify-content: center; gap: 15px; cursor: pointer; transition: all 0.3s ease; }
.magic-card:hover { transform: translateY(-2px); border-color: var(--accent-blue); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); }
.m-icon { font-size: 3rem; }
.m-text { display: flex; flex-direction: column; }
.m-text strong { font-size: 1.1rem; color: var(--text-main); margin-bottom: 4px; }
.m-text span { font-size: 0.85rem; color: var(--text-muted); }

/* Animazioni AI Loading */
.ai-processing-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 2rem 0; }
.ai-animation-box { margin-bottom: 1.5rem; position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
.magic-ring { width: 60px; height: 60px; border-radius: 50%; box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); display: flex; align-items: center; justify-content: center; animation: pulse-ring 2s infinite; position: relative;}
.magic-ring::after { content: ''; position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid #6366f1; border-top-color: transparent; animation: spin 1.5s linear infinite; }
.magic-sparkle { font-size: 2rem; animation: bounce 2s infinite; }
.loader-bar { width: 100%; max-width: 250px; height: 6px; background: var(--bg-app); border-radius: 10px; margin-top: 1.5rem; overflow: hidden; position: relative; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); width: 50%; position: absolute; left: 0; top: 0; border-radius: 10px; animation: load-bar 2s ease-in-out infinite; }

/* Pannello Risultati AI */
.ai-insights-panel { background: linear-gradient(to right, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05)); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 20px; }
.panel-header { display: flex; align-items: center; gap: 8px; margin-bottom: 15px; color: var(--accent-blue); font-size: 1rem; }
.panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.insight-item { display: flex; flex-direction: column; gap: 6px; }
.insight-item label { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }
.badge { padding: 8px 12px; border-radius: 6px; font-size: 0.95rem; font-weight: 700; display: inline-block; text-align: left;}
.badge-gas-color { background: rgba(249, 115, 22, 0.15); color: #ea580c; border: 1px solid rgba(249, 115, 22, 0.3); }
.badge-water-color { background: rgba(59, 130, 246, 0.15); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.3); }
.badge-neutral { background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color); }
.monospace { font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; font-size: 1.1rem; }
.ai-notes { margin-top: 15px; text-align: right; }

/* Pulsante Modale */
.btn-ai-indicator { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2); transition: transform 0.2s; }
.btn-ai-indicator:hover, .hover-scale:active { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); }

/* Badges Titolo */
.type-badge { font-size: 0.85rem; padding: 6px 14px; border-radius: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid transparent; }
.badge-luce { background: rgba(245, 158, 11, 0.1); color: #d97706; border-color: rgba(245, 158, 11, 0.3); }
.badge-gas { background: rgba(249, 115, 22, 0.1); color: #ea580c; border-color: rgba(249, 115, 22, 0.3); }
.badge-acqua { background: rgba(59, 130, 246, 0.1); color: #2563eb; border-color: rgba(59, 130, 246, 0.3); }
.badge-default { background: var(--bg-app); color: var(--text-muted); border-color: var(--border-color); }

/* Buttons & Utils */
.compact-footer { display: flex; gap: 15px; margin-top: 20px; }
.btn-save-small { background-color: var(--accent-blue); color: white; padding: 12px 24px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s;}
.btn-save-small:hover:not(:disabled) { background-color: var(--accent-cyan); }
.btn-save-small:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-ghost-small { background: var(--bg-card); border: 1px solid var(--border-color); padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; color: var(--text-main); }
.error-text { color: #ef4444; font-weight: 600; font-size: 0.95rem; }

/* Keyframes */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes load-bar { 0% { left: -50%; width: 50%; } 50% { left: 25%; width: 50%; } 100% { left: 100%; width: 50%; } }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
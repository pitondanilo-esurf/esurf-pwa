<template>
  <div class="app-container">
    <TopNavbar />

    <main class="main-content" :class="'theme-' + selectedLens">
      
      <div class="premium-progress fade-in">
        <div class="progress-bar" style="width: 25%;"></div>
      </div>

      <div class="header-premium fade-in delay-1">
        <div class="badges-row">
          <div class="card-tag lens-tag">
            <span class="lens-icon-mini">{{ lensMap[selectedLens].icon }}</span>
            {{ lensMap[selectedLens].label }}
          </div>
        </div>
        <h1 class="title-premium">Ottimo. Ora carichiamo la materia prima.</h1>
        <p class="subtitle-premium">{{ $t('onboarding.magicDesc') }}</p>
      </div>

      <div v-if="formMode === 'selection'" class="cards-stack fade-in delay-2">
        <input 
          type="file" 
          id="magicBillInput" 
          style="display: none;" 
          accept="application/pdf, image/*"
          @change="handleMagicUpload"
        />
        
        <div class="revo-card" @click="triggerMagicUpload">
          <div class="card-header">
            <div class="icon-circle icon-pdf">📄</div>
            <div>
              <h3 class="card-title-text">Carica Bolletta</h3>
              <p class="card-body">Carica il PDF o una foto nitida</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="formMode === 'ai_loading'" class="ai-loading-container fade-in">
        <div class="ai-visual">
          <div class="pulse-ring"></div>
          <span class="ai-icon">e</span>
        </div>
        <h3 class="card-title-text">Analisi in corso...</h3>
        <p class="card-body">L'Intelligenza Artificiale sta estraendo i dati.</p>
      </div>

      <div v-else-if="formMode === 'result' && analyzedData" class="result-stack fade-in">
        <div class="revo-card result-summary">
          <div class="card-tag lens-tag">
            {{ analyzedData.type.replace('_', ' ').toUpperCase() }} RILEVATA
          </div>
          
          <div class="result-row">
            <span class="label">Codice (POD/PDR):</span>
            <span class="value monospace">{{ analyzedData.code }}</span>
          </div>

          <div class="action-buttons">
            <button @click="resetForm" class="btn-secondary-revo">Annulla</button>
            <button 
              @click="confirmAndSave" 
              class="btn-primary-revo"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Salvataggio...' : 'Conferma e Prosegui' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="errorMsg" class="error-toast fade-in">{{ errorMsg }}</div>
      <div v-if="successMsg" class="success-toast fade-in">{{ successMsg }}</div>
    </main>

    <BottomNavbar class="fade-in delay-3" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios';
import TopNavbar from '@/components/TopNavbar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';

// --- INIZIO IMPORT DA BACKUP PER VALIDAZIONE ---
import { validaBollettaPreUpload } from '@/utils/billValidator';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'; 

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
// --- FINE IMPORT DA BACKUP PER VALIDAZIONE ---

const router = useRouter();
const selectedLens = ref('wallet');
const formMode = ref('selection');
const errorMsg = ref('');
const successMsg = ref('');
const analyzedData = ref(null);
const billFile = ref(null);
const isSaving = ref(false);

const currentUser = ref({ cf: '', piva: '' }); // Aggiunto dal backup

const lensMap = {
  wallet: { icon: '📉', label: 'Lente Wallet' },
  planet: { icon: '🌿', label: 'Lente Planet' },
  shield: { icon: '🛡️', label: 'Lente Shield' }
};

onMounted(async () => {
  const saved = localStorage.getItem('esurf_selected_lens');
  if (saved && lensMap[saved]) selectedLens.value = saved;

  // Aggiunto dal backup per recuperare i dati dell'utente per la validazione
  try {
    const res = await axios.get('/api/user');
    currentUser.value = res.data;
  } catch (e) {
    console.error("Errore recupero dati utente", e);
  }
});

const triggerMagicUpload = () => document.getElementById('magicBillInput').click();

const handleMagicUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // --- AGGIUNTA: Resetta i messaggi precedenti al nuovo tentativo ---
    errorMsg.value = '';
    successMsg.value = '';
    formMode.value = 'ai_loading';
    
    // Utilizzo della funzione esterna
    const result = await validaBollettaPreUpload(file, {
        cf: currentUser.value.cf,
        piva: currentUser.value.piva
    });

    if (!result.valid) {
        formMode.value = 'selection';
        
        // Se l'errore è relativo al CF/P.IVA, costruiamo il messaggio con i valori incrociati
        if (result.error.includes('Codice Fiscale') || result.error.includes('P.IVA') || result.error.includes('corrispondono')) {
            
            // 1. Il dato che ci aspettiamo dal DB (se ha la PIVA diamo priorità a quella)
            const expectedValue = currentUser.value.piva ? currentUser.value.piva : currentUser.value.cf;
            
            // 2. Il dato che la funzione ha trovato nel file PDF (se presente)
            const foundValue = result.foundValue ? result.foundValue : "Nessuno o illeggibile";
            
            errorMsg.value = `⚠️ Attenzione: Il CF/P.IVA letto nella bolletta (${foundValue}) non corrisponde al tuo profilo (${expectedValue}).`;
        } else {
            // Per tutti gli altri errori (es. file troppo grande, non PDF) manteniamo l'errore standard
            errorMsg.value = `⚠️ ${result.error}`;
        }
        
        event.target.value = ''; 
        return;
    }

    // 2. Se è valida, procedi con l'analisi AI
    billFile.value = file;
    
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
        const status = e.response?.status;
        const serverMsg = e.response?.data?.message || "";

        // Gestione Granulare degli Errori di Analisi
        if (status === 413) {
            errorMsg.value = "Il file è troppo grande. La dimensione massima consentita è 5MB.";
        } else if (status === 415) {
            errorMsg.value = "Formato file non supportato. Per favore, usa PDF, JPG o PNG.";
        } else if (status === 422) {
            errorMsg.value = serverMsg || "L'Intelligenza Artificiale non è riuscita a leggere il documento. Assicurati che sia una bolletta intera e leggibile.";
        } else if (status === 503 || serverMsg.includes('503') || serverMsg.toLowerCase().includes('timeout')) {
            errorMsg.value = "I server dell'AI sono momentaneamente sovraccarichi. Riprova tra qualche minuto.";
        } else {
            errorMsg.value = serverMsg || "Si è verificato un errore durante l'analisi. Controlla la tua connessione e riprova.";
        }
        
        billFile.value = null;
    } finally {
        event.target.value = ''; 
    }
};

const confirmAndSave = async () => {
    console.log("👉 Click su Conferma e Salva!");

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
        const formData = new FormData();
        formData.append('bill_file', billFile.value);
        formData.append('resource_type', analyzedData.value.type);
        formData.append('code', analyzedData.value.code);
        formData.append('ai_data', JSON.stringify(analyzedData.value.ai_data));

        const res = await axios.post('/api/resources/store-onboarding', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        successMsg.value = res.data.message || 'Risorsa salvata con successo!';

        let podIdToSave = res.data.pod_id || res.data.id;
        if (!podIdToSave && res.data.data) {
            podIdToSave = res.data.data.id || res.data.data.pod_id;
        }

        if (podIdToSave) {
            localStorage.setItem('esurf_current_pod_id', String(podIdToSave));
            localStorage.setItem('esurf_current_pod_code', analyzedData.value.code);
            localStorage.setItem('esurf_current_resource_type', analyzedData.value.type);
        }

        // --- INIZIO MODIFICA ROUTING DINAMICO ---
        setTimeout(() => {
            let nextRoute = '/assetlight'; // Default: energia elettrica
            const rType = analyzedData.value.type.toLowerCase();

            if (rType.includes('gas')) {
                nextRoute = '/assetlight_gas';
            } else if (rType.includes('acqua') || rType.includes('water')) {
                nextRoute = '/assetlight_water';
            }

            console.log(`🔄 Reindirizzamento a ${nextRoute} in base al tipo rilevato (${rType})...`);
            router.push(nextRoute); 
        }, 2500);
        // --- FINE MODIFICA ROUTING DINAMICO ---
        
    } catch (e) {
        console.error("❌ Errore API Frontend:", e);
        errorMsg.value = e.response?.data?.message || 'Errore di connessione al server.';
    } finally {
        isSaving.value = false;
    }
};

const resetForm = () => { formMode.value = 'selection'; analyzedData.value = null; };
</script>

<style scoped>
@import '@/assets/main_V0.css';

/* STILI TEMA E LAYOUT ASSETLIGHT */
.theme-wallet { --accent: #d97706; }
.theme-planet { --accent: #10b981; }
.theme-shield { --accent: #3b82f6; }

.main-content { padding: 12px 20px; max-width: 480px; margin: 0 auto; padding-bottom: 80px; }

.premium-progress { height: 3px; background: var(--border-color); border-radius: 4px; margin-bottom: 16px; overflow: hidden; }
.progress-bar { height: 100%; background: var(--accent); transition: width 0.5s ease; }

.header-premium { margin-bottom: 20px; }
.badges-row { display: flex; gap: 8px; margin-bottom: 12px; }
.card-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); display: inline-block;}
.lens-tag { color: var(--accent); }
.lens-icon-mini { font-size: 12px; margin-right: 4px; }

.title-premium { font-size: 24px; font-weight: 800; margin: 0; color: var(--text-primary); letter-spacing: -0.5px; }
.subtitle-premium { font-size: 13px; color: var(--text-muted); margin-top: 4px; line-height: 1.3; }

/* Stili specifici per la gestione dei bottoni e avvisi */
.action-buttons { display: flex; gap: 12px; margin-top: 20px; }
.btn-primary-revo { 
  flex: 2; background: var(--text-primary); color: var(--bg-card); 
  border: none; padding: 16px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s;
}
.btn-primary-revo:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-secondary-revo { 
  flex: 1; background: var(--border-color); color: var(--text-primary); 
  border: none; padding: 16px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s;
}

/* Stile Card e Titoli */
.revo-card {
  width: 100%; text-align: left; padding: 24px; border-radius: 24px;
  background: var(--bg-card); border: 1px solid var(--border-color);
  box-shadow: var(--shadow-card); color: var(--text-primary);
  margin-bottom: 16px; cursor: pointer; transition: all 0.2s ease;
}
.revo-card:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08); }

.card-title-text { 
  color: var(--text-primary) !important; 
  font-size: 17px; font-weight: 800; margin: 0; 
}
.card-body { color: var(--text-muted); font-size: 14px; margin-top: 4px; line-height: 1.5; }

.card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
.icon-circle { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.icon-pdf { background: rgba(59, 130, 246, 0.1); }

/* AI Loading */
.ai-loading-container { text-align: center; padding: 60px 20px; }
.ai-visual { position: relative; margin-bottom: 30px; display: inline-block; }
.ai-icon { font-size: 40px; position: relative; z-index: 2; }
.pulse-ring {
  position: absolute; width: 80px; height: 80px; background: var(--accent); opacity: 0.2;
  border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

/* Utils */
.result-row { display: flex; justify-content: space-between; margin: 12px 0; }
.monospace { font-family: monospace; font-size: 16px; font-weight: bold; }
.error-toast { background: #ef4444; color: white; padding: 12px; border-radius: 12px; text-align: center; margin-top: 20px; font-weight: 600; }
.success-toast { background: #10b981; color: white; padding: 12px; border-radius: 12px; text-align: center; margin-top: 20px; font-weight: 600; }
</style>
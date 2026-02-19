<template>
  <div class="setup-container">
    <div class="card">
      <div class="header">
        <div class="icon">🔐</div>
        <h2>Completa il Profilo</h2>
      </div>
      
      <p class="subtitle" v-if="email">Ciao, <span class="highlight">{{ email }}</span></p>
      <p class="description">Inserisci i tuoi dati personali, imposta una password e accetta i termini per attivare l'account.</p>

      <form @submit.prevent="completeSetup">
        
        <div class="form-row">
            <div class="form-group">
              <label>Nome</label>
              <input 
                v-model="form.name" 
                type="text" 
                placeholder="Mario" 
                required 
                class="input-field"
              >
            </div>
            <div class="form-group">
              <label>Cognome</label>
              <input 
                v-model="form.surname" 
                type="text" 
                placeholder="Rossi" 
                required 
                class="input-field"
              >
            </div>
        </div>

        <div class="form-group">
          <label>Nuova Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="Minimo 8 caratteri" 
            required 
            minlength="8"
            class="input-field"
          >
        </div>

        <div class="form-group">
          <label>Conferma Password</label>
          <input 
            v-model="form.password_confirmation" 
            type="password" 
            placeholder="Ripeti la password" 
            required
            class="input-field"
          >
        </div>

        <div class="legal-section">
            <div class="legal-row">
                <label class="checkbox-wrapper">
                    <input type="checkbox" v-model="form.accept_esurf" required>
                    <span class="custom-check"></span>
                    <span class="label-text">
                        Accetto i <a href="#" @click.prevent="viewPdf('terms_esurf', 'Termini e Condizioni')">Termini di Servizio e-Surf</a>
                    </span>
                </label>
            </div>
            
            <div class="legal-row">
                <label class="checkbox-wrapper">
                    <input type="checkbox" v-model="form.accept_concernet" required>
                    <span class="custom-check"></span>
                    <span class="label-text">
                        Accetto il <a href="#" @click.prevent="viewPdf('code_ethics_concernet', 'Codice Etico Concernet')">Codice Etico Concernet</a>
                    </span>
                </label>
            </div>
        </div>

        <div v-if="errorMessage" class="alert error">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading || !form.accept_esurf || !form.accept_concernet">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Attivazione in corso...' : 'Attiva Account' }}
        </button>
      </form>
      
      <div class="footer-link">
        <small>Hai già un account? <a @click="$router.push('/login')">Accedi</a></small>
      </div>
    </div>

    <transition name="modal-fade">
        <div v-if="showPdfModal" class="modal-backdrop" @click.self="closePdfModal">
            <div class="glass-modal pdf-viewer-modal">
                <div class="modal-header">
                    <h3>{{ currentPdfTitle }}</h3>
                    <button @click="closePdfModal" class="btn-close-modal">✕</button>
                </div>
                <div class="modal-body-pdf">
                    <div v-if="pdfLoading" class="pdf-loading">
                        <div class="spinner-small"></div> Caricamento documento...
                    </div>
                    <iframe v-else :src="pdfUrl" class="pdf-iframe" title="Documento PDF"></iframe>
                </div>
            </div>
        </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// Importiamo axios "puro" per evitare conflitti con interceptor globali
import axios from 'axios'; 

const route = useRoute();
const router = useRouter();

// Creiamo un'istanza dedicata che NON ha interceptor globali (fix errore 401)
const setupApi = axios.create({
    baseURL: 'http://192.168.0.206:8000', // Modifica se necessario con il tuo IP/Dominio
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// DEFINIZIONE VARIABILI REATTIVE (Queste mancavano nel tuo script precedente)
const form = ref({
  name: '',      
  surname: '',   
  password: '',
  password_confirmation: '',
  accept_esurf: false,
  accept_concernet: false
});

const email = ref('');
const token = ref('');
const loading = ref(false);
const errorMessage = ref('');

// Variabili per il Modale PDF
const showPdfModal = ref(false);
const pdfLoading = ref(false);
const pdfUrl = ref('');
const currentPdfTitle = ref('');

// --- INIT ---
onMounted(() => {
  token.value = route.query.token;
  email.value = route.query.email;
  
  if (!token.value) {
    errorMessage.value = "Link di attivazione non valido (Token mancante).";
  }
});

// --- LOGICA PDF ---
const viewPdf = async (type, title) => {
    showPdfModal.value = true;
    pdfLoading.value = true;
    currentPdfTitle.value = title;
    
    try {
        // Usiamo setupApi per iniettare manualmente l'header Authorization corretto
        const response = await setupApi.get(`/api/legal/${type}/pdf`, { 
            responseType: 'blob',
            headers: {
                'Authorization': `Bearer ${token.value}`
            }
        });
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        pdfUrl.value = window.URL.createObjectURL(blob);
    } catch (e) {
        console.error("Errore PDF:", e);
        // Fallback: prova senza token se la rotta è pubblica
        if (e.response && e.response.status === 401) {
             try {
                 const resPublic = await setupApi.get(`/api/legal/${type}/pdf`, { responseType: 'blob' });
                 pdfUrl.value = window.URL.createObjectURL(new Blob([resPublic.data], { type: 'application/pdf' }));
                 return;
            } catch (ex) {}
        }
        alert("Impossibile caricare il documento. Il link potrebbe essere scaduto.");
        showPdfModal.value = false;
    } finally {
        pdfLoading.value = false;
    }
};

const closePdfModal = () => {
    showPdfModal.value = false;
    if (pdfUrl.value) {
        window.URL.revokeObjectURL(pdfUrl.value);
        pdfUrl.value = '';
    }
};

// --- LOGICA INVIO FORM ---
const completeSetup = async () => {
  // Validazioni
  if (!form.value.name || !form.value.surname) { errorMessage.value = "Nome e Cognome sono obbligatori."; return; }
  if (form.value.password.length < 8) { errorMessage.value = "La password deve avere almeno 8 caratteri."; return; }
  if (form.value.password !== form.value.password_confirmation) { errorMessage.value = "Le due password non coincidono."; return; }
  if (!form.value.accept_esurf || !form.value.accept_concernet) { errorMessage.value = "Devi accettare tutti i documenti legali."; return; }

  if (!token.value) { errorMessage.value = "Token mancante."; return; }

  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await setupApi.post('/api/auth/complete-owner-setup', 
      {
        name: form.value.name,       
        surname: form.value.surname, 
        password: form.value.password,
        password_confirmation: form.value.password_confirmation,
        accept_esurf: true,
        accept_concernet: true
      },
      {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      }
    );

    const newAccessToken = response.data.access_token;
    
    if (newAccessToken) {
        localStorage.setItem('auth_token', newAccessToken); 
        
        // Opzionale: reindirizzamento in base al ruolo
        const user = response.data.user || {};
        alert("Account attivato con successo!");
        
        if (user.role === 'owner') router.push('/owner/dashboard');
        else if (user.role === 'admin') router.push('/admin');
        else router.push('/dashboard');
    } else {
        router.push('/login');
    }

  } catch (error) {
    console.error(error);
    if (error.response?.data?.message) {
         errorMessage.value = error.response.data.message;
    } else {
         errorMessage.value = "Errore durante l'attivazione.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* STILI GENERALI */
.setup-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8fafc; padding: 20px; font-family: 'Inter', sans-serif; }
.card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); width: 100%; max-width: 480px; text-align: center; }
.header { margin-bottom: 2rem; }
.icon { font-size: 2.5rem; margin-bottom: 1rem; }
h2 { margin: 0 0 0.5rem 0; color: #1e293b; font-size: 1.5rem; font-weight: 700; }
.subtitle { color: #64748b; margin: 0; font-size: 0.95rem; }
.highlight { color: #3b82f6; font-weight: 600; }
.description { color: #94a3b8; font-size: 0.85rem; margin: 1rem 0 1.5rem 0; line-height: 1.5; }

/* FORM LAYOUT */
.form-row { display: flex; gap: 1rem; }
.form-group { margin-bottom: 1.25rem; text-align: left; flex: 1; }
.form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #475569; }
.input-field { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; box-sizing: border-box; }
.input-field:focus { outline: none; border-color: #3b82f6; }

/* LEGAL SECTION */
.legal-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: left; }
.legal-row { margin-bottom: 10px; }
.checkbox-wrapper { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; color: #334155; }
.checkbox-wrapper input { display: none; }
.custom-check { width: 20px; height: 20px; border: 2px solid #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: white; transition: all 0.2s; flex-shrink: 0; }
.checkbox-wrapper input:checked + .custom-check { background: #3b82f6; border-color: #3b82f6; }
.checkbox-wrapper input:checked + .custom-check::after { content: '✓'; color: white; font-weight: bold; font-size: 0.8rem; }
.label-text a { color: #3b82f6; text-decoration: none; font-weight: 600; }

/* BUTTONS */
.btn-primary { width: 100%; padding: 14px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: background 0.2s; display: flex; justify-content: center; align-items: center; gap: 10px; }
.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; opacity: 0.7; }

/* ALERT & LOADING */
.alert { padding: 12px; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem; text-align: left; }
.alert.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.spinner { width: 16px; height: 16px; border: 2px solid #ffffff; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
.spinner-small { width: 20px; height: 20px; border: 3px solid #cbd5e1; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* MODALE */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: white; width: 95%; max-width: 800px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; height: 85vh; }
.modal-header { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fff; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
.modal-body-pdf { flex: 1; background: #f1f5f9; position: relative; }
.pdf-iframe { width: 100%; height: 100%; border: none; }
.pdf-loading { display: flex; align-items: center; justify-content: center; height: 100%; gap: 10px; color: #64748b; font-weight: 500; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.footer-link { margin-top: 1.5rem; color: #64748b; }
.footer-link a { color: #3b82f6; text-decoration: none; cursor: pointer; font-weight: 600; }
</style>
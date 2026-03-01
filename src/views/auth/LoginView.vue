<template>
  <div class="auth-container">
    <div class="card" :class="{ 'wide-card': step === 3 }">
      
      <div v-if="step === 1">
        <div class="header">
          <h2 class="title">Bentornato</h2>
          <p class="subtitle">Accedi al tuo account e-Surf</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              v-model="loginForm.email" 
              type="email" 
              id="email" 
              placeholder="mario.rossi@esempio.it" 
              required 
              :class="{ 'error-border': error }"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              v-model="loginForm.password" 
              type="password" 
              id="password" 
              placeholder="La tua password" 
              required 
              :class="{ 'error-border': error }"
            />
          </div>

          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <button type="submit" :disabled="isLoading" class="btn-primary">
            <span v-if="!isLoading">Accedi</span>
            <span v-else class="loader">Verifica credenziali...</span>
          </button>

          <div class="footer-text">
            Non hai un account? <router-link to="/register">Registrati</router-link>
          </div>
        </form>
      </div>

      <div v-else-if="step === 2" class="otp-container">
        <div class="header">
          <h2 class="title">Verifica Email</h2>
          <p class="subtitle">
            Account non attivo. Abbiamo inviato un codice a:<br>
            <strong>{{ loginForm.email }}</strong>
          </p>
        </div>

        <form @submit.prevent="handleVerifyOtp" class="auth-form">
          <div class="form-group otp-group">
            <label for="otp">Inserisci Codice OTP</label>
            <input 
              v-model="otpCode" 
              type="text" 
              id="otp" 
              placeholder="123456" 
              maxlength="6"
              class="otp-input"
              required 
              autocomplete="one-time-code"
            />
            <span v-if="otpError" class="error-msg">{{ otpError }}</span>
          </div>

          <button type="submit" :disabled="isLoading" class="btn-primary">
            <span v-if="!isLoading">Verifica Email</span>
            <span v-else class="loader">Verifica in corso...</span>
          </button>
          
          <div class="footer-text">
             Non hai ricevuto il codice o è scaduto?<br>
             <a href="#" @click.prevent="resendOtp">Invia di nuovo</a>
          </div>
        </form>
      </div>

      <div v-else-if="step === 3">
        <div class="header">
          <h2 class="title">Completa Profilo</h2>
          <p class="subtitle">Verifica i tuoi dati anagrafici e attiva l'utenza.</p>
        </div>

        <form @submit.prevent="handleCompleteProfile" class="auth-form">
          
          <div class="type-selector">
            <label :class="{ active: profile.subject_type === 'private' }">
              <input type="radio" value="private" v-model="profile.subject_type"> Privato
            </label>
            <label :class="{ active: profile.subject_type === 'company' }">
              <input type="radio" value="company" v-model="profile.subject_type"> Azienda
            </label>
          </div>

          <div class="form-row">
            <div class="form-group">
               <label>Nome</label>
               <input v-model="profile.first_name" required placeholder="Es. Mario">
            </div>
            <div class="form-group">
               <label>Cognome</label>
               <input v-model="profile.last_name" required placeholder="Es. Rossi">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
               <label>Città</label>
               <input v-model="profile.city" required placeholder="Es. Milano">
            </div>
            <div class="form-group">
               <label>Provincia</label>
               <input v-model="profile.province" required placeholder="MI" maxlength="2" style="text-transform: uppercase;">
            </div>
          </div>

          <div v-if="profile.subject_type === 'private'" class="fade-in">
             <div class="form-group">
               <label>Codice Fiscale</label>
               <input v-model="profile.tax_code" required placeholder="Codice Fiscale" maxlength="16" style="text-transform: uppercase;">
             </div>
          </div>

          <div v-if="profile.subject_type === 'company'" class="fade-in">
             <div class="form-group">
               <label>Ragione Sociale</label>
               <input v-model="profile.company_name" required placeholder="Nome Azienda Srl">
             </div>
             <div class="form-group">
               <label>Partita IVA</label>
               <input v-model="profile.vat_number" required placeholder="Numero P.IVA">
             </div>
          </div>

          <hr class="divider">

          <div class="legal-section">
            <div class="legal-item">
              <input type="checkbox" id="esurf" v-model="profile.accept_esurf" required>
              <label for="esurf">
                Accetto i <a href="#" @click.prevent="openLegal('terms_esurf')">Termini di Servizio eSurf</a>
              </label>
            </div>
            <div class="legal-item">
              <input type="checkbox" id="concernet" v-model="profile.accept_concernet" required>
              <label for="concernet">
                Accetto il <a href="#" @click.prevent="openLegal('code_ethics_concernet')">Codice Etico Concernet</a>
              </label>
            </div>
          </div>

          <div v-if="generalError" class="alert alert-danger">{{ generalError }}</div>

          <button type="submit" :disabled="isLoading" class="btn-primary">
            <span v-if="!isLoading">Salva e Vai alla Dashboard</span>
            <span v-else class="loader">Salvataggio...</span>
          </button>
        </form>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
           <h3>Documento Legale</h3>
           <button class="close-btn" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
            <div v-if="!modalLoading" v-html="modalContent"></div>
            <div v-else class="loader-text">Caricamento documento...</div>
        </div>
        <div class="modal-footer">
            <button @click="showModal = false" class="btn-primary">Chiudi</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from '@/services/AuthService';

const router = useRouter();
const isLoading = ref(false);
const error = ref('');
const generalError = ref('');
const step = ref(1); // 1=Login, 2=OTP, 3=Profile

// Dati Step 1
const loginForm = reactive({ email: '', password: '' });

// Dati Step 2
const otpCode = ref('');
const otpError = ref('');

// Dati Step 3
const profile = reactive({
  first_name: '',
  last_name: '',
  subject_type: 'private',
  city: '',
  province: '',
  tax_code: '',
  company_name: '',
  vat_number: '',
  accept_esurf: false,
  accept_concernet: false
});

// Stati Modale
const showModal = ref(false);
const modalContent = ref('');
const modalLoading = ref(false);

// --- AZIONE 1: LOGIN E ROUTING STATO ---
const handleLogin = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const response = await AuthService.login(loginForm);
    
    if (response.data && response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
    }

    // Se l'oggetto user non è nella risposta login, lo recuperiamo
    let user = response.data.user;
    if (!user) {
        const userRes = await AuthService.getUser();
        user = userRes.data;
    }

    // SCENARIO A: Email non verificata
    if (!user.email_verified_at) {
        try {
            await AuthService.sendOtp(loginForm.email); 
            step.value = 2; 
        } catch (e) {
            console.warn("Invio OTP fallito.");
            router.push({
                path: '/register',
                query: { email: loginForm.email, error: 'invalid_email' }
            });
            return;
        }
    } 
    // SCENARIO B: Profilo Incompleto
    else if (!user.is_compliant) {
        profile.first_name = user.first_name || '';
        profile.last_name = user.last_name || '';
        
        if (user.profile) {
            profile.city = user.profile.city || '';
            profile.province = user.profile.province || '';
            profile.subject_type = user.profile.subject_type || 'private';
            profile.tax_code = user.profile.tax_code || '';
            profile.company_name = user.profile.company_name || '';
            profile.vat_number = user.profile.vat_number || '';
        }
        step.value = 3; 
    } 
    // SCENARIO C: Tutto OK
    else {
        // --- MODIFICA RBAC: Reindirizzamento basato sul ruolo ---
        if (user.role === 'admin') {
            router.push('/admin');
        } else if (user.role === 'owner') {
             // [CORRETTO] Reindirizziamo alla Owner Dashboard
             router.push('/owner/dashboard');
        } else {
            // Utente Standard
            router.push('/home');
        }
    }

  } catch (e) {
    console.error(e);
    if (e.response && e.response.status === 401) {
        error.value = "Email o password non corretti.";
    } else {
        error.value = "Si è verificato un errore di connessione.";
    }
  } finally {
    isLoading.value = false;
  }
};

// --- AZIONE 2: VERIFICA OTP ---
const handleVerifyOtp = async () => {
  if (otpCode.value.length < 6) {
    otpError.value = "Il codice deve essere di 6 cifre";
    return;
  }
  isLoading.value = true;
  otpError.value = '';

  try {
    await AuthService.verifyOtp({
      email: loginForm.email,
      otp_code: otpCode.value
    });
    
    const userRes = await AuthService.getUser();
    const user = userRes.data;
    profile.first_name = user.first_name || '';
    profile.last_name = user.last_name || '';

    step.value = 3;
  } catch (error) {
    otpError.value = "Codice non valido o scaduto.";
  } finally {
    isLoading.value = false;
  }
};

const resendOtp = async () => {
    isLoading.value = true;
    try {
        await AuthService.sendOtp(loginForm.email);
        alert("Nuovo codice inviato!");
    } catch (e) { 
        alert("Impossibile inviare l'email. Riprova più tardi."); 
    } finally { 
        isLoading.value = false; 
    }
};

// --- AZIONE 3: COMPLETAMENTO PROFILO E FIRMA ---
const handleCompleteProfile = async () => {
  isLoading.value = true;
  generalError.value = '';

  try {
    // 1. Salvataggio Anagrafica
    const payload = {
      first_name: profile.first_name, 
      last_name: profile.last_name,   
      subject_type: profile.subject_type,
      city: profile.city,
      province: profile.province,
      tax_code: profile.tax_code,
      company_name: profile.company_name,
      vat_number: profile.vat_number,
      accept_esurf: profile.accept_esurf,
      accept_concernet: profile.accept_concernet
    };

    await AuthService.saveProfile(payload);
    
    // 2. CORREZIONE: Eseguiamo la firma esplicita
    if (profile.accept_esurf && profile.accept_concernet) {
        await AuthService.signGlobal({
            accept_esurf: 'true',
            accept_concernet: 'true'
        });
    }

    // 3. Redirect
    alert("Bentornato! Profilo aggiornato.");
    
    // Check finale per redirect dopo setup profilo
    const userRes = await AuthService.getUser();
    const user = userRes.data;
    if (user.role === 'admin') router.push('/admin');
    else if (user.role === 'owner') router.push('/owner/dashboard');
    else router.push('/dashboard');

  } catch (error) {
    if (error.response && error.response.status === 422) {
        generalError.value = Object.values(error.response.data.errors).flat().join(', ');
    } else {
        generalError.value = "Errore salvataggio dati.";
    }
  } finally {
    isLoading.value = false;
  }
};

const openLegal = async (type) => {
    showModal.value = true;
    modalLoading.value = true;
    try {
        const res = await AuthService.getLegalPreview(type);
        modalContent.value = res.data.html_content;
    } catch (e) { modalContent.value = "Errore caricamento."; }
    finally { modalLoading.value = false; }
};
</script>

<style scoped>
/* (Stili invariati) */
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 1rem; background-color: #f7fafc; }
.card { background: #ffffff; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); width: 100%; max-width: 400px; transition: all 0.3s ease; }
.wide-card { max-width: 650px; }

.header { text-align: center; margin-bottom: 2rem; }
.title { font-size: 1.75rem; color: #1a202c; margin-bottom: 0.5rem; font-weight: 700; }
.subtitle { color: #718096; font-size: 0.95rem; }

.auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-row { display: flex; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }
label { font-size: 0.85rem; font-weight: 600; color: #4a5568; }
input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; }
input:focus { outline: none; border-color: #3182ce; box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15); }
.error-border { border-color: #f56565; }

.alert-danger { background-color: #fff5f5; color: #c53030; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; border: 1px solid #feb2b2; text-align: center; }
.error-msg { color: #e53e3e; font-size: 0.75rem; }

.btn-primary { background-color: #3182ce; color: white; padding: 0.9rem; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s; margin-top: 0.5rem; }
.btn-primary:hover { background-color: #2b6cb0; }
.btn-primary:disabled { background-color: #a0aec0; cursor: not-allowed; }

.footer-text { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #718096; }
.footer-text a { color: #3182ce; text-decoration: none; font-weight: 600; }

.otp-container { text-align: center; }
.otp-group input { letter-spacing: 0.8em; font-size: 1.8rem; text-align: center; font-weight: bold; padding: 0.5rem; width: 100%; max-width: 300px; margin: 0 auto; display: block; }

.type-selector { display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem; }
.type-selector label { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid transparent; transition: all 0.2s; }
.type-selector label.active { background-color: #ebf8ff; border-color: #3182ce; color: #2c5282; font-weight: bold; }
.divider { margin: 1.5rem 0; border: 0; border-top: 1px solid #e2e8f0; }
.legal-section { display: flex; flex-direction: column; gap: 0.8rem; }
.legal-item { display: flex; gap: 0.5rem; align-items: center; font-size: 0.9rem; }
.legal-item a { color: #3182ce; text-decoration: underline; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; width: 90%; max-width: 600px; max-height: 85vh; border-radius: 8px; display: flex; flex-direction: column; }
.modal-header { padding: 1rem; border-bottom: 1px solid #edf2f7; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 1.5rem; overflow-y: auto; line-height: 1.6; color: #4a5568; }
.modal-footer { padding: 1rem; border-top: 1px solid #edf2f7; text-align: right; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #718096; }

.loader::after { content: "..."; animation: dots 1.5s steps(5, end) infinite; }
@keyframes dots { 0%, 20% { content: "."; } 40% { content: ".."; } 60% { content: "..."; } 80%, 100% { content: ""; } }

@media (max-width: 600px) {
  .auth-container { padding: 0; align-items: flex-start; background-color: #fff; }
  .card { box-shadow: none; padding: 1.5rem; border-radius: 0; min-height: 100vh; }
  .form-row { flex-direction: column; gap: 1rem; }
  .otp-group input { font-size: 1.5rem; letter-spacing: 0.5em; }
}
</style>
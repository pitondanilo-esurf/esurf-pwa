<template>
  <div class="auth-container">
    <div class="card" :class="{ 'wide-card': step === 3 }">
      
      <div v-if="step === 1">
        <div class="header">
          <h2 class="title">Crea Account</h2>
          <p class="subtitle">Inserisci i tuoi dati per registrarti a eSurf</p>
        </div>
        
        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="first_name">Nome</label>
              <input v-model="form.first_name" type="text" id="first_name" placeholder="Es. Mario" :class="{ 'error-border': errors.first_name }" required />
              <span v-if="errors.first_name" class="error-msg">{{ errors.first_name[0] }}</span>
            </div>
            <div class="form-group">
              <label for="last_name">Cognome</label>
              <input v-model="form.last_name" type="text" id="last_name" placeholder="Es. Rossi" :class="{ 'error-border': errors.last_name }" required />
              <span v-if="errors.last_name" class="error-msg">{{ errors.last_name[0] }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input v-model="form.email" type="email" id="email" placeholder="mario.rossi@esempio.it" :class="{ 'error-border': errors.email }" required />
            <span v-if="errors.email" class="error-msg">{{ errors.email[0] }}</span>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input v-model="form.password" type="password" id="password" placeholder="Minimo 8 caratteri" :class="{ 'error-border': errors.password }" required />
            <span v-if="errors.password" class="error-msg">{{ errors.password[0] }}</span>
          </div>

          <div class="form-group">
            <label for="password_confirmation">Conferma Password</label>
            <input v-model="form.password_confirmation" type="password" id="password_confirmation" placeholder="Ripeti la password" required />
          </div>

          <div v-if="generalError" class="alert alert-danger">{{ generalError }}</div>

          <button type="submit" :disabled="isLoading" class="btn-primary">
            <span v-if="!isLoading">Registrati e Ricevi Codice</span>
            <span v-else class="loader">Elaborazione...</span>
          </button>

          <div class="footer-text">
            Hai già un account? <router-link to="/login">Accedi</router-link>
          </div>
        </form>
      </div>

      <div v-else-if="step === 2" class="otp-container">
        <div class="header">
          <h2 class="title">Verifica Email</h2>
          <p class="subtitle">
            Abbiamo inviato un codice a 6 cifre a:<br>
            <strong>{{ form.email }}</strong>
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
             Non hai ricevuto il codice? <a href="#" @click.prevent="resendOtp">Invia di nuovo</a>
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
               <input v-model="form.first_name" required placeholder="Es. Mario">
            </div>
            <div class="form-group">
               <label>Cognome</label>
               <input v-model="form.last_name" required placeholder="Es. Rossi">
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
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AuthService from '@/services/AuthService';

const router = useRouter();
const route = useRoute();

const isLoading = ref(false);
const step = ref(1); // 1=Reg, 2=OTP, 3=Profile

const errors = ref({});
const generalError = ref('');
const otpError = ref('');

const showModal = ref(false);
const modalContent = ref('');
const modalLoading = ref(false);

// Step 1
const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: ''
});

// Step 2
const otpCode = ref('');

// Step 3
const profile = reactive({
  subject_type: 'private', 
  city: '',
  province: '',
  tax_code: '',
  company_name: '',
  vat_number: '',
  accept_esurf: false,
  accept_concernet: false
});

onMounted(() => {
    if (route.query.error === 'invalid_email') {
        generalError.value = "L'indirizzo email non è valido o non può ricevere messaggi. Per favore, registrati con un indirizzo corretto.";
        if (route.query.email) form.email = route.query.email;
    }
});

const handleRegister = async () => {
  isLoading.value = true;
  errors.value = {};
  generalError.value = '';

  try {
    await AuthService.register(form);
    step.value = 2;
  } catch (error) {
    if (error.response) {
        if (error.response.status === 422) {
            if (error.response.data.errors) errors.value = error.response.data.errors;
            if (error.response.data.message) generalError.value = error.response.data.message;
        } else {
            generalError.value = "Errore del server. Riprova più tardi.";
        }
    } else {
        generalError.value = "Errore di connessione. Controlla la tua rete.";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleVerifyOtp = async () => {
  if (otpCode.value.length < 6) {
    otpError.value = "Il codice deve essere di 6 cifre";
    return;
  }
  isLoading.value = true;
  otpError.value = '';

  try {
    const response = await AuthService.verifyOtp({
      email: form.email,
      otp_code: otpCode.value
    });
    
    // 1. Salviamo il token se il backend lo restituisce
    if (response.data && response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
    }
    
    // 2. Facciamo un tentativo di login silenzioso per assicurarci la sessione CSRF
    // Nota: Avvolgiamo in try-catch per evitare che un errore qui blocchi l'avanzamento allo step 3
    try {
       await AuthService.login({
           email: form.email,
           password: form.password
       });
    } catch (e) {
       console.warn("Login automatico post-OTP fallito (potrebbe essere già loggato o backend stateless). Procedo comunque.");
    }

    // 3. Andiamo allo step 3. Grazie al fix in AuthService.js, non verremo reindirizzati
    step.value = 3; 

  } catch (error) {
    otpError.value = "Codice non valido o scaduto.";
  } finally {
    isLoading.value = false;
  }
};

const handleCompleteProfile = async () => { 
  isLoading.value = true;
  generalError.value = '';

  try {
    // 1. Salvataggio Anagrafica
    const profilePayload = {
      subject_type: profile.subject_type,
      first_name: form.first_name, 
      last_name: form.last_name,
      tax_code: profile.tax_code,
      company_name: profile.company_name,
      vat_number: profile.vat_number,
      city: profile.city,
      province: profile.province,
      // Inviamo 1 (intero) per evitare errori di validazione booleani/stringhe
      accept_esurf: profile.accept_esurf ? 1 : 0,
      accept_concernet: profile.accept_concernet ? 1 : 0
    };
    
    await AuthService.saveProfile(profilePayload);

    // 2. Firma Legale
    if (profile.accept_esurf && profile.accept_concernet) {
        await AuthService.signGlobal({
            accept_esurf: 1,      
            accept_concernet: 1   
        });
    }

    alert("Benvenuto! Account attivato con successo.");
    router.push('/dashboard');

  } catch (error) {
    console.error(error);
    if (error.response && error.response.status === 422) {
        generalError.value = Object.values(error.response.data.errors).flat().join(', ');
    } else {
        generalError.value = "Errore nel salvataggio. " + (error.response?.data?.message || "");
    }
  } finally {
    isLoading.value = false;
  }
};

const openLegal = async (type) => {
    showModal.value = true;
    modalLoading.value = true;
    modalContent.value = '';
    try {
        const response = await AuthService.getLegalPreview(type);
        modalContent.value = response.data.html_content || "Contenuto non disponibile";
    } catch (e) {
        modalContent.value = "<p style='color:red'>Impossibile caricare il documento.</p>";
    } finally {
        modalLoading.value = false;
    }
};

const resendOtp = async () => {
    isLoading.value = true;
    try {
        await AuthService.sendOtp(form.email);
        alert("Nuovo codice inviato!");
    } catch (error) {
        alert("Impossibile inviare il codice.");
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
/* STILI INVARIATI */
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 1rem; background-color: #f7fafc; }
.card { background: #ffffff; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); width: 100%; max-width: 480px; transition: all 0.3s ease; }
.wide-card { max-width: 650px; }
.header { text-align: center; margin-bottom: 2rem; }
.title { font-size: 1.75rem; color: #1a202c; margin-bottom: 0.5rem; font-weight: 700; }
.subtitle { color: #718096; font-size: 0.95rem; line-height: 1.5; }
.auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-row { display: flex; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }
label { font-size: 0.85rem; font-weight: 600; color: #4a5568; }
input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s, box-shadow 0.2s; background-color: #fff; }
input:focus { outline: none; border-color: #4299e1; box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15); }
.error-border { border-color: #f56565; background-color: #fff5f5; }
.error-msg { color: #e53e3e; font-size: 0.75rem; margin-top: 2px; }
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
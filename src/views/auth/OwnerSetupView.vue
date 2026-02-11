<template>
  <div class="setup-container">
    <div class="card">
      <div class="header">
        <div class="icon">🔐</div>
        <h2>Attiva il tuo Account</h2>
      </div>
      
      <p class="subtitle" v-if="email">Ciao, <span class="highlight">{{ email }}</span></p>
      <p class="description">Imposta una password sicura per completare l'attivazione e accedere alla piattaforma.</p>

      <form @submit.prevent="completeSetup">
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

        <div v-if="errorMessage" class="alert error">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Attivazione in corso...' : 'Attiva Account' }}
        </button>
      </form>
      
      <div class="footer-link">
        <small>Hai già un account? <a @click="$router.push('/login')">Accedi</a></small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '@/services/axios'; // Assicurati che questo import sia corretto

const route = useRoute();
const router = useRouter();

const form = ref({
  password: '',
  password_confirmation: ''
});

const email = ref('');
const token = ref('');
const loading = ref(false);
const errorMessage = ref('');

// --- 1. INIZIALIZZAZIONE ---
onMounted(() => {
  // Recupera i parametri dalla query string dell'URL (es. ?token=XYZ&email=abc@test.it)
  token.value = route.query.token;
  email.value = route.query.email;

  console.log("🔹 SETUP INIT - Token trovato:", token.value ? "SÌ" : "NO");
  
  if (!token.value) {
    errorMessage.value = "Link di attivazione non valido (Token mancante).";
    console.error("❌ Errore: Token mancante nell'URL");
  }
});

// --- 2. AZIONE DI ATTIVAZIONE ---
const completeSetup = async () => {
  // Validazione Frontend
  if (form.value.password.length < 8) {
    errorMessage.value = "La password deve avere almeno 8 caratteri.";
    return;
  }
  
  if (form.value.password !== form.value.password_confirmation) {
    errorMessage.value = "Le due password non coincidono.";
    return;
  }

  if (!token.value) {
    errorMessage.value = "Token di attivazione mancante. Riprova dal link email.";
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    console.log("🔹 Invio richiesta attivazione...");

    // CHIAMATA API
    const response = await axios.post('/api/auth/complete-owner-setup', 
      {
        password: form.value.password,
        password_confirmation: form.value.password_confirmation
      },
      {
        headers: {
          // [IMPORTANTE] Sovrascriviamo l'Authorization per usare il token dell'URL
          // invece di quello eventualmente presente nel localStorage (che non esiste ancora)
          'Authorization': `Bearer ${token.value}`,
          'Accept': 'application/json'
        }
      }
    );

    console.log("✅ Attivazione riuscita!", response.data);

    // 3. GESTIONE SUCCESSO (Auto-Login)
    const newAccessToken = response.data.access_token;
    
    if (newAccessToken) {
        // Salva il token definitivo
        localStorage.setItem('token', newAccessToken);
        
        // Imposta header default per le chiamate successive
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // Controlla ruolo e reindirizza
        const user = response.data.user || {};
        
        alert("Account attivato con successo! Benvenuto.");
        
        if (user.role === 'owner') {
            router.push('/owner/dashboard');
        } else if (user.role === 'admin') {
            router.push('/admin/dashboard');
        } else {
            router.push('/dashboard');
        }
    } else {
        // Fallback raro
        alert("Password impostata. Effettua il login.");
        router.push('/login');
    }

  } catch (error) {
    console.error("❌ Errore attivazione:", error);
    
    // Gestione errori specifici
    if (error.response) {
        if (error.response.status === 401) {
             errorMessage.value = "Sessione scaduta o link non valido. Richiedi un nuovo invito.";
        } else if (error.response.status === 403) {
             errorMessage.value = "Accesso negato o account già attivo.";
        } else if (error.response.status === 422) {
             // Errori validazione backend (es. password troppo semplice)
             const errors = error.response.data.errors;
             errorMessage.value = errors ? Object.values(errors).flat().join(' ') : error.response.data.message;
        } else {
             errorMessage.value = error.response.data.message || "Errore del server.";
        }
    } else {
        errorMessage.value = "Errore di connessione. Controlla la rete.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Layout Centrato */
.setup-container { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  min-height: 100vh; 
  background: #f8fafc; 
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

/* Card */
.card { 
  background: white; 
  padding: 2.5rem; 
  border-radius: 16px; 
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); 
  width: 100%; 
  max-width: 420px; 
  text-align: center; 
}

/* Header */
.icon { font-size: 2.5rem; margin-bottom: 1rem; }
h2 { margin: 0 0 0.5rem 0; color: #1e293b; font-size: 1.5rem; font-weight: 700; }
.subtitle { color: #64748b; margin: 0; font-size: 0.95rem; }
.highlight { color: #3b82f6; font-weight: 600; }
.description { color: #94a3b8; font-size: 0.85rem; margin: 1rem 0 2rem 0; line-height: 1.5; }

/* Form */
.form-group { margin-bottom: 1.25rem; text-align: left; }
.form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #475569; }
.input-field { 
  width: 100%; 
  padding: 12px; 
  border: 1px solid #cbd5e1; 
  border-radius: 8px; 
  font-size: 1rem; 
  transition: border-color 0.2s;
  box-sizing: border-box; 
}
.input-field:focus { outline: none; border-color: #3b82f6; ring: 2px solid #bfdbfe; }

/* Button */
.btn-primary { 
  width: 100%; 
  padding: 14px; 
  background: #3b82f6; 
  color: white; 
  border: none; 
  border-radius: 8px; 
  font-weight: 600; 
  font-size: 1rem;
  cursor: pointer; 
  transition: background 0.2s; 
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }

/* Feedback */
.alert { padding: 12px; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem; text-align: left; }
.alert.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

/* Spinner */
.spinner {
  width: 16px; height: 16px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.footer-link { margin-top: 1.5rem; color: #64748b; }
.footer-link a { color: #3b82f6; text-decoration: none; cursor: pointer; font-weight: 600; }
.footer-link a:hover { text-decoration: underline; }
</style>
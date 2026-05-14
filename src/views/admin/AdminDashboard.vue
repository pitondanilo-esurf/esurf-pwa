<template>
  <div class="admin-wrapper">
      <nav class="navbar-admin">
          <div class="brand">🛡️ SUPER ADMIN</div>
          <button @click="logout" class="btn-logout">Esci</button>
      </nav>

      <div class="content">
          <header class="page-header">
              <h1>Gestione Piattaforma</h1>
              <p>Pannello di controllo centralizzato</p>
          </header>

          <div class="dashboard-grid mb-4">
              <div class="admin-card create-box">
                  <h3>📧 Invita Nuovo Owner</h3>
                  <p>Invia una mail di attivazione. L'Owner imposterà password e OTP al primo accesso.</p>
                  
                  <form @submit.prevent="handleCreateOwner" class="admin-form">
                      <div class="form-row">
                          <input v-model="form.name" placeholder="Nome" class="inp" required>
                          <input v-model="form.surname" placeholder="Cognome" class="inp" required>
                      </div>
                      
                      <input v-model="form.email" type="email" placeholder="Email Aziendale" class="inp" required>
                      
                      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
                      <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>

                      <div v-if="debugLink" class="debug-box">
                          <strong>Link Attivazione (Simulazione Email):</strong>
                          <br>
                          <a :href="debugLink" target="_blank">{{ debugLink }}</a>
                      </div>

                      <button type="submit" class="btn-admin" :disabled="loading">
                          {{ loading ? 'Invio in corso...' : 'Invia Invito' }}
                      </button>
                  </form>
              </div>

              <div class="admin-card list-box">
                  <div class="list-header">
                      <h3>📋 Lista Owner</h3>
                      <button @click="fetchOwners" class="btn-refresh" title="Aggiorna lista">🔄</button>
                  </div>
                  
                  <div v-if="loadingList" class="loading-text">Caricamento...</div>
                  <div v-else-if="owners.length === 0" class="empty-text">Nessun Owner registrato.</div>

                  <ul v-else class="owner-list">
                      <li v-for="owner in owners" :key="owner.id" class="owner-item">
                          
                          <div class="owner-avatar" :class="{ pending: owner.status === 'pending' }">
                              {{ owner.name[0] }}
                          </div>
                          
                          <div class="owner-info">
                              <span class="name">{{ owner.name }} {{ owner.surname }}</span>
                              <span class="email">{{ owner.email }}</span>
                          </div>
                          
                          <div class="owner-status">
                              <span class="status-badge" :class="owner.status">
                                  {{ owner.status === 'active' ? 'ATTIVO' : 'PENDING' }}
                              </span>
                          </div>
                      </li>
                  </ul>
              </div>
          </div>

          <h2 class="section-title mt-5">Moduli Operativi</h2>
          <div class="dashboard-grid">

              <div class="admin-card module-card hover-scale" @click="$router.push({ name: 'admin-impianti' })">
                  <div class="card-icon">☀️</div>
                  <div class="card-info">
                      <h3>Gestione Impianti</h3>
                      <p>Amministra anagrafica, credenziali inverter e testa le connessioni API.</p>
                  </div>
                  <div class="card-arrow">→</div>
              </div>
              
              <div class="admin-card module-card hover-scale" @click="goToFlexAuctions">
                  <div class="card-icon">⚡</div>
                  <div class="card-info">
                      <h3>Aste di Flessibilità</h3>
                      <p>Gestisci plafond, baseline e raggruppamenti asset per i mercati UVAM e DSO.</p>
                  </div>
                  <div class="card-arrow">→</div>
              </div>

              <div class="admin-card module-card hover-scale" @click="goToOrphanPods">
                  <div class="card-icon">🔍</div>
                  <div class="card-info">
                      <h3>Rilevamento POD Orfani</h3>
                      <p>Visualizza e gestisci i POD non ancora assegnati ad alcuna Comunità Energetica.</p>
                  </div>
                  <div class="card-arrow">→</div>
              </div>

              <div class="admin-card module-card hover-scale" @click="$router.push({ name: 'admin-power-users' })">
                  <div class="card-icon">⚡</div>
                  <div class="card-info">
                      <h3>Gestione Power User</h3>
                      <p>Assegna o revoca i privilegi speciali agli utenti e visualizza l'elenco degli attivi.</p>
                  </div>
                  <div class="card-arrow">→</div>
              </div>  
              <div class="action-item" @click="goTo('/admin/business-plan')">
                    <div class="act-icon">📈</div>
                    <div class="act-info">
                        <h4>Esco Business Model Simulator</h4>
                        <p>Simula ROI, sblocchi lead e success fee per le ESCO.</p>
                    </div>
                    <div class="arrow">→</div>
                </div>            

          </div>

      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from '@/services/AuthService';
import AdminService from '@/services/AdminService';

const router = useRouter();
const loading = ref(false);
const loadingList = ref(false);
const owners = ref([]);
const errorMsg = ref('');
const successMsg = ref('');
const debugLink = ref('');

const form = ref({ name: '', surname: '', email: '' });

// --- NAVIGAZIONE MODULI ---
const goToFlexAuctions = () => {
  // Assicurati che il nome della rotta corrisponda a quello nel tuo router/index.js
  router.push({ name: 'admin-flex-auctions' });
};

const goToOrphanPods = () => {
  // Naviga alla nuova pagina dei POD Orfani
  router.push({ name: 'admin-pod-orfani' });
};

onMounted(async () => {
    await fetchOwners();
});

const fetchOwners = async () => {
    loadingList.value = true;
    try {
        const res = await AdminService.getOwners();
        owners.value = res.data;
    } catch (e) {
        console.error("Errore lista owners", e);
    } finally {
        loadingList.value = false;
    }
};

const handleCreateOwner = async () => {
    loading.value = true;
    errorMsg.value = '';
    successMsg.value = '';
    debugLink.value = '';

    try {
        const res = await AdminService.createOwner(form.value);
        successMsg.value = `Invito inviato con successo a ${form.value.email}`;
        
        if(res.data.activation_link) {
            debugLink.value = res.data.activation_link;
        }

        form.value = { name: '', surname: '', email: '' };
        await fetchOwners(); 

    } catch (e) {
        errorMsg.value = e.response?.data?.message || "Errore creazione owner.";
    } finally {
        loading.value = false;
    }
};

const logout = async () => {
    await AuthService.logout();
    router.push('/login');
};
</script>

<style scoped>
/* Layout Base */
.admin-wrapper { min-height: 100vh; background: #0f172a; color: white; font-family: 'Inter', sans-serif; }
.navbar-admin { padding: 1rem 2rem; background: #1e293b; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; }
.brand { font-weight: 700; letter-spacing: 1px; }
.btn-logout { background: transparent; border: 1px solid #475569; color: #cbd5e1; padding: 6px 14px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
.btn-logout:hover { border-color: #ef4444; color: #ef4444; }

.content { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem; }
.page-header { margin-bottom: 2.5rem; }
.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

/* Utilities Spaziatura */
.mb-4 { margin-bottom: 2rem; }
.mt-5 { margin-top: 3rem; }
.section-title { font-size: 1.2rem; color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 1.5rem; }

/* Cards Generiche */
.admin-card { background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; }
.admin-card h3 { margin-top: 0; color: #f8fafc; }
.admin-card p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem; }

/* Form */
.admin-form { display: flex; flex-direction: column; gap: 15px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.inp { padding: 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white; width: 100%; box-sizing: border-box; }
.btn-admin { padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 10px; transition: 0.2s; }
.btn-admin:hover { background: #2563eb; }

/* Moduli Operativi (Cards Navigazione) */
.module-card { display: flex; align-items: center; gap: 20px; padding: 1.5rem; cursor: pointer; transition: all 0.2s ease; }
.module-card p { margin-bottom: 0; }
.card-icon { font-size: 2.5rem; background: rgba(59, 130, 246, 0.1); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.3); }
.card-info { flex: 1; }
.card-arrow { font-size: 1.5rem; color: #475569; font-weight: bold; transition: 0.2s; }
.hover-scale:hover { transform: translateY(-3px); border-color: #3b82f6; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); }
.hover-scale:hover .card-arrow { color: #3b82f6; transform: translateX(5px); }

/* Messaggi */
.error-msg { color: #fca5a5; background: rgba(127, 29, 29, 0.3); padding: 10px; border-radius: 6px; font-size: 0.9rem; }
.success-msg { color: #6ee7b7; background: rgba(6, 78, 59, 0.3); padding: 10px; border-radius: 6px; font-size: 0.9rem; }
.debug-box { background: #334155; padding: 10px; border-radius: 6px; font-size: 0.8rem; word-break: break-all; margin-top: 10px; }
.debug-box a { color: #60a5fa; }

/* Lista Owner & Badge Stato */
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.btn-refresh { background: none; border: none; cursor: pointer; font-size: 1.2rem; transition: 0.2s; }
.btn-refresh:hover { transform: rotate(180deg); }
.owner-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; max-height: 350px; overflow-y: auto; padding-right: 5px; }

/* Custom Scrollbar per la lista */
.owner-list::-webkit-scrollbar { width: 6px; }
.owner-list::-webkit-scrollbar-track { background: #0f172a; border-radius: 4px; }
.owner-list::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

.owner-item { display: flex; align-items: center; gap: 15px; background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155; }
.owner-avatar { width: 40px; height: 40px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; text-transform: uppercase; flex-shrink: 0; }
.owner-avatar.pending { background: #f59e0b; }

.owner-info { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.owner-info .name { font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.owner-info .email { color: #94a3b8; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.status-badge { font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; }
.status-badge.active { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.status-badge.pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

@media (max-width: 900px) { 
    .dashboard-grid { grid-template-columns: 1fr; } 
    .module-card { flex-direction: column; text-align: center; }
    .card-arrow { display: none; }
}
</style>
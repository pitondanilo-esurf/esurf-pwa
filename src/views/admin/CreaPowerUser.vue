<template>
  <div class="admin-wrapper">
    <nav class="navbar-admin">
      <div class="brand">🛡️ GESTIONE POWER USER</div>
      <button @click="$router.push('/admin')" class="btn-back">Torna alla Dashboard</button>
    </nav>

    <div class="content">
      <header class="page-header">
        <h1>Assegna / Revoca Privilegi</h1>
        <p>Cerca un utente per email per gestire i privilegi da Power User ⚡</p>
      </header>

      <div class="dashboard-grid mb-4">
        <div class="admin-card">
          <h3>🔍 Cerca Utente</h3>
          <form @submit.prevent="handleSearch" class="admin-form">
            <input 
              v-model="searchEmail" 
              type="email" 
              placeholder="Inserisci l'email dell'utente" 
              class="inp" 
              required
            >
            <button type="submit" class="btn-admin" :disabled="loadingSearch">
              {{ loadingSearch ? 'Ricerca in corso...' : 'Cerca' }}
            </button>
          </form>

          <div v-if="searchError" class="error-msg mt-3">{{ searchError }}</div>

          <div v-if="foundUser" class="result-card mt-4">
            <div class="user-details">
              <div class="avatar">{{ foundUser.name[0] }}</div>
              <div>
                <h4>{{ foundUser.name }} {{ foundUser.surname }}</h4>
                <p class="text-muted">{{ foundUser.email }}</p>
                <p class="text-muted text-sm">
                  Community: <strong>{{ foundUser.community ? foundUser.community.name : 'Nessuna' }}</strong>
                </p>
              </div>
            </div>

            <div class="action-area mt-3">
              <p>
                Stato attuale: 
                <span class="status-badge" :class="foundUser.power_user ? 'active' : 'pending'">
                  {{ foundUser.power_user ? '⚡ POWER USER' : 'UTENTE STANDARD' }}
                </span>
              </p>
              
              <button 
                @click="handleTogglePowerUser" 
                class="btn-toggle" 
                :class="foundUser.power_user ? 'btn-danger' : 'btn-success'"
                :disabled="loadingToggle"
              >
                {{ loadingToggle ? 'Attendere...' : (foundUser.power_user ? 'Revoca Privilegio' : 'Assegna Privilegio') }}
              </button>
              
              <div v-if="toggleSuccess" class="success-msg mt-2">{{ toggleSuccess }}</div>
            </div>
          </div>
        </div>
      </div>

      <h2 class="section-title mt-5">⚡ Elenco Power User Attivi</h2>
      <div class="admin-card">
        <div v-if="loadingList" class="text-muted">Caricamento elenco...</div>
        <div v-else-if="powerUsers.length === 0" class="empty-text">Nessun Power User presente nel sistema.</div>
        
        <table v-else class="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Community / CER</th>
              <th>Data Iscrizione</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in powerUsers" :key="user.id">
              <td><strong>{{ user.name }} {{ user.surname }}</strong></td>
              <td>{{ user.email }}</td>
              <td>
                <span class="community-badge">
                  {{ user.community ? user.community.name : 'Nessuna Assegnazione' }}
                </span>
              </td>
              <td class="text-muted">{{ new Date(user.created_at).toLocaleDateString('it-IT') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminService from '@/services/AdminService'; // Assicurati che il percorso sia corretto

const searchEmail = ref('');
const foundUser = ref(null);
const powerUsers = ref([]);

const loadingSearch = ref(false);
const loadingToggle = ref(false);
const loadingList = ref(false);

const searchError = ref('');
const toggleSuccess = ref('');

onMounted(() => {
  fetchPowerUsers();
});

const handleSearch = async () => {
  loadingSearch.value = true;
  searchError.value = '';
  toggleSuccess.value = '';
  foundUser.value = null;

  try {
    const res = await AdminService.searchUserByEmail(searchEmail.value);
    foundUser.value = res.data;
  } catch (e) {
    searchError.value = e.response?.data?.message || 'Errore durante la ricerca.';
  } finally {
    loadingSearch.value = false;
  }
};

const handleTogglePowerUser = async () => {
  if (!foundUser.value) return;
  
  loadingToggle.value = true;
  toggleSuccess.value = '';

  try {
    const res = await AdminService.togglePowerUser(foundUser.value.id);
    toggleSuccess.value = res.data.message;
    // Aggiorna lo stato locale senza ricaricare
    foundUser.value.power_user = res.data.power_user;
    
    // Ricarica la lista in basso
    await fetchPowerUsers();
  } catch (e) {
    searchError.value = 'Errore durante la modifica dei privilegi.';
  } finally {
    loadingToggle.value = false;
  }
};

const fetchPowerUsers = async () => {
  loadingList.value = true;
  try {
    const res = await AdminService.getPowerUsers();
    powerUsers.value = res.data;
  } catch (e) {
    console.error('Errore recupero power users', e);
  } finally {
    loadingList.value = false;
  }
};
</script>

<style scoped>
/* Eredita lo stile base dalla Dashboard Admin */
.admin-wrapper { min-height: 100vh; background: #0f172a; color: white; font-family: 'Inter', sans-serif; }
.navbar-admin { padding: 1rem 2rem; background: #1e293b; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; }
.brand { font-weight: 700; letter-spacing: 1px; }
.btn-back { background: transparent; border: 1px solid #475569; color: #cbd5e1; padding: 6px 14px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
.btn-back:hover { border-color: #64748b; color: white; }

.content { max-width: 1000px; margin: 0 auto; padding: 3rem 1.5rem; }
.page-header { margin-bottom: 2.5rem; }

.mb-4 { margin-bottom: 2rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }
.mt-5 { margin-top: 3rem; }
.text-muted { color: #94a3b8; }
.text-sm { font-size: 0.85rem; }

.section-title { font-size: 1.2rem; color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 1.5rem; }
.admin-card { background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; }

.admin-form { display: flex; gap: 10px; }
.inp { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white; }
.btn-admin { padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-admin:hover { background: #2563eb; }

/* Result Card */
.result-card { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 1.5rem; }
.user-details { display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #334155; padding-bottom: 1rem; }
.avatar { width: 50px; height: 50px; background: #f59e0b; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; text-transform: uppercase; }
.user-details h4 { margin: 0 0 5px 0; font-size: 1.2rem; }
.user-details p { margin: 0; }

.action-area { display: flex; flex-direction: column; gap: 15px; align-items: flex-start; }
.btn-toggle { padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; color: white; }
.btn-success { background: #10b981; }
.btn-success:hover { background: #059669; }
.btn-danger { background: #ef4444; }
.btn-danger:hover { background: #dc2626; }

.status-badge { font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 4px; }
.status-badge.active { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
.status-badge.pending { background: rgba(100, 116, 139, 0.2); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3); }

/* Table */
.admin-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.admin-table th, .admin-table td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; }
.admin-table th { color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
.community-badge { background: #334155; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; }

/* Messages */
.error-msg { color: #fca5a5; background: rgba(127, 29, 29, 0.3); padding: 10px; border-radius: 6px; font-size: 0.9rem; }
.success-msg { color: #6ee7b7; background: rgba(6, 78, 59, 0.3); padding: 10px; border-radius: 6px; font-size: 0.9rem; }
</style>
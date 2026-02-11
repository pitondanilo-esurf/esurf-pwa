<template>
  <div class="owner-layout">
    <nav class="sidebar">
      <div class="brand">
        <div class="logo-icon">⚡</div>
        <span>Owner<span class="light">Panel</span></span>
      </div>
      
      <div class="user-profile">
        <div class="avatar">{{ initials }}</div>
        <div class="info">
          <span class="name">{{ user.name }} {{ user.surname }}</span>
          <span class="role">Proprietario</span>
        </div>
      </div>

      <ul class="nav-links">
        <li 
          :class="{ active: $route.path === '/owner/dashboard' }" 
          @click="goTo('/owner/dashboard')"
        >
            📊 Panoramica
        </li>
        
        <li 
          :class="{ active: $route.path === '/owner/pods', disabled: !hasCommunity }" 
          @click="hasCommunity && goTo('/owner/pods')"
        >
            📍 Gestione POD & Upload
        </li>
        
        <li class="disabled">⚡ Produzione (Presto)</li>
        <li class="disabled">👥 Partecipanti (Presto)</li>
      </ul>

      <div class="logout-wrapper">
        <button @click="handleLogout" class="btn-logout">
          <i class="fas fa-sign-out-alt"></i> Esci
        </button>
      </div>
    </nav>

    <main class="main-content">
      
      <header class="top-bar">
        <div>
            <h1 v-if="hasCommunity">Dashboard {{ community.name }}</h1>
            <h1 v-else>Benvenuto, {{ user.name }}</h1>
            <p class="subtitle">Panoramica energetica e gestione comunità</p>
        </div>
        <span class="date">{{ currentDate }}</span>
      </header>

      <div v-if="loading" class="loader-container">
          <div class="spinner"></div> Caricamento dati...
      </div>

      <div v-else-if="!hasCommunity" class="setup-container fade-in">
          <div class="glass-card setup-box">
              <div class="setup-header">
                  <div class="icon-wrapper">🚀</div>
                  <h2>Crea la tua Comunità Energetica</h2>
                  <p>Per iniziare a gestire i POD, definisci la configurazione della tua CER.</p>
              </div>
              <form @submit.prevent="createCommunity" class="setup-form">
                  <div class="form-group">
                      <label>Nome Comunità / Impianto</label>
                      <input v-model="form.name" placeholder="Es. CER Sole Sicilia" required>
                  </div>
                  <div class="form-group">
                      <label>Tipologia</label>
                      <select v-model="form.type" required>
                          <option disabled value="">Seleziona tipo...</option>
                          <option value="CER">CER (Comunità Energetica Rinnovabile)</option>
                          <option value="AUC">AUC (Autoconsumo Collettivo)</option>
                          <option value="Azienda">Azienda (Autoconsumo Diffuso)</option>
                          <option value="Altro">Altro</option>
                      </select>
                  </div>
                  <button type="submit" class="btn-cta" :disabled="submitting">
                      {{ submitting ? 'Creazione in corso...' : 'Crea Comunità' }}
                  </button>
              </form>
          </div>
      </div>

      <div v-else class="dashboard-view fade-in">
        
        <div class="kpi-grid">
            <div class="kpi-card glass">
                <div class="icon-box blue">🔌</div>
                <div class="data">
                    <h3>Totale POD</h3>
                    <span class="value">{{ stats.pods_count || 0 }}</span>
                    <span class="trend">Gestiti dalla CER</span>
                </div>
            </div>
            
            <div class="kpi-card glass">
                <div class="icon-box green">⚡</div>
                <div class="data">
                    <h3>Potenza Installata</h3>
                    <span class="value">{{ stats.total_production_kw || 0 }} kW</span>
                    <span class="trend">Fotovoltaico Totale</span>
                </div>
            </div>

            <div class="kpi-card glass">
                <div class="icon-box purple">👥</div>
                <div class="data">
                    <h3>Membri</h3>
                    <span class="value">{{ stats.members_count || 0 }}</span>
                    <span class="trend">Partecipanti attivi</span>
                </div>
            </div>

            <div class="kpi-card glass highlight">
                <div class="icon-box orange">🔥</div>
                <div class="data">
                    <h3>Autoconsumo</h3>
                    <span class="value">{{ stats.self_sufficiency || 0 }}%</span>
                    <span class="trend">Indice Autosufficienza (Simulato)</span>
                </div>
            </div>
        </div>

        <div class="content-grid">
            
            <div class="section-card actions-section">
                <h3>Azioni Rapide</h3>
                <div class="actions-list">
                    <div class="action-item" @click="goTo('/owner/pods')">
                        <div class="act-icon">📂</div>
                        <div class="act-info">
                            <h4>Gestione POD</h4>
                            <p>Importa Excel o aggiungi manuale</p>
                        </div>
                        <div class="arrow">→</div>
                    </div>

                    <div class="action-item disabled">
                        <div class="act-icon">📄</div>
                        <div class="act-info">
                            <h4>Contratti & Legal</h4>
                            <p>Gestione firme (In arrivo)</p>
                        </div>
                    </div>

                    <div class="action-item disabled">
                        <div class="act-icon">🔧</div>
                        <div class="act-info">
                            <h4>Configurazione</h4>
                            <p>Impostazioni CER</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section-card chart-section">
                <h3>Andamento Energetico</h3>
                <div class="chart-placeholder">
                    <div class="chart-mockup">
                        <div class="bar" style="height: 40%"></div>
                        <div class="bar" style="height: 70%"></div>
                        <div class="bar" style="height: 50%"></div>
                        <div class="bar" style="height: 85%"></div>
                        <div class="bar" style="height: 60%"></div>
                        <div class="bar" style="height: 90%"></div>
                    </div>
                    <p>I dati di produzione in tempo reale saranno disponibili presto.</p>
                </div>
            </div>

        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from '@/services/AuthService';
import CommunityService from '@/services/CommunityService';
import axios from '@/services/axios'; 

const router = useRouter();
const user = ref({ name: '', surname: '' });
const community = ref(null);
const stats = ref({}); 
const loading = ref(true);
const submitting = ref(false);
const form = ref({ name: '', type: 'CER', address: '' });

// Calcolata: True se l'oggetto community esiste ed ha un ID valido
const hasCommunity = computed(() => {
    return community.value && community.value.id;
});

const initials = computed(() => {
    const n = user.value.name ? user.value.name[0] : '';
    const s = user.value.surname ? user.value.surname[0] : '';
    return (n + s).toUpperCase();
});

const currentDate = new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

onMounted(async () => {
    try {
        // 1. Carica Utente
        const userRes = await AuthService.getUser();
        user.value = userRes.data;

        // 2. Carica Community
        const commRes = await CommunityService.getMyCommunity();
        
        // --- FIX LOGICA RILEVAMENTO COMMUNITY ---
        if (commRes.data) {
            if (Array.isArray(commRes.data)) {
                // Se è un array (es. lista), prendi il primo elemento se esiste
                if (commRes.data.length > 0) {
                    community.value = commRes.data[0];
                }
            } else if (commRes.data.id) {
                // Se è un oggetto singolo valido (es. { id: 1, name: ... })
                community.value = commRes.data;
            }
        }

        // 3. Se abbiamo trovato la community, carichiamo le statistiche
        if (community.value && community.value.id) {
            await loadDashboardStats();
        }

    } catch (e) {
        console.error("Errore caricamento dashboard", e);
    } finally {
        loading.value = false;
    }
});

const loadDashboardStats = async () => {
    try {
        const res = await axios.get('/api/owner/dashboard/stats');
        stats.value = res.data;
    } catch (e) {
        console.error("Impossibile caricare statistiche", e);
    }
};

const createCommunity = async () => {
    submitting.value = true;
    try {
        const res = await CommunityService.create(form.value);
        // Gestione risposta create: potrebbe tornare { community: {...} } o direttamente {...}
        community.value = res.data.community || res.data;
        
        // Reset stats
        stats.value = { pods_count: 0, members_count: 0, total_production_kw: 0 };
    } catch (e) {
        alert("Errore durante la creazione della comunità. Riprova.");
    } finally {
        submitting.value = false;
    }
};

const goTo = (path) => {
    router.push(path);
};

const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
};
</script>

<style scoped>
/* LAYOUT */
.owner-layout { display: flex; min-height: 100vh; background: #f1f5f9; font-family: 'Inter', sans-serif; color: #1e293b; }

/* SIDEBAR */
.sidebar { width: 280px; background: #0f172a; color: white; display: flex; flex-direction: column; padding: 1.5rem; flex-shrink: 0; }
.brand { display: flex; align-items: center; gap: 12px; font-size: 1.4rem; font-weight: 700; margin-bottom: 3rem; color: #f8fafc; }
.logo-icon { background: #3b82f6; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.light { font-weight: 300; opacity: 0.7; }

.user-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; padding: 1rem; background: #1e293b; border-radius: 12px; border: 1px solid #334155; }
.avatar { width: 42px; height: 42px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; }
.info { display: flex; flex-direction: column; }
.name { font-weight: 600; font-size: 0.95rem; }
.role { font-size: 0.75rem; color: #94a3b8; }

.nav-links { list-style: none; padding: 0; margin: 0; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-links li { padding: 12px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; color: #cbd5e1; font-weight: 500; display: flex; align-items: center; gap: 10px; }
.nav-links li:hover:not(.disabled) { background: #1e293b; color: white; transform: translateX(5px); }
.nav-links li.active { background: #3b82f6; color: white; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
.nav-links li.disabled { opacity: 0.4; cursor: not-allowed; }

.btn-logout { width: 100%; padding: 12px; background: #1e293b; border: 1px solid #ef4444; color: #ef4444; border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; }
.btn-logout:hover { background: #ef4444; color: white; }

/* MAIN CONTENT */
.main-content { flex: 1; padding: 2.5rem; overflow-y: auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
.top-bar h1 { margin: 0; font-size: 2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
.subtitle { margin: 5px 0 0 0; color: #64748b; font-size: 1rem; }
.date { font-weight: 500; color: #64748b; background: white; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.03); text-transform: capitalize; }

/* KPI GRID */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.kpi-card { background: white; padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; gap: 1.2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02); transition: transform 0.2s; border: 1px solid #f1f5f9; }
.kpi-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

.icon-box { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0; }
.blue { background: #eff6ff; color: #3b82f6; }
.green { background: #ecfdf5; color: #10b981; }
.purple { background: #f5f3ff; color: #8b5cf6; }
.orange { background: #fff7ed; color: #f97316; }

.data { display: flex; flex-direction: column; }
.data h3 { margin: 0; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.data .value { font-size: 1.8rem; font-weight: 800; color: #0f172a; line-height: 1.2; margin: 4px 0; }
.data .trend { font-size: 0.75rem; color: #94a3b8; }

/* CONTENT GRID (ACTIONS + CHART) */
.content-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; }
.section-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.section-card h3 { margin: 0 0 1.5rem 0; font-size: 1.1rem; color: #0f172a; font-weight: 700; }

.actions-list { display: flex; flex-direction: column; gap: 1rem; }
.action-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.action-item:hover:not(.disabled) { background: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); }
.action-item.disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(1); }
.act-icon { font-size: 1.4rem; background: white; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.act-info h4 { margin: 0; font-size: 0.95rem; color: #0f172a; }
.act-info p { margin: 2px 0 0 0; font-size: 0.8rem; color: #64748b; }
.arrow { margin-left: auto; color: #cbd5e1; font-weight: bold; }

/* CHART PLACEHOLDER */
.chart-placeholder { height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0; }
.chart-mockup { display: flex; align-items: flex-end; gap: 12px; height: 100px; margin-bottom: 1rem; opacity: 0.5; }
.bar { width: 12px; background: #cbd5e1; border-radius: 4px; }

/* SETUP FORM */
.setup-container { display: flex; justify-content: center; margin-top: 3rem; }
.setup-box { background: white; padding: 3rem; border-radius: 20px; max-width: 550px; width: 100%; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
.setup-header { text-align: center; margin-bottom: 2.5rem; }
.icon-wrapper { font-size: 3rem; margin-bottom: 1rem; }
.setup-header h2 { margin: 0; font-size: 1.5rem; color: #0f172a; }
.setup-header p { color: #64748b; margin-top: 0.5rem; }
.setup-form { display: flex; flex-direction: column; gap: 1.5rem; }
.form-group label { font-weight: 600; font-size: 0.9rem; color: #334155; margin-bottom: 0.5rem; display: block; }
.form-group input, .form-group select { width: 100%; padding: 14px; border: 1px solid #cbd5e1; border-radius: 10px; background: #f8fafc; transition: 0.2s; font-size: 1rem; }
.form-group input:focus, .form-group select:focus { border-color: #3b82f6; background: white; outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.btn-cta { background: #3b82f6; color: white; padding: 16px; border: none; border-radius: 10px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: 0.2s; width: 100%; }
.btn-cta:hover { background: #2563eb; transform: translateY(-1px); }
.btn-cta:disabled { opacity: 0.7; cursor: not-allowed; }

/* RESPONSIVE */
@media (max-width: 1024px) {
    .content-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
    .owner-layout { flex-direction: column; }
    .sidebar { width: 100%; padding: 1rem; }
    .nav-links { flex-direction: row; overflow-x: auto; padding-bottom: 10px; }
    .main-content { padding: 1.5rem; }
    .kpi-grid { grid-template-columns: 1fr; }
}
</style>
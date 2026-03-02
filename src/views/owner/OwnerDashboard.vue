<template>
  <div class="owner-layout">
    <nav class="sidebar">
      
      <div class="brand-header">
        <div class="brand">
          <div class="logo-icon">⚡</div>
          <span>Owner<span class="light">Panel</span></span>
        </div>
        
        <div class="header-toggles">
          <button @click="toggleTheme" class="clean-toggle-btn" :title="isLightMode ? 'Passa a Dark Mode' : 'Passa a Light Mode'">
            {{ isLightMode ? '🌙' : '☀️' }}
          </button>
          <button @click="toggleLanguage" class="clean-toggle-btn lang-text" title="Cambia lingua">
            {{ locale === 'it' ? 'EN' : 'IT' }}
          </button>
        </div>
      </div>
      
      <div class="user-profile">
        <div class="avatar">{{ initials }}</div>
        <div class="info">
          <span class="name">{{ user.name }} {{ user.surname }}</span>
          <span class="role">{{ $t('ownerDashboard.sidebar.role') }}</span>
        </div>
      </div>

<ul class="nav-links">
        <li 
          :class="{ active: $route.path === '/owner/dashboard' }" 
          @click="goTo('/owner/dashboard')"
        >
            {{ $t('ownerDashboard.sidebar.overview') }}
        </li>
        
        <li 
          :class="{ active: $route.path === '/owner/pods', disabled: !hasCommunity }" 
          @click="hasCommunity && goTo('/owner/pods')"
        >
            {{ $t('ownerDashboard.sidebar.managePods') }}
        </li>

        <li 
          :class="{ active: $route.path === '/owner/cabine', disabled: !hasCommunity }" 
          @click="hasCommunity && goTo('/owner/cabine')"
        >
            {{ $t('ownerDashboard.sidebar.primarySubstations') }}
        </li>
        
        <li class="disabled">{{ $t('ownerDashboard.sidebar.production') }}</li>
        <li class="disabled">{{ $t('ownerDashboard.sidebar.participants') }}</li>
      </ul>

      <div class="logout-wrapper">
        <button @click="handleLogout" class="btn-logout">
          <i class="fas fa-sign-out-alt"></i> {{ $t('ownerDashboard.sidebar.logout') }}
        </button>
      </div>
    </nav>

    <main class="main-content">
      
      <header class="top-bar fade-in delay-0">
        <div>
            <h1 v-if="hasCommunity">{{ $t('ownerDashboard.topbar.dashboardTitle', { name: community.name }) }}</h1>
            <h1 v-else>{{ $t('ownerDashboard.topbar.welcome', { name: user.name }) }}</h1>
            <p class="subtitle">{{ $t('ownerDashboard.topbar.subtitle') }}</p>
        </div>
        <span class="date">{{ currentDate }}</span>
      </header>

      <div v-if="loading" class="loader-container">
          <div class="spinner"></div> {{ $t('ownerDashboard.status.loading') }}
      </div>

      <div v-else-if="!hasCommunity" class="setup-container fade-in delay-1">
          <div class="glass-card setup-box">
              <div class="setup-header">
                  <div class="icon-wrapper">🚀</div>
                  <h2>{{ $t('ownerDashboard.setup.title') }}</h2>
                  <p>{{ $t('ownerDashboard.setup.description') }}</p>
              </div>
              <form @submit.prevent="createCommunity" class="setup-form">
                  <div class="form-group">
                      <label>{{ $t('ownerDashboard.setup.nameLabel') }}</label>
                      <input v-model="form.name" :placeholder="$t('ownerDashboard.setup.namePlaceholder')" class="compact-input" required>
                  </div>
                  <div class="form-group">
                      <label>{{ $t('ownerDashboard.setup.typeLabel') }}</label>
                      <select v-model="form.type" class="compact-input" required>
                          <option disabled value="">{{ $t('ownerDashboard.setup.typePlaceholder') }}</option>
                          <option value="CER">CER (Comunità Energetica Rinnovabile)</option>
                          <option value="AUC">AUC (Autoconsumo Collettivo)</option>
                          <option value="Azienda">Azienda (Autoconsumo Diffuso)</option>
                          <option value="Cooperativa">Cooperativa</option>
                          <option value="Altro">Altro</option>
                      </select>
                  </div>
                  <button type="submit" class="btn-primary mt-3" :disabled="submitting">
                      {{ submitting ? $t('ownerDashboard.setup.creating') : $t('ownerDashboard.setup.createBtn') }}
                  </button>
              </form>
          </div>
      </div>

      <div v-else class="dashboard-view fade-in delay-1">
        
        <div class="kpi-grid">
            <div class="kpi-card glass">
                <div class="icon-box blue">🔌</div>
                <div class="data">
                    <h3>{{ $t('ownerDashboard.kpi.totalPods') }}</h3>
                    <span class="value">{{ stats.pods_count || 0 }}</span>
                    <span class="trend">{{ $t('ownerDashboard.kpi.managedBy') }}</span>
                </div>
            </div>
            
            <div class="kpi-card glass">
                <div class="icon-box green">⚡</div>
                <div class="data">
                    <h3>{{ $t('ownerDashboard.kpi.installedPower') }}</h3>
                    <span class="value">{{ stats.total_production_kw || 0 }} kW</span>
                    <span class="trend">{{ $t('ownerDashboard.kpi.totalPv') }}</span>
                </div>
            </div>

            <div class="kpi-card glass">
                <div class="icon-box purple">👥</div>
                <div class="data">
                    <h3>{{ $t('ownerDashboard.kpi.members') }}</h3>
                    <span class="value">{{ stats.members_count || 0 }}</span>
                    <span class="trend">{{ $t('ownerDashboard.kpi.activeParticipants') }}</span>
                </div>
            </div>

            <div class="kpi-card glass highlight">
                <div class="icon-box orange">🔥</div>
                <div class="data">
                    <h3>{{ $t('ownerDashboard.kpi.selfConsumption') }}</h3>
                    <span class="value">{{ stats.self_sufficiency || 0 }}%</span>
                    <span class="trend">{{ $t('ownerDashboard.kpi.sufficiencyIndex') }}</span>
                </div>
            </div>
        </div>

        <div class="content-grid">
            
            <div class="section-card actions-section">
                <h3>{{ $t('ownerDashboard.actions.title') }}</h3>
                <div class="actions-list">
                    <div class="action-item" @click="goTo('/owner/pods')">
                        <div class="act-icon">📂</div>
                        <div class="act-info">
                            <h4>{{ $t('ownerDashboard.actions.managePods') }}</h4>
                            <p>{{ $t('ownerDashboard.actions.managePodsDesc') }}</p>
                        </div>
                        <div class="arrow">→</div>
                    </div>

                    <div class="action-item disabled">
                        <div class="act-icon">📄</div>
                        <div class="act-info">
                            <h4>{{ $t('ownerDashboard.actions.contracts') }}</h4>
                            <p>{{ $t('ownerDashboard.actions.contractsDesc') }}</p>
                        </div>
                    </div>

                    <div class="action-item disabled">
                        <div class="act-icon">🔧</div>
                        <div class="act-info">
                            <h4>{{ $t('ownerDashboard.actions.config') }}</h4>
                            <p>{{ $t('ownerDashboard.actions.configDesc') }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section-card chart-section">
                <h3>{{ $t('ownerDashboard.chart.title') }}</h3>
                <div class="chart-placeholder">
                    <div class="chart-mockup">
                        <div class="bar" style="height: 40%"></div>
                        <div class="bar" style="height: 70%"></div>
                        <div class="bar" style="height: 50%"></div>
                        <div class="bar" style="height: 85%"></div>
                        <div class="bar" style="height: 60%"></div>
                        <div class="bar" style="height: 90%"></div>
                    </div>
                    <p>{{ $t('ownerDashboard.chart.placeholder') }}</p>
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
import { useI18n } from 'vue-i18n';
import AuthService from '@/services/AuthService';
import CommunityService from '@/services/CommunityService';
import axios from '@/services/axios'; 

const router = useRouter();
const { t, locale } = useI18n();

const user = ref({ name: '', surname: '' });
const community = ref(null);
const stats = ref({}); 
const loading = ref(true);
const submitting = ref(false);
const form = ref({ name: '', type: 'CER', address: '' });
const isLightMode = ref(false);

const hasCommunity = computed(() => {
    return community.value && community.value.id;
});

const initials = computed(() => {
    const n = user.value.name ? user.value.name[0] : '';
    const s = user.value.surname ? user.value.surname[0] : '';
    return (n + s).toUpperCase();
});

// Data dinamica in base alla lingua selezionata
const currentDate = computed(() => {
    const langCode = locale.value === 'it' ? 'it-IT' : 'en-US';
    return new Date().toLocaleDateString(langCode, { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
});

onMounted(async () => {
    // 1. INIZIALIZZA TEMA E LINGUA DA LOCALSTORAGE
    const savedTheme = localStorage.getItem('theme');
    isLightMode.value = savedTheme === 'light';
    if (isLightMode.value) document.body.classList.add('light-mode');
    
    const savedLang = localStorage.getItem('lang');
    if (savedLang) locale.value = savedLang;

    try {
        const userRes = await AuthService.getUser();
        user.value = userRes.data;

        const commRes = await CommunityService.getMyCommunity();
        
        if (commRes.data) {
            if (Array.isArray(commRes.data)) {
                if (commRes.data.length > 0) community.value = commRes.data[0];
            } else if (commRes.data.id) {
                community.value = commRes.data;
            }
        }

        if (community.value && community.value.id) {
            await loadDashboardStats();
        }

    } catch (e) {
        console.error("Errore caricamento dashboard", e);
    } finally {
        loading.value = false;
    }
});

const toggleTheme = () => {
    isLightMode.value = !isLightMode.value;
    if (isLightMode.value) {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    }
};

const toggleLanguage = () => {
    locale.value = locale.value === 'it' ? 'en' : 'it';
    localStorage.setItem('lang', locale.value);
};

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
        community.value = res.data.community || res.data;
        stats.value = { pods_count: 0, members_count: 0, total_production_kw: 0 };
    } catch (e) {
        alert(t('ownerDashboard.alerts.createError'));
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
/* AGGIORNATO CON VARIABILI CSS GLOBALI PER SUPPORTO DARK/LIGHT MODE */

.owner-layout { 
    display: flex; 
    min-height: 100vh; 
    background: var(--bg-app); 
    color: var(--text-main); 
}

/* SIDEBAR */
.sidebar { 
    width: 280px; 
    background: var(--bg-card); 
    border-right: 1px solid var(--border-color);
    display: flex; 
    flex-direction: column; 
    padding: 1.5rem; 
    flex-shrink: 0; 
}

/* BRAND HEADER E TOGGLES PULITI */
.brand-header {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px dashed var(--border-color);
}
.brand { 
    display: flex; 
    align-items: center; 
    gap: 12px; 
    font-size: 1.4rem; 
    font-weight: 700; 
    color: var(--text-main); 
}
.logo-icon { 
    background: var(--accent-blue); 
    width: 36px; 
    height: 36px; 
    border-radius: 10px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 1.2rem; 
    color: white;
}
.light { font-weight: 300; opacity: 0.7; }

.header-toggles {
    display: flex;
    gap: 20px;
    align-items: center;
    padding-left: 5px;
}
.clean-toggle-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.3rem;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s ease, transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}
.clean-toggle-btn:hover {
    color: var(--accent-blue);
    transform: scale(1.1);
}
.lang-text {
    font-size: 1.05rem;
    font-weight: 800;
    font-family: 'Inter', sans-serif;
}

.user-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; padding: 1rem; background: var(--bg-app); border-radius: 12px; border: 1px solid var(--border-color); }
.avatar { width: 42px; height: 42px; background: var(--accent-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; }
.info { display: flex; flex-direction: column; }
.name { font-weight: 600; font-size: 0.95rem; color: var(--text-main);}
.role { font-size: 0.75rem; color: var(--text-muted); }

.nav-links { list-style: none; padding: 0; margin: 0; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.nav-links li { padding: 12px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; color: var(--text-muted); font-weight: 500; display: flex; align-items: center; gap: 10px; }
.nav-links li:hover:not(.disabled) { background: var(--bg-app); color: var(--text-main); transform: translateX(5px); }
.nav-links li.active { background: var(--accent-blue); color: white; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
.nav-links li.disabled { opacity: 0.4; cursor: not-allowed; }

.btn-logout { width: 100%; padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; }
.btn-logout:hover { background: #ef4444; color: white; }

/* MAIN CONTENT */
.main-content { flex: 1; padding: 2.5rem; overflow-y: auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
.top-bar h1 { margin: 0; font-size: 2rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; }
.subtitle { margin: 5px 0 0 0; color: var(--text-muted); font-size: 1rem; }
.date { font-weight: 500; color: var(--text-muted); background: var(--bg-card); padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.03); text-transform: capitalize; border: 1px solid var(--border-color); }

/* KPI GRID */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.kpi-card { background: var(--bg-card); padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; gap: 1.2rem; transition: transform 0.2s; border: 1px solid var(--border-color); }
.kpi-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border-color: var(--accent-blue); }

.icon-box { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0; }
.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }

.data { display: flex; flex-direction: column; }
.data h3 { margin: 0; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.data .value { font-size: 1.8rem; font-weight: 800; color: var(--text-main); line-height: 1.2; margin: 4px 0; }
.data .trend { font-size: 0.75rem; color: var(--text-muted); }

/* CONTENT GRID (ACTIONS + CHART) */
.content-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; }
.section-card { background: var(--bg-card); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color); }
.section-card h3 { margin: 0 0 1.5rem 0; font-size: 1.1rem; color: var(--text-main); font-weight: 700; }

.actions-list { display: flex; flex-direction: column; gap: 1rem; }
.action-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-app); border-radius: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.action-item:hover:not(.disabled) { background: var(--bg-card); border-color: var(--accent-blue); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); }
.action-item.disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(1); }
.act-icon { font-size: 1.4rem; background: var(--bg-card); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.act-info h4 { margin: 0; font-size: 0.95rem; color: var(--text-main); }
.act-info p { margin: 2px 0 0 0; font-size: 0.8rem; color: var(--text-muted); }
.arrow { margin-left: auto; color: var(--text-muted); font-weight: bold; }

/* CHART PLACEHOLDER */
.chart-placeholder { height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-app); border-radius: 12px; border: 2px dashed var(--border-color); color: var(--text-muted); }
.chart-mockup { display: flex; align-items: flex-end; gap: 12px; height: 100px; margin-bottom: 1rem; opacity: 0.5; }
.bar { width: 12px; background: var(--text-muted); border-radius: 4px; }

/* SETUP FORM */
.setup-container { display: flex; justify-content: center; margin-top: 3rem; }
.setup-box { background: var(--bg-card); padding: 3rem; border-radius: 20px; max-width: 550px; width: 100%; border: 1px solid var(--border-color); text-align: center; }
.setup-header { margin-bottom: 2.5rem; }
.icon-wrapper { font-size: 3rem; margin-bottom: 1rem; }
.setup-header h2 { margin: 0; font-size: 1.5rem; color: var(--text-main); }
.setup-header p { color: var(--text-muted); margin-top: 0.5rem; }
.setup-form { display: flex; flex-direction: column; gap: 1rem; text-align: left; }

.compact-input { width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-app); color: var(--text-main); font-size: 1rem; transition: 0.2s; }
.compact-input:focus { border-color: var(--accent-blue); outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.mt-3 { margin-top: 1rem; }

/* SPINNER & UTILS */
.loader-container { padding: 3rem; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 15px;}
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.5s ease forwards; opacity: 0;}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.delay-0 { animation-delay: 0.1s; }
.delay-1 { animation-delay: 0.2s; }

/* RESPONSIVE */
@media (max-width: 1024px) {
    .content-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
    .owner-layout { flex-direction: column; }
    .sidebar { width: 100%; padding: 1rem; border-right: none; border-bottom: 1px solid var(--border-color); }
    .nav-links { flex-direction: row; overflow-x: auto; padding-bottom: 10px; margin-bottom: 10px;}
    .main-content { padding: 1.5rem; }
    .kpi-grid { grid-template-columns: 1fr; }
    .brand-header { flex-direction: row; align-items: center; justify-content: space-between; border-bottom: none; margin-bottom: 1.5rem; padding-bottom: 0; }
}
</style>
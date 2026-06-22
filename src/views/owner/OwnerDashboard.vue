<template>
  <div class="owner-layout">
    <nav class="sidebar">
      
      <div class="brand-header">
        <div class="brand">
          <div class="logo-icon">⚡</div>
          <span>Owner<span class="light">Panel</span></span>
        </div>
        
        <div class="header-toggles">
          <button class="icon-btn hover-scale" @click="toggleTheme" :aria-label="$t('common.changeTheme')" :title="$t('common.changeTheme')">
            <svg v-if="isLightMode" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>

          <button @click="toggleLanguage" class="clean-toggle-btn lang-text" title="Cambia lingua">
            {{ locale === 'it' ? 'EN' : 'IT' }}
          </button>
        </div>
      </div>
      
      <div class="user-profile clickable-profile" @click="goTo('/profilo')" title="Vai al tuo Profilo">
        <div class="avatar">{{ initials }}</div>
        <div class="info">
          <span class="name">{{ user.name }} {{ user.surname }}</span>
          <span class="role">{{ $t('ownerDashboard.sidebar.role') }}</span>
        </div>
        <div class="profile-arrow">→</div>
      </div>

      <ul class="nav-links">
        <li 
          :class="{ active: currentView === 'dashboard' }" 
          @click="currentView = 'dashboard'"
        >
            {{ $t('ownerDashboard.sidebar.overview') }}
        </li>

        <li 
          :class="{ active: $route.path === '/survey/strategia_business_2026' }" 
          @click="goTo('/survey/strategia_business_2026')"
          class="highlight-nav-item"
        >
            <span class="nav-icon">📊</span>
            {{ $t('ownerDashboard.sidebar.strategicSurvey', 'Sondaggio Strategico') }}
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

        <li 
          :class="{ active: currentView === 'perimetro', disabled: !hasCommunity }" 
          @click="hasCommunity && showPerimetro()"
        >
            <span class="nav-icon">🗺️</span>
            Perimetro Operativo CER
        </li>

        <li 
            :class="{ active: $route.path === '/owner/education', disabled: !hasCommunity }" 
            @click="hasCommunity && goTo('/owner/education')"
        >
            {{ $t('ownerDashboard.sidebar.education') }}
        </li>

        <li 
                :class="{ active: $route.path === '/owner/bollette' }" 
                @click="goTo('/owner/bollette')"
                class="highlight-nav-item"
                >
                    <span class="nav-icon">🧾</span>
                    {{ $t('ownerDashboard.sidebar.historyBills', 'Storico Bollette') }}
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
        <div class="header-titles">
            <div v-if="hasCommunity" class="title-with-badge">
                <h1>{{ $t('ownerDashboard.topbar.dashboardTitle', { name: community.name }) }}</h1>
                <span class="type-badge" v-if="community.type">{{ community.type }}</span>
                
                <button 
                  v-if="community.type === 'CER'" 
                  @click="openCerModal" 
                  class="cer-settings-btn" 
                  title="Configurazione Avanzata CER"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>
            </div>
            
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

      <div v-else class="fade-in delay-1">
        
        <div v-if="currentView === 'dashboard'" class="dashboard-view">
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
                        <div class="action-item" @click="goTo('/profilo')">
                            <div class="act-icon">👤</div>
                            <div class="act-info">
                                <h4>{{ $t('common.profile', 'Il mio Profilo') }}</h4>
                                <p>Gestisci anagrafica, identità digitale (DID) e contratti firmati.</p>
                            </div>
                            <div class="arrow">→</div>
                        </div>

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

        <div v-else-if="currentView === 'perimetro'" class="dashboard-view">
          <div class="section-card" style="min-height: 400px;">
            <div class="section-header-flex">
              <div>
                <h3 style="margin:0; font-size: 1.4rem;">🗺️ Perimetro Operativo CER</h3>
                <p style="margin-top: 5px; color: var(--text-muted);">Elenco ufficiale delle Cabine Primarie su cui insiste l'anagrafica legale della Comunità Energetica.</p>
              </div>
              <button class="btn-primary" @click="openCerModal" style="display: flex; gap: 8px; align-items: center;">
                ⚙️ <span>Modifica Perimetro</span>
              </button>
            </div>

            <div class="table-responsive">
              <table class="fintech-table">
                <thead>
                  <tr>
                    <th>Codice Area (AC)</th>
                    <th>Territorio Coperto (Province)</th>
                    <th>Distributore / Gestore Rete</th>
                    <th>Stato Operativo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loadingPerimetro">
                    <td colspan="4" class="text-center py-4 text-muted">Sincronizzazione dati anagrafici dal server in corso...</td>
                  </tr>
                  <tr v-else-if="perimetroList.length === 0">
                    <td colspan="4" class="text-center text-muted py-4">
                        Nessuna cabina presente nel perimetro. Clicca su "Modifica Perimetro" in alto a destra per iniziare l'associazione.
                    </td>
                  </tr>
                  <tr v-else v-for="cab in perimetroList" :key="cab.cod_ac">
                    <td><span class="cabina-code">⚡ {{ cab.cod_ac }}</span></td>
                    <td>
                        <span :class="cab.provincia_nome ? 'provincia-badge' : 'text-muted'">
                            {{ cab.provincia_nome || 'In attesa di verifica' }}
                        </span>
                    </td>
                    <td>{{ cab.gestore || 'N/D' }}</td>
                    <td><span class="status-badge active">Verificata dal GSE</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </main>

    <transition name="fade">
      <div v-if="isCerModalOpen" class="modal-overlay" @click.self="closeCerModal">
        <div class="modal-content large-modal">
          <div class="modal-header">
            <div>
              <h2 style="margin: 0; font-size: 1.25rem;">⚙️ Configurazione CER</h2>
              <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-muted);">{{ community?.name }}</p>
            </div>
            <button class="close-btn" @click="closeCerModal">✕</button>
          </div>
          
          <div class="modal-body custom-scroll">
            <form @submit.prevent="saveCerConfig" class="cer-form">
              
              <div class="form-section">
                <h3 class="section-title">Brand & Comunicazione</h3>
                <div class="form-group">
                  <label>Logo Ufficiale della CER</label>
                  <div class="file-upload-box">
                    <input type="file" accept="image/*" @change="handleFileUpload($event, 'logo')" class="file-input">
                    <span class="file-hint" :style="{ color: cerConfig.logo || community?.logo_path ? 'var(--accent-green)' : 'inherit' }">
                      {{ cerConfig.logo ? cerConfig.logo.name : (community?.logo_path ? '✅ Logo attuale salvato (clicca per sostituire)' : 'Trascina un file o clicca per caricare (PNG, JPG)') }}
                    </span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Messaggio di Benvenuto per i Membri</label>
                  <textarea v-model="cerConfig.welcomeMessage" rows="3" class="modern-input" placeholder="Benvenuti nella nostra Comunità Energetica Rinnovabile..."></textarea>
                </div>
              </div>

              <div class="form-section">
                <h3 class="section-title">Documentazione Legale</h3>
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label>Regolamento Interno (PDF)</label>
                    <div class="file-upload-box">
                      <input type="file" accept="application/pdf" @change="handleFileUpload($event, 'regolamento')" class="file-input">
                      <span class="file-hint" :style="{ color: cerConfig.regolamento || community?.regolamento_path ? 'var(--accent-green)' : 'inherit' }">
                        {{ cerConfig.regolamento ? cerConfig.regolamento.name : (community?.regolamento_path ? '✅ PDF Salvato' : 'Allega PDF') }}
                      </span>
                    </div>
                  </div>
                  <div class="form-group flex-1">
                    <label>Statuto Costitutivo (PDF)</label>
                    <div class="file-upload-box">
                      <input type="file" accept="application/pdf" @change="handleFileUpload($event, 'statuto')" class="file-input">
                      <span class="file-hint" :style="{ color: cerConfig.statuto || community?.statuto_path ? 'var(--accent-green)' : 'inherit' }">
                        {{ cerConfig.statuto ? cerConfig.statuto.name : (community?.statuto_path ? '✅ PDF Salvato' : 'Allega PDF') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3 class="section-title">Dati Amministrativi e Finanziari</h3>
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label>Rappresentante Legale</label>
                    <input v-model="cerConfig.representative" class="modern-input" placeholder="Nome e Cognome">
                  </div>
                  <div class="form-group flex-1">
                    <label>IBAN per Accredito GSE</label>
                    <input v-model="cerConfig.iban" class="modern-input uppercase" placeholder="IT00..." maxlength="27">
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h3 class="section-title">Ricerca Cabine Primarie</h3>
                <p class="section-desc">Seleziona la provincia per sbloccare e inserire l'elenco delle cabine fisiche da associare alla CER.</p>
                
                <div class="form-row mt-2" style="gap: 16px; margin-bottom: 16px;">
                  <div class="form-group flex-1" style="margin-bottom: 0;">
                    <label>1. Filtra per Provincia</label>
                    <select v-model="currentProvince" @change="fetchSubstationsByProvince" class="modern-input">
                      <option value="">Scegli Provincia...</option>
                      <option v-for="prov in provincesList" :key="prov.provincia_sigla" :value="prov.provincia_sigla">
                        {{ prov.provincia_nome }} ({{ prov.provincia_sigla }})
                      </option>
                    </select>
                  </div>
                  
                  <div class="form-group flex-1" style="margin-bottom: 0;">
                    <label>2. Seleziona Cabina Primaria</label>
                    <select v-model="currentSelectedCabina" class="modern-input" :disabled="!currentProvince || loadingCabine">
                      <option value="">{{ loadingCabine ? 'Caricamento cabine...' : 'Scegli la cabina...' }}</option>
                      <option v-for="cab in availableCabine" :key="cab.cod_ac" :value="cab.cod_ac">
                        {{ cab.cod_ac }} - {{ cab.gestore || 'Gestore N/D' }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 0;">
                  <button type="button" @click="addSelectedCabina" class="btn-primary" style="width: 100%; height: 46px;" :disabled="!currentSelectedCabina">
                    + Aggiungi Cabina alla CER
                  </button>
                </div>
              </div>

              <div class="form-section summary-section">
                <div class="section-header-flex no-border">
                  <h3 class="section-title no-border" style="margin-bottom: 0; padding-bottom: 0;">Cabine Associate (Riepilogo)</h3>
                  <span class="count-badge">{{ cerConfig.substations.length }} Attive</span>
                </div>
                
                <div v-if="cerConfig.substations.length === 0" class="file-hint text-left-dashed summary-empty mt-3">
                  Nessuna cabina primaria associata al perimetro. Utilizza il pannello di ricerca qui sopra.
                </div>
                
                <div v-else class="cabine-tags-container mt-3">
                  <div v-for="(cabina, index) in cerConfig.substations" :key="index" class="cabina-tag-item animate-tag">
                    <div class="tag-content">
                        <span class="icon">⚡</span>
                        <span class="cabina-code">
                          {{ cabina.code }} 
                          <span v-if="cabina.province" class="tag-province-label">({{ cabina.province }})</span>
                        </span>
                    </div>
                    <button type="button" @click="removeSubstation(index)" class="remove-tag-btn" title="Rimuovi Cabina dalla CER">✕</button>
                  </div>
                </div>
              </div>

            </form>
          </div>

          <div class="modal-footer">
            <button class="btn-text-only" @click="closeCerModal" :disabled="savingCer">Annulla</button>
            <button class="btn-primary" @click="saveCerConfig" :disabled="savingCer">
              {{ savingCer ? 'Salvataggio in corso...' : 'Salva Configurazione' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

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

const currentView = ref('dashboard');
const perimetroList = ref([]);
const loadingPerimetro = ref(false);

const isCerModalOpen = ref(false);
const savingCer = ref(false);
const cerConfig = ref({
  welcomeMessage: '',
  representative: '',
  iban: '',
  substations: [],
  logo: null,
  regolamento: null,
  statuto: null
});

const provincesList = ref([]);        
const availableCabine = ref([]);       
const currentProvince = ref('');       
const currentSelectedCabina = ref(''); 
const loadingCabine = ref(false);     

const hasCommunity = computed(() => {
    return community.value && community.value.id;
});

const initials = computed(() => {
    const n = user.value.name ? user.value.name[0] : '';
    const s = user.value.surname ? user.value.surname[0] : '';
    return (n + s).toUpperCase();
});

const currentDate = computed(() => {
    const langCode = locale.value === 'it' ? 'it-IT' : 'en-US';
    return new Date().toLocaleDateString(langCode, { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
});

onMounted(async () => {
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

const showPerimetro = async () => {
  currentView.value = 'perimetro';
  loadingPerimetro.value = true;
  try {
      const res = await axios.get(`/api/communities/${community.value.id}/perimetro`);
      perimetroList.value = res.data;
  } catch (e) {
      console.warn("Errore caricamento perimetro, uso fallback", e);
      const fallbackSubs = community.value.substations || [];
      perimetroList.value = fallbackSubs.map(s => {
          const codice = typeof s === 'object' ? (s.code || s.cod_ac) : s;
          const prov = typeof s === 'object' ? (s.provincia_sigla || '') : '';
          return {
              cod_ac: codice,
              provincia_nome: prov || 'Da sincronizzare',
              gestore: 'N/D'
          };
      });
  } finally {
      loadingPerimetro.value = false;
  }
};

const openCerModal = async () => {
  cerConfig.value.welcomeMessage = community.value.welcome_message || '';
  cerConfig.value.representative = community.value.representative_name || '';
  cerConfig.value.iban = community.value.iban || '';
  
  currentProvince.value = '';
  currentSelectedCabina.value = '';
  availableCabine.value = [];

  // 1. Forza il caricamento dell'elenco cabine dal server se non è già presente
  if (!perimetroList.value || perimetroList.value.length === 0) {
      try {
          const res = await axios.get(`/api/communities/${community.value.id}/perimetro`);
          perimetroList.value = res.data;
      } catch (e) {
          console.warn("Impossibile caricare il perimetro dal server, uso i dati in cache", e);
      }
  }

  // 2. Usa l'elenco aggiornato (perimetroList) come fonte primaria, altrimenti usa i dati in cache
  const existingSubs = (perimetroList.value && perimetroList.value.length > 0) 
      ? perimetroList.value 
      : (community.value.substations || []);

  // 3. Popola l'array del modale mappando correttamente i campi dal DB
  if (existingSubs && existingSubs.length > 0) {
      cerConfig.value.substations = existingSubs.map(s => {
          if (typeof s === 'object') {
              return { 
                  code: s.code || s.cod_ac || '', 
                  province: s.provincia_sigla || s.provincia_nome || s.province || '' 
              };
          }
          return { code: s, province: '' };
      }).filter(s => s.code && s.code.trim() !== '');
  } else {
      cerConfig.value.substations = [];
  }

  cerConfig.value.logo = null;
  cerConfig.value.regolamento = null;
  cerConfig.value.statuto = null;

  if (provincesList.value.length === 0) {
      try {
          const res = await axios.get('/api/province-disponibili');
          provincesList.value = res.data; 
      } catch (e) {
          console.error("Impossibile scaricare le province", e);
      }
  }

  isCerModalOpen.value = true;
};

const fetchSubstationsByProvince = async () => {
  currentSelectedCabina.value = '';
  if (!currentProvince.value) {
      availableCabine.value = [];
      return;
  }
  loadingCabine.value = true;
  try {
      const res = await axios.get(`/api/province/${currentProvince.value}/cabine`);
      availableCabine.value = res.data; 
  } catch (e) {
      console.error("Errore caricamento cabine per provincia", e);
  } finally {
      loadingCabine.value = false;
  }
};

const addSelectedCabina = () => {
  if (currentSelectedCabina.value) {
      const giaPresente = cerConfig.value.substations.some(s => s.code === currentSelectedCabina.value);
      if (!giaPresente) {
          cerConfig.value.substations.push({
              code: currentSelectedCabina.value,
              province: currentProvince.value
          });
          currentSelectedCabina.value = ''; 
      }
  }
};

const closeCerModal = () => {
  isCerModalOpen.value = false;
};

const removeSubstation = (index) => {
  cerConfig.value.substations.splice(index, 1);
};

const handleFileUpload = (event, fieldName) => {
  const file = event.target.files[0];
  if (file) {
    cerConfig.value[fieldName] = file;
  }
};

const saveCerConfig = async () => {
  savingCer.value = true;
  try {
    const formData = new FormData();
    
    formData.append('welcomeMessage', cerConfig.value.welcomeMessage || '');
    formData.append('representative', cerConfig.value.representative || '');
    
    const cleanIban = (cerConfig.value.iban || '').replace(/\s+/g, '');
    formData.append('iban', cleanIban);

    if (cerConfig.value.logo instanceof File) formData.append('logo', cerConfig.value.logo);
    if (cerConfig.value.regolamento instanceof File) formData.append('regolamento', cerConfig.value.regolamento);
    if (cerConfig.value.statuto instanceof File) formData.append('statuto', cerConfig.value.statuto);

    cerConfig.value.substations.forEach(sub => {
        if(sub.code && sub.code.trim() !== '') {
            formData.append('substations[]', sub.code.trim().toUpperCase());
        }
    });

    const res = await axios.post(`/api/communities/${community.value.id}/cer-config`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    community.value.welcome_message = cerConfig.value.welcomeMessage;
    community.value.representative_name = cerConfig.value.representative;
    community.value.iban = cleanIban;
    
    community.value.substations = res.data.substations || cerConfig.value.substations;
    
    // AGGIUNTA: Allineiamo anche il perimetroList locale per la tabella
    perimetroList.value = cerConfig.value.substations.map(s => ({
        cod_ac: s.code,
        provincia_nome: s.province,
        gestore: 'In fase di aggiornamento' 
    }));
    
    alert("Configurazione del Perimetro aggiornata con successo.");
    closeCerModal();
    
    if (currentView.value === 'perimetro') {
        showPerimetro();
    }
    
   
  } catch (e) {
    if (e.response && e.response.status === 422) {
        let errorMsg = "ATTENZIONE - Dati non validi:\n";
        const errors = e.response.data.errors;
        for (const key in errors) {
            errorMsg += `\n- ${errors[key][0]}`;
        }
        alert(errorMsg);
    } else {
        alert("Errore di comunicazione col server o mismatch nel Database SQL.");
    }
    console.error("CER Save Error:", e);
  } finally {
    savingCer.value = false;
  }
};
</script>

<style scoped>
.owner-layout { 
    display: flex; 
    min-height: 100vh; 
    background: var(--bg-app); 
    color: var(--text-main); 
}

.sidebar { 
    width: 280px; 
    background: var(--bg-card); 
    border-right: 1px solid var(--border-color);
    display: flex; 
    flex-direction: column; 
    padding: 1.5rem; 
    flex-shrink: 0; 
}

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
.header-toggles { display: flex; gap: 20px; align-items: center; padding-left: 5px; }

.icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color 0.2s ease, transform 0.2s ease; padding: 0; }
.icon-btn:hover { color: var(--accent-blue); transform: scale(1.1); }

.clean-toggle-btn { background: none; border: none; color: var(--text-muted); font-size: 1.3rem; cursor: pointer; padding: 0; transition: color 0.2s ease, transform 0.2s ease; display: flex; align-items: center; justify-content: center; }
.clean-toggle-btn:hover { color: var(--accent-blue); transform: scale(1.1); }
.lang-text { font-size: 1.05rem; font-weight: 800; font-family: 'Inter', sans-serif; }

.user-profile { display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; padding: 1rem; background: var(--bg-app); border-radius: 12px; border: 1px solid var(--border-color); }
.clickable-profile { cursor: pointer; transition: all 0.2s ease; }
.clickable-profile:hover { border-color: var(--accent-blue); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); }
.profile-arrow { margin-left: auto; color: var(--text-muted); font-weight: bold; transition: transform 0.2s ease; }
.clickable-profile:hover .profile-arrow { color: var(--accent-blue); transform: translateX(4px); }

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

.main-content { flex: 1; padding: 2.5rem; overflow-y: auto; }
.top-bar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
.top-bar h1 { margin: 0; font-size: 2rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; }

.title-with-badge { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.type-badge { font-size: 0.8rem; background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); border: 1px solid var(--accent-blue); padding: 4px 10px; border-radius: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;}

.cer-settings-btn { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-muted); width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; margin-top: 4px; }
.cer-settings-btn:hover { background: var(--accent-blue); color: white; border-color: var(--accent-blue); transform: rotate(45deg); }

.subtitle { margin: 5px 0 0 0; color: var(--text-muted); font-size: 1rem; }
.date { font-weight: 500; color: var(--text-muted); background: var(--bg-card); padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.03); text-transform: capitalize; border: 1px solid var(--border-color); }

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

.chart-placeholder { height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-app); border-radius: 12px; border: 2px dashed var(--border-color); color: var(--text-muted); }
.chart-mockup { display: flex; align-items: flex-end; gap: 12px; height: 100px; margin-bottom: 1rem; opacity: 0.5; }
.bar { width: 12px; background: var(--text-muted); border-radius: 4px; }

.setup-container { display: flex; justify-content: center; margin-top: 3rem; }
.setup-box { background: var(--bg-card); padding: 3rem; border-radius: 20px; max-width: 550px; width: 100%; border: 1px solid var(--border-color); text-align: center; }
.setup-header { margin-bottom: 2.5rem; }
.icon-wrapper { font-size: 3rem; margin-bottom: 1rem; }
.setup-header h2 { margin: 0; font-size: 1.5rem; color: var(--text-main); }
.setup-header p { color: var(--text-muted); margin-top: 0.5rem; }
.setup-form { display: flex; flex-direction: column; gap: 1rem; text-align: left; }
.compact-input { width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-app); color: var(--text-main); font-size: 1rem; transition: 0.2s; }
.compact-input:focus { border-color: var(--accent-blue); outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(5px); z-index: 999; display: flex; justify-content: center; align-items: center; padding: 20px; }
.modal-content { background: var(--bg-card); border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border-color); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
.large-modal { width: 100%; max-width: 680px; max-height: 90vh; }
.modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; color: var(--text-main); }
.close-btn { background: var(--bg-app); border: 1px solid var(--border-color); color: var(--text-muted); width: 32px; height: 32px; border-radius: 8px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.close-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }

.modal-body { padding: 24px; flex-grow: 1; overflow-y: auto; background: var(--bg-app); }
.custom-scroll::-webkit-scrollbar { width: 8px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
.custom-scroll::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

.modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px; background: var(--bg-card); }

.cer-form { display: flex; flex-direction: column; gap: 0; }
.form-section { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
.section-title { margin: 0 0 16px 0; font-size: 1.05rem; color: var(--text-main); font-weight: 700; border-bottom: 1px dashed var(--border-color); padding-bottom: 10px; }
.section-desc { font-size: 0.85rem; color: var(--text-muted); margin: -8px 0 16px 0; line-height: 1.4; }

.form-group { margin-bottom: 16px; }
.form-row { display: flex; gap: 16px; }
.align-end { align-items: flex-end; }
.flex-1 { flex: 1; }

label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
.modern-input { width: 100%; background: var(--bg-app); color: var(--text-main); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; transition: border-color 0.2s; font-family: inherit;}
.modern-input:focus { outline: none; border-color: var(--accent-blue); }
.uppercase { text-transform: uppercase; }

.file-upload-box { position: relative; border: 1px dashed var(--border-color); border-radius: 8px; padding: 12px; background: var(--bg-app); text-align: center; cursor: pointer; transition: all 0.2s; overflow: hidden; }
.file-upload-box:hover { border-color: var(--accent-blue); background: rgba(59, 130, 246, 0.05); }
.file-input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.file-hint { font-size: 0.85rem; color: var(--text-muted); pointer-events: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.text-left-dashed { text-align: left; padding: 12px; border: 1px dashed var(--border-color); border-radius: 8px; margin-top: 8px;}

.summary-section { background: var(--bg-app); border: 1px dashed var(--border-color); margin-bottom: 0; }
.section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 10px; }
.no-border { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.count-badge { background: var(--accent-blue); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
.summary-empty { background: var(--bg-card); }

.cabine-tags-container { display: flex; flex-wrap: wrap; gap: 12px; }
.cabina-tag-item { display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border: 1px solid var(--border-color); padding: 10px 16px; border-radius: 8px; font-size: 0.95rem; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.02); min-width: 200px; }
.tag-content { display: flex; align-items: center; gap: 8px; }
.cabina-code { color: var(--text-main); font-family: 'Courier New', Courier, monospace; letter-spacing: 0.5px; }

.tag-province-label { font-size: 0.8rem; color: var(--accent-blue); font-weight: 800; font-family: 'Inter', sans-serif; margin-left: 2px;}

.remove-tag-btn { background: rgba(239, 68, 68, 0.1); border: none; color: #ef4444; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; margin-left: auto; }
.remove-tag-btn:hover { background: #ef4444; color: white; }

.animate-tag { animation: scaleInTag 0.25s ease-out forwards; }
@keyframes scaleInTag { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 1rem; }

.btn-primary { background: var(--accent-blue); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-text-only { background: transparent; border: none; color: var(--text-muted); padding: 12px; font-weight: 600; cursor: pointer; transition: color 0.2s; }
.btn-text-only:hover { color: var(--text-main); }

.loader-container { padding: 3rem; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 15px;}
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px auto; }
.spinner-small { width: 24px; height: 24px; border: 3px solid var(--border-color); border-top: 3px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.5s ease forwards; opacity: 0;}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.delay-0 { animation-delay: 0.1s; }
.delay-1 { animation-delay: 0.2s; }

.table-responsive { overflow-x: auto; margin-top: 20px; }
.fintech-table { width: 100%; border-collapse: collapse; text-align: left; background: var(--bg-app); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);}
.fintech-table th { padding: 16px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); border-bottom: 1px solid var(--border-color); background: var(--bg-card); font-weight: 700; }
.fintech-table td { padding: 16px; border-bottom: 1px solid var(--border-color); color: var(--text-main); font-size: 0.95rem; vertical-align: middle; }
.fintech-table tr:last-child td { border-bottom: none; }
.fintech-table tbody tr:hover { background: rgba(59, 130, 246, 0.02); }
.status-badge.active { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; white-space: nowrap;}
.provincia-badge { display: inline-block; background: var(--bg-card); border: 1px solid var(--border-color); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600;}

@media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
@media (max-width: 768px) {
    .owner-layout { flex-direction: column; }
    .sidebar { width: 100%; padding: 1rem; border-right: none; border-bottom: 1px solid var(--border-color); }
    .nav-links { flex-direction: row; overflow-x: auto; padding-bottom: 10px; margin-bottom: 10px;}
    .main-content { padding: 1.5rem; }
    .kpi-grid { grid-template-columns: 1fr; }
    .brand-header { flex-direction: row; align-items: center; justify-content: space-between; border-bottom: none; margin-bottom: 1.5rem; padding-bottom: 0; }
    .form-row { flex-direction: column; gap: 16px; }
}
</style>
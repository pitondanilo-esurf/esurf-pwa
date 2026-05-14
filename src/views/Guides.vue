<template>
  <div class="app-container">
    <TopNavbar />

    <main class="main-content main-content-tight">
      
      <div class="f-header-section fade-in">
        <h1 class="f-page-title">Suggerimenti e Guide</h1>
        <p class="f-page-subtitle">
          Scopri le funzionalità e i moduli attivi configurati appositamente per il tuo profilo.
        </p>
      </div>

      <div class="f-divider fade-in delay-1"></div>

      <div class="f-debug-card fade-in delay-2">
        <div class="f-debug-header">
          <div class="f-debug-indicator pulse-animation"></div>
          <span class="f-debug-title">SYSTEM DEBUG CONFIG</span>
        </div>
        <div class="f-debug-body">
            <div class="f-debug-row">
                <span class="f-debug-label">Blocchi attesi (DB):</span>
                <span class="f-debug-value">{{ dashboardConfig.blocks.length }}</span>
            </div>
            <div class="f-debug-row">
                <span class="f-debug-label">Chiavi ricevute (DB):</span>
                <div class="f-tags-container">
                  <span v-for="b in dashboardConfig.blocks" :key="b.id" class="f-tag f-tag-success">
                    {{ b.component_key }}
                  </span>
                </div>
            </div>
            <div class="f-debug-row">
                <span class="f-debug-label">Componenti pronti (Frontend):</span>
                <span class="f-debug-value f-text-blue">
                  {{ Object.keys(availableBlocks).join(', ') || 'Nessuno' }}
                </span>
            </div>
        </div>
      </div>
      
      <div class="f-section-header fade-in delay-3">
        <h2 class="f-section-title">{{ $t('home.hero.suggestion') || 'Moduli Attivi' }}</h2>
      </div>

      <div v-if="loadingConfig" class="f-loading-container fade-in delay-3">
          <div class="f-spinner"></div>
      </div>

      <div v-else class="dynamic-blocks">
          <template v-for="(block, index) in dashboardConfig.blocks" :key="block.id || index">
              
              <component
                v-if="availableBlocks[block.component_key]"
                :is="availableBlocks[block.component_key]"
                :class="`fade-in delay-${4 + index}`"
              />

              <div v-else class="f-alert-card f-alert-danger fade-in">
                  <div class="f-alert-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <div class="f-alert-content">
                    <h4 class="f-alert-title">Errore Mapping Componente</h4>
                    <p class="f-alert-desc">
                      Il database richiede il caricamento di <code class="f-code-block">{{ block.component_key }}</code>, ma il componente non è registrato nel file di configurazione frontend (<code>blockRegistry.js</code>).
                    </p>
                  </div>
              </div>

          </template>
      </div>

    </main>
    
    <BottomNavbar class="fade-in delay-3" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from '@/services/axios';
import AuthService from '@/services/AuthService';

import TopNavbar from '@/components/TopNavbar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';

// Importa il registro blocchi per i componenti dinamici
import { availableBlocks } from '@/config/blockRegistry';

const { t } = useI18n();
const user = ref({});
const loadingAuth = ref(true);

// Stato della dashboard dinamica
const dashboardConfig = ref({ blocks: [] });
const loadingConfig = ref(false);

onMounted(async () => {
  // Ripristino tema per Dark/Light Mode
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }

  try {
    const response = await AuthService.getUser();
    user.value = response.data;
    await fetchDashboardConfig();
  } catch (e) {
    console.warn("Utente non loggato, caricamento fallback per le guide.");
    // Fallback in caso di utente non autenticato o errore
    dashboardConfig.value.blocks = [
      { id: 1, component_key: 'FeatureActivation' },
      { id: 2, component_key: 'FeatureNotifications' }
    ];
  } finally {
    loadingAuth.value = false;
  }
});

const fetchDashboardConfig = async () => {
    loadingConfig.value = true;
    try {
        const res = await axios.get('/api/user/dashboard-config');
        if (res.data.blocks) {
             dashboardConfig.value.blocks = res.data.blocks;
        } else {
             console.error("Struttura risposta API errata:", res.data);
        }
    } catch (e) {
        console.error("Errore API Dashboard Config", e);
        dashboardConfig.value.blocks = [
            { id: 1, component_key: 'FeatureActivation' },
            { id: 2, component_key: 'FeatureNotifications' }
        ];
    } finally {
        loadingConfig.value = false;
    }
};
</script>

<style scoped>
/* --- BASE APP --- */
.app-container { 
  min-height: 100vh; 
  background-color: var(--bg-app); 
  color: var(--text-main); 
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
.main-content { padding: 1.5rem 1rem 5rem 1rem; max-width: 1000px; margin: 0 auto; }
.main-content-tight { max-width: 768px; padding-bottom: 100px; }

/* --- HEADER --- */
.f-header-section { margin-bottom: 1.5rem; text-align: left; }
.f-page-title { 
  font-size: 1.75rem; 
  font-weight: 800; 
  margin: 0; 
  color: var(--text-primary); 
  letter-spacing: -0.8px; 
}
.f-page-subtitle { 
  color: var(--text-muted); 
  font-size: 0.95rem; 
  line-height: 1.5; 
  margin: 0.5rem 0 0 0; 
  font-weight: 400;
}

.f-divider {
  height: 1px;
  background: var(--border-color);
  margin: 2rem 0;
  opacity: 0.6;
}

.f-section-header { margin: 0 0 1.25rem 0; }
.f-section-title { 
  font-size: 1.15rem; 
  font-weight: 700; 
  margin: 0; 
  color: var(--text-main); 
  letter-spacing: -0.3px;
}

/* --- DEBUG CARD FINTECH STYLE --- */
.f-debug-card {
  background: #0f172a; /* Dark Blue scuro stile terminale */
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

.f-debug-header {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1e293b;
  padding: 10px 16px;
  border-bottom: 1px solid #334155;
}

.f-debug-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
}

.pulse-animation { animation: debugPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1); }
@keyframes debugPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.f-debug-title {
  color: #94a3b8;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.f-debug-body {
  padding: 16px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.f-debug-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.f-debug-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 0.7rem; }
.f-debug-value { color: #f8fafc; font-weight: 500; }
.f-text-blue { color: #38bdf8; }

.f-tags-container { display: flex; flex-wrap: wrap; gap: 6px; }
.f-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
.f-tag-success {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* --- ALERT CARDS (MISSING BLOCKS) --- */
.f-alert-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.f-alert-danger {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.f-alert-icon {
  color: #ef4444;
  flex-shrink: 0;
  margin-top: 2px;
  width: 24px;
  height: 24px;
}

.f-alert-title {
  margin: 0 0 4px 0;
  color: #ef4444;
  font-size: 0.95rem;
  font-weight: 700;
}

.f-alert-desc {
  margin: 0;
  color: var(--text-main);
  font-size: 0.85rem;
  line-height: 1.5;
}

.f-code-block {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--text-primary);
}

/* --- SPINNER & BLOCKS --- */
.f-loading-container { display: flex; justify-content: center; padding: 4rem 0; }
.f-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: fSpin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes fSpin { to { transform: rotate(360deg); } }

.dynamic-blocks { display: flex; flex-direction: column; gap: 16px; }

/* --- ANIMATIONS --- */
.fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; opacity: 0; }
.delay-1 { animation-delay: 0.05s; }
.delay-2 { animation-delay: 0.1s; }
.delay-3 { animation-delay: 0.15s; }
.delay-4 { animation-delay: 0.20s; }
.delay-5 { animation-delay: 0.25s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* Mobile Optimizations */
@media (min-width: 600px) {
  .f-debug-row { flex-direction: row; align-items: baseline; gap: 12px; }
  .f-debug-label { width: 180px; flex-shrink: 0; }
}
</style>
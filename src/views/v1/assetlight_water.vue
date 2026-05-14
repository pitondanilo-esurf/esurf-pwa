<template>
  <div class="app-container">
    <TopNavbar />

    <main class="main-content" :class="'theme-' + selectedLens">
      
      <div class="premium-progress fade-in">
        <div class="progress-bar" style="width: 75%;"></div>
      </div>

      <div class="header-premium fade-in delay-1">
        <div class="badges-row">
          <div class="card-tag lens-tag">
            <span class="lens-icon-mini">{{ lensMap[selectedLens].icon }}</span>
            {{ lensMap[selectedLens].label }}
          </div>
          <div v-if="currentPodCode" class="card-tag pod-tag">
            Cod. Utenza: <span class="pod-code">{{ currentPodCode }}</span>
          </div>
        </div>
        
        <h1 class="title-premium">Profilo Idrico</h1>
        <p class="subtitle-premium">Configura i tuoi asset idrici per l'ottimizzazione AI.</p>
      </div>

      <div class="cards-stack fade-in delay-2">
        
        <div class="premium-card">
          <h3 class="card-question">Gestisci un giardino o aree verdi?</h3>
          <div class="options-grid">
            <button class="premium-option" :class="{ 'active': form.irrigation === 'Automatic' }" @click="form.irrigation = 'Automatic'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 21a4 4 0 0 1-4-4c0-5.1 6-11 7-12 1 1 7 6.9 7 12a4 4 0 0 1-4 4z"/>
                  <path d="M11 21v-3"/><path d="M15 21v-2"/><path d="M19 21v-1"/>
                </svg>
              </div>
              <span class="option-text">Irrig. Aut.</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.irrigation === 'Manual' }" @click="form.irrigation = 'Manual'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/><path d="M5 11h14v10H5z"/><circle cx="12" cy="16" r="1"/>
                </svg>
              </div>
              <span class="option-text">Manuale</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.irrigation === 'None' }" @click="form.irrigation = 'None'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
              </div>
              <span class="option-text">Nessuno</span>
            </button>
          </div>
        </div>

        <div class="premium-card">
          <h3 class="card-question">Hai una piscina attiva?</h3>
          <div class="options-grid">
            <button class="premium-option" :class="{ 'active': form.pool === 'Yes' }" @click="form.pool = 'Yes'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 6c.6.5 1.2 1 2.5 1C5.8 7 7 5.5 8.5 5.5c1.5 0 2.7 1.5 4 1.5 1.3 0 2.5-1.5 4-1.5s2.7 1.5 4 1.5c1.3 0 1.9-.5 2.5-1"/>
                  <path d="M2 12c.6.5 1.2 1 2.5 1 1.3 0 2.5-1.5 4-1.5 1.5 0 2.7 1.5 4 1.5 1.3 0 2.5-1.5 4-1.5s2.7 1.5 4 1.5c1.3 0 1.9-.5 2.5-1"/>
                  <path d="M2 18c.6.5 1.2 1 2.5 1 1.3 0 2.5-1.5 4-1.5 1.5 0 2.7 1.5 4 1.5 1.3 0 2.5-1.5 4-1.5s2.7 1.5 4 1.5c1.3 0 1.9-.5 2.5-1"/>
                </svg>
              </div>
              <span class="option-text">Sì</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.pool === 'No' }" @click="form.pool = 'No'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
              </div>
              <span class="option-text">No</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.pool === 'Planning' }" @click="form.pool = 'Planning'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <span class="option-text">In progetto</span>
            </button>
          </div>
        </div>

        <div class="premium-card">
          <h3 class="card-question">Hai sistemi di trattamento o risparmio?</h3>
          <div class="options-grid">
            <button class="premium-option" :class="{ 'active': form.tech === 'Softener' }" @click="form.tech = 'Softener'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <span class="option-text">Addolcitore</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.tech === 'Reducers' }" @click="form.tech = 'Reducers'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>
                </svg>
              </div>
              <span class="option-text">Riduttori</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.tech === 'None' }" @click="form.tech = 'None'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20"/><path d="m17 7-5-5-5 5"/><path d="m7 17 5 5 5-5"/>
                </svg>
              </div>
              <span class="option-text">Nessuno</span>
            </button>
          </div>
        </div>
      </div>

      <div class="action-footer fade-in delay-3">
        <div v-if="errorMsg" class="error-toast">{{ errorMsg }}</div>
        <button @click="saveAssets" class="btn-primary-revo" :disabled="isSaving || !isFormComplete">
          {{ isSaving ? 'Salvataggio...' : 'Conferma e Salva' }}
        </button>
      </div>

    </main>
    <BottomNavbar class="fade-in delay-3" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios';
import TopNavbar from '@/components/TopNavbar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';

const router = useRouter();
const selectedLens = ref('wallet');
const currentPodId = ref(null);
const currentPodCode = ref(null);
const isSaving = ref(false);
const errorMsg = ref('');

const lensMap = {
  wallet: { icon: '📉', label: 'Lente Wallet' },
  planet: { icon: '🌿', label: 'Lente Planet' },
  shield: { icon: '🛡️', label: 'Lente Shield' }
};

const form = reactive({ irrigation: null, pool: null, tech: null });
const isFormComplete = computed(() => form.irrigation && form.pool && form.tech);

onMounted(() => {
  const savedLens = localStorage.getItem('esurf_selected_lens');
  if (savedLens) selectedLens.value = savedLens;
  
  currentPodId.value = localStorage.getItem('esurf_current_pod_id');
  currentPodCode.value = localStorage.getItem('esurf_current_pod_code');
});

const saveAssets = async () => {
    if (!currentPodId.value) { 
        errorMsg.value = "Dati mancanti: ID utenza non trovato."; 
        return; 
    }
    
    isSaving.value = true;
    errorMsg.value = '';

    try {
        const assetsToSave = [];

        // 1. IRRIGAZIONE
        if (form.irrigation === 'Automatic') {
            assetsToSave.push({ asset_type: 'Irrigation', name: 'Irrigazione Automatica' });
        } else if (form.irrigation === 'Manual') {
            assetsToSave.push({ asset_type: 'Irrigation', name: 'Irrigazione Manuale' });
        }

        // 2. PISCINA
        if (form.pool === 'Yes') {
            assetsToSave.push({ asset_type: 'Pool', name: 'Piscina Attiva' });
        }

        // 3. TRATTAMENTO / TECNOLOGIA
        if (form.tech === 'Softener') {
            assetsToSave.push({ asset_type: 'Water Treatment', name: 'Addolcitore' });
        } else if (form.tech === 'Reducers') {
            assetsToSave.push({ asset_type: 'Water Efficiency', name: 'Riduttori di Flusso' });
        }

        console.log("🔵 [FRONTEND] Salvataggio asset idrici:", assetsToSave);

        for (const asset of assetsToSave) {
            await axios.post('/api/pod-assets', { 
                pod_id: currentPodId.value, 
                ...asset, 
                nominal_power: 0, 
                priority: 1, 
                typical_usage: 'always', 
                control: 'Manuale' 
            });
        }
        
        router.push('/onboardinghub'); 
        
    } catch (e) { 
        console.error("❌ Errore salvataggio asset acqua:", e);
        errorMsg.value = "Impossibile salvare i dati idrici."; 
    } finally { 
        isSaving.value = false; 
    }
};
</script>

<style scoped>
@import '@/assets/main_V0.css';

/* STILI IDENTICI AD ASSETLIGHT.VUE */
.theme-wallet { --accent: #d97706; }
.theme-planet { --accent: #10b981; }
.theme-shield { --accent: #3b82f6; }

.main-content { padding: 12px 20px; max-width: 480px; margin: 0 auto; padding-bottom: 80px; }

.premium-progress { height: 3px; background: var(--border-color); border-radius: 4px; margin-bottom: 16px; overflow: hidden; }
.progress-bar { width: 75%; height: 100%; background: var(--accent); transition: width 0.5s ease; }

.header-premium { margin-bottom: 20px; }
.badges-row { display: flex; gap: 8px; margin-bottom: 12px; }
.card-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); }
.lens-tag { color: var(--accent); }
.pod-tag { color: var(--text-muted); border-style: dashed; }
.pod-code { font-family: monospace; font-weight: 800; color: var(--text-primary); }

.title-premium { font-size: 24px; font-weight: 800; margin: 0; color: var(--text-primary); letter-spacing: -0.5px; }
.subtitle-premium { font-size: 13px; color: var(--text-muted); margin-top: 4px; line-height: 1.3; }

.cards-stack { display: flex; flex-direction: column; gap: 12px; }
.premium-card {
  padding: 14px; border-radius: 20px; background: var(--bg-card);
  border: 1px solid var(--border-color); box-shadow: var(--shadow-card);
  background: linear-gradient(160deg, var(--bg-card) 60%, rgba(255,255,255,0.02) 100%);
}
.card-question { font-size: 14px; font-weight: 700; margin: 0 0 12px 0; color: var(--text-primary); }

.options-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.premium-option {
  background: var(--bg-app); border: 1px solid var(--border-color);
  border-radius: 14px; padding: 10px 4px; cursor: pointer; transition: 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--text-muted);
}
.icon-box { width: 24px; height: 24px; color: var(--text-muted); transition: 0.2s; }
.option-text { font-size: 11px; font-weight: 600; text-align: center; line-height: 1.1; }

.premium-option.active { border-color: var(--accent); color: var(--text-primary); transform: translateY(-1px); }
.premium-option.active .icon-box { color: var(--accent); }

.btn-primary-revo { 
  width: 100%; background: var(--text-primary); color: var(--bg-card); 
  border: none; padding: 16px; border-radius: 14px; font-size: 15px; font-weight: 800; cursor: pointer; 
}
.btn-primary-revo:disabled { opacity: 0.5; }
.error-toast { background: #ef4444; color: white; padding: 12px; border-radius: 12px; text-align: center; margin-top: 20px; font-weight: 600; font-size: 14px; }
</style>
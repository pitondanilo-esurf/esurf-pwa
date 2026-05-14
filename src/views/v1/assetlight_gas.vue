<template>
  <div class="app-container">
    <TopNavbar />

    <main class="main-content" :class="'theme-' + selectedLens">
      
      <div class="premium-progress fade-in">
        <div class="progress-bar"></div>
      </div>

      <div class="header-premium fade-in delay-1">
        <div class="badges-row">
          <div class="card-tag lens-tag">
            <span class="lens-icon-mini">{{ lensMap[selectedLens].icon }}</span>
            {{ lensMap[selectedLens].label }}
          </div>
          <div v-if="currentPodCode" class="card-tag pod-tag">
            PDR: <span class="pod-code">{{ currentPodCode }}</span>
          </div>
        </div>
        
        <h1 class="title-premium">Profilo Termico</h1>
        <p class="subtitle-premium">Configura i tuoi asset gas per l'ottimizzazione AI.</p>
      </div>

      <div class="cards-stack fade-in delay-2">
        
        <div class="premium-card">
          <h3 class="card-question">Che tipo di caldaia hai?</h3>
          <div class="options-grid">
            <button class="premium-option" :class="{ 'active': form.boiler === 'Condensazione' }" @click="form.boiler = 'Condensazione'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                  <path d="M12 14c0 2 2 2 2 4a2 2 0 0 1-4 0c0-2 2-2 2-4z"/>
                </svg>
              </div>
              <span class="option-text">Condensazione</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.boiler === 'Tradizionale' }" @click="form.boiler = 'Tradizionale'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                  <path d="M10 14c0 1.5 1.5 2 1.5 3.5a1.5 1.5 0 0 1-3 0c0-1.5 1.5-2 1.5-3.5z"/>
                  <path d="M14 14c0 1.5 1.5 2 1.5 3.5a1.5 1.5 0 0 1-3 0c0-1.5 1.5-2 1.5-3.5z"/>
                </svg>
              </div>
              <span class="option-text">Tradizionale</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.boiler === 'Altro' }" @click="form.boiler = 'Altro'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </div>
              <span class="option-text">Altro</span>
            </button>
          </div>
        </div>

        <div class="premium-card">
          <h3 class="card-question">Come scaldi l'acqua sanitaria?</h3>
          <div class="options-grid">
            <button class="premium-option" :class="{ 'active': form.water === 'Caldaia' }" @click="form.water = 'Caldaia'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <span class="option-text">Come Risc.</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.water === 'Scaldabagno' }" @click="form.water = 'Scaldabagno'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <path d="M9 7h6"/><path d="M9 11h6"/><path d="M12 15v4"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </div>
              <span class="option-text">Scaldabagno El.</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.water === 'Altro' }" @click="form.water = 'Altro'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </div>
              <span class="option-text">Altro</span>
            </button>
          </div>
        </div>

        <div class="premium-card">
          <h3 class="card-question">Hai solare termico per l'acqua?</h3>
          <div class="options-grid">
            <button class="premium-option" :class="{ 'active': form.solar === 'Si' }" @click="form.solar = 'Si'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                </svg>
              </div>
              <span class="option-text">Sì</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.solar === 'No' }" @click="form.solar = 'No'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
              </div>
              <span class="option-text">No</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.solar === 'Interesse' }" @click="form.solar = 'Interesse'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <span class="option-text">Mi interessa</span>
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

const form = reactive({ boiler: null, water: null, solar: null });
const isFormComplete = computed(() => form.boiler && form.water && form.solar);

onMounted(() => {
  const savedLens = localStorage.getItem('esurf_selected_lens');
  if (savedLens) selectedLens.value = savedLens;
  
  // Utilizziamo le stesse chiavi di localStorage impostate in ResourceOnboarding
  currentPodId.value = localStorage.getItem('esurf_current_pod_id');
  currentPodCode.value = localStorage.getItem('esurf_current_pod_code');
});

const saveAssets = async () => {
    if (!currentPodId.value) { 
        errorMsg.value = "Dati mancanti: ID del PDR non trovato."; 
        return; 
    }
    
    isSaving.value = true;
    errorMsg.value = '';

    try {
        const assetsToSave = [];

        // 1. TIPO DI CALDAIA
        if (form.boiler === 'Condensazione') {
            assetsToSave.push({ asset_type: 'Boiler', name: 'Caldaia a Condensazione' });
        } else if (form.boiler === 'Tradizionale') {
            assetsToSave.push({ asset_type: 'Boiler', name: 'Caldaia Tradizionale' });
        }

        // 2. ACQUA SANITARIA
        if (form.water === 'Scaldabagno') {
            assetsToSave.push({ asset_type: 'Water Heater', name: 'Scaldabagno Elettrico' });
        }

        // 3. SOLARE TERMICO
        if (form.solar === 'Si') {
            assetsToSave.push({ asset_type: 'Solar Thermal', name: 'Solare Termico' });
        } else if (form.solar === 'Interesse') {
            // Registriamo l'interesse come asset fittizio per future logiche di upsell/commerciali
            assetsToSave.push({ asset_type: 'Lead', name: 'Interesse: Solare Termico' });
        }

        console.log("🟡 [FRONTEND - STEP 1] Array generato in base ai bottoni cliccati:", assetsToSave);

        // Invio degli asset
        for (const asset of assetsToSave) {
            const payload = { 
                pod_id: currentPodId.value, // Usa pod_id a livello API anche se in realtà è un PDR
                ...asset, 
                nominal_power: 0, 
                priority: 1, 
                typical_usage: 'always', 
                control: 'Manuale' 
            };

            console.log("📤 [FRONTEND - STEP 2] Chiamata in partenza verso /api/pod-assets. Payload:", payload);
            await axios.post('/api/pod-assets', payload);
        }
        
        console.log("✅ [FRONTEND - STEP 3] Tutte le chiamate API completate. Vado all'Onboarding Hub!");
        
        router.push('/onboardinghub'); 
        
    } catch (e) { 
        console.error("❌ Errore salvataggio asset gas:", e);
        errorMsg.value = "Errore durante il salvataggio dei dispositivi."; 
    } finally { 
        isSaving.value = false; 
    }
};
</script>

<style scoped>
@import '@/assets/main_V0.css';

/* STILI TEMA E LAYOUT */
.theme-wallet { --accent: #d97706; }
.theme-planet { --accent: #10b981; }
.theme-shield { --accent: #3b82f6; }

.main-content { padding: 12px 20px; max-width: 480px; margin: 0 auto; padding-bottom: 80px; }

.premium-progress { height: 3px; background: var(--border-color); border-radius: 4px; margin-bottom: 16px; overflow: hidden; }
.progress-bar { width: 50%; height: 100%; background: var(--accent); transition: width 0.5s ease; }

.header-premium { margin-bottom: 20px; }
.badges-row { display: flex; gap: 8px; margin-bottom: 12px; }
.card-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-card); }
.lens-tag { color: var(--accent); }
.pod-tag { color: var(--text-muted); border-style: dashed; }
.pod-code { font-family: monospace; font-weight: 800; color: var(--text-primary); }

.title-premium { font-size: 24px; font-weight: 800; margin: 0; color: var(--text-primary); letter-spacing: -0.5px; }
.subtitle-premium { font-size: 13px; color: var(--text-muted); margin-top: 4px; line-height: 1.3; }

/* CARDS COMPATTE */
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

/* STATO ATTIVO DINAMICO */
.premium-option.active { border-color: var(--accent); color: var(--text-primary); transform: translateY(-1px); }
.premium-option.active .icon-box { color: var(--accent); }

.btn-primary-revo { 
  width: 100%; background: var(--text-primary); color: var(--bg-card); 
  border: none; padding: 16px; border-radius: 14px; font-size: 15px; font-weight: 800; cursor: pointer; 
}
.btn-primary-revo:disabled { opacity: 0.5; }
.error-toast { background: #ef4444; color: white; padding: 12px; border-radius: 12px; text-align: center; margin-top: 20px; font-weight: 600; font-size: 14px; }
</style>
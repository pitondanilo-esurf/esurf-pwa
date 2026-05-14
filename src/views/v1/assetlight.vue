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
            POD: <span class="pod-code">{{ currentPodCode }}</span>
          </div>
        </div>
        
        <h1 class="title-premium">Profilo energetico</h1>
        <p class="subtitle-premium">Configura i tuoi asset per l'ottimizzazione AI.</p>
      </div>

      <div class="cards-stack fade-in delay-2">
        
        <div class="premium-card">
          <h3 class="card-question">Cosa scalda la tua casa?</h3>
          <div class="options-grid">
            <button class="premium-option" :class="{ 'active': form.heating === 'Boiler' }" @click="form.heating = 'Boiler'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.21 1.14-3.027.353-.408.86-.507 1.36-.273.5.233.5 1.026.5 1.25.04.148.14.331.22.42a2.38 2.38 0 0 0 1.28.63Z"/></svg>
              </div>
              <span class="option-text">Caldaia</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.heating === 'Heat Pump' }" @click="form.heating = 'Heat Pump'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 20-1.25-2.5L7.5 20"/><path d="m2 12 2.5-1.25L2 9.5"/><path d="m10 4 1.25 2.5L12.5 4"/><path d="m22 12-2.5 1.25L22 14.5"/><path d="m4 18 2.5-1.25L4 15.5"/><path d="m20 18-2.5-1.25L20 15.5"/><path d="m4 6 2.5 1.25L4 8.5"/><path d="m20 6-2.5 1.25L20 8.5"/><path d="M12 2v20"/><path d="M20 6.6 4 17.4"/><path d="m4 6.6 16 10.8"/><path d="M2 12h20"/></svg>
              </div>
              <span class="option-text">Pompa</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.heating === 'Other' }" @click="form.heating = 'Other'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </div>
              <span class="option-text">Altro</span>
            </button>
          </div>
        </div>

        <div class="premium-card">
          <h3 class="card-question">Hai un'auto elettrica?</h3>
          <div class="options-grid">
            <button class="premium-option" :class="{ 'active': form.ev === 'EV' }" @click="form.ev = 'EV'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
              </div>
              <span class="option-text">Sì</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.ev === 'Soon' }" @click="form.ev = 'Soon'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span class="option-text">Presto</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.ev === 'No' }" @click="form.ev = 'No'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              </div>
              <span class="option-text">No</span>
            </button>
          </div>
        </div>

        <div class="premium-card">
          <h3 class="card-question">Hai pannelli solari?</h3>
          <div class="options-grid">
            <button class="premium-option" :class="{ 'active': form.solar === 'Photovoltaic' }" @click="form.solar = 'Photovoltaic'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              </div>
              <span class="option-text">Sì</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.solar === 'Condo' }" @click="form.solar = 'Condo'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="18"/><line x1="15" y1="22" x2="15" y2="18"/><line x1="18" y1="6" x2="18" y2="6"/><line x1="18" y1="10" x2="18" y2="10"/><line x1="18" y1="14" x2="18" y2="14"/><line x1="6" y1="6" x2="6" y2="6"/><line x1="6" y1="10" x2="6" y2="10"/><line x1="6" y1="14" x2="6" y2="14"/><line x1="10" y1="6" x2="10" y2="6"/><line x1="10" y1="10" x2="10" y2="10"/><line x1="10" y1="14" x2="10" y2="14"/><line x1="14" y1="6" x2="14" y2="6"/><line x1="14" y1="10" x2="14" y2="10"/><line x1="14" y1="14" x2="14" y2="14"/></svg>
              </div>
              <span class="option-text">Condom.</span>
            </button>
            <button class="premium-option" :class="{ 'active': form.solar === 'No' }" @click="form.solar = 'No'">
              <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              </div>
              <span class="option-text">No</span>
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

const form = reactive({ heating: null, ev: null, solar: null });
const isFormComplete = computed(() => form.heating && form.ev && form.solar);

onMounted(() => {
  const savedLens = localStorage.getItem('esurf_selected_lens');
  if (savedLens) selectedLens.value = savedLens;
  currentPodId.value = localStorage.getItem('esurf_current_pod_id');
  currentPodCode.value = localStorage.getItem('esurf_current_pod_code');
});

const saveAssets = async () => {
    if (!currentPodId.value) { 
        errorMsg.value = "Dati mancanti: ID del POD non trovato."; 
        return; 
    }
    
    isSaving.value = true;
    errorMsg.value = '';

    try {
        const assetsToSave = [];

        // 1. POMPA DI CALORE
        if (form.heating === 'Heat Pump') {
            assetsToSave.push({ asset_type: 'Heat Pump', name: 'Pompa di Calore' });
        }

        // 2. VEICOLO ELETTRICO
        if (form.ev === 'EV') {
            assetsToSave.push({ asset_type: 'EV', name: 'Auto Elettrica' });
        }

        // 3. FOTOVOLTAICO
        if (form.solar === 'Photovoltaic' || form.solar === 'Condo') {
            assetsToSave.push({ 
                asset_type: 'Photovoltaic', 
                name: form.solar === 'Condo' ? 'Fotovoltaico Condominiale' : 'Fotovoltaico Privato' 
            });
        }

        console.log("🟡 [FRONTEND - STEP 1] Array generato in base ai bottoni cliccati:", assetsToSave);

        // Invio degli asset
        for (const asset of assetsToSave) {
            
            // Prepariamo il pacchetto esatto che stiamo per spedire
            const payload = { 
                pod_id: currentPodId.value, 
                ...asset, 
                nominal_power: 0, 
                priority: 1, 
                typical_usage: 'always', 
                control: 'Manuale' 
            };

            // 🟢 IL LOG DELLA VERITÀ PRIMA DELLA CHIAMATA AL BACKEND
            console.log("📤 [FRONTEND - STEP 2] Chiamata in partenza verso /api/pod-assets. Payload:", payload);

            await axios.post('/api/pod-assets', payload);
        }
        
        console.log("✅ [FRONTEND - STEP 3] Tutte le chiamate API completate. Vado all'Onboarding Hub!");
        
        // Non cancelliamo l'id così la pagina dopo sa chi siamo
        router.push('/onboardinghub'); 
        
    } catch (e) { 
        console.error("❌ Errore salvataggio asset:", e);
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
.option-text { font-size: 11px; font-weight: 600; }

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
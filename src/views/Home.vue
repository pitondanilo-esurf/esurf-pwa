<template>
  <div class="app-container">
    <TopNavbar />

    <main class="main-content main-content-tight">
      
      <div class="welcome-section fade-in">
        <div class="welcome-header">
           <span class="greeting">{{ greetingText }}</span>
           <span class="user-name">{{ (user.name || user.first_name || 'Amico').toUpperCase() }}</span>
        </div>
        <p class="card-body mt-2">Benvenuto nel cuore di eSurf. Qui, la tua partecipazione attiva è il motore del cambiamento. Condividendo i tuoi dati di consumo, non solo guadagni, ma contribuisci a costruire un futuro energetico più pulito e sostenibile per tutti. Scopri come il tuo impegno fa la differenza.</p>
      </div>

      <div class="grid-dashboard mt-5 fade-in delay-1">
        
        <div class="glass-card fintech-card benefit-card hover-lift">
          <div class="benefit-icon icon-earn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              <path d="M11 2v20"></path>
            </svg>
          </div>
          <div class="benefit-details">
            <h3 class="card-title-text text-earn">Il Tuo Risparmio, il Tuo Guadagno</h3>
            <p class="card-body">Condividere i dati del tuo contatore intelligente è un modo semplice e diretto per generare valore. Ad eSurf, ogni tuo contributo viene ricompensato. Trasformiamo la tua trasparenza in premi concreti, permettendoti di guadagnare semplicemente comprendendo meglio come consumi.</p>
          </div>
        </div>

        <div class="glass-card fintech-card benefit-card hover-lift">
          <div class="benefit-icon icon-env">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div class="benefit-details">
            <h3 class="card-title-text text-env">Insieme per un Pianeta più Verde</h3>
            <p class="card-body">Il tuo contributo non si ferma al portafoglio. I dati che condividi aiutano a mappare i flussi energetici, identificare sprechi e supportare la transizione verso fonti di energia rinnovabile. Con eSurf, la tua efficienza diventa un bene comune per l'ambiente.</p>
          </div>
        </div>

        <div class="glass-card fintech-card benefit-card hover-lift">
          <div class="benefit-icon icon-com">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="benefit-details">
            <h3 class="card-title-text text-com">La Community eSurf</h3>
            <p class="card-body">Unisciti a una community di utenti impegnati. Insieme, creiamo un impatto significativo. Più siamo, più precisi diventano i nostri dati e più forte è il nostro potere di influenzare un cambiamento positivo nel settore energetico. Il tuo contributo conta.</p>
          </div>
        </div>

        <div v-if="loadingResources" class="glass-card fintech-card benefit-card" style="justify-content: center; align-items: center; min-height: 180px;">
           <div class="f-spinner"></div>
        </div>

        <div 
          v-else-if="!hasResources" 
          class="glass-card fintech-card benefit-card hover-lift pointer active-card" 
          @click="goToOnboarding"
        >
          <div class="benefit-icon icon-onb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="benefit-details">
            <h3 class="card-title-text text-onb">Inizia Ora il Tuo Viaggio</h3>
            <p class="card-body">Sei a un passo dal fare la differenza. Collega la tua prima risorsa o invia una bolletta per permettere all'AI di iniziare l'analisi. Bastano pochi click per sbloccare tutti i vantaggi.</p>
          </div>
          <div class="benefit-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div 
          v-else 
          class="glass-card fintech-card benefit-card hover-lift pointer active-card" 
          @click="goToHub"
        >
          <div class="benefit-icon icon-hub">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="benefit-details">
            <h3 class="card-title-text text-hub">Le Tue Utenze Attive</h3>
            <p class="card-body">Hai attualmente <strong style="font-size: 1.1rem; color: var(--text-main);">{{ resourceCount }}</strong> {{ resourceCount === 1 ? 'risorsa collegata' : 'risorse collegate' }}. Puoi monitorarne l'efficienza e i dati direttamente dal tuo Hub di gestione.</p>
          </div>
          <div class="benefit-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

      </div>

      <div class="grouped-informational mt-4 fade-in delay-2">
        <div class="location-group">
            <div class="accordion-container">
                <div class="glass-card fintech-card benefit-card small hover-scale pointer active-card" @click="goToGuides">
                    <div class="benefit-icon icon-guide">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z"></path>
                        </svg>
                    </div>
                    <div class="benefit-details">
                        <h3 class="card-title-text-small text-guide">Guide e Come Funziona</h3>
                        <p class="card-body-small">Hai dubbi? Consulta le nostre guide passo-passo per iniziare al meglio.</p>
                    </div>
                    <div class="benefit-arrow small">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                </div>
                <div class="glass-card fintech-card benefit-card small hover-scale pointer active-card" @click="goToSupport">
                    <div class="benefit-icon icon-support">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <path d="M20.07 15a10 10 0 1 1-2.14-2.14"></path>
                            <line x1="21" y1="21" x2="16" y2="16"></line>
                        </svg>
                    </div>
                    <div class="benefit-details">
                        <h3 class="card-title-text-small text-support">Supporto e Contatti</h3>
                        <p class="card-body-small">Il nostro team è a tua disposizione per qualsiasi necessità o domanda.</p>
                    </div>
                    <div class="benefit-arrow small">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                </div>
            </div>
        </div>
      </div>

    </main>
    
    <BottomNavbar class="fade-in delay-3" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from '@/services/axios'; 
import AuthService from '@/services/AuthService';
import TopNavbar from '@/components/TopNavbar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';

const router = useRouter();
const { locale } = useI18n();

const isLightMode = ref(false); 
const user = ref({});
const loadingAuth = ref(true);

const resources = ref([]);
const loadingResources = ref(true);

const hasResources = computed(() => resources.value.length > 0);
const resourceCount = computed(() => resources.value.length);

onMounted(async () => {
  if (localStorage.getItem('theme') === 'light') {
    isLightMode.value = true;
    document.body.classList.add('light-mode');
  } else {
    isLightMode.value = false;
    document.body.classList.remove('light-mode');
  }

  try {
    const response = await AuthService.getUser();
    user.value = response.data;
    await fetchResources();
  } catch (e) {
    console.warn("Utente non loggato o token scaduto.");
  } finally {
    loadingAuth.value = false;
  }
});

const fetchResources = async () => {
    loadingResources.value = true;
    try {
        const response = await axios.get('/api/resources');
        resources.value = response.data.data || response.data || [];
    } catch (error) {
        console.warn("Errore durante il recupero delle risorse:", error.message);
        resources.value = [];
    } finally {
        loadingResources.value = false;
    }
};

const greetingText = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon Pomeriggio';
    return 'Buonasera';
});

const goToOnboarding = () => { router.push('/onboarding'); };
const goToGuides = () => { router.push('/guides'); };
const goToSupport = () => { router.push('/support'); };
const goToHub = () => { router.push('/hub'); }; 
</script>

<style scoped>
/* Contenitore PWA BASE */
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 1rem 1rem 4rem 1rem; max-width: 1000px; margin: 0 auto; }
.main-content-tight { padding: 1rem; max-width: 800px; padding-bottom: 90px; }

/* SEZIONE BENVENUTO */
.welcome-section { text-align: left; margin-bottom: 20px; }
.welcome-header { display: flex; flex-direction: column; }
.greeting { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.user-name { font-weight: 800; font-size: 1.6rem; color: var(--text-main); letter-spacing: -0.5px; }
.mt-2 { margin-top: 0.5rem; }
.mt-5 { margin-top: 2rem; }

/* GRIGLIA DASHBOARD BENEFICI */
.grid-dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 2rem;}

/* Base Card */
.benefit-card { 
  background: var(--bg-card); 
  padding: 16px; 
  border-radius: 12px; 
  display: flex; 
  align-items: start; /* Allineamento in alto per schede standard con molto testo */
  gap: 16px; 
  border: 1px solid var(--border-color); 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
  position: relative;
}

/* Modifiche per Active Card (Cliccabili) */
.active-card {
  align-items: center; /* Allineamento centrale per una migliore resa con la freccia */
  padding-right: 48px; /* Spazio per la freccia */
}

.benefit-card.small { padding: 12px; gap: 12px; }
.benefit-card.small.active-card { padding-right: 40px; } /* Spazio ridotto per card piccole */

.benefit-card.small:hover { border-color: var(--accent-blue); background: var(--bg-card-alt); }
.benefit-card .benefit-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.benefit-card.small .benefit-icon { width: 36px; height: 36px; }
.benefit-details { flex: 1; }
.card-title-text { margin: 0; font-weight: 700; font-size: 1.05rem; color: var(--text-main); letter-spacing: -0.3px; margin-bottom: 6px;}
.card-title-text-small { margin: 0; font-weight: 600; font-size: 0.9rem; color: var(--text-main); letter-spacing: -0.2px; }
.card-body { margin: 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }
.card-body-small { margin: 0; font-size: 0.75rem; color: var(--text-muted); line-height: 1.3; }

/* Simbolo Freccia per Active Card */
.benefit-arrow {
  position: absolute;
  right: 16px;
  width: 24px;
  height: 24px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.benefit-arrow.small {
  right: 12px;
  width: 20px;
  height: 20px;
}

.benefit-arrow svg {
  width: 100%;
  height: 100%;
}

/* Hover effects */
.hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05); }
.pointer { cursor: pointer; }

/* Cambia colore freccia all'hover della card */
.active-card:hover .benefit-arrow {
  color: var(--accent-blue);
  transform: translateX(2px);
  opacity: 1;
}

/* ICON COLORI & TITOLI COLORI */
.icon-earn { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
.text-earn { color: #16a34a; }
.icon-env { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
.text-env { color: var(--accent-blue); }
.icon-com { background: rgba(100, 116, 139, 0.1); color: #64748b; }
.text-com { color: #64748b; }
.icon-onb { background: rgba(249, 115, 22, 0.1); color: #ea580c; }
.text-onb { color: #ea580c; }
.icon-guide { background: rgba(79, 172, 254, 0.1); color: #4facfe; }
.text-guide { color: #4facfe; }
.icon-support { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
.text-support { color: #fbbf24; }
.icon-hub { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
.text-hub { color: #6366f1; }

/* SPINNER FINTECH */
.f-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: fspin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes fspin { to { transform: rotate(360deg); } }

/* ALTRE SCHEDE INFERIORI */
.grouped-informational { display: flex; flex-direction: column; gap: 10px;}
.location-group { margin-bottom: 20px; }
.accordion-container { display: flex; gap: 10px; flex-wrap: wrap; }

/* ANIMAZIONI */
.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0; }
.delay-1 { animation-delay: 0.05s; }
.delay-2 { animation-delay: 0.1s; }
.delay-3 { animation-delay: 0.15s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* RESPONSIVE */
@media (max-width: 600px) {
    .grid-dashboard { grid-template-columns: 1fr; }
    .accordion-container { flex-direction: column; gap: 10px; }
}
</style>
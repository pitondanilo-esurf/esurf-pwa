<template>
    <transition name="fade">
        <div v-if="isHelpModalOpen" class="modal-overlay" @click.self="closeHelp">
            <div class="modal-content custom-scrollbar">
                <header class="modal-header">
                    <div class="modal-header-left">
                        <span class="help-badge">
                            <svg class="icon-sm mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Guida Modulo
                        </span>
                        <h3>{{ currentHelpContent.title }}</h3>
                    </div>
                    <button class="btn-close" @click="closeHelp">
                        <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </header>

                <div class="modal-body">
                    <p class="help-description">{{ currentHelpContent.description }}</p>
                    
                    <div class="help-section" v-if="currentHelpContent.elements && currentHelpContent.elements.length > 0">
                        <h4 class="help-subtitle">Elementi del Grafico:</h4>
                        <ul class="help-list">
                            <li v-for="(item, idx) in currentHelpContent.elements" :key="idx">
                                <strong>{{ item.title }}:</strong> {{ item.text }}
                            </li>
                        </ul>
                    </div>

                    <div class="help-footer" v-if="currentHelpContent.interaction">
                        <svg class="icon-sm text-emerald mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                        <span>{{ currentHelpContent.interaction }}</span>
                    </div>
                </div>
            </div>
        </div>
    </transition>

    <nav class="eddps-navbar">
        <div class="navbar-container">
            
            <div class="brand-section">
                <router-link to="/hub" class="brand-link">
                    <div class="brand-logo">
                        <svg class="icon-lg text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div class="brand-text">
                        <h1>E-surf</h1>
                        <span class="brand-subtitle">EDDPS Engine</span>
                    </div>
                </router-link>
            </div>

            <div class="nav-links" :class="{ 'is-mobile-open': isMobileOpen }">
                <router-link 
                    v-for="item in menuItems" 
                    :key="item.name" 
                    :to="item.path" 
                    class="nav-item"
                    active-class="is-active"
                    @click="isMobileOpen = false"
                >
                    <span class="nav-icon" v-html="item.icon"></span>
                    <span class="nav-label">{{ item.label }}</span>
                    <span v-if="item.isWip" class="wip-badge">WIP</span>
                </router-link>
            </div>

            <div class="action-section">
                
                <button class="icon-btn help-btn" @click="openHelp" title="Guida alla pagina corrente">
                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>

                <div class="nav-divider"></div>

                <router-link to="/profilo" class="icon-btn" title="Il mio Profilo">
                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </router-link>
                
                <router-link to="/admin" class="icon-btn" title="Dashboard Admin">
                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </router-link>

                <div class="user-avatar" title="Utente">DP</div>
                
                <button class="mobile-toggle icon-btn" @click="isMobileOpen = !isMobileOpen">
                    <svg v-if="!isMobileOpen" class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    <svg v-else class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

        </div>
    </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isMobileOpen = ref(false);
const isHelpModalOpen = ref(false);

const openHelp = () => {
    isHelpModalOpen.value = true;
    document.body.style.overflow = 'hidden'; // Blocca scroll pagina
};

const closeHelp = () => {
    isHelpModalOpen.value = false;
    document.body.style.overflow = ''; // Ripristina scroll
};

// ============================================================================
// DIZIONARIO GUIDA DINAMICA BASATO SULLA ROTTA
// ============================================================================
const currentHelpContent = computed(() => {
    switch (route.name) {
        
        case 'sankeyeMap':
            return {
                title: 'Sankey Flow Chart',
                description: 'Il grafico di Sankey visualizza la distribuzione del peso e del valore semantico estratto dai documenti elaborati dal motore EDDPS, tracciandone il flusso dalla fonte grezza fino alla potenziale linea di ricavo (Revenue Stream).',
                elements: [
                    { title: 'Nodi Azzurri (Documenti)', text: 'Rappresentano la fonte dei dati grezzi ingerita dal sistema (es. PNRR, Contratti, Bandi).' },
                    { title: 'Nodi Gialli (Intenti)', text: 'Gli obiettivi strategici o operativi che l\'AI ha isolato all\'interno del documento.' },
                    { title: 'Nodi Viola (Modelli)', text: 'I Business Model teorici che sono stati "risvegliati" o attivati dagli intenti estratti.' },
                    { title: 'Nodi Verdi (Revenue)', text: 'I Filoni di Cassa finali in cui si traduce l\'applicazione del Modello di Business.' }
                ],
                interaction: 'Passa il mouse sui flussi (linee) per vedere il peso esatto del trasferimento di valore. Clicca su un nodo o un flusso per "fissare" (pin) il tooltip e analizzarne i dettagli.'
            };
        case 'DecisionSupport': 
            return {
                title: 'Decision Support System (DSS)',
                description: 'Questo modulo funge da imbuto decisionale (Golden Path Prioritization). Il motore analizza le opportunità grezze estratte dall\'AI e applica un algoritmo multi-criterio per isolare i task con il più alto valore strategico, rendendoli pronti per l\'assegnazione.',
                elements: [
                    { title: '🧠 Affidabilità AI (Confidence)', text: 'Misura la solidità dell\'estrazione originaria, basata sul peso (weight) assegnato dal modello linguistico durante la lettura del documento.' },
                    { title: '⚡ Impatto Strategico (Asset)', text: 'Valuta l\'allineamento del modello di business intercettato con il core aziendale. Assegna un "boost" ai documenti che parlano di asset primari (es. VPP, CER, gestione POD, Flessibilità).' },
                    { title: '🛠️ Fattibilità Operativa (SOP)', text: 'Premia le opportunità per cui l\'AI è riuscita a generare un flusso di azioni concreto (Action Flow). Più step operativi ci sono, più il task è considerato pronto all\'uso.' },
                    { title: 'Golden Score', text: 'Un punteggio da 0 a 100 generato dalla media ponderata dei tre pilastri precedenti. Serve a ordinare la lista delle priorità assolute.' }
                ],
                interaction: 'Usa "Sincronizza DB" per forzare il ricalcolo dei pesi sulle ultime analisi. Usa il filtro a tendina per isolare i "Golden Paths" (Score > 75) o i task "Pronti all\'esecuzione". Clicca su "Autorizza & Push" per delegare il task su Asana al ruolo suggerito dal sistema.'
            };
        case 'CoverageMap':
            return {
                title: 'Network Coverage Matrix',
                description: 'Una rappresentazione topologica delle relazioni tra i documenti ingeriti e il portafoglio di Modelli di Business dell\'azienda.',
                elements: [
                    { title: 'Nodi Attivi (Luminosi)', text: 'Entità che sono state attivate con successo dall\'analisi in corso.' },
                    { title: 'Nodi Latenti (Grigi)', text: 'Modelli o Revenue Streams presenti a database ma attualmente inattivi per mancanza di documenti correlati.' }
                ],
                interaction: 'Trascina i nodi per riorganizzare la vista. Usa lo scroll del mouse per fare zoom in/out.'
            };

        case 'AIRevenueDashboard':
            return {
                title: 'Revenue Forecast Dashboard',
                description: 'Questa dashboard funge da aggregatore matematico. Compila tutti gli intenti "risvegliati" e li raggruppa sotto i rispettivi filoni di cassa, assegnando uno Score di copertura.',
                elements: [],
                interaction: 'Espandi un filone cliccando su "Intenti Aggregati" per visualizzare le fonti documentali e lo stato di assegnazione su Asana dei task relativi.'
            };

        case 'OrchestratorDashboard':
            return {
                title: 'Gatekeeper Orchestrator',
                description: 'Il cuore operativo dell\'engine. Qui arrivano le interpretazioni semantiche dei documenti, che vengono filtrate e tradotte in workflow azionabili (Standard Operating Procedures) e delegate al team tramite Asana.',
                elements: [],
                interaction: 'Usa i selettori a tendina nelle card verdi/viola per assegnare una task al ruolo operativo corretto e clicca "Push Asana" per inviarla al project management system.'
            };
            
        case 'FundingCallsDashboard':
            return {
                title: 'Funding Hub',
                description: 'Il motore di discovery per il monitoraggio dei bandi e delle opportunità di finanziamento europee, nazionali e private focalizzate su ESG e Transizione Energetica.',
                elements: [
                    { title: 'Dotazione / Ticket', text: 'Mostra il budget complessivo del bando e l\'intensità dell\'agevolazione.' },
                    { title: 'Scadenze', text: 'Indica l\'apertura e la chiusura del bando. Le date inferiori ai 60 giorni vengono evidenziate in rosso.' },
                    { title: 'Cluster Mappati', text: 'I modelli di business E-surf compatibili con le spese ammissibili dello strumento finanziario.' }
                ],
                interaction: 'Scorri la griglia per analizzare i bandi in ordine di urgenza e allineamento agli asset tecnologici.'
            };

        default:
            return {
                title: 'E-surf EDDPS Engine',
                description: 'Benvenuto nel motore semantico di E-surf. Utilizza il menu di navigazione per esplorare le opportunità estratte, i modelli di business attivati e le proiezioni di revenue.',
                elements: [],
                interaction: 'Seleziona un modulo specifico dalla barra in alto per iniziare.'
            };
    }
});


// Configurazione dinamica dei moduli ALLINEATA AL TUO ROUTER
const menuItems = ref([
    {
        name: 'Dashboard', path: '/hub', label: 'Main Hub',
        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>',
        isWip: false
    },
    {
        name: 'OrchestratorDashboard', path: '/orchestrator', label: 'Gatekeeper',
        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>',
        isWip: false
    },
    {
        name: 'FundingCallsDashboard', path: '/funding-hub', label: 'Funding Hub',
        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
        isWip: false
    },
    {
        name: 'AIRevenueDashboard', path: '/revenue-forecast', label: 'Revenue Forecast',
        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
        isWip: false
    },
    {
        name: 'CoverageMap', path: '/coverage-map', label: 'Coverage Matrix',
        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>',
        isWip: false
    },
    {
        name: 'sankeyeMap', path: '/sankey-map', label: 'Sankey Flow',
        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>',
        isWip: false
    },
    {
        name: 'DecisionSupport', path: '/decision-support', label: 'Decision Support',
        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>',
        isWip: true
    }
]);
</script>

<style scoped>
/* ==========================================================================
   STILI NAVBAR
   ========================================================================== */
.eddps-navbar {
    --nav-bg: rgba(6, 9, 15, 0.85);
    --nav-border: #1f2937;
    --text-main: #F3F4F6;
    --text-muted: #9CA3AF;
    --accent-emerald: #10B981;
    --accent-blue: #3B82F6;
    
    position: sticky;
    top: 0; left: 0; width: 100%; height: 64px;
    background-color: var(--nav-bg);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--nav-border);
    z-index: 999; /* Z-index inferiore alla modale */
    font-family: system-ui, -apple-system, sans-serif;
}

.navbar-container { max-width: 1600px; margin: 0 auto; height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; }
.brand-section { display: flex; align-items: center; min-width: 200px; }
.brand-link { display: flex; align-items: center; gap: 12px; text-decoration: none; transition: opacity 0.2s; }
.brand-link:hover { opacity: 0.8; }
.icon-lg { width: 24px; height: 24px; }
.icon-md { width: 20px; height: 20px; }
.icon-sm { width: 16px; height: 16px; }
.mr-1 { margin-right: 4px; }
.mr-2 { margin-right: 8px; }
.text-emerald { color: var(--accent-emerald); }

.brand-text h1 { font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin: 0; line-height: 1; letter-spacing: -0.025em; }
.brand-subtitle { font-size: 0.65rem; color: var(--text-muted); font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; }

.nav-links { display: flex; align-items: center; gap: 0.5rem; height: 100%; }
.nav-item { display: flex; align-items: center; gap: 8px; padding: 0.5rem 1rem; color: var(--text-muted); text-decoration: none; font-size: 0.875rem; font-weight: 500; border-radius: 8px; transition: all 0.2s ease; position: relative; }
.nav-icon { width: 18px; height: 18px; display: flex; align-items: center; }
.nav-icon :deep(svg) { width: 100%; height: 100%; }
.nav-item:hover { color: var(--text-main); background-color: rgba(255, 255, 255, 0.05); }
.nav-item.is-active { color: var(--accent-blue); background-color: rgba(59, 130, 246, 0.1); }
.nav-item.is-active::after { content: ''; position: absolute; bottom: -13px; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, var(--accent-emerald), var(--accent-blue)); border-radius: 2px 2px 0 0; }
.wip-badge { font-family: monospace; font-size: 0.55rem; background-color: #374151; color: #D1D5DB; padding: 2px 6px; border-radius: 4px; margin-left: 4px; }

.action-section { display: flex; align-items: center; gap: 12px; min-width: 200px; justify-content: flex-end; }
.nav-divider { width: 1px; height: 24px; background-color: var(--nav-border); margin: 0 4px; }

.icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; text-decoration: none; }
.icon-btn:hover { color: var(--text-main); background-color: rgba(255, 255, 255, 0.05); }

/* Stile speciale per il bottone Aiuto */
.help-btn { color: var(--accent-emerald); }
.help-btn:hover { background-color: rgba(16, 185, 129, 0.1); }

.user-avatar { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-blue) 100%); color: #06090F; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; margin-left: 4px; }
.mobile-toggle { display: none; }

/* ==========================================================================
   STILI MODALE DI AIUTO (Coerenti con la dark mode di sistema)
   ========================================================================== */
.modal-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center; z-index: 9999;
}
.modal-content {
    background-color: #0B101A; border: 1px solid #1F2937;
    border-radius: 16px; width: 90%; max-width: 550px; max-height: 85vh;
    overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    display: flex; flex-direction: column;
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #111827; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }

.modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1.5rem; border-bottom: 1px solid #1F2937;
    background-color: #111827; position: sticky; top: 0; z-index: 10;
}
.modal-header-left { display: flex; flex-direction: column; gap: 6px; }
.help-badge { font-size: 0.7rem; font-family: monospace; color: #10B981; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.25rem; color: #F3F4F6; }

.btn-close { background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 4px; transition: color 0.2s, background 0.2s; }
.btn-close:hover { color: #F3F4F6; background-color: rgba(255,255,255,0.1); }

.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
.help-description { font-size: 0.95rem; color: #D1D5DB; line-height: 1.6; margin: 0; }

.help-section { background-color: rgba(255,255,255,0.02); border: 1px solid #1F2937; border-radius: 8px; padding: 1rem; }
.help-subtitle { font-size: 0.85rem; font-family: monospace; text-transform: uppercase; color: #9CA3AF; margin: 0 0 12px 0; }
.help-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.help-list li { font-size: 0.85rem; color: #D1D5DB; line-height: 1.4; padding-left: 14px; position: relative; }
.help-list li::before { content: "•"; position: absolute; left: 0; color: #10B981; font-size: 1.2rem; line-height: 1; top: -2px; }
.help-list li strong { color: #F3F4F6; font-weight: 600; }

.help-footer { display: flex; align-items: center; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 12px; border-radius: 8px; font-size: 0.85rem; color: #A7F3D0; font-style: italic; line-height: 1.4; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active .modal-content { animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalSlideIn { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

/* === RESPONSIVE === */
@media (max-width: 1024px) {
    .nav-item { padding: 0.5rem; }
    .nav-label { display: none; } 
}

@media (max-width: 768px) {
    .mobile-toggle { display: flex; }
    .nav-links {
        position: absolute; top: 64px; left: 0; width: 100%;
        background-color: #0B101A; flex-direction: column; align-items: stretch;
        padding: 1rem; gap: 8px; border-bottom: 1px solid #1F2937;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
        transform: translateY(-150%); opacity: 0; transition: all 0.3s ease-in-out; z-index: -1;
    }
    .nav-links.is-mobile-open { transform: translateY(0); opacity: 1; }
    .nav-label { display: block; }
    .nav-item.is-active::after { display: none; }
    .nav-item.is-active { border-left: 3px solid var(--accent-blue); }
}
@media print { .eddps-navbar { display: none !important; } }
</style>
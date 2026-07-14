<template>
    <AppNavbar />
    <div class="orchestrator-wrapper custom-scrollbar">
        <div class="main-content">
            
            <header class="page-header-compact">
                <div class="header-left">
                    <span class="gatekeeper-tag">
                        <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        Discovery Engine
                    </span>
                    <h2>E-surf <span class="text-gradient">Funding Hub</span></h2>
                    <p class="subtitle">Monitoraggio bandi e opportunità di finanziamento ESG & Transizione Energetica</p>
                </div>
                <div class="header-right no-print">
                    <div class="status-panel">
                        <span class="status-label">Stato Sync</span>
                        <span v-if="loading" class="status-value warning">
                            <svg class="spinner icon-sm" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Estrazione...
                        </span>
                        <span v-else class="status-value success">
                            <span class="pulse-dot"></span> Database Allineato
                        </span>
                    </div>
                </div>
            </header>

            <div v-if="error" class="alert-error no-print">
                Errore Connessione DB: {{ error }}
            </div>
            
            <div v-else-if="!loading && calls.length === 0" class="empty-state glass-card no-print">
                Nessun bando presente nella collection. Verifica l'ingestion dal prompt.
            </div>

            <main v-else class="calls-grid">
                <div v-for="call in calls" :key="call._id || call.bando_id" class="call-card print-avoid-break">
                    
                    <div class="card-header">
                        <div class="header-top">
                            <span class="bando-id">{{ call.bando_id }}</span>
                            <span class="ente-badge">{{ call.ente_erogatore }}</span>
                        </div>
                        <h3 class="call-title">{{ call.nome }}</h3>
                    </div>

                    <div class="card-body">
                        <p class="call-desc">{{ call.descrizione_breve }}</p>
                        
                        <div class="financial-block">
                            <span class="block-label">Dotazione / Ticket</span>
                            <p class="financial-value">{{ call.dotazione_finanziaria }}</p>
                        </div>
                        
                        <div class="dates-row">
                            <div class="date-box start">
                                <span class="date-label">Apertura</span>
                                <span class="date-val">{{ formatDate(call.data_start) }}</span>
                            </div>
                            <div class="date-box end">
                                <span class="date-label">Scadenza</span>
                                <span class="date-val" :class="{'urgent': isUrgent(call.data_end)}">
                                    {{ formatDate(call.data_end) }}
                                </span>
                            </div>
                        </div>
                        
                        <div v-if="call.modelli_coperti && call.modelli_coperti.length" class="models-block">
                            <span class="block-label">Modelli Business Mappati (E-surf Framework)</span>
                            <div class="models-chips">
                                <span v-for="(modello, i) in call.modelli_coperti" :key="i" class="model-chip">
                                    Cluster {{ modello }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- FOOTER CON LINK UFFICIALE (Mostrato solo se presente) -->
                    <div class="card-footer" v-if="call.link_ufficiale">
                        <a :href="call.link_ufficiale" target="_blank" rel="noopener noreferrer" class="link-bando no-print" title="Apri il bando in una nuova finestra">
                            <span>Vai al Bando Ufficiale</span>
                            <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                    </div>
                    
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/axios.js'; 
import AppNavbar from '@/components/eddpsNavBar.vue';

const calls = ref([]);
const loading = ref(true);
const error = ref(null);

const formatDate = (dateString) => {
    if (!dateString) return 'Data non definita';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    return date.toLocaleDateString('it-IT', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
};

const isUrgent = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(date - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 60; // Evidenzia in rosso se mancano meno di 60 giorni
};

onMounted(async () => {
    try {
        const response = await apiClient.get('/api/eddps/calls');
        calls.value = response.data?.data || [];
    } catch (err) {
        error.value = err.message || "Impossibile recuperare i bandi dal server.";
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
/* Variabili e Layout di base allineate a Orchestrator */
.orchestrator-wrapper {
    --bg-dark: #06090F;
    --bg-card: #0B101A;
    --bg-body: #080C14;
    --bg-panel: #111827;
    --border-color: #1f2937;
    --text-main: #F3F4F6;
    --text-muted: #9CA3AF;
    --accent-emerald: #10B981;
    --accent-blue: #3B82F6;
    
    background-color: var(--bg-dark);
    color: var(--text-main);
    min-height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
    padding: 1.5rem;
    box-sizing: border-box;
}

.main-content { max-width: 1152px; margin: 0 auto; }

/* Header CSS */
.page-header-compact {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1.5rem; margin-bottom: 2.5rem;
}

.gatekeeper-tag {
    font-family: monospace; font-size: 0.75rem; color: var(--accent-blue);
    text-transform: uppercase; letter-spacing: 0.1em;
    display: flex; align-items: center; gap: 8px;
}

.page-header-compact h2 {
    font-size: 2.25rem; font-weight: 700; margin: 0.25rem 0; color: #ffffff;
}

.text-gradient {
    background: linear-gradient(to right, var(--accent-blue), var(--accent-emerald));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.subtitle { font-size: 0.875rem; color: var(--text-muted); font-family: monospace; margin: 0; }

.status-panel {
    background-color: #111827; border: 1px solid var(--border-color);
    border-radius: 8px; padding: 0.75rem; display: flex; flex-direction: column; align-items: flex-end;
}
.status-label { font-size: 0.625rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
.status-value { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 500; margin-top: 4px; }
.status-value.warning { color: #FBBF24; }
.status-value.success { color: #34D399; }
.pulse-dot { width: 6px; height: 6px; background-color: #10B981; border-radius: 50%; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }

/* Grid Bandi */
.calls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    gap: 1.5rem;
}

.call-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
}

.call-card:hover {
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}

.card-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    background: linear-gradient(to bottom, rgba(255,255,255,0.02), transparent);
}

.header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }

.bando-id {
    font-family: monospace; font-size: 0.7rem; font-weight: 700;
    color: #9CA3AF; background-color: #1F2937;
    padding: 4px 8px; border-radius: 6px; letter-spacing: 0.05em;
}

.ente-badge {
    font-size: 0.7rem; font-weight: 600;
    background-color: rgba(59, 130, 246, 0.15); color: #93C5FD;
    padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(59, 130, 246, 0.3);
}

.call-title {
    font-size: 1.1rem; font-weight: 700; color: #F3F4F6;
    margin: 0; line-height: 1.4;
}

.card-body {
    padding: 1.5rem;
    display: flex; flex-direction: column; gap: 1.25rem;
    flex: 1;
}

.call-desc {
    font-size: 0.85rem; color: var(--text-muted);
    margin: 0; line-height: 1.5;
}

.block-label {
    display: block; font-size: 0.65rem; font-family: monospace;
    text-transform: uppercase; font-weight: 700; color: #6B7280;
    margin-bottom: 6px; letter-spacing: 0.05em;
}

.financial-block {
    background-color: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.15);
    padding: 12px; border-radius: 8px;
}

.financial-value {
    font-size: 0.9rem; font-weight: 500; color: #A7F3D0; margin: 0;
}

.dates-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.date-box { padding: 10px; background-color: #111827; border: 1px solid #374151; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; }
.date-label { font-size: 0.65rem; text-transform: uppercase; color: #9CA3AF; font-weight: 700; }
.date-val { font-size: 0.85rem; color: #E5E7EB; font-family: monospace; }
.date-val.urgent { color: #F87171; font-weight: 700; }

.models-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.model-chip {
    font-size: 0.725rem; background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1); color: #D1D5DB;
    padding: 4px 10px; border-radius: 6px; font-family: monospace;
}

/* Stili Footer e Link Bando */
.card-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-color);
    background-color: rgba(255, 255, 255, 0.02);
    display: flex;
    justify-content: flex-end;
}

.link-bando {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--accent-blue);
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 8px;
    background-color: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.25);
    transition: all 0.2s ease-in-out;
}

.link-bando:hover {
    background-color: rgba(59, 130, 246, 0.2);
    color: #60A5FA;
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-1px);
}

/* Spinner e Utils */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 1s linear infinite; }
.icon-sm { width: 16px; height: 16px; }

@media (max-width: 768px) {
    .calls-grid { grid-template-columns: 1fr; }
    .page-header-compact { flex-direction: column; align-items: flex-start; gap: 1rem; }
    .card-footer { justify-content: stretch; }
    .link-bando { width: 100%; justify-content: center; }
}
</style>
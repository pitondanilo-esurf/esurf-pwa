<template>
    <div class="revenue-wrapper custom-scrollbar">
        <div class="main-content">
            
            <header class="page-header-compact">
                <div class="header-left">
                    <span class="ai-tag">
                        <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        Gemini AI Strategist
                    </span>
                    <h2>E-surf <span class="text-gradient">Revenue Forecast</span></h2>
                    <p class="subtitle">Aggregazione automatica delle opportunità in Filoni di Cassa</p>
                </div>
                
                <div class="header-right no-print action-buttons">
                    <span v-if="lastUpdateDate" class="last-update-label">
                        <svg class="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Aggiornato: {{ lastUpdateDate }}
                    </span>

                    <button @click="fetchAggregation(true)" :disabled="loading" class="btn-generate">
                        <span v-if="loading" class="flex-center">
                            <svg class="spinner icon-sm mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Analisi AI in corso...
                        </span>
                        <span v-else class="flex-center">
                            <svg class="icon-sm mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Forza Aggiornamento
                        </span>
                    </button>
                </div>
            </header>

            <div v-if="error" class="alert-error no-print">
                <strong>Errore AI:</strong> {{ error }}
            </div>
            
            <div v-else-if="!loading && !revenueData" class="empty-state glass-card no-print">
                <svg class="icon-xl mb-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <p>Nessuna aggregazione presente. Clicca su "Forza Aggiornamento" per avviare il motore AI di Gemini.</p>
            </div>

            <div v-if="revenueData" class="dashboard-content">
                
                <!-- PANNELLO STATISTICHE -->
                <div class="stats-row no-print">
                    <div class="stat-card">
                        <span class="stat-label">Filoni Attivati</span>
                        <span class="stat-value text-indigo-400">{{ revenueData.revenue_streams?.length || 0 }}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Intenti Core Rilevati</span>
                        <span class="stat-value text-emerald-400">{{ totalCoreIntents }}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Opportunità (Org.) Coinvolte</span>
                        <span class="stat-value text-blue-400">{{ totalOrganizations }}</span>
                    </div>
                    <div class="stat-card border-red">
                        <span class="stat-label">Intenti Scartati (Noise)</span>
                        <span class="stat-value text-red-400">{{ totalDiscarded }}</span>
                    </div>
                </div>

                <main class="dashboard-grid">
                    
                    <div class="streams-section">
                        <h3 class="section-title">
                            Dettaglio Filoni di Ricavo
                        </h3>
                        
                        <div class="streams-list">
                            <div v-for="(stream, index) in revenueData.revenue_streams" :key="'stream-'+index" class="stream-card print-avoid-break">
                                
                                <div class="stream-header">
                                    <h4 class="stream-name">{{ stream.stream_name }}</h4>
                                    <div class="score-badge print-badge" :class="getScoreColor(stream.total_potential_score)">
                                        Score: {{ stream.total_potential_score }}/100
                                    </div>
                                </div>
                                
                                <div class="progress-track">
                                    <div class="progress-fill" 
                                         :class="getScoreColorClass(stream.total_potential_score)" 
                                         :style="{ width: stream.total_potential_score + '%' }">
                                    </div>
                                </div>

                                <p class="stream-summary">
                                    {{ stream.strategic_summary }}
                                </p>

                                <div class="stream-footer">
                                    <div class="intent-count interactive" @click="toggleStream(index)">
                                        <svg class="icon-xs chevron-rotate no-print" :class="{ 'open': openStreams.includes(index) }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                        Intenti Aggregati ({{ stream.aggregated_intents_count || (stream.aggregated_intents ? stream.aggregated_intents.length : 0) }})
                                    </div>
                                    <div class="organizations">
                                        <span v-for="(org, i) in stream.contributing_organizations" :key="'org-'+i" class="org-chip">
                                            {{ org }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Dettaglio Intenti Aggregati -->
                                <div class="intent-dropdown" :class="{ 'force-print-open': true }" v-show="openStreams.includes(index)">
                                    <div v-for="(intentObj, idx) in stream.aggregated_intents" :key="'intent-'+index+'-'+idx" class="intent-detail-item">
                                        <span class="intent-text">{{ intentObj.intent || intentObj }}</span>
                                        <span v-if="intentObj.weight" class="intent-weight-pill">W: {{ intentObj.weight }}</span>
                                    </div>
                                    <div v-if="!stream.aggregated_intents || stream.aggregated_intents.length === 0" class="text-muted text-xs">
                                        Nessun dettaglio intento restituito dall'AI.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="noise-section">
                        <div class="noise-card print-avoid-break">
                            <h3 class="noise-title">
                                <svg class="icon-sm text-red no-print" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                Filtro Operativo (Scarti)
                            </h3>
                            <p class="noise-desc">
                                Questi intenti sono stati isolati dall'AI in quanto non generano marginalità PaaS e rischiano di esporre E-surf a costi operativi, cantieristici o finanziari (Fuori Perimetro).
                            </p>
                            
                            <ul v-if="revenueData.discarded_noise?.length" class="noise-list">
                                <li v-for="(noise, index) in revenueData.discarded_noise" :key="'noise-'+index" class="noise-item-container">
                                    <div class="noise-main">
                                        <span class="bullet-cross">✕</span>
                                        <span class="noise-text">{{ noise.intent || noise }}</span>
                                    </div>
                                    <div v-if="noise.reason" class="noise-reason">
                                        Motivo: {{ noise.reason }}
                                    </div>
                                </li>
                            </ul>
                            <div v-else class="no-noise">
                                L'AI non ha rilevato anomalie o deviazioni dal core business.
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/services/axios.js'; 

const loading = ref(false);
const error = ref(null);
const revenueData = ref(null);
const openStreams = ref([]); 
const lastUpdateDate = ref(null);

// === COMPUTED PROPERTIES PER STATISTICHE ===
const totalCoreIntents = computed(() => {
    if (!revenueData.value?.revenue_streams) return 0;
    return revenueData.value.revenue_streams.reduce((acc, stream) => {
        return acc + (stream.aggregated_intents_count || (stream.aggregated_intents ? stream.aggregated_intents.length : 0));
    }, 0);
});

const totalOrganizations = computed(() => {
    if (!revenueData.value?.revenue_streams) return 0;
    const orgs = new Set();
    revenueData.value.revenue_streams.forEach(stream => {
        if (stream.contributing_organizations) {
            stream.contributing_organizations.forEach(org => orgs.add(org));
        }
    });
    return orgs.size;
});

const totalDiscarded = computed(() => {
    return revenueData.value?.discarded_noise?.length || 0;
});


// === LOGICA DI RIPARTENZA E FORMATTAZIONE DATA ===
onMounted(() => {
    fetchAggregation(false);
});

const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date)) return '';
    
    return new Intl.DateTimeFormat('it-IT', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// === LOGICA DI FETCH ===
const fetchAggregation = async (forceUpdate = false) => {
    loading.value = true;
    error.value = null;
    openStreams.value = [];

    try {
        const url = forceUpdate ? '/api/eddps/revenue-aggregation?force=true' : '/api/eddps/revenue-aggregation';
        const response = await apiClient.get(url);
        
        if (response.data.status === 'success') {
            revenueData.value = response.data.data;
            lastUpdateDate.value = formatDateTime(response.data.timestamp);
            
            if (response.data.is_cached && !forceUpdate) {
                setTimeout(() => {
                    const wantsUpdate = window.confirm("Stai visualizzando l'ultimo Snapshot AI globale.\n\nVuoi forzare una nuova analisi a Gemini per aggiornare i dati per tutti gli utenti?");
                    if (wantsUpdate) {
                        fetchAggregation(true);
                    }
                }, 300);
            }
        } else {
            throw new Error(response.data.message || "Errore sconosciuto durante l'analisi.");
        }
    } catch (err) {
        console.error("Errore aggregazione AI:", err);
        error.value = err.message || "Impossibile contattare il server per l'elaborazione AI.";
    } finally {
        loading.value = false;
    }
};

const toggleStream = (index) => {
    if (openStreams.value.includes(index)) {
        openStreams.value = openStreams.value.filter(i => i !== index);
    } else {
        openStreams.value.push(index);
    }
};

const getScoreColor = (score) => {
    if (score >= 80) return 'badge-high';
    if (score >= 50) return 'badge-medium';
    return 'badge-low';
};

const getScoreColorClass = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-blue-500';
    return 'bg-gray-500';
};
</script>

<style scoped>
/* ==========================================================================
   VARIABILI CSS E IMPOSTAZIONI BASE (SCREEN)
   ========================================================================== */
.revenue-wrapper {
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

.main-content {
    max-width: 1280px;
    margin: 0 auto;
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: var(--bg-panel); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }

.icon-xs { width: 14px; height: 14px; }
.icon-sm { width: 16px; height: 16px; }
.icon-xl { width: 48px; height: 48px; }
.mr-2 { margin-right: 8px; }
.mb-4 { margin-bottom: 16px; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.text-red { color: #EF4444; }

/* HEADER E BOTTONI */
.page-header-compact {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1.5rem;
    margin-bottom: 2.5rem;
}

.ai-tag {
    font-family: monospace;
    font-size: 0.75rem;
    color: var(--accent-blue);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    gap: 8px;
}

.page-header-compact h2 {
    font-size: 2.25rem;
    font-weight: 700;
    margin: 0.25rem 0;
    letter-spacing: -0.025em;
    color: #ffffff;
}

.text-gradient {
    background: linear-gradient(to right, var(--accent-emerald), var(--accent-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.subtitle {
    font-size: 0.875rem;
    color: var(--text-muted);
    font-family: monospace;
    margin: 0;
}

.action-buttons {
    display: flex;
    gap: 16px;
    align-items: center;
}

.last-update-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--text-muted);
    font-family: monospace;
    background: rgba(255, 255, 255, 0.05);
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
}

.btn-generate {
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
    display: flex;
    align-items: center;
}

.btn-generate:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.btn-generate:disabled {
    background: #374151;
    color: #9CA3AF;
    cursor: not-allowed;
    box-shadow: none;
}

/* STATI (ERRORE E VUOTO) */
.alert-error {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #FCA5A5;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.empty-state {
    padding: 4rem 2rem;
    background-color: var(--bg-card);
    border: 1px dashed var(--border-color);
    color: var(--text-muted);
    text-align: center;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* PANNELLO STATISTICHE */
.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 2.5rem;
}

.stat-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-card.border-red {
    border-bottom: 2px solid rgba(239, 68, 68, 0.5);
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: monospace;
    font-weight: 600;
    margin-bottom: 8px;
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
}

.text-emerald-400 { color: #34D399; }
.text-blue-400 { color: #60A5FA; }
.text-indigo-400 { color: #818CF8; }
.text-red-400 { color: #F87171; }


/* GRIGLIA PRINCIPALE */
.dashboard-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    align-items: start;
}

.section-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #F3F4F6;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

/* CARDS FILONI DI RICAVO */
.streams-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.stream-card {
    background-color: var(--bg-panel);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    transition: transform 0.2s, box-shadow 0.2s;
}

.stream-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    border-color: #374151;
}

.stream-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.stream-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: #E5E7EB;
    margin: 0;
}

.score-badge {
    font-family: monospace;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
}
.badge-high { background-color: rgba(16, 185, 129, 0.2); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); }
.badge-medium { background-color: rgba(59, 130, 246, 0.2); color: #93C5FD; border: 1px solid rgba(59, 130, 246, 0.3); }
.badge-low { background-color: rgba(107, 114, 128, 0.2); color: #D1D5DB; border: 1px solid rgba(107, 114, 128, 0.3); }

.progress-track {
    background-color: #1F2937;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 1rem;
}
.progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 1s ease-in-out;
}
.bg-emerald-500 { background-color: #10B981; }
.bg-blue-500 { background-color: #3B82F6; }
.bg-gray-500 { background-color: #6B7280; }

.stream-summary {
    font-size: 0.875rem;
    color: #D1D5DB;
    line-height: 1.5;
    margin-bottom: 1.5rem;
}

.stream-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #1F2937;
    padding-top: 1rem;
}

.intent-count {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    color: var(--accent-emerald);
    font-weight: 600;
    font-family: monospace;
}
.intent-count.interactive {
    cursor: pointer;
    user-select: none;
    transition: color 0.2s;
}
.intent-count.interactive:hover {
    color: #34D399;
}

.chevron-rotate {
    transition: transform 0.3s ease;
}
.chevron-rotate.open {
    transform: rotate(180deg);
}

.organizations {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
}

.org-chip {
    font-size: 0.65rem;
    background-color: #111827;
    color: #9CA3AF;
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid #374151;
    font-family: monospace;
}

.intent-dropdown {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.intent-detail-item {
    background-color: rgba(0,0,0,0.2);
    border: 1px solid var(--border-color);
    padding: 0.75rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}
.intent-text {
    font-size: 0.8rem;
    color: #D1D5DB;
    line-height: 1.4;
}
.intent-weight-pill {
    font-size: 0.65rem;
    font-family: monospace;
    background-color: rgba(16, 185, 129, 0.15);
    color: #34D399;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
    border: 1px solid rgba(16, 185, 129, 0.3);
}


/* SEZIONE RUMORE SCARTATO */
.noise-card {
    background-color: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    position: sticky;
    top: 20px;
}

.noise-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 700;
    color: #FCA5A5;
    margin-top: 0;
    margin-bottom: 0.75rem;
}

.noise-desc {
    font-size: 0.80rem;
    color: #D1D5DB;
    margin-bottom: 1.5rem;
    line-height: 1.4;
}

.noise-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.noise-item-container {
    display: flex;
    flex-direction: column;
    background-color: rgba(0,0,0,0.2);
    padding: 10px;
    border-radius: 6px;
    border-left: 2px solid #EF4444;
}

.noise-main {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.bullet-cross {
    color: #EF4444;
    font-weight: bold;
    font-size: 0.9rem;
    line-height: 1;
}

.noise-text {
    font-size: 0.80rem;
    color: #E5E7EB;
    font-weight: 500;
    line-height: 1.3;
}

.noise-reason {
    font-size: 0.75rem;
    color: #FCA5A5;
    margin-left: 1.5rem; 
    margin-top: 6px;
    padding-left: 8px;
    border-left: 1px solid rgba(239, 68, 68, 0.4);
    font-style: italic;
}

.no-noise {
    font-size: 0.85rem;
    color: #10B981;
    font-style: italic;
    padding: 1rem;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 8px;
    text-align: center;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
.spinner { animation: spin 1s linear infinite; }

@media (max-width: 900px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
    
    .stats-row {
        grid-template-columns: repeat(2, 1fr);
    }

    .noise-card {
        position: static;
    }
}

@media (max-width: 600px) {
    .page-header-compact {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
    }
    .action-buttons {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
    }
    .stats-row {
        grid-template-columns: 1fr;
    }
    .stream-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    .stream-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    .organizations {
        justify-content: flex-start;
    }
}

/* ==========================================================================
   STAMPA (PRINT CSS) - ATTIVABILE CON CTRL+P
   ========================================================================== */
@media print {
    body, .revenue-wrapper, .main-content {
        background-color: white !important;
        color: #111827 !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    .text-gradient {
        background: none !important;
        -webkit-text-fill-color: #111827 !important;
        color: #111827 !important;
    }

    .no-print {
        display: none !important;
    }

    .dashboard-grid {
        display: block !important;
        width: 100% !important;
    }
    .streams-section, .noise-section {
        width: 100% !important;
        margin-bottom: 2rem !important;
    }

    .intent-dropdown.force-print-open {
        display: flex !important;
        border-color: #E5E7EB !important;
    }

    .stream-card, .noise-card, .intent-detail-item, .noise-item-container {
        background-color: white !important;
        border: 1px solid #D1D5DB !important;
        box-shadow: none !important;
        color: #111827 !important;
    }
    
    .stream-card:hover {
        transform: none !important;
    }

    .print-avoid-break {
        page-break-inside: avoid;
        break-inside: avoid;
    }

    .stream-name, h2, h3, h4, .noise-title, .intent-text, .noise-text {
        color: #111827 !important;
    }
    .stream-summary, .noise-desc, .noise-reason {
        color: #4B5563 !important;
    }

    .print-badge, .org-chip, .intent-weight-pill {
        border: 1px solid #9CA3AF !important;
        background-color: white !important;
        color: #111827 !important;
    }

    .progress-track {
        background-color: #F3F4F6 !important;
        border: 1px solid #E5E7EB !important;
    }
    .progress-fill {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    
    .interactive {
        pointer-events: none;
    }
}
</style>
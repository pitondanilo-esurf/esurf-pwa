<template>
    <AppNavbar />
    <div class="revenue-wrapper custom-scrollbar">
        <div class="main-content">
            
            <header class="page-header-compact">

                <div class="header-left">
                    <span class="ai-tag">
                        <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        EDDPS Aggregation Engine
                    </span>
                    <h2>E-surf <span class="text-gradient">Revenue Forecast</span></h2>
                    <p class="subtitle">Aggregazione automatica da MongoDB: Opportunità → Modelli → Filoni di Cassa</p>
                </div>
                
                <div class="header-right no-print action-buttons">
                    <span v-if="lastUpdateDate" class="last-update-label">
                        <svg class="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Aggiornato: {{ lastUpdateDate }}
                    </span>

                    <button @click="fetchAggregation()" :disabled="loading" class="btn-generate">
                        <span v-if="loading" class="flex-center">
                            <svg class="spinner icon-sm mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Estrazione flussi...
                        </span>
                        <span v-else class="flex-center">
                            <svg class="icon-sm mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Sincronizza DB
                        </span>
                    </button>
                </div>
            </header>

            <div v-if="error" class="alert-error no-print">
                <strong>Errore Connessione:</strong> {{ error }}
            </div>
            
            <div v-else-if="!loading && !revenueData" class="empty-state glass-card no-print">
                <svg class="icon-xl mb-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <p>Nessuna aggregazione presente. Clicca su "Sincronizza DB" per generare le metriche di Revenue.</p>
            </div>

            <div v-if="revenueData" class="dashboard-content">
                
                <!-- PANNELLO STATISTICHE -->
                <div class="stats-row no-print">
                    <div class="stat-card">
                        <span class="stat-label">Filoni Attivati</span>
                        <span class="stat-value text-indigo-400">{{ revenueData.revenue_streams?.length || 0 }}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Intenti Core</span>
                        <span class="stat-value text-emerald-400">{{ totalCoreIntents }}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Organizzazioni</span>
                        <span class="stat-value text-blue-400">{{ totalOrganizations }}</span>
                    </div>
                    <div class="stat-card border-red">
                        <span class="stat-label">Scarti (Noise)</span>
                        <span class="stat-value text-red-400">{{ totalDiscarded }}</span>
                    </div>
                </div>

                <main class="dashboard-grid">
                    
                    <div class="streams-section">
                        <h3 class="section-title">Dettaglio Filoni di Ricavo</h3>
                        
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

                                <p class="stream-summary">{{ stream.strategic_summary }}</p>

                                <div class="stream-footer">
                                    <div class="intent-count interactive" @click="toggleStream(index)">
                                        <svg class="icon-xs chevron-rotate no-print" :class="{ 'open': openStreams.includes(index) }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                        Intenti Aggregati
                                    </div>
                                    <div class="organizations">
                                        <span v-for="(org, i) in stream.contributing_organizations" :key="'org-'+i" class="org-chip">
                                            {{ org }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Dettaglio Intenti Aggregati -->
                                <div class="intent-dropdown" :class="{ 'force-print-open': true }" v-show="openStreams.includes(index)">
                                    <div v-for="(intentObj, idx) in stream.aggregated_intents" :key="'intent-'+index+'-'+idx" 
                                         class="intent-detail-item interactive-item" 
                                         @click="openIntentModal(intentObj)">
                                        
                                        <div class="intent-main-content">
                                            <span class="intent-text">{{ intentObj.intent_text }}</span>
                                            <div class="intent-meta-info">
                                                <span class="doc-source-tag">
                                                    <svg class="icon-xs mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                                    {{ intentObj.doc_title }}
                                                </span>
                                                <span class="date-tag" v-if="intentObj.doc_date">{{ formatDate(intentObj.doc_date) }}</span>
                                                
                                                <!-- BADGE ASANA INLINE -->
                                                <span v-if="intentObj.asana_status === 'ASSIGNED'" class="asana-badge-inline">
                                                    <svg class="icon-xs mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                                    Assegnato ({{ intentObj.asana_role }})
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <span v-if="intentObj.weight" class="intent-weight-pill">W: {{ Number(intentObj.weight).toFixed(2) }}</span>
                                    </div>
                                    <div v-if="!stream.aggregated_intents || stream.aggregated_intents.length === 0" class="text-muted text-xs">
                                        Nessun dettaglio intento restituito.
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
                                Intenti esclusi perché non presentano corrispondenze con i modelli di business attivi nei Filoni di Cassa.
                            </p>
                            
                            <ul v-if="revenueData.discarded_noise?.length" class="noise-list">
                                <li v-for="(noise, index) in revenueData.discarded_noise" :key="'noise-'+index" class="noise-item-container">
                                    <div class="noise-main">
                                        <span class="bullet-cross">✕</span>
                                        <span class="noise-text">{{ noise.intent || noise }}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                </main>
            </div>
        </div>

        <!-- MODAL DETTAGLIO INTENTO -->
        <transition name="fade">
            <div v-if="selectedIntent" class="modal-overlay" @click.self="closeModal">
                <div class="modal-content custom-scrollbar">
                    
                    <header class="modal-header">
                        <div class="modal-header-left">
                            <span class="weight-badge" :class="selectedIntent.weight >= 0.8 ? 'bg-emerald' : 'bg-muted'">
                                W: {{ Number(selectedIntent.weight).toFixed(2) }}
                            </span>
                            <h3>Dettaglio Intento Analitico</h3>
                        </div>
                        <button class="btn-close" @click="closeModal">
                            <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </header>

                    <div class="modal-body">
                        <!-- Meta Info (Documento & Data) -->
                        <div class="modal-meta-row">
                            <div class="doc-source-tag">
                                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                {{ selectedIntent.doc_title }}
                            </div>
                            <span class="date-tag" v-if="selectedIntent.doc_date">{{ formatDate(selectedIntent.doc_date) }}</span>
                        </div>

                        <!-- Intento Principale -->
                        <div class="modal-section">
                            <h4 class="intent-main-title">{{ selectedIntent.intent_text }}</h4>
                            <p class="intent-motivation" v-if="selectedIntent.full_intent?.weight_motivation">
                                {{ selectedIntent.full_intent.weight_motivation }}
                            </p>
                        </div>

                        <!-- SEZIONE ASANA ASSEGNATA -->
                        <div class="modal-section" v-if="selectedIntent.asana_status === 'ASSIGNED'">
                            <div class="assigned-state-container print-clean">
                                <div class="assigned-details flex-1">
                                    <span class="asana-label no-print">Stato Task Asana</span>
                                    <span class="role-assigned text-emerald-400">✓ {{ getRoleName(selectedIntent.asana_role) }}</span>
                                    <span v-if="selectedIntent.asana_task_id" class="task-id">Task ID: {{ selectedIntent.asana_task_id }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Modelli di Business Mappati -->
                        <div class="modal-section" v-if="selectedIntent.full_intent?.associated_business_models?.length">
                            <span class="framework-label mt-2">💼 Modelli Business Mappati</span>
                            <div class="model-chips mt-1">
                                <span v-for="(bm, bmIdx) in selectedIntent.full_intent.associated_business_models" :key="'bm-'+bmIdx" class="model-chip">
                                    <span class="model-code">[{{ bm.categoria_codice }}.{{ bm.modello_codice }}]</span> {{ bm.modello_titolo }}
                                </span>
                            </div>
                        </div>

                        <!-- Framework Strategico (Obiettivi e Azioni) -->
                        <div class="intent-execution-framework" v-if="selectedIntent.full_intent?.objective || (selectedIntent.full_intent?.action_flow?.length > 0)">
                            <div class="framework-objective" v-if="selectedIntent.full_intent.objective">
                                <span class="framework-label">🎯 Obiettivo Strategico</span>
                                <p class="framework-value">{{ selectedIntent.full_intent.objective }}</p>
                            </div>
                            <div class="framework-workflow mt-3" v-if="selectedIntent.full_intent.action_flow?.length > 0">
                                <span class="framework-label">📋 Action Flow Ordinato (SOP)</span>
                                <ul class="sop-list">
                                    <li v-for="(step, sIdx) in selectedIntent.full_intent.action_flow" :key="'step-'+sIdx" class="sop-step">
                                        {{ step }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </transition>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/services/axios.js'; 
import AppNavbar from '@/components/eddpsNavBar.vue';

const loading = ref(false);
const error = ref(null);
const revenueData = ref(null);
const openStreams = ref([]); 
const lastUpdateDate = ref(null);

// Stato del Modale
const selectedIntent = ref(null);

// === MAPPA RUOLI ORGANIZZATIVI (Per traduzione ID Asana -> Testo) ===
const ORG_ROLES = [
    { role_id: "R01", role_name: "System Architect" },
    { role_id: "R02", role_name: "AI/ML Engineer" },
    { role_id: "R03", role_name: "Data Engineer" },
    { role_id: "R04", role_name: "Product Manager" },
    { role_id: "R05", role_name: "Business Development Manager" },
    { role_id: "R06", role_name: "Relazioni Istituzionali" },
    { role_id: "R07", role_name: "Marketing Manager" },
    { role_id: "R08", role_name: "Legal Counsel" },
    { role_id: "R09", role_name: "Compliance & Regulatory Officer" },
    { role_id: "R10", role_name: "Project Manager" },
    { role_id: "R11", role_name: "Operations Manager" },
    { role_id: "R12", role_name: "CFO / Finance Director" },
    { role_id: "R13", role_name: "UX/UI Designer" },
    { role_id: "R14", role_name: "DevOps / Platform Engineer" },
    { role_id: "R15", role_name: "Sales Manager" },
    { role_id: "R16", role_name: "Data Scientist / ESG Analyst" }
];

const getRoleName = (roleId) => {
    const role = ORG_ROLES.find(r => r.role_id === roleId);
    return role ? role.role_name : roleId;
};

// === COMPUTED PROPERTIES PER STATISTICHE ===
const totalCoreIntents = computed(() => {
    if (!revenueData.value?.revenue_streams) return 0;
    return revenueData.value.revenue_streams.reduce((acc, stream) => {
        return acc + (stream.aggregated_intents ? stream.aggregated_intents.length : 0);
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


// === ON MOUNT & FORMATTING ===
onMounted(() => {
    fetchAggregation();
});

const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date)) return '';
    return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('it-IT', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

// === LOGICA DI FETCH E AGGREGAZIONE ===
const fetchAggregation = async () => {
    loading.value = true;
    error.value = null;
    openStreams.value = [];

    try {
        const [oppResponse, matrixResponse] = await Promise.all([
            apiClient.get('/api/eddps/opportunities'),
            apiClient.get('/api/eddps/matrix-mapping')
        ]);

        const opportunities = oppResponse.data?.data || [];
        const matrixMap = matrixResponse.data?.data || { revenue_streams: [] };

        const streamsMap = new Map();

        (matrixMap.revenue_streams || []).forEach(stream => {
            streamsMap.set(stream.stream_id || stream.stream_name, {
                stream_name: stream.stream_name,
                strategic_summary: stream.strategic_summary || stream.descrizione || "Filone strategico strutturato.",
                total_potential_score: 0,
                aggregated_intents: [],
                org_set: new Set(),
                mapped_models: stream.mapped_models || []
            });
        });

        const discarded_noise = [];

        opportunities.forEach((doc, idx) => {
            const sourceName = doc.organizzazione || doc.company_name || doc.analyzed_document_title || `Sorgente Documentale ${idx+1}`;
            const docTitle = doc.analyzed_document_title || `Documento ${idx+1}`;
            const docDate = doc.event_date || doc.processing_date || null;

            if (doc.opportunity_intents && Array.isArray(doc.opportunity_intents)) {
                doc.opportunity_intents.forEach(intent => {
                    if (!intent.intent) return;

                    let mappedToStream = false;

                    // Estrazione dei parametri Asana (controlliamo sia workflow_control che la root dell'intento per sicurezza)
                    const asanaStatus = intent.workflow_control?.asana_status || intent.asana_status || null;
                    const asanaRole = intent.workflow_control?.asana_role || intent.asana_role || null;
                    const asanaTaskId = intent.workflow_control?.asana_task_id || intent.asana_task_id || null;

                    if (intent.associated_business_models && Array.isArray(intent.associated_business_models)) {
                        intent.associated_business_models.forEach(bm => {
                            streamsMap.forEach(streamData => {
                                const matches = streamData.mapped_models.some(m =>
                                    String(m.categoria_codice) === String(bm.categoria_codice) &&
                                    String(m.modello_codice) === String(bm.modello_codice)
                                );

                                if (matches) {
                                    mappedToStream = true;
                                    // Salviamo meta-dati estesi per il pop-up
                                    streamData.aggregated_intents.push({
                                        intent_text: intent.intent,
                                        weight: intent.weight || 1,
                                        doc_title: docTitle,
                                        doc_date: docDate,
                                        full_intent: intent,
                                        asana_status: asanaStatus,
                                        asana_role: asanaRole,
                                        asana_task_id: asanaTaskId
                                    });
                                    streamData.total_potential_score += (intent.weight || 1) * 15; 
                                    streamData.org_set.add(sourceName);
                                }
                            });
                        });
                    }

                    if (!mappedToStream) {
                        discarded_noise.push({ intent: intent.intent });
                    }
                });
            }
        });

        const finalStreams = Array.from(streamsMap.values())
            .filter(s => s.aggregated_intents.length > 0)
            .map(s => {
                s.total_potential_score = Math.min(100, Math.round(s.total_potential_score));
                s.contributing_organizations = Array.from(s.org_set);
                delete s.org_set; 
                return s;
            })
            .sort((a, b) => b.total_potential_score - a.total_potential_score);

        revenueData.value = { revenue_streams: finalStreams, discarded_noise: discarded_noise };
        lastUpdateDate.value = formatDateTime(new Date().toISOString());

    } catch (err) {
        console.error("Errore elaborazione aggregazione flussi DB:", err);
        error.value = "Impossibile estrarre i dati dai database MongoDB.";
    } finally {
        loading.value = false;
    }
};

const toggleStream = (index) => {
    if (openStreams.value.includes(index)) openStreams.value = openStreams.value.filter(i => i !== index);
    else openStreams.value.push(index);
};

// Modale Handlers
const openIntentModal = (intentObj) => {
    selectedIntent.value = intentObj;
    document.body.style.overflow = 'hidden'; 
};
const closeModal = () => {
    selectedIntent.value = null;
    document.body.style.overflow = ''; 
};

// Utilities CSS
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

.main-content { max-width: 1280px; margin: 0 auto; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: var(--bg-panel); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
.icon-xs { width: 14px; height: 14px; }
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }
.icon-xl { width: 48px; height: 48px; }
.mr-1 { margin-right: 4px; }
.mr-2 { margin-right: 8px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mb-4 { margin-bottom: 16px; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.text-red { color: #EF4444; }

/* HEADER E BOTTONI */
.page-header-compact { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem; margin-bottom: 2.5rem; }
.ai-tag { font-family: monospace; font-size: 0.75rem; color: var(--accent-blue); text-transform: uppercase; letter-spacing: 0.1em; display: flex; align-items: center; gap: 8px; }
.page-header-compact h2 { font-size: 2.25rem; font-weight: 700; margin: 0.25rem 0; letter-spacing: -0.025em; color: #ffffff; }
.text-gradient { background: linear-gradient(to right, var(--accent-emerald), var(--accent-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.subtitle { font-size: 0.875rem; color: var(--text-muted); font-family: monospace; margin: 0; }
.action-buttons { display: flex; gap: 16px; align-items: center; }
.last-update-label { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-muted); font-family: monospace; background: rgba(255, 255, 255, 0.05); padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border-color); }
.btn-generate { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; }
.btn-generate:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
.btn-generate:disabled { background: #374151; color: #9CA3AF; cursor: not-allowed; }

/* PANNELLO STATISTICHE */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
.stat-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: center; }
.stat-card.border-red { border-bottom: 2px solid rgba(239, 68, 68, 0.5); }
.stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace; font-weight: 600; margin-bottom: 8px; }
.stat-value { font-size: 2rem; font-weight: 700; line-height: 1; }
.text-emerald-400 { color: #34D399; } .text-blue-400 { color: #60A5FA; } .text-indigo-400 { color: #818CF8; } .text-red-400 { color: #F87171; }

/* GRIGLIA E STREAM CARDS */
.dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; align-items: start; }
.section-title { font-size: 1.125rem; font-weight: 700; color: #F3F4F6; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); }
.streams-list { display: flex; flex-direction: column; gap: 1.5rem; }
.stream-card { background-color: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; }
.stream-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.stream-name { font-size: 1.125rem; font-weight: 700; color: #E5E7EB; margin: 0; }
.score-badge { font-family: monospace; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
.badge-high { background-color: rgba(16, 185, 129, 0.2); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); }
.badge-medium { background-color: rgba(59, 130, 246, 0.2); color: #93C5FD; border: 1px solid rgba(59, 130, 246, 0.3); }
.badge-low { background-color: rgba(107, 114, 128, 0.2); color: #D1D5DB; border: 1px solid rgba(107, 114, 128, 0.3); }
.progress-track { background-color: #1F2937; height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 1rem; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 1s ease-in-out; }
.bg-emerald-500 { background-color: #10B981; } .bg-blue-500 { background-color: #3B82F6; } .bg-gray-500 { background-color: #6B7280; }
.stream-summary { font-size: 0.875rem; color: #D1D5DB; line-height: 1.5; margin-bottom: 1.5rem; }
.stream-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #1F2937; padding-top: 1rem; }

.intent-count { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--accent-emerald); font-weight: 600; font-family: monospace; cursor: pointer; user-select: none; transition: color 0.2s; }
.intent-count:hover { color: #34D399; }
.chevron-rotate { transition: transform 0.3s ease; } .chevron-rotate.open { transform: rotate(180deg); }
.organizations { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.org-chip { font-size: 0.65rem; background-color: #111827; color: #9CA3AF; padding: 3px 8px; border-radius: 4px; border: 1px solid #374151; font-family: monospace; }

/* LISTA INTENTI AGGREGATI */
.intent-dropdown { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 0.5rem; }
.intent-detail-item {
    background-color: rgba(0,0,0,0.2);
    border: 1px solid var(--border-color);
    padding: 0.75rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    transition: all 0.2s ease;
}
.interactive-item { cursor: pointer; }
.interactive-item:hover { background-color: rgba(59, 130, 246, 0.05); border-color: rgba(59, 130, 246, 0.3); transform: translateX(2px); }

.intent-main-content { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.intent-text { font-size: 0.85rem; color: #D1D5DB; line-height: 1.4; font-weight: 500; }
.intent-meta-info { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.doc-source-tag { font-size: 0.7rem; color: #9CA3AF; display: flex; align-items: center; gap: 4px; background-color: rgba(255, 255, 255, 0.05); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-color); }
.date-tag { font-size: 0.7rem; background-color: rgba(59, 130, 246, 0.1); color: #93C5FD; padding: 2px 8px; border-radius: 4px; font-family: monospace; border: 1px solid rgba(59, 130, 246, 0.3); }
.intent-weight-pill { font-size: 0.65rem; font-family: monospace; background-color: rgba(16, 185, 129, 0.15); color: #34D399; padding: 2px 6px; border-radius: 4px; white-space: nowrap; border: 1px solid rgba(16, 185, 129, 0.3); font-weight: 700; }

/* BADGE ASANA INLINE */
.asana-badge-inline {
    font-size: 0.65rem;
    background-color: rgba(16, 185, 129, 0.1);
    color: #34D399;
    padding: 2px 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    border: 1px solid rgba(16, 185, 129, 0.3);
    font-weight: 600;
    font-family: monospace;
}

/* SEZIONE RUMORE */
.noise-card { background-color: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 1.5rem; position: sticky; top: 20px; }
.noise-title { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; color: #FCA5A5; margin-top: 0; margin-bottom: 0.75rem; }
.noise-desc { font-size: 0.80rem; color: #D1D5DB; margin-bottom: 1.5rem; line-height: 1.4; }
.noise-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.noise-item-container { background-color: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; border-left: 2px solid #EF4444; }
.noise-main { display: flex; align-items: flex-start; gap: 10px; }
.bullet-cross { color: #EF4444; font-weight: bold; font-size: 0.9rem; line-height: 1; }
.noise-text { font-size: 0.80rem; color: #E5E7EB; font-weight: 500; line-height: 1.3; }

/* ==========================================================================
   MODAL POP-UP (STILE ORCHESTRATOR DASHBOARD)
   ========================================================================== */
.modal-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
    background-color: var(--bg-card); border: 1px solid var(--border-color);
    border-radius: 16px; width: 90%; max-width: 650px; max-height: 85vh;
    overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    display: flex; flex-direction: column;
}
.modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1.5rem; border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-panel); position: sticky; top: 0; z-index: 10;
}
.modal-header-left { display: flex; align-items: center; gap: 12px; }
.modal-header h3 { margin: 0; font-size: 1.1rem; color: #F3F4F6; }
.weight-badge { padding: 4px 8px; font-size: 0.75rem; font-family: monospace; font-weight: 700; border-radius: 4px; }
.bg-emerald { background-color: var(--accent-emerald); color: #000; }
.bg-muted { background-color: #374151; color: #D1D5DB; }
.btn-close { background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 4px; transition: color 0.2s, background 0.2s; }
.btn-close:hover { color: #F3F4F6; background-color: rgba(255,255,255,0.1); }

.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
.modal-meta-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.modal-section { display: flex; flex-direction: column; gap: 6px; }
.intent-main-title { font-size: 1.15rem; font-weight: 600; color: #E5E7EB; margin: 0; line-height: 1.4; }
.intent-motivation { font-size: 0.85rem; color: #9CA3AF; font-family: monospace; margin: 0; padding-left: 12px; border-left: 3px solid #374151; line-height: 1.5; }

/* Asana Section Modal */
.assigned-state-container { display: flex; align-items: center; background-color: rgba(0,0,0,0.2); padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2); margin-top: 4px; }
.assigned-details { display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
.asana-label { font-size: 0.65rem; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; font-family: monospace; }
.role-assigned { font-size: 0.85rem; font-weight: 700; color: #34D399; }
.task-id { font-size: 0.7rem; font-family: monospace; color: #6B7280; margin-top: 4px; }

/* Framework & Models */
.framework-label { font-size: 0.7rem; font-family: monospace; text-transform: uppercase; color: #A7F3D0; font-weight: 700; letter-spacing: 0.05em; }
.model-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.model-chip { font-size: 0.75rem; background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); color: #A7F3D0; padding: 4px 10px; border-radius: 6px; font-weight: 500; }
.model-code { font-family: monospace; font-weight: 700; color: var(--accent-emerald); margin-right: 4px; }

.intent-execution-framework { background-color: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; gap: 12px; }
.framework-value { font-size: 0.9rem; color: #E5E7EB; margin: 4px 0 0 0; font-weight: 500; line-height: 1.5; }
.sop-list { list-style: none; padding: 0; margin: 8px 0 0 0; display: flex; flex-direction: column; gap: 8px; }
.sop-step { font-size: 0.85rem; color: #D1D5DB; padding-left: 20px; position: relative; line-height: 1.4; }
.sop-step::before { content: "→"; position: absolute; left: 0; color: var(--accent-emerald); font-weight: bold; }

/* Transizioni Modal */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active .modal-content { animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalSlideIn { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 1s linear infinite; }
</style>
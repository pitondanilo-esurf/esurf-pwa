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

            <main v-else>
                <!-- LEGENDA CLUSTER ESPANSA -->
                <div class="legend-section no-print">
                    <h4 class="legend-title">
                        <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Legenda Modelli E-surf (Cluster & Decimali)
                    </h4>
                    <div class="legend-grid-expanded">
                        <div class="legend-col" v-for="(desc, cluster) in CLUSTER_LEGEND" :key="cluster">
                            <span class="cluster-badge">{{ cluster }}</span>
                            <span class="cluster-text">{{ desc }}</span>
                        </div>
                    </div>
                </div>

                <!-- BANDI ATTIVI -->
                <h3 class="section-heading mt-4" v-if="activeCalls.length > 0">Opportunità in Corso</h3>
                <div class="calls-grid">
                    <div v-for="call in activeCalls" :key="call._id || call.bando_id" class="call-card print-avoid-break">
                        
                        <div class="card-header">
                            <div class="header-top">
                                <span class="bando-id">{{ call.bando_id }}</span>
                                <span class="ente-badge">{{ call.ente_erogatore }}</span>
                                
                                <!-- RATING A STELLE -->
                                <div class="rating-box no-print">
                                    <svg v-for="star in 5" :key="star" @click="setRating(call, star)" class="star-icon" :class="{'active': star <= (call.rating || 0)}" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                </div>
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
                                <span class="block-label">Modelli Business Mappati</span>
                                <div class="models-chips">
                                    <span v-for="(modello, i) in call.modelli_coperti" :key="i" class="model-chip" :title="getClusterTooltip(modello)">
                                        Cluster {{ modello }}
                                    </span>
                                </div>
                            </div>

                            <!-- SETUP & NOTE OPERATIVE -->
                            <div class="notes-block">
                                <div class="notes-header">
                                    <span class="block-label mb-0">Setup & Note di Valutazione</span>
                                    <button @click="toggleEditNote(call)" class="btn-edit-note no-print">
                                        {{ editingNotes[call._id] ? '💾 Salva' : '✏️ Modifica' }}
                                    </button>
                                </div>
                                <div v-if="editingNotes[call._id]">
                                    <div class="edit-group mb-2">
                                        <span class="input-label">🔗 Link Bando:</span>
                                        <input type="text" v-model="call.link_ufficiale" class="link-input custom-scrollbar" placeholder="Inserisci URL (es. https://...)">
                                    </div>
                                    <div class="edit-group">
                                        <span class="input-label">📝 Note Valutazione:</span>
                                        <textarea v-model="call.note" class="notes-textarea custom-scrollbar" placeholder="Inserisci appunti o note strategiche (supporta Markdown)..."></textarea>
                                    </div>
                                </div>
                                <div v-else class="notes-display markdown-content custom-scrollbar" v-html="call.note ? renderMarkdown(call.note) : 'Nessuna nota presente.'">
                                </div>
                            </div>

                            <!-- BLOCCO ASANA -->
                            <div class="asana-interactive-block print-clean mt-2">
                                <template v-if="call.asana_status !== 'ASSIGNED'">
                                    <div class="assignment-controls no-print w-full">
                                        <span class="asana-label">Delega Valutazione a:</span>
                                        <div class="flex gap-2">
                                            <select v-model="selectedRoles[call._id]" class="role-select flex-1">
                                                <option value="" disabled selected>Seleziona Ruolo...</option>
                                                <option v-for="role in ORG_ROLES" :key="role.role_id" :value="role.role_id">
                                                    [{{ role.role_id }}] {{ role.role_name }}
                                                </option>
                                            </select>
                                            <button 
                                                @click="pushToAsana(call)"
                                                :disabled="!selectedRoles[call._id] || pushStatus[call._id] === 'loading'"
                                                class="btn-asana-push">
                                                <span v-if="pushStatus[call._id] === 'loading'">...</span>
                                                <span v-else>Push Asana</span>
                                            </button>
                                        </div>
                                    </div>
                                </template>

                                <template v-else>
                                    <div class="assigned-state-container w-full">
                                        <div class="assigned-details flex-1">
                                            <span class="asana-label no-print">Task Asana Delegato a:</span>
                                            <span class="role-assigned text-emerald-400">✓ {{ getRoleName(call.asana_role) }}</span>
                                            <span class="task-id">ID: {{ call.asana_task_id }}</span>
                                        </div>
                                        <button 
                                            @click="unassignAsanaTask(call)" 
                                            class="btn-asana-remove no-print" 
                                            :disabled="unassignStatus[call._id] === 'loading'"
                                            title="Revoca assegnazione">
                                            <span v-if="unassignStatus[call._id] === 'loading'">...</span>
                                            <span v-else>
                                                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </span>
                                        </button>
                                    </div>
                                </template>
                            </div>

                        </div>

                        <!-- FOOTER CON LINK UFFICIALE -->
                        <div class="card-footer" v-if="call.link_ufficiale">
                            <a :href="call.link_ufficiale" target="_blank" rel="noopener noreferrer" class="link-bando no-print" title="Apri il bando in una nuova finestra">
                                <span>Vai al Bando Ufficiale</span>
                                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- BANDI SCADUTI -->
                <div v-if="expiredCalls.length > 0" class="expired-section mt-5">
                    <h3 class="section-heading">Archivio Bandi Chiusi / Scaduti</h3>
                    <div class="accordion-container">
                        <div v-for="call in expiredCalls" :key="call._id || call.bando_id" class="accordion-item" :class="{ 'is-open': openExpired.includes(call._id || call.bando_id) }">
                            
                            <!-- Intestazione Accordion -->
                            <div class="accordion-header" @click="toggleExpired(call._id || call.bando_id)">
                                <div class="expired-header-info">
                                    <span class="status-badge-expired">SCADUTO</span>
                                    <span class="expired-date">Chiusura: {{ formatDate(call.data_end) }}</span>
                                    <h4 class="expired-title">{{ call.nome }}</h4>
                                    <div class="rating-box no-print ml-2" v-if="call.rating">
                                        <svg v-for="star in call.rating" :key="star" class="star-icon active" style="width:12px;height:12px;" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div class="chevron-box" :class="{ 'rotate': openExpired.includes(call._id || call.bando_id) }">
                                    <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>

                            <transition name="accordion-slide">
                                <div v-show="openExpired.includes(call._id || call.bando_id)" class="accordion-body">
                                    <div class="card-body accordion-card-body">
                                        <div class="header-top mb-3">
                                            <span class="bando-id">{{ call.bando_id }}</span>
                                            <span class="ente-badge">{{ call.ente_erogatore }}</span>
                                        </div>
                                        <p class="call-desc">{{ call.descrizione_breve }}</p>
                                        <div class="financial-block">
                                            <span class="block-label">Dotazione / Ticket</span>
                                            <p class="financial-value">{{ call.dotazione_finanziaria }}</p>
                                        </div>
                                        <div v-if="call.modelli_coperti && call.modelli_coperti.length" class="models-block">
                                            <span class="block-label">Modelli Business Mappati</span>
                                            <div class="models-chips">
                                                <span v-for="(modello, i) in call.modelli_coperti" :key="i" class="model-chip" :title="getClusterTooltip(modello)">
                                                    Cluster {{ modello }}
                                                </span>
                                            </div>
                                        </div>
                                        <div v-if="call.note" class="notes-block mt-3">
                                            <span class="block-label">Note di Valutazione Storiche</span>
                                            <div class="notes-display markdown-content custom-scrollbar" v-html="renderMarkdown(call.note)"></div>
                                        </div>
                                    </div>
                                    <div class="card-footer" v-if="call.link_ufficiale">
                                        <a :href="call.link_ufficiale" target="_blank" rel="noopener noreferrer" class="link-bando link-bando-expired no-print">
                                            <span>Visualizza Storico Bando Ufficiale</span>
                                            <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                        </a>
                                    </div>
                                </div>
                            </transition>

                        </div>
                    </div>
                </div>

            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/services/axios.js'; 
import AppNavbar from '@/components/eddpsNavBar.vue';

const calls = ref([]);
const loading = ref(true);
const error = ref(null);
const openExpired = ref([]);

const editingNotes = ref({});
const selectedRoles = ref({});
const pushStatus = ref({});
const unassignStatus = ref({});

// Mappatura esaustiva per i Tooltip
const CLUSTER_LEGEND = {
    '1.1': 'Costituzione CER, Autoconsumo Collettivo, Impianti fisici',
    '2.1': 'Meccanismi incentivanti (RID, Incentivi GSE)',
    '2.2': 'Contratti PPA, Mercati MFL/Flessibilità e Demand Response',
    '3.1': 'Efficienza energetica olistica (Luce, Gas, Acqua)',
    '3.2': 'Gemelli Digitali (Digital Twins) e Circolarità di distretto',
    '4.1': 'Sviluppo piattaforme SaaS e Orchestrazione dati',
    '4.2': 'Calcolo LCA e Carbon Footprint',
    '4.3': 'Tokenizzazione crediti ambientali e Blockchain',
    '4.4': 'AI su POD, Shadow Billing e Gestione real-time',
    '5.1': 'Integrazione Agro-fotovoltaico',
    '5.2': 'Distretti industriali cooperativi di PMI',
    '5.3': 'Reti territoriali di economia solidale',
    '5.4': 'Contrasto Povertà Energetica BES'
};

const ORG_ROLES = [
    { role_id: "R01", role_name: "System Architect" },
    { role_id: "R04", role_name: "Product Manager" },
    { role_id: "R05", role_name: "Business Development" },
    { role_id: "R06", role_name: "Relazioni Istituzionali" },
    { role_id: "R10", role_name: "Project Manager" },
    { role_id: "R12", role_name: "CFO / Finance Director" }
];

const getClusterTooltip = (code) => CLUSTER_LEGEND[code] || 'Cluster ' + code;

const getRoleName = (roleId) => {
    const role = ORG_ROLES.find(r => r.role_id === roleId);
    return role ? role.role_name : roleId;
};

const toggleExpired = (id) => {
    const idx = openExpired.value.indexOf(id);
    if (idx === -1) openExpired.value.push(id);
    else openExpired.value.splice(idx, 1);
};

const formatDate = (dateString) => {
    if (!dateString) return 'Data non definita';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isUrgent = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(date - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 60; 
};

const renderMarkdown = (text) => {
    if (!text) return '';
    
    let html = text
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>(\n<li>.*<\/li>)*)/g, '<ul class="md-list">$1</ul>')
        .replace(/\n(?!\s*<)/g, '<br>');
    return html;
};

// --- LOGICA RATING E NOTE ---
const setRating = async (call, ratingValue) => {
    call.rating = ratingValue;
    try {
        await apiClient.put(`/api/eddps/calls/${call._id}`, { rating: ratingValue });
    } catch (err) {
        console.error("Errore salvataggio rating", err);
    }
};

const toggleEditNote = async (call) => {
    if (editingNotes.value[call._id]) {
        try {
            await apiClient.put(`/api/eddps/calls/${call._id}`, { 
                note: call.note || '',
                link_ufficiale: call.link_ufficiale || ''
            });
        } catch (err) {
            console.error("Errore salvataggio setup bando", err);
        }
    }
    editingNotes.value[call._id] = !editingNotes.value[call._id];
};

// --- LOGICA ASANA ---
const pushToAsana = async (call) => {
    const roleId = selectedRoles.value[call._id];
    if (!roleId) return;

    pushStatus.value[call._id] = 'loading';
    try {
        const desc = `${call.descrizione_breve}\n\nDOTAZIONE:\n${call.dotazione_finanziaria}\n\nSCADENZA:\n${formatDate(call.data_end)}\n\nNOTE INTERNE:\n${call.note || 'Nessuna nota.'}`;
        
        const payload = {
            bando_id_mongo: call._id,
            bando_titolo: call.nome,
            description: desc,
            role_assigned: roleId
        };

        const response = await apiClient.post('/api/eddps/calls/asana-task', payload);
        call.asana_status = 'ASSIGNED';
        call.asana_role = roleId;
        call.asana_task_id = response.data.task_gid;

    } catch (err) {
        console.error("Errore push Asana:", err);
    } finally {
        pushStatus.value[call._id] = null;
    }
};

const unassignAsanaTask = async (call) => {
    unassignStatus.value[call._id] = 'loading';
    try {
        await apiClient.post('/api/eddps/calls/asana-task/remove', {
            task_gid: String(call.asana_task_id),
            bando_id_mongo: String(call._id)
        });
        call.asana_status = null;
        call.asana_role = null;
        call.asana_task_id = null;
        selectedRoles.value[call._id] = "";
    } catch (err) {
        console.error("Errore rimozione task Asana:", err);
    } finally {
        unassignStatus.value[call._id] = null;
    }
};

const sortedCalls = computed(() => {
    return [...calls.value].sort((a, b) => {
        const dateA = a.data_end ? new Date(a.data_end).getTime() : 0;
        const dateB = b.data_end ? new Date(b.data_end).getTime() : 0;
        return dateB - dateA; 
    });
});

const activeCalls = computed(() => {
    const today = new Date().getTime();
    return sortedCalls.value.filter(c => {
        if (!c.data_end) return true;
        return new Date(c.data_end).getTime() >= today;
    });
});

const expiredCalls = computed(() => {
    const today = new Date().getTime();
    return sortedCalls.value.filter(c => {
        if (!c.data_end) return false;
        return new Date(c.data_end).getTime() < today;
    });
});

onMounted(async () => {
    try {
        const response = await apiClient.get('/api/eddps/calls');
        const rawCalls = response.data?.data || [];
        
        // Normalizza i rating da stringhe di emoji ("⭐⭐⭐") a numeri interi (3)
        calls.value = rawCalls.map(call => {
            if (typeof call.rating === 'string') {
                call.rating = (call.rating.match(/⭐/g) || []).length;
            }
            return call;
        });
        
        // Inizializza lo stato dei selettori Asana per i bandi già assegnati
        calls.value.forEach(call => {
            if (call.asana_status === 'ASSIGNED') {
                selectedRoles.value[call._id] = call.asana_role;
            }
        });
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
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: var(--bg-panel); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }

/* Header CSS */
.page-header-compact {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1.5rem; margin-bottom: 2rem;
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

.section-heading { font-size: 1.25rem; color: #F3F4F6; margin-bottom: 1.25rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
.mt-4 { margin-top: 2rem; }
.mt-5 { margin-top: 3rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-0 { margin-bottom: 0 !important; }
.w-full { width: 100%; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.gap-2 { gap: 0.5rem; }

/* LEGENDA CLUSTER CSS */
.legend-section {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 2rem;
}
.legend-title {
    font-size: 0.8rem; font-family: monospace; text-transform: uppercase;
    color: #9CA3AF; margin: 0 0 16px 0; letter-spacing: 0.05em;
    display: flex; align-items: center; gap: 8px;
}
.legend-grid-expanded {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;
}
.legend-col { display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; }
.cluster-badge {
    background-color: rgba(16, 185, 129, 0.1); color: var(--accent-emerald);
    border: 1px solid rgba(16, 185, 129, 0.3); width: 32px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 4px; font-family: monospace; font-weight: 700; font-size: 0.75rem;
    flex-shrink: 0;
}
.cluster-text { font-size: 0.75rem; color: #D1D5DB; }

/* GRID BANDI ATTIVI */
.calls-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(500px, 1fr)); gap: 1.5rem; }

.call-card {
    background-color: var(--bg-card); border: 1px solid var(--border-color);
    border-radius: 12px; display: flex; flex-direction: column; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
}
.call-card:hover { border-color: rgba(59, 130, 246, 0.5); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }

.card-header {
    padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color);
    background: linear-gradient(to bottom, rgba(255,255,255,0.02), transparent);
}

.header-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.bando-id {
    font-family: monospace; font-size: 0.7rem; font-weight: 700;
    color: #9CA3AF; background-color: #1F2937;
    padding: 4px 8px; border-radius: 6px; letter-spacing: 0.05em;
}
.ente-badge {
    font-size: 0.7rem; font-weight: 600; background-color: rgba(59, 130, 246, 0.15);
    color: #93C5FD; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(59, 130, 246, 0.3); margin-right: auto;
}

/* RATING STARS */
.rating-box { display: flex; gap: 4px; }
.star-icon { width: 16px; height: 16px; color: #374151; cursor: pointer; transition: color 0.2s; }
.star-icon:hover, .star-icon.active { color: #FBBF24; }

.call-title { font-size: 1.1rem; font-weight: 700; color: #F3F4F6; margin: 0; line-height: 1.4; }

.card-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; flex: 1; }
.call-desc { font-size: 0.85rem; color: var(--text-muted); margin: 0; line-height: 1.5; }

.block-label { display: block; font-size: 0.65rem; font-family: monospace; text-transform: uppercase; font-weight: 700; color: #6B7280; margin-bottom: 6px; letter-spacing: 0.05em; }
.financial-block { background-color: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); padding: 12px; border-radius: 8px; }
.financial-value { font-size: 0.9rem; font-weight: 500; color: #A7F3D0; margin: 0; }

.dates-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.date-box { padding: 10px; background-color: #111827; border: 1px solid #374151; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; }
.date-label { font-size: 0.65rem; text-transform: uppercase; color: #9CA3AF; font-weight: 700; }
.date-val { font-size: 0.85rem; color: #E5E7EB; font-family: monospace; }
.date-val.urgent { color: #F87171; font-weight: 700; }

.models-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.model-chip { font-size: 0.725rem; background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #D1D5DB; padding: 4px 10px; border-radius: 6px; font-family: monospace; cursor: help; }

/* STILI SETUP E EDITING */
.input-label { font-size: 0.65rem; font-family: monospace; text-transform: uppercase; color: #a7f3d0; font-weight: 700; display: block; margin-bottom: 4px; }
.link-input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid #374151; color: #60A5FA; padding: 8px; font-size: 0.8rem; border-radius: 6px; font-family: system-ui, -apple-system, sans-serif; margin-bottom: 8px; }
.link-input:focus { outline: none; border-color: var(--accent-blue); }
.markdown-content { font-size: 0.85rem; color: #E5E7EB; line-height: 1.5; }
.markdown-content :deep(strong) { font-weight: 700; color: #fff; background: rgba(255, 255, 255, 0.05); padding: 0 4px; border-radius: 3px; }
.markdown-content :deep(em) { font-style: italic; color: var(--accent-emerald); }
.markdown-content :deep(.md-list) { list-style-type: disc; padding-left: 20px; margin: 6px 0; }
.markdown-content :deep(li) { margin-bottom: 4px; }

/* NOTE E ASANA CSS */
.notes-block { background-color: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.03); border-radius: 8px; padding: 12px; }
.notes-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.btn-edit-note { background: transparent; border: 1px solid #374151; color: #9CA3AF; font-size: 0.65rem; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-family: monospace; transition: all 0.2s; }
.btn-edit-note:hover { border-color: var(--accent-blue); color: var(--accent-blue); }
.notes-textarea { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid #374151; color: #D1D5DB; padding: 8px; font-size: 0.8rem; border-radius: 6px; font-family: system-ui, -apple-system, sans-serif; resize: vertical; min-height: 80px; }
.notes-textarea:focus { outline: none; border-color: var(--accent-blue); }
.notes-display { font-size: 0.8rem; color: #E5E7EB; min-height: 40px; font-style: italic; white-space: pre-wrap; }

.asana-interactive-block { display: flex; align-items: flex-end; gap: 12px; padding: 12px; background-color: rgba(0,0,0,0.4); border: 1px solid var(--border-color); border-radius: 8px; }
.asana-label { font-size: 0.625rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: block; }
.role-select { background-color: var(--bg-body); color: var(--text-main); border: 1px solid #374151; padding: 8px 10px; border-radius: 6px; font-size: 0.75rem; font-family: monospace; outline: none; cursor: pointer; }
.btn-asana-push { background-color: #F06A6A; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; min-height: 34px; }
.btn-asana-push:disabled { background-color: #374151; color: #9CA3AF; cursor: not-allowed; }
.assigned-state-container { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.assigned-details { display: flex; flex-direction: column; align-items: flex-start; }
.role-assigned { font-size: 0.75rem; font-weight: 700; color: #34D399; }
.task-id { font-size: 0.65rem; font-family: monospace; color: var(--text-muted); margin-top: 2px; }
.btn-asana-remove { background-color: rgba(239, 68, 68, 0.1); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 32px; }

/* FOOTER CARD */
.card-footer {
    padding: 1rem 1.5rem; border-top: 1px solid var(--border-color);
    background-color: rgba(255, 255, 255, 0.02); display: flex; justify-content: flex-end;
}
.link-bando {
    display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600;
    color: var(--accent-blue); text-decoration: none; padding: 8px 16px; border-radius: 8px;
    background-color: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.25);
    transition: all 0.2s ease-in-out;
}
.link-bando:hover { background-color: rgba(59, 130, 246, 0.2); color: #60A5FA; border-color: rgba(59, 130, 246, 0.4); transform: translateY(-1px); }

/* ACCORDION BANDI SCADUTI */
.accordion-container { display: flex; flex-direction: column; gap: 1rem; }
.accordion-item {
    background-color: var(--bg-card); border: 1px solid var(--border-color);
    border-radius: 12px; overflow: hidden;
}
.accordion-header {
    padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center;
    cursor: pointer; background: linear-gradient(to bottom, rgba(255,255,255,0.02), transparent);
    transition: background-color 0.2s;
}
.accordion-header:hover { background-color: rgba(255,255,255,0.03); }

.expired-header-info { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.status-badge-expired {
    background-color: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3);
    font-size: 0.65rem; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-family: monospace; letter-spacing: 0.05em;
}
.expired-date { font-size: 0.75rem; color: #9CA3AF; font-family: monospace; background-color: #1F2937; padding: 4px 8px; border-radius: 6px; }
.expired-title { font-size: 1rem; font-weight: 600; color: #D1D5DB; margin: 0; }

.chevron-box { padding: 6px; background-color: #1F2937; border-radius: 50%; color: #D1D5DB; transition: transform 0.3s ease, background-color 0.3s; }
.chevron-box.rotate { transform: rotate(180deg); background-color: #374151; }

.accordion-body { border-top: 1px solid var(--border-color); background-color: var(--bg-body); }
.accordion-card-body { padding: 1.5rem; }

.link-bando-expired {
    color: #9CA3AF; background-color: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.1);
}
.link-bando-expired:hover { color: #E5E7EB; background-color: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }

.accordion-slide-enter-active, .accordion-slide-leave-active { transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out; max-height: 1200px; overflow: hidden; opacity: 1; }
.accordion-slide-enter-from, .accordion-slide-leave-to { max-height: 0; opacity: 0; }

/* Spinner e Utils */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 1s linear infinite; }
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }

@media (max-width: 768px) {
    .calls-grid { grid-template-columns: 1fr; }
    .page-header-compact { flex-direction: column; align-items: flex-start; gap: 1rem; }
    .card-footer { justify-content: stretch; }
    .link-bando { width: 100%; justify-content: center; }
    .expired-header-info { gap: 8px; }
    .expired-title { width: 100%; margin-top: 4px; }
    .flex.gap-2 { flex-direction: column; }
    .btn-asana-push { width: 100%; }
}
</style>
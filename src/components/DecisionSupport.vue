<template>
    <div class="dss-wrapper custom-scrollbar">
        <AppNavbar />

        <div class="main-content">
            
            <header class="page-header-compact">
                <div class="header-left">
                    <span class="dss-tag">
                        Decision Support System (DSS)
                    </span>
                    <h2>Golden Path <span class="text-gradient">Prioritization</span></h2>
                    <p class="subtitle">Filtro multicriterio per isolare i task ad alto impatto e pronti all'esecuzione.</p>
                </div>
                
                <div class="header-right">
                    <button @click="syncDSS" :disabled="loading" class="btn-sync mr-3">
                        <span v-if="loading">Sincronizzazione...</span>
                        <span v-else>🔄 Sincronizza DB</span>
                    </button>

                    <div class="filter-box">
                        <label class="filter-label">Filtro Operativo:</label>
                        <select v-model="scoreFilter" class="score-select">
                            <option value="all">Tutti i Percorsi (Raw)</option>
                            <option value="high">Solo Golden Paths (Score > 75)</option>
                            <option value="actionable">Pronti all'Esecuzione (SOP Presente)</option>
                        </select>
                    </div>
                </div>
            </header>

            <div class="stats-row">
                <div class="stat-card">
                    <span class="stat-label">Totale Valutati</span>
                    <span class="stat-value text-blue-400">{{ tasks.length }}</span>
                </div>
                <div class="stat-card border-emerald">
                    <span class="stat-label">Golden Paths (>75)</span>
                    <span class="stat-value text-emerald-400">{{ goldenPathsCount }}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">SOP Generate</span>
                    <span class="stat-value text-indigo-400">{{ actionableCount }}</span>
                </div>
            </div>

            <div v-if="loading && tasks.length === 0" class="empty-state glass-card">
                Recupero analisi dal database...
            </div>

            <div v-else class="task-grid">
                <transition-group name="list">
                    <div v-for="task in filteredTasks" :key="task.id || task._id" class="task-card" :class="{ 'is-golden': task.golden_score >= 75 }">
                        
                        <div class="score-column">
                            <div class="golden-score-circle" :class="getScoreClass(task.golden_score)">
                                <span class="score-number">{{ task.golden_score }}</span>
                                <span class="score-label">SCORE</span>
                            </div>
                            <div class="suggested-role">
                                <span class="role-label">Assegnazione DSS:</span>
                                <span class="role-value">{{ task.suggested_role || 'Da definire' }}</span>
                            </div>
                        </div>

                        <div class="info-column">
                            <div class="task-meta">
                                <span class="doc-tag">📄 {{ task.source_doc }}</span>
                                <span class="model-tag" v-if="task.associated_business_models && task.associated_business_models.length > 0">
                                    💼 [{{ task.associated_business_models[0].categoria_codice }}.{{ task.associated_business_models[0].modello_codice }}] {{ task.associated_business_models[0].modello_titolo }}
                                </span>
                            </div>
                            
                            <h3 class="intent-title">{{ task.intent }}</h3>
                            
                            <div class="pillars-breakdown" v-if="task.scores">
                                <div class="pillar">
                                    <div class="pillar-header">
                                        <span>🧠 Affidabilità AI</span>
                                        <span>{{ task.scores.ai_confidence }}/100</span>
                                    </div>
                                    <div class="progress-bg"><div class="progress-fill bg-purple" :style="{ width: task.scores.ai_confidence + '%' }"></div></div>
                                </div>
                                <div class="pillar">
                                    <div class="pillar-header">
                                        <span>⚡ Impatto (Asset)</span>
                                        <span>{{ task.scores.strategic_impact }}/100</span>
                                    </div>
                                    <div class="progress-bg"><div class="progress-fill bg-emerald" :style="{ width: task.scores.strategic_impact + '%' }"></div></div>
                                </div>
                                <div class="pillar">
                                    <div class="pillar-header">
                                        <span>🛠️ Fattibilità (SOP)</span>
                                        <span>{{ task.scores.operational_feasibility }}/100</span>
                                    </div>
                                    <div class="progress-bg"><div class="progress-fill bg-blue" :style="{ width: task.scores.operational_feasibility + '%' }"></div></div>
                                </div>
                            </div>
                            
                            <div class="sop-box" v-if="task.action_flow && task.action_flow.length > 0">
                                <span class="sop-label">Action Flow Generato:</span>
                                <ul>
                                    <li v-for="(step, idx) in task.action_flow" :key="idx">{{ step }}</li>
                                </ul>
                            </div>
                            <div class="sop-missing" v-else>
                                ⚠️ Richiede analisi umana: Action Flow non definito chiaramente dall'AI.
                            </div>
                        </div>

                        <div class="action-column">
                            <button class="btn-approve" @click="pushToAsana(task)" :disabled="task.asana_status === 'ASSIGNED'">
                                <span v-if="task.asana_status === 'ASSIGNED'">✓ Assegnato</span>
                                <span v-else>Autorizza & Push</span>
                            </button>
                            <button class="btn-discard" v-if="task.asana_status !== 'ASSIGNED'" @click="discardTask(task)">
                                Scarta
                            </button>
                        </div>
                    </div>
                </transition-group>
            </div>
            
            <div v-if="!loading && filteredTasks.length === 0" class="empty-state glass-card">
                Nessun task corrisponde ai filtri selezionati.
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import apiClient from '@/services/axios.js';
import AppNavbar from '@/components/eddpsNavBar.vue';

const scoreFilter = ref('high');
const tasks = ref([]);
const loading = ref(false);

// Recupero Dati Backend
const fetchGoldenPaths = async () => {
    loading.value = true;
    try {
        const response = await apiClient.get(`/api/eddps/dss/paths?filter=${scoreFilter.value}`);
        // Assicurati che l'array non sia null
        tasks.value = response.data?.data || [];
    } catch (error) {
        console.error("Errore nel recupero dei Golden Paths:", error);
        tasks.value = [];
    } finally {
        loading.value = false;
    }
};

// Sincronizzazione Forzata Backend
const syncDSS = async () => {
    loading.value = true;
    try {
        await apiClient.post('/api/eddps/dss/sync');
        await fetchGoldenPaths(); // Ricarica la lista
    } catch (error) {
        console.error("Errore durante la sincronizzazione DSS:", error);
    } finally {
        loading.value = false;
    }
};

// Listener sul filtro
watch(scoreFilter, () => {
    fetchGoldenPaths();
});

onMounted(() => {
    fetchGoldenPaths();
});

// Computed Properties
const goldenPathsCount = computed(() => tasks.value.filter(t => t.golden_score >= 75).length);
const actionableCount = computed(() => tasks.value.filter(t => t.action_flow && t.action_flow.length > 0).length);

// Il backend restituisce già i dati filtrati, ma applichiamo il sorting lato frontend per sicurezza
const filteredTasks = computed(() => {
    return [...tasks.value].sort((a, b) => b.golden_score - a.golden_score);
});

// Metodi UI
const getScoreClass = (score) => {
    if (score >= 85) return 'score-excellent';
    if (score >= 75) return 'score-good';
    return 'score-average';
};

const pushToAsana = (task) => {
    // Da integrare con la vera chiamata API Asana
    console.log(`Pushed to Asana: ${task._id} assigned to ${task.suggested_role}`);
    task.asana_status = 'ASSIGNED';
};

const discardTask = (task) => {
    // CORRETTO: Ora lavora su 'tasks.value' invece di 'mockTasks.value'
    const targetId = task.id || task._id;
    tasks.value = tasks.value.filter(t => (t.id || t._id) !== targetId);
};
</script>

<style scoped>
.dss-wrapper {
    --bg-dark: #06090F; --bg-card: #0B101A; --bg-panel: #111827;
    --border-color: #1f2937; --text-main: #F3F4F6; --text-muted: #9CA3AF;
    --accent-emerald: #10B981; --accent-blue: #3B82F6; --accent-purple: #8B5CF6;
    
    background-color: var(--bg-dark); color: var(--text-main);
    min-height: 100vh; font-family: system-ui, -apple-system, sans-serif;
}

.main-content { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: var(--bg-panel); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }

.mr-3 { margin-right: 12px; }

/* HEADER */
.page-header-compact { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem; margin-bottom: 2rem; }
.dss-tag { font-family: monospace; font-size: 0.75rem; color: var(--accent-purple); text-transform: uppercase; letter-spacing: 0.1em; display: flex; align-items: center; }

.page-header-compact h2 { font-size: 2.25rem; font-weight: 700; margin: 0.25rem 0; letter-spacing: -0.025em; }
.text-gradient { background: linear-gradient(to right, var(--accent-emerald), var(--accent-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.subtitle { font-size: 0.875rem; color: var(--text-muted); font-family: monospace; margin: 0; }

.header-right { display: flex; align-items: flex-end; }
.btn-sync { background-color: #1F2937; color: #E5E7EB; border: 1px solid #374151; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; height: fit-content; transition: background 0.2s; }
.btn-sync:hover:not(:disabled) { background-color: #374151; }

.filter-box { display: flex; flex-direction: column; gap: 6px; }
.filter-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-family: monospace; }
.score-select { background-color: var(--bg-panel); color: var(--text-main); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; outline: none; cursor: pointer; }
.score-select:focus { border-color: var(--accent-blue); }

/* STATS */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; }
.stat-card.border-emerald { border-bottom: 2px solid var(--accent-emerald); }
.stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-family: monospace; font-weight: 600; margin-bottom: 4px; }
.stat-value { font-size: 2rem; font-weight: 700; line-height: 1; }
.text-emerald-400 { color: #34D399; } .text-blue-400 { color: #60A5FA; } .text-indigo-400 { color: #818CF8; }

/* TASK CARDS */
.task-grid { display: flex; flex-direction: column; gap: 1.5rem; }
.task-card { background-color: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 12px; display: grid; grid-template-columns: 140px 1fr 160px; gap: 1.5rem; padding: 1.5rem; transition: transform 0.2s, border-color 0.2s; }
.task-card.is-golden { border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 4px 20px rgba(16, 185, 129, 0.05); }
.task-card:hover { transform: translateY(-2px); }

/* Score Column */
.score-column { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 16px; border-right: 1px solid var(--border-color); padding-right: 1.5rem; }
.golden-score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 4px solid #374151; background-color: rgba(0,0,0,0.2); }
.score-number { font-size: 2rem; font-weight: 800; line-height: 1; }
.score-label { font-size: 0.6rem; font-family: monospace; letter-spacing: 0.1em; color: var(--text-muted); margin-top: 2px; }

.score-excellent { border-color: var(--accent-emerald); color: var(--accent-emerald); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
.score-good { border-color: var(--accent-blue); color: var(--accent-blue); }
.score-average { border-color: #F59E0B; color: #F59E0B; }

.suggested-role { text-align: center; display: flex; flex-direction: column; gap: 4px; }
.role-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; }
.role-value { font-size: 0.75rem; font-weight: 700; color: #E5E7EB; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; text-align: center;}

/* Info Column */
.info-column { display: flex; flex-direction: column; gap: 12px; }
.task-meta { display: flex; gap: 12px; font-size: 0.75rem; font-family: monospace; }
.doc-tag { color: #9CA3AF; }
.model-tag { color: var(--accent-purple); background: rgba(139, 92, 246, 0.1); padding: 2px 8px; border-radius: 4px; }

.intent-title { font-size: 1.1rem; font-weight: 600; margin: 0; line-height: 1.4; color: #F3F4F6; }

.pillars-breakdown { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 8px; }
.pillar { display: flex; flex-direction: column; gap: 6px; }
.pillar-header { display: flex; justify-content: space-between; font-size: 0.7rem; font-family: monospace; color: #D1D5DB; }
.progress-bg { height: 6px; background-color: #1F2937; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; }
.bg-purple { background-color: var(--accent-purple); }
.bg-emerald { background-color: var(--accent-emerald); }
.bg-blue { background-color: var(--accent-blue); }

.sop-box { background-color: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-top: 8px; }
.sop-label { font-size: 0.7rem; font-family: monospace; text-transform: uppercase; color: var(--accent-emerald); font-weight: 700; }
.sop-box ul { margin: 6px 0 0 0; padding-left: 20px; font-size: 0.85rem; color: #D1D5DB; }
.sop-missing { font-size: 0.8rem; color: #FCA5A5; background: rgba(239, 68, 68, 0.1); padding: 8px 12px; border-radius: 6px; margin-top: 8px; border: 1px solid rgba(239, 68, 68, 0.2); }

/* Action Column */
.action-column { display: flex; flex-direction: column; justify-content: flex-start; gap: 12px; border-left: 1px solid var(--border-color); padding-left: 1.5rem; }
.btn-approve { background: var(--accent-emerald); color: #000; border: none; padding: 10px 14px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
.btn-approve:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
.btn-approve:disabled { background: #374151; color: #9CA3AF; cursor: not-allowed; }
.btn-discard { background: transparent; color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px; border-radius: 8px; font-weight: 600; font-size: 0.8rem; cursor: pointer; }
.btn-discard:hover { background: rgba(239, 68, 68, 0.1); }
.empty-state { padding: 3rem; text-align: center; color: var(--text-muted); font-family: monospace; border: 1px dashed var(--border-color); border-radius: 12px; }

/* Transitions */
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(30px); }

.btn-edit-sop {
    background: transparent; border: 1px solid var(--border-color);
    color: var(--text-muted); font-size: 0.65rem; padding: 2px 8px;
    border-radius: 4px; cursor: pointer; font-family: monospace;
}
.btn-edit-sop:hover { border-color: var(--accent-emerald); color: var(--accent-emerald); }

.sop-textarea {
    width: 100%; background: #000; border: 1px solid #374151;
    color: #fff; padding: 6px; font-size: 0.8rem; margin-top: 4px;
    border-radius: 4px; font-family: system-ui, sans-serif; resize: vertical;
}

@media (max-width: 1024px) {
    .task-card { grid-template-columns: 1fr; gap: 1rem; }
    .score-column, .action-column { border: none; padding: 0; flex-direction: row; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
    .action-column { border-bottom: none; border-top: 1px solid var(--border-color); padding-top: 1rem; }
    .golden-score-circle { width: 60px; height: 60px; }
    .score-number { font-size: 1.5rem; }
    .pillars-breakdown { grid-template-columns: 1fr; }
    .header-right { flex-direction: column; align-items: flex-start; gap: 12px;}
}
</style>
<template>
<AppNavbar />
    <div class="orchestrator-wrapper custom-scrollbar">
        <div class="main-content">
            
            <header class="page-header-compact">
                <div class="header-left">
                    <span class="gatekeeper-tag">
                        <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        EDDPS Semantic Gatekeeper
                    </span>
                    <h2>E-surf <span class="text-gradient">Orchestrator Hub</span></h2>
                    <p class="subtitle">Routing intelligente delle opportunità di rete e asset energetici</p>
                </div>
                <div class="header-right no-print">
                    <div class="status-panel">
                        <span class="status-label">Stato Servizio</span>
                        <span v-if="loading" class="status-value warning">
                            <svg class="spinner icon-sm" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Sincronizzazione...
                        </span>
                        <span v-else class="status-value success">
                            <span class="pulse-dot"></span> Live Sync ON
                        </span>
                    </div>
                </div>
            </header>

            <div v-if="error" class="alert-error no-print">
                Errore Gatekeeper: {{ error }}
            </div>
            
            <div v-else-if="!loading && opportunities.length === 0" class="empty-state glass-card no-print">
                La rete è in ascolto. Nessun flusso nel perimetro.
            </div>

            <main v-else class="accordion-container">
                <div v-for="doc in opportunities" :key="doc._id" class="accordion-item print-avoid-break" :class="{ 'is-open': openChannels.includes(doc._id) }">
                    <div class="accordion-accent-line no-print" :class="getStatusBorderClass(doc.status)"></div>
                    
                    <div class="accordion-header" @click="toggleChannel(doc._id)">
                        <div class="header-main-info">
                            <div class="title-row">
                                <span class="status-badge" :class="getStatusClass(doc.status)">
                                    {{ getStatusText(doc.status) }}
                                </span>

                                <span class="date-tag">{{ formatDate(doc.event_date || doc.processing_date) }}</span>
                                
                                <div class="doc-source-tag" v-if="doc.analyzed_document_title">
                                    <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                    {{ doc.analyzed_document_title }}
                                </div>

                                <div class="org-tags-container">
                                    <template v-if="doc.crm_lead_enrichment?.organizations && doc.crm_lead_enrichment.organizations.length > 0">
                                        <h3 v-for="(org, oIdx) in doc.crm_lead_enrichment.organizations" :key="'org-'+oIdx" class="org-name-chip">
                                            {{ org.organization_name }}
                                        </h3>
                                    </template>
                                    <h3 v-else class="org-name-chip">N/A</h3>
                                </div>

                                <span class="website-tag" v-if="getFirstWebsite(doc)">{{ getFirstWebsite(doc) }}</span>
                            </div>
                            <p class="reasoning-text">{{ doc.reasoning }}</p>
                        </div>
                        
                        <div class="header-actions">
                            <div class="node-count">
                                <span class="node-label">Nodi Elaborati</span>
                                <span class="node-value">{{ (doc.opportunity_intents?.length || 0) + (doc.partner_collaborations?.length || 0) }}</span>
                            </div>
                            <div class="chevron-box no-print" :class="{ 'rotate': openChannels.includes(doc._id) }">
                                <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <transition name="accordion-slide">
                        <div v-show="openChannels.includes(doc._id)" class="accordion-body force-print-block">
                            
                            <div v-if="doc.crm_lead_enrichment?.key_contacts?.length" class="section-block print-avoid-break">
                                <h4 class="section-title title-blue">
                                    <svg class="icon-sm no-print" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    Dati CRM & Contatti Rilevati
                                </h4>
                                <div class="grid-list-2">
                                    <div v-for="(contact, idx) in doc.crm_lead_enrichment.key_contacts" :key="'contact-'+idx" class="contact-card print-border">
                                        <div class="contact-header">
                                            <div>
                                                <h5 class="contact-name" :class="{'text-muted-italic': contact.name === 'Nome non rilevato'}">{{ contact.name }}</h5>
                                                <span class="contact-role">{{ contact.role_or_title }}</span>
                                                <div v-if="contact.associated_organization" class="associated-org">@ {{ contact.associated_organization }}</div>
                                            </div>
                                            <span class="relation-badge">{{ contact.relation_type }}</span>
                                        </div>
                                        <p v-if="contact.context_notes" class="contact-notes">{{ contact.context_notes }}</p>
                                    </div>
                                </div>
                            </div>

                            <div v-if="doc.entities_extracted && (doc.entities_extracted.client_or_context || doc.entities_extracted.key_technologies_mentioned?.length)" class="section-block mt-custom print-avoid-break">
                                <h4 class="section-title title-purple">
                                    <svg class="icon-sm no-print" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                    Entità Estrapolate & Tecnologie
                                </h4>
                                <div class="entities-card print-border">
                                    <div class="entity-row" v-if="doc.entities_extracted.client_or_context">
                                        <span class="entity-label">Contesto / Bando / Riferimento:</span>
                                        <span class="entity-value">{{ doc.entities_extracted.client_or_context }}</span>
                                    </div>
                                    <div class="entity-row" v-if="doc.entities_extracted.key_technologies_mentioned?.length">
                                        <span class="entity-label">Tecnologies Chiave Menzionate:</span>
                                        <div class="tech-chips">
                                            <span v-for="(tech, i) in doc.entities_extracted.key_technologies_mentioned" :key="'tech-'+i" class="tech-chip">
                                                {{ tech }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-if="doc.opportunity_intents?.length" class="section-block mt-custom print-avoid-break">
                                <h4 class="section-title title-emerald">
                                    <svg class="icon-sm no-print" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                                    Assegnazione AI & Flussi Core
                                </h4>
                                <div class="grid-list">
                                    <div v-for="(intent, index) in doc.opportunity_intents" :key="'intent-'+index" 
                                         class="intent-card print-border" :class="{ 'high-weight': intent.weight >= 0.8 }">
                                        

                                        
                                        <div class="intent-info">
                                        
                                            <div class="intent-header">
                                                <span class="weight-badge" :class="intent.weight >= 0.8 ? 'bg-emerald' : 'bg-muted'">
                                                    W: {{ Number(intent.weight).toFixed(2) }}
                                                </span>
                                                <h5 class="intent-title">{{ intent.intent }}</h5>
                                            </div>
                                            <p class="intent-motivation">{{ intent.weight_motivation }}</p>


                                        <div v-if="intent.weight >= 0.8" class="asana-interactive-block print-clean">
                                            
                                            <template v-if="intent.asana_status !== 'ASSIGNED'">
                                                <div class="assignment-controls no-print">
                                                    <span class="asana-label">Routing & Assegnazione</span>
                                                    <select v-model="selectedRoles[`intent_${doc._id}_${index}`]" class="role-select">
                                                        <option value="" disabled selected>Seleziona Ruolo Operativo...</option>
                                                        <option v-for="role in ORG_ROLES" :key="role.role_id" :value="role.role_id">
                                                            [{{ role.role_id }}] {{ role.role_name }}
                                                        </option>
                                                    </select>
                                                </div>
                                                <button 
                                                    @click="pushToAsana(doc, intent, 'intent', selectedRoles[`intent_${doc._id}_${index}`], `intent_${doc._id}_${index}`)"
                                                    :disabled="!selectedRoles[`intent_${doc._id}_${index}`] || pushStatus[`intent_${doc._id}_${index}`] === 'loading'"
                                                    class="btn-asana-push no-print">
                                                    <span v-if="pushStatus[`intent_${doc._id}_${index}`] === 'loading'">
                                                        <svg class="spinner icon-sm" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    </span>
                                                    <span v-else>Push Asana</span>
                                                </button>
                                                <span class="print-only-text"><em>Da assegnare</em></span>
                                            </template>

                                            <template v-else>
                                                <div class="assigned-state-container print-clean">
                                                    <div class="assigned-details flex-1">
                                                        <span class="asana-label no-print">Stato Task</span>
                                                        <span class="role-assigned text-emerald-400">✓ {{ getRoleName(intent.asana_role) }}</span>
                                                        <span v-if="intent.asana_task_id" class="task-id">ID: {{ intent.asana_task_id }}</span>
                                                    </div>
                                                    <button 
                                                        @click="unassignAsanaTask(doc, intent, 'intent', `intent_${doc._id}_${index}`)" 
                                                        class="btn-asana-remove no-print" 
                                                        :disabled="unassignStatus[`intent_${doc._id}_${index}`] === 'loading'"
                                                        title="Revoca assegnazione e rimuovi da Asana">
                                                        <span v-if="unassignStatus[`intent_${doc._id}_${index}`] === 'loading'">
                                                            <svg class="spinner icon-sm" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        </span>
                                                        <span v-else>
                                                            <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        </span>
                                                    </button>
                                                </div>
                                            </template>

                                        </div>
                                        <div v-else class="asana-block discarded-block">
                                            <span class="discarded-badge">Scartato (W &lt; 0.8)</span>
                                        </div>

                                            
                                            <div v-if="intent.associated_business_models?.length" class="associated-models-box">
                                                <span class="framework-label">💼 Modelli Business Mappati:</span>
                                                <div class="model-chips">
                                                    <span v-for="(bm, bmIdx) in intent.associated_business_models" :key="'bm-'+bmIdx" class="model-chip" :title="bm.categoria_titolo">
                                                        <span class="model-code">[{{ bm.categoria_codice }}.{{ bm.modello_codice }}]</span> {{ bm.modello_titolo }}
                                                    </span>
                                                </div>
                                            </div>

                                            <div class="intent-execution-framework">
                                                
                                                <div class="sop-header-edit mb-2">
                                                    <span class="framework-label">⚙️ Setup Esecutivo</span>
                                                    <button @click="toggleEditSOP(doc._id, index, intent)" class="btn-edit-sop no-print">
                                                        {{ editingSOPs[`${doc._id}_intent_${index}`] ? '💾 Salva Setup' : '✏️ Modifica Dettagli' }}
                                                    </button>
                                                </div>

                                                <div class="framework-objective" v-if="intent.objective">
                                                    <span class="framework-label">🎯 Obiettivo Strategico:</span>
                                                    <p class="framework-value">{{ intent.objective }}</p>
                                                </div>

                                                <div class="framework-context mt-3" v-if="!editingSOPs[`${doc._id}_intent_${index}`] && (intent.target || intent.note)">
                                                    <div v-if="intent.target" class="mb-2 flex align-center">
                                                        <span class="framework-label">🎯 Mercato Target:</span>
                                                        <span class="target-badge ml-2">{{ intent.target }}</span>
                                                    </div>
                                                    <div v-if="intent.note" class="mb-2">
                                                        <span class="framework-label">📝 Note Operative:</span>
                                                        <div class="framework-value markdown-content" v-html="renderMarkdown(intent.note)"></div>
                                                    </div>
                                                </div>

                                                <div class="framework-context-edit mt-3" v-if="editingSOPs[`${doc._id}_intent_${index}`]">
                                                    <div class="edit-group mb-2">
                                                        <span class="framework-label">🎯 Mercato Target:</span>
                                                        <select v-model="intent.target" class="sop-select mt-1">
                                                            <option value="General">General (Default)</option>
                                                            <option value="Residenziale">Residenziale</option>
                                                            <option value="PMI">PMI</option>
                                                            <option value="Altro">Altro</option>
                                                        </select>
                                                    </div>
                                                    <div class="edit-group mb-3">
                                                        <span class="framework-label">📝 Note Operative (Supporta Markdown: **grassetto**, - lista):</span>
                                                        <textarea v-model="intent.note" class="sop-textarea-note custom-scrollbar" placeholder="Es. **Attenzione:** Verificare i requisiti..."></textarea>
                                                    </div>
                                                </div>
                                                
                                                <div class="framework-workflow mt-2" v-if="intent.action_flow && intent.action_flow.length > 0">
                                                    <span class="framework-label">📋 Action Flow (SOP):</span>
                                                    
                                                    <ul class="sop-list mt-1" v-if="!editingSOPs[`${doc._id}_intent_${index}`]">
                                                        <li v-for="(step, sIdx) in intent.action_flow" :key="'step-'+sIdx" class="sop-step">
                                                            {{ step }}
                                                        </li>
                                                    </ul>
                                                    
                                                    <div v-else class="sop-edit-area mt-1">
                                                        <textarea v-for="(step, sIdx) in intent.action_flow" :key="'edit-'+sIdx" 
                                                                v-model="intent.action_flow[sIdx]" class="sop-textarea custom-scrollbar"></textarea>
                                                    </div>
                                                </div>
                                            </div>



                                                                                </div>
                                    </div>
                                </div>
                            </div>

                            <div v-if="doc.partner_collaborations?.length" class="section-block mt-custom print-avoid-break">
                                <h4 class="section-title title-indigo">
                                    <svg class="icon-sm no-print" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    Assegnazioni & Workflow Partner
                                </h4>
                                <div class="grid-list-2">
                                    <div v-for="(collab, index) in doc.partner_collaborations" :key="'collab-'+index" class="collab-card print-border">
                                        <div class="collab-info">
                                            <div class="collab-header">
                                                <span class="partner-title">Partner Esterno</span>
                                                <span class="partner-badge">{{ collab.assigned_partner || collab.workflow_control?.assigned_partner || 'N/A' }}</span>
                                            </div>
                                            <p class="collab-desc">{{ collab.activity_description }}</p>
                                        </div>
                                        
                                        <div class="collab-footer">
                                            <div class="strategic-block full-width mb-3">
                                                <span class="strategic-label">Valore Strategico</span>
                                                <span class="strategic-value">{{ collab.strategic_value }}</span>
                                            </div>
                                            
                                            <div v-if="collab.asana_status !== 'ASSIGNED'" class="assignment-controls-row no-print">
                                                <select v-model="selectedRoles[`collab_${doc._id}_${index}`]" class="role-select flex-1 mr-2">
                                                    <option value="" disabled selected>Assegna Delega...</option>
                                                    <option v-for="role in ORG_ROLES" :key="role.role_id" :value="role.role_id">
                                                        [{{ role.role_id }}] {{ role.role_name }}
                                                    </option>
                                                </select>
                                                <button 
                                                    @click="pushToAsana(doc, collab, 'collab', selectedRoles[`collab_${doc._id}_${index}`], `collab_${doc._id}_${index}`)"
                                                    :disabled="!selectedRoles[`collab_${doc._id}_${index}`] || pushStatus[`collab_${doc._id}_${index}`] === 'loading'"
                                                    class="btn-asana-push">
                                                    <span v-if="pushStatus[`collab_${doc._id}_${index}`] === 'loading'">Pushing...</span>
                                                    <span v-else>Push Asana</span>
                                                </button>
                                            </div>
                                            <span class="print-only-text" v-if="collab.asana_status !== 'ASSIGNED'"><em>Da assegnare</em></span>

                                            <div v-else class="assigned-state-container-collab print-clean">
                                                <div class="assigned-details">
                                                    <span class="role-assigned text-indigo-400">✓ {{ getRoleName(collab.asana_role) }}</span>
                                                    <span v-if="collab.asana_task_id" class="task-id">ID: {{ collab.asana_task_id }}</span>
                                                </div>
                                                <button 
                                                    @click="unassignAsanaTask(doc, collab, 'collab', `collab_${doc._id}_${index}`)" 
                                                    class="btn-asana-remove ml-auto no-print"
                                                    :disabled="unassignStatus[`collab_${doc._id}_${index}`] === 'loading'">
                                                    <span v-if="unassignStatus[`collab_${doc._id}_${index}`] === 'loading'">...</span>
                                                    <span v-else>
                                                        <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </transition>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/axios.js'; 
import AppNavbar from '@/components/eddpsNavBar.vue';

const opportunities = ref([]);
const loading = ref(true);
const error = ref(null);
const openChannels = ref([]); 

const selectedRoles = ref({});
const pushStatus = ref({});
const unassignStatus = ref({}); 

// --- STATO EDITING SETUP ESECUTIVO ---
const editingSOPs = ref({}); 

// Funzione Custom per parsare il Markdown senza librerie esterne
const renderMarkdown = (text) => {
    if (!text) return '';
    
    let html = text
        // 1. Escapa i tag HTML base per sicurezza
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        // 2. Grassetto (**testo**)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // 3. Corsivo (*testo* o _testo_)
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // 4. Liste puntate (trattino all'inizio della riga)
        .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
        // 5. Avvolgi i gruppi di <li> in un <ul>
        .replace(/(<li>.*<\/li>(\n<li>.*<\/li>)*)/g, '<ul class="md-list">$1</ul>')
        // 6. Vai a capo: converti i newline in <br> (evitando di rompere le liste)
        .replace(/\n(?!\s*<)/g, '<br>');
        
    return html;
};

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

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('it-IT', { month: 'long' });
    const year = date.getFullYear();
    
    return `${day}, ${month} ${year}`;
};

const getStatusText = (status) => {
    if (!status) return 'STATUS UNKNOWN';
    if (typeof status === 'string') return status.replace(/_/g, ' ');
    return 'STATUS UNKNOWN';
};

const getStatusClass = (status) => {
    if (!status || typeof status !== 'string') return 'bg-muted';
    const s = status.toUpperCase();
    if (s === 'IN_PERIMETER') return 'status-in';
    if (s === 'OUT_OF_PERIMETER') return 'status-out';
    if (s === 'AMBIGUOUS') return 'status-amb';
    return 'bg-muted';
};

const getStatusBorderClass = (status) => {
    if (!status || typeof status !== 'string') return '';
    const s = status.toUpperCase();
    if (s === 'OUT_OF_PERIMETER') return 'border-out';
    if (s === 'AMBIGUOUS') return 'border-amb';
    return ''; 
};

const getFirstWebsite = (doc) => {
    if (doc.crm_lead_enrichment?.organizations && Array.isArray(doc.crm_lead_enrichment.organizations)) {
        const orgWithWeb = doc.crm_lead_enrichment.organizations.find(org => org.website_or_references && org.website_or_references !== "N/A");
        return orgWithWeb ? orgWithWeb.website_or_references : null;
    }
    return null;
};

const getPrimaryOrgName = (doc) => {
    if (doc.crm_lead_enrichment?.organizations && doc.crm_lead_enrichment.organizations.length > 0) {
        return doc.crm_lead_enrichment.organizations[0].organization_name;
    }
    return 'Opportunità Generica';
};

const toggleChannel = (docId) => {
    const index = openChannels.value.indexOf(docId);
    if (index === -1) {
        openChannels.value.push(docId); 
    } else {
        openChannels.value.splice(index, 1); 
    }
};

// === LOGICA EDITING SETUP ESECUTIVO ===
const toggleEditSOP = (docId, index, intent) => {
    const uniqueKey = `${docId}_intent_${index}`;
    if (editingSOPs.value[uniqueKey]) {
        saveSOP(uniqueKey, intent);
    }
    editingSOPs.value[uniqueKey] = !editingSOPs.value[uniqueKey];
};

const saveSOP = async (uniqueKey, intent) => {
    try {
        if (!intent.target) intent.target = 'General';

        await apiClient.post(`/api/eddps/dss/update-flow/${uniqueKey}`, {
            action_flow: intent.action_flow,
            note: intent.note || '',
            target: intent.target
        });
        console.log("✅ Setup esecutivo aggiornato con successo in MongoDB:", uniqueKey);
    } catch (err) {
        console.error("❌ Errore salvataggio setup esecutivo", err);
        alert("Errore di rete durante il salvataggio dei dettagli.");
    }
};

const pushToAsana = async (doc, item, type, roleId, uniqueKey) => {
    pushStatus.value[uniqueKey] = 'loading';

    const parts = uniqueKey.split('_');
    const itemIndex = parseInt(parts[parts.length - 1], 10);

    try {
        let compiledDescription = type === 'intent' ? item.intent : item.activity_description;
        
        if (type === 'intent') {
            if (item.target) {
                compiledDescription += `\n\n🎯 MERCATO TARGET:\n${item.target}`;
            }
            if (item.note) {
                compiledDescription += `\n\n📝 NOTE OPERATIVE:\n${item.note}`;
            }
            if (item.associated_business_models?.length) {
                compiledDescription += `\n\n💼 MODELLI DI BUSINESS MAPPATI:\n` + item.associated_business_models.map(bm => `- [${bm.categoria_codice}.${bm.modello_codice}] ${bm.modello_titolo} (${bm.categoria_titolo})`).join('\n');
            }
            if (item.objective) {
                compiledDescription += `\n\n🎯 OBIETTIVO STRATEGICO:\n${item.objective}`;
            }
            if (item.action_flow && item.action_flow.length > 0) {
                compiledDescription += `\n\n📋 WORKFLOW AZIONI VALIDATO (SOP):\n` + item.action_flow.map(step => `- ${step}`).join('\n');
            }
        }

        const payload = {
            title: `[${roleId}] Opportunità: ${getPrimaryOrgName(doc)}`,
            description: compiledDescription,
            role_assigned: roleId,
            destination_board: "BACKLOG", 
            source_document: doc.analyzed_document_title || 'N/A',
            doc_id: doc._id,
            item_type: type,
            item_index: itemIndex
        };

        const response = await apiClient.post('/api/eddps/asana-task', payload);

        item.asana_status = 'ASSIGNED';
        item.asana_role = roleId;
        item.asana_task_id = response.data.task_gid; 

    } catch (err) {
        console.error("❌ [ASANA PUSH ERRORE] Impossibile creare il task:", err);
    } finally {
        pushStatus.value[uniqueKey] = null;
    }
};

const unassignAsanaTask = async (doc, item, type, uniqueKey) => {
    unassignStatus.value[uniqueKey] = 'loading';

    const parts = uniqueKey.split('_');
    const itemIndex = parseInt(parts[parts.length - 1], 10);

    const payload = {
        task_gid: String(item.asana_task_id || ''), 
        doc_id: String(doc._id || ''),              
        item_type: type,                            
        item_index: itemIndex                       
    };

    try {
        if (!payload.task_gid) {
            throw new Error("ID del Task Asana mancante. Impossibile revocare.");
        }

        await apiClient.post('/api/eddps/asana-task/remove', payload);

        item.asana_status = null;
        item.asana_role = null;
        item.asana_task_id = null;
        selectedRoles.value[uniqueKey] = ""; 

    } catch (err) {
        console.error("❌ [ASANA UNASSIGN ERRORE] Impossibile revocare il task:", err);
        alert("Errore durante la rimozione del task su Asana.");
    } finally {
        unassignStatus.value[uniqueKey] = null;
    }
};

onMounted(async () => {
    try {
        const response = await apiClient.get('/api/eddps/opportunities');
        let data = response.data?.data || [];
        
        data.sort((a, b) => {
            const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
            const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
            return dateB - dateA; 
        });
        
        opportunities.value = data;

        opportunities.value.forEach(doc => {
            if (doc.opportunity_intents) {
                doc.opportunity_intents.forEach((intent, i) => {
                    if (intent.asana_status === 'ASSIGNED') {
                        selectedRoles.value[`intent_${doc._id}_${i}`] = intent.asana_role;
                    }
                });
            }
            if (doc.partner_collaborations) {
                doc.partner_collaborations.forEach((collab, i) => {
                    if (collab.asana_status === 'ASSIGNED') {
                        selectedRoles.value[`collab_${doc._id}_${i}`] = collab.asana_role;
                    }
                });
            }
        });

    } catch (err) {
        error.value = err.message || "Impossibile recuperare i dati dal server.";
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
/* ==========================================================================
   VARIABILI CSS E IMPOSTAZIONI BASE
   ========================================================================== */
.orchestrator-wrapper {
    --bg-dark: #06090F;
    --bg-card: #0B101A;
    --bg-body: #080C14;
    --bg-panel: #111827;
    --border-color: #1f2937;
    --text-main: #F3F4F6;
    --text-muted: #9CA3AF;
    --accent-emerald: #10B981;
    --accent-emerald-light: rgba(16, 185, 129, 0.3);
    --accent-blue: #3B82F6;
    --accent-indigo: #818cf8;
    --accent-indigo-bg: rgba(49, 46, 129, 0.3);
    --accent-indigo-border: rgba(99, 102, 241, 0.2);
    
    background-color: var(--bg-dark);
    color: var(--text-main);
    min-height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
    padding: 1.5rem;
    box-sizing: border-box;
}

.main-content {
    max-width: 1152px;
    margin: 0 auto;
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: var(--bg-panel); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }

.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }

.print-only-text {
    display: none;
}

/* ==========================================================================
   HEADER & ACCORDION
   ========================================================================== */
.page-header-compact {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1.5rem;
    margin-bottom: 2.5rem;
}

.gatekeeper-tag {
    font-family: monospace;
    font-size: 0.75rem;
    color: var(--accent-emerald);
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

/* Stili Markdown Custom */
.markdown-content { font-size: 0.85rem; color: #E5E7EB; margin-top: 4px; line-height: 1.5; }
.markdown-content :deep(strong) { font-weight: 700; color: #fff; background: rgba(255, 255, 255, 0.05); padding: 0 4px; border-radius: 3px; }
.markdown-content :deep(em) { font-style: italic; color: var(--accent-emerald); }
.markdown-content :deep(.md-list) { list-style-type: disc; padding-left: 20px; margin: 6px 0; }
.markdown-content :deep(li) { margin-bottom: 4px; }

.status-panel {
    background-color: #111827;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.status-label {
    font-size: 0.625rem;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
}

.status-value {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    margin-top: 4px;
}

.status-value.warning { color: #FBBF24; }
.status-value.success { color: #34D399; }

.pulse-dot {
    width: 6px;
    height: 6px;
    background-color: #10B981;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.alert-error {
    background-color: rgba(127, 29, 29, 0.3);
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: #F87171;
    padding: 1rem;
    border-radius: 12px;
    font-family: monospace;
    font-size: 0.875rem;
}

.empty-state {
    padding: 3rem;
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    text-align: center;
    border-radius: 16px;
    font-family: monospace;
    font-size: 0.875rem;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.accordion-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.accordion-item {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    position: relative;
    overflow: hidden;
}

.accordion-accent-line {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom, var(--accent-emerald), transparent);
}
.accordion-accent-line.border-out { background: linear-gradient(to bottom, #EF4444, transparent); }
.accordion-accent-line.border-amb { background: linear-gradient(to bottom, #F59E0B, transparent); }

.accordion-header {
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s;
}

.accordion-header:hover {
    background-color: rgba(255, 255, 255, 0.02);
}

.header-main-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

.status-badge {
    font-size: 0.65rem;
    font-family: monospace;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 700;
    text-transform: uppercase;
}
.status-in { background-color: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); }
.status-out { background-color: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3); }
.status-amb { background-color: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3); }

.doc-source-tag {
    font-size: 0.75rem;
    color: #9CA3AF;
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: rgba(255, 255, 255, 0.05);
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
}

.org-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.org-name-chip {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f3f4f6;
    margin: 0;
    letter-spacing: -0.025em;
    background-color: rgba(59, 130, 246, 0.1);
    padding: 4px 12px;
    border-radius: 8px;
    border: 1px solid rgba(59, 130, 246, 0.2);
}

.website-tag, .date-tag {
    font-size: 0.75rem;
    background-color: #1F2937;
    color: #D1D5DB;
    padding: 4px 10px;
    border-radius: 6px;
    font-family: monospace;
    border: 1px solid #374151;
}
.date-tag {
    background-color: rgba(59, 130, 246, 0.1);
    color: #93C5FD;
    border-color: rgba(59, 130, 246, 0.3);
}

.reasoning-text {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin: 0;
    max-width: 48rem;
    line-height: 1.6;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.node-count {
    display: flex;
    flex-direction: column;
    text-align: right;
}

.node-label {
    font-size: 0.625rem;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.1em;
}

.node-value {
    font-size: 1.5rem;
    font-weight: 700;
    font-family: monospace;
    color: #ffffff;
}

.chevron-box {
    padding: 8px;
    background-color: #1F2937;
    border-radius: 50%;
    color: #D1D5DB;
    transition: transform 0.3s ease, background-color 0.3s;
}

.chevron-box.rotate {
    transform: rotate(180deg);
    background-color: #374151;
}

.accordion-body {
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-body);
    padding: 2rem;
}

.accordion-slide-enter-active, .accordion-slide-leave-active {
    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
    max-height: 1500px;
    overflow: hidden;
    opacity: 1;
}
.accordion-slide-enter-from, .accordion-slide-leave-to {
    max-height: 0;
    opacity: 0;
}

.section-block { margin-bottom: 2rem; }
.mt-custom { margin-top: 2rem; }

.section-title {
    font-size: 0.75rem;
    font-family: monospace;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1.25rem;
}
.title-emerald { color: var(--accent-emerald); }
.title-indigo { color: var(--accent-indigo); }
.title-blue { color: #60A5FA; }
.title-purple { color: #A78BFA; }

.grid-list { display: grid; grid-template-columns: 1fr; gap: 1rem; }
.grid-list-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

/* ==========================================================================
   STRUTTURE DI DETTAGLIO CONTATTI ED ENTITÀ
   ========================================================================== */
.contact-card {
    background-color: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.15);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.contact-header { display: flex; justify-content: space-between; align-items: flex-start; }
.contact-name { font-size: 0.875rem; font-weight: 700; color: #DBEAFE; margin: 0 0 2px 0; }
.text-muted-italic { color: #9CA3AF; font-style: italic; font-weight: 400; }
.contact-role { font-size: 0.75rem; color: #9CA3AF; display: block; }
.associated-org { font-size: 0.65rem; font-family: monospace; color: #60A5FA; margin-top: 4px; background-color: rgba(59, 130, 246, 0.1); display: inline-block; padding: 2px 6px; border-radius: 4px; }
.relation-badge { font-size: 0.625rem; font-family: monospace; background-color: rgba(59, 130, 246, 0.15); color: #93C5FD; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.25); text-transform: uppercase; }
.contact-notes { font-size: 0.75rem; color: #D1D5DB; margin: 0; font-style: italic; border-left: 2px solid rgba(59, 130, 246, 0.3); padding-left: 8px; }

.entities-card {
    background-color: rgba(139, 92, 246, 0.05);
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.entity-row { display: flex; flex-direction: column; gap: 6px; }
.entity-label { font-size: 0.625rem; font-family: monospace; text-transform: uppercase; font-weight: 700; color: #C4B5FD; }
.entity-value { font-size: 0.875rem; color: #EDE9FE; font-weight: 500; }
.tech-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.tech-chip { font-size: 0.7rem; font-family: monospace; background-color: rgba(139, 92, 246, 0.15); color: #DDD6FE; padding: 4px 10px; border-radius: 9999px; border: 1px solid rgba(139, 92, 246, 0.25); }

/* ==========================================================================
   CARDS INTENTI CON DATI STRUTTURATI
   ========================================================================== */
.intent-card {
    background-color: var(--bg-panel);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    position: relative;
    overflow: hidden;
}

.intent-card.high-weight { border-color: var(--accent-emerald-light); }

.intent-info { flex: 1; display: flex; flex-direction: column; gap: 12px; }
.intent-header { display: flex; align-items: center; gap: 12px; }

.weight-badge { padding: 2px 8px; font-size: 0.625rem; font-family: monospace; font-weight: 700; border-radius: 4px; }
.bg-emerald { background-color: var(--accent-emerald); color: #000; }
.bg-muted { background-color: #374151; color: #D1D5DB; }

.intent-title { font-size: 1rem; font-weight: 600; color: #E5E7EB; margin: 0; }
.intent-motivation { font-size: 0.8rem; color: var(--text-muted); font-family: monospace; margin: 0; padding-left: 8px; border-left: 2px solid #374151; }

.associated-models-box { display: flex; flex-direction: column; gap: 6px; margin-top: 2px; }
.model-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.model-chip { font-size: 0.725rem; background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); color: #A7F3D0; padding: 4px 10px; border-radius: 6px; font-weight: 500; }
.model-code { font-family: monospace; font-weight: 700; color: var(--accent-emerald); margin-right: 2px; }

/* Layout Framework Strategico & SOP Editing */
.intent-execution-framework {
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.framework-label { font-size: 0.675rem; font-family: monospace; text-transform: uppercase; color: #a7f3d0; font-weight: 700; letter-spacing: 0.05em; }
.framework-value { font-size: 0.85rem; color: #E5E7EB; margin: 4px 0 0 0; font-weight: 500; }

.sop-header-edit { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.btn-edit-sop {
    background: transparent; border: 1px solid var(--border-color);
    color: var(--text-muted); font-size: 0.65rem; padding: 4px 8px;
    border-radius: 4px; cursor: pointer; font-family: monospace;
    transition: all 0.2s;
}
.btn-edit-sop:hover { border-color: var(--accent-emerald); color: var(--accent-emerald); background: rgba(16, 185, 129, 0.05); }

.sop-list { list-style: none; padding: 0; margin: 6px 0 0 0; display: flex; flex-direction: column; gap: 6px; }
.sop-step { font-size: 0.8rem; color: #D1D5DB; padding-left: 18px; position: relative; font-family: system-ui, -apple-system, sans-serif; }
.sop-step::before { content: "→"; position: absolute; left: 2px; color: var(--accent-emerald); font-weight: bold; }

.sop-edit-area { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.sop-textarea {
    width: 100%; background: rgba(0,0,0,0.3); border: 1px solid #374151;
    color: #D1D5DB; padding: 8px; font-size: 0.8rem;
    border-radius: 6px; font-family: system-ui, -apple-system, sans-serif; 
    resize: vertical; min-height: 40px;
}
.sop-textarea-note {
    width: 100%; background: rgba(0,0,0,0.3); border: 1px solid #374151;
    color: #D1D5DB; padding: 8px; font-size: 0.8rem;
    border-radius: 6px; font-family: system-ui, -apple-system, sans-serif; 
    resize: vertical; min-height: 200px;
}
.sop-textarea:focus { outline: none; border-color: var(--accent-blue); }

.target-badge {
    font-family: monospace; font-size: 0.7rem; font-weight: 700;
    background-color: rgba(59, 130, 246, 0.15); color: #93C5FD;
    padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.3);
}

.sop-select {
    width: 100%; background: rgba(0,0,0,0.3); border: 1px solid #374151;
    color: #D1D5DB; padding: 6px 8px; font-size: 0.8rem;
    border-radius: 6px; font-family: system-ui, -apple-system, sans-serif;
}
.sop-select:focus { outline: none; border-color: var(--accent-blue); }

.ml-2 { margin-left: 8px; }
.mb-2 { margin-bottom: 8px; }
.flex { display: flex; }
.align-center { align-items: center; }

/* Sezione interattiva Asana */
.asana-interactive-block {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    padding: 12px;
    background-color: rgba(0,0,0,0.4);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    min-width: 35%;
    max-height: fit-content;
}

.assignment-controls { display: flex; flex-direction: column; flex: 1; }
.assigned-state-container { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 12px; }
.assigned-details { display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
.role-assigned { font-size: 0.75rem; font-weight: 700; }
.task-id { font-size: 0.65rem; font-family: monospace; color: var(--text-muted); margin-top: 2px; }

.full-width { width: 100%; }
.mb-3 { margin-bottom: 12px; }

.asana-label { font-size: 0.625rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }

.role-select {
    background-color: var(--bg-body);
    color: var(--text-main);
    border: 1px solid #374151;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-family: monospace;
    outline: none;
    width: 100%;
    cursor: pointer;
}
.role-select:focus { border-color: var(--accent-blue); }

.btn-asana-push {
    background-color: #F06A6A; 
    color: white;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 34px;
}
.btn-asana-push:disabled { background-color: #374151; color: #9CA3AF; cursor: not-allowed; }

.btn-asana-remove {
    background-color: rgba(239, 68, 68, 0.1);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
}

/* Card Collaborazione Partner */
.collab-card {
    background-color: var(--accent-indigo-bg);
    border: 1px solid var(--accent-indigo-border);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
}
.collab-info { display: flex; flex-direction: column; gap: 8px; }
.collab-header { display: flex; justify-content: space-between; align-items: flex-start; }
.partner-title { font-size: 0.75rem; font-family: monospace; font-weight: 700; color: #A5B4FC; text-transform: uppercase; }
.partner-badge { font-size: 0.625rem; font-family: monospace; background-color: rgba(99, 102, 241, 0.2); color: #C7D2FE; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(99, 102, 241, 0.3); }
.collab-desc { font-size: 0.875rem; color: #D1D5DB; margin: 0; }
.collab-footer { padding-top: 12px; border-top: 1px solid var(--accent-indigo-border); display: flex; flex-direction: column; }
.assignment-controls-row { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.flex-1 { flex: 1; }
.mr-2 { margin-right: 0.5rem; }
.ml-auto { margin-left: auto; }

.assigned-state-container-collab {
    display: flex;
    align-items: center;
    background-color: rgba(0,0,0,0.2);
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(99, 102, 241, 0.2);
}

.strategic-block { display: flex; flex-direction: column; }
.strategic-label { font-size: 0.625rem; color: rgba(165, 180, 252, 0.7); font-family: monospace; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
.strategic-value { font-size: 0.75rem; color: var(--text-muted); font-style: italic; }
.discarded-block { justify-content: flex-end; background: none; border: none; }
.discarded-badge { font-size: 0.75rem; font-family: monospace; color: #4B5563; padding: 4px 12px; border-radius: 9999px; border: 1px solid var(--border-color); }

@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 1s linear infinite; }

@media (max-width: 768px) {
    .page-header-compact { flex-direction: column; align-items: flex-start; gap: 1rem; }
    .accordion-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
    .header-actions { width: 100%; justify-content: space-between; }
    .intent-card { flex-direction: column; }
    .asana-interactive-block { width: 100%; flex-direction: column; align-items: stretch; }
    .btn-asana-push, .btn-asana-remove { width: 100%; justify-content: center; margin-top: 8px; }
    .grid-list-2 { grid-template-columns: 1fr; }
}

/* ==========================================================================
   STAMPA (PRINT CSS)
   ========================================================================== */
@media print {
    body, .orchestrator-wrapper, .main-content {
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
    .no-print { display: none !important; }
    .force-print-block {
        display: block !important;
        opacity: 1 !important;
        max-height: none !important;
        visibility: visible !important;
        padding: 1.5rem !important;
        border-top: none !important;
        background-color: white !important;
    }
    .accordion-item, .print-avoid-break, .intent-card, .collab-card, .contact-card, .entities-card {
        page-break-inside: avoid;
        break-inside: avoid;
    }
    .accordion-item { box-shadow: none !important; border: 1px solid #D1D5DB !important; margin-bottom: 2rem !important; }
    .accordion-header { background-color: #F9FAFB !important; padding: 1rem !important; border-bottom: 1px solid #D1D5DB !important; }
    .print-border { background-color: white !important; border: 1px solid #D1D5DB !important; box-shadow: none !important; }
    .org-name-chip, .section-title, h2, h3, h4, h5, .intent-title, .partner-title, .entity-label, .contact-name, .framework-label { color: #111827 !important; background-color: transparent !important; border: none !important; padding: 0 !important;}
    .reasoning-text, .intent-motivation, .collab-desc, .contact-notes, .entity-value, .contact-role, .framework-value, .sop-step { color: #4B5563 !important; }
    .weight-badge, .relation-badge, .tech-chip, .partner-badge, .website-tag, .date-tag, .discarded-badge, .associated-org, .model-chip { border: 1px solid #9CA3AF !important; background-color: white !important; color: #111827 !important; }
    .print-clean { background-color: transparent !important; border: none !important; padding: 0 !important; }
    .role-assigned { color: #059669 !important; font-weight: 700 !important; }
    .task-id { color: #6B7280 !important; }
    .print-only-text { display: inline-block !important; color: #6B7280 !important; font-size: 0.85rem !important; }
    .intent-execution-framework { background-color: #FAFAFA !important; border: 1px solid #E5E7EB !important; }
    .text-muted-italic { color: #6B7280 !important; }
    .model-code { color: #111827 !important; }
}
</style>
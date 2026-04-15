<template>
  <div class="accordion-item" :class="{ 'is-open': isOpen, 'has-error': resource.status === 'failed' }">
    
    <div class="accordion-header" @click="$emit('toggle')">
        <div class="header-main-info">
            
<div v-if="resource.compliance_data"
    class="compliance-square hover-scale pointer" 
    :class="getComplianceColorClass(resource.compliance_data?.level)" 
    :title="`Livello ${resource.compliance_data?.level} - Clicca per dettagli`"
    @click.stop="$emit('view-compliance', resource.compliance_data)">
</div>

            <span class="c-code">{{ resource.pod_code || 'N/A' }}</span>
            
            <span class="c-role" :class="getTypeClass(resource.resource_type)">
                {{ formatType(resource.resource_type) }}
            </span>
            
            <div class="c-status" :class="getDisplayStatus(resource)">
                <span class="dot"></span> {{ getStatusLabel(getDisplayStatus(resource)) }}
            </div>
            
        </div>
        
        <svg class="chevron" :class="{ 'rotate': isOpen }" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    </div>

    <transition name="accordion-slide">
        <div v-show="isOpen" class="accordion-body">
            
            <div v-if="resource.status === 'failed'" class="alert alert-error" style="margin-bottom:15px; font-size:0.85rem; padding:8px;">
                <strong>Errore:</strong> {{ resource.error_log || 'Nessun dettaglio disponibile.' }}
            </div>

            <div class="c-body-top">
                <div class="action-buttons-row">
                    <button 
                        @click.prevent.stop="$emit('open-qr', resource)" 
                        class="btn-asset-nav hover-scale" 
                        title="Mostra QR Code">
                        📱 QR
                    </button>

                    <button 
                        v-if="resource.ai_analysis"
                        @click.stop="$emit('view-ai', resource)" 
                        class="btn-ai-indicator hover-scale" 
                        title="Visualizza Analisi AI">
                        ✨ Analisi AI
                    </button>

                    <button 
                        @click.stop="$emit('manage-assets', resource)" 
                        class="btn-asset-nav hover-scale" 
                        title="Gestisci Dispositivi e Asset">
                        <span class="icon">🔌</span> Asset
                    </button>
                </div>

                <div class="c-location">
                    📍 {{ resource.city }} <span v-if="resource.province">({{ resource.province }})</span>, {{ resource.address }}
                </div>
                <div class="c-location" style="margin-top: -8px; font-weight:600; color: var(--text-main);">
                    👤 {{ resource.titolare_nominativo || 'Intestatario mancante' }}
                    <span style="font-weight:normal; font-size:0.8rem; margin-left: 8px; color: var(--text-muted);">
                        (✉️ {{ resource.titolare_email || 'Email mancante' }})
                    </span>
                </div>
            </div>

            <div class="c-tech-grid">
                
                <template v-if="!resource.resource_type || resource.resource_type === 'energia_elettrica'">
                    <div class="tech-cell">
                        <span class="t-label">Potenza</span>
                        <span class="t-val">{{ resource.consumer_power_kw || resource.contract_power || '0.00' }} kW</span>
                    </div>
                    <div class="tech-cell" v-if="resource.annual_consumption_kwh">
                        <span class="t-label">Consumo</span>
                        <span class="t-val">{{ resource.annual_consumption_kwh }} kWh</span>
                    </div>
                    <div class="tech-cell" v-if="resource.primary_substation">
                        <span class="t-label">Cabina</span>
                        <span class="t-val text-blue">{{ resource.primary_substation }}</span>
                    </div>
                </template>
                
                <template v-else-if="resource.resource_type === 'gas'">
                     <div class="tech-cell">
                        <span class="t-label">Risorsa</span>
                        <span class="t-val" style="color: #ea580c;">Fornitura Gas</span>
                    </div>
                     <div class="tech-cell" v-if="resource.annual_consumption_smc">
                        <span class="t-label">Consumo</span>
                        <span class="t-val">{{ resource.annual_consumption_smc }} Smc</span>
                    </div>
                </template>
                
                <template v-else-if="resource.resource_type === 'acqua'">
                     <div class="tech-cell">
                        <span class="t-label">Risorsa</span>
                        <span class="t-val" style="color: #2563eb;">Rete Idrica</span>
                    </div>
                     <div class="tech-cell" v-if="resource.annual_consumption_mc">
                        <span class="t-label">Consumo</span>
                        <span class="t-val">{{ resource.annual_consumption_mc }} mc</span>
                    </div>
                </template>

                <div class="tech-cell" v-if="resource.bill_file">
                    <span class="t-label">Bolletta</span>
                    <a @click.prevent.stop="$emit('view-pdf', { doc: 'bill', resource: resource })" class="t-val doc-active hover-link" title="Visualizza Bolletta">
                        📄 Presente
                    </a>
                </div>
                <div class="tech-cell" v-else>
                    <span class="t-label">Bolletta</span>
                    <span class="t-val text-muted">❌ Assente</span>
                </div>
            </div>

            <div class="c-footer">
                <div class="c-left-actions">
                    <button @click.prevent.stop="$emit('edit', resource)" class="c-btn-edit">✏️ Modifica</button>
                    
                    <span v-if="isSigned" class="doc-links">
                        <span class="sep">|</span>
                        <button v-if="resource.delegation_file" @click.prevent.stop="$emit('view-pdf', { doc: 'delegation', resource: resource })" class="c-link">Delega</button>
                        <button v-if="resource.policy_file" @click.prevent.stop="$emit('view-pdf', { doc: 'policy', resource: resource })" class="c-link">Privacy</button>
                    </span>
                </div>
                
                <div class="c-right-actions">
                    <button v-if="isSigned" @click.prevent.stop="$emit('open-revoke', resource)" class="c-rev-btn">Revoca</button>
                    <div v-else style="display: flex; gap: 10px; align-items: center;">
                        <button @click.prevent.stop="$emit('open-sign', resource)" class="btn-primary sign-btn" style="padding: 6px 14px; font-size: 0.85rem;">Firma Delega</button>
                        <button @click.prevent.stop="$emit('delete', resource)" class="c-btn-del" title="Elimina Risorsa">✕</button>
                    </div>
                </div>
            </div>
            
        </div>
    </transition>

  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  resource: { type: Object, required: true },
  isOpen: { type: Boolean, default: false }
});

// Aggiunto manage-assets per gestire il nuovo bottone Asset
defineEmits(['toggle', 'edit', 'delete', 'view-pdf', 'view-ai', 'open-sign', 'open-qr', 'open-revoke', 'manage-assets', 'view-compliance']);

const isResourceIncomplete = (res) => {
    const hasTitolareEmail = res.titolare_email && res.titolare_email.trim() !== '';
    const hasOperativeEmail = res.operative_email && res.operative_email.trim() !== '';
    const isNameValid = res.titolare_nominativo && res.titolare_nominativo.trim().toLowerCase() !== 'da verificare';
    return !(hasTitolareEmail && hasOperativeEmail && isNameValid);
};

const isSigned = computed(() => {
    return props.resource.status === 'active' || props.resource.status === 'processed';
});

const getDisplayStatus = (res) => {
    if (res.status === 'pending' && isResourceIncomplete(res)) return 'incomplete';
    if (res.status === 'processed' || res.status === 'active') return 'active'; 
    return res.status;
};

const getStatusLabel = (status) => {
    const map = { 
        'pending': 'In Attesa', 
        'incomplete': 'Incompleto',
        'active': 'Attivo',
        'processed': 'Completato', 
        'failed': 'Fallito' 
    };
    return map[status] || status;
};

const formatType = (type) => {
  if (!type) return 'Luce';
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getTypeClass = (type) => {
  switch (type) {
    case 'energia_elettrica': return 'type-luce';
    case 'gas': return 'type-gas';
    case 'acqua': return 'type-acqua';
    default: return 'type-luce';
  }
};

const getComplianceColorClass = (level) => {
    if (!level) return 'level-none';
    const l = level.toLowerCase();
    if (l.includes('bronze')) return 'level-bronze';
    if (l.includes('silver')) return 'level-silver';
    if (l.includes('gold')) return 'level-gold';
    if (l.includes('platinum')) return 'level-platinum';
    return 'level-none';
};
</script>

<style scoped>
.accordion-item { background: var(--bg-card-alt, var(--bg-card)); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 12px; overflow: hidden; transition: all 0.2s ease; }
.accordion-item:hover { border-color: var(--accent-blue); }
.accordion-item.is-open { box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: var(--accent-blue); }
.accordion-item.has-error { border-color: rgba(239, 68, 68, 0.5); }

.accordion-header { padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; background: transparent; }
.header-main-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.compliance-square { width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0; box-shadow: inset 0 1px 3px rgba(0,0,0,0.2); }
.level-bronze { background: linear-gradient(135deg, #CD7F32, #8B4513); }
.level-silver { background: linear-gradient(135deg, #E0E0E0, #9E9E9E); }
.level-gold { background: linear-gradient(135deg, #FFD700, #B8860B); }
.level-platinum { background: linear-gradient(135deg, #00f2fe, #4facfe); }
.level-none { background: var(--bg-app); border: 1px dashed var(--border-color); }

.c-code { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
.c-role { font-size: 0.65rem; background: var(--bg-app); padding: 2px 8px; border-radius: 4px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; border: 1px solid var(--border-color); }

.type-luce { color: #d97706; border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.1); }
.type-gas { color: #ea580c; border-color: rgba(249, 115, 22, 0.3); background: rgba(249, 115, 22, 0.1); }
.type-acqua { color: #2563eb; border-color: rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.1); }

.c-status { font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 12px; background: var(--bg-app); border: 1px solid var(--border-color); }
.c-status.active { color: #16a34a; background: rgba(22, 163, 74, 0.1); border-color: rgba(22, 163, 74, 0.2); }
.c-status.pending { color: #d97706; background: rgba(217, 119, 6, 0.1); border-color: rgba(217, 119, 6, 0.2); }
.c-status.incomplete { color: #64748b; background: rgba(100, 116, 139, 0.1); border-color: rgba(100, 116, 139, 0.2); }
.c-status.failed { color: #ef4444; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); }

.dot { width: 6px; height: 6px; background: currentColor; border-radius: 50%; }
.chevron { color: var(--text-muted); transition: transform 0.3s ease; }
.chevron.rotate { transform: rotate(180deg); color: var(--accent-blue); }

.accordion-body { padding: 0 20px 20px 20px; border-top: 1px solid var(--border-color); margin-top: 10px; padding-top: 16px; }
.accordion-slide-enter-active, .accordion-slide-leave-active { transition: all 0.3s ease-in-out; max-height: 800px; opacity: 1; overflow: hidden; }
.accordion-slide-enter-from, .accordion-slide-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }

.action-buttons-row { display: flex; gap: 10px; margin-bottom: 16px; }
.btn-ai-indicator { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; border: none; border-radius: 8px; padding: 6px 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2); }
.btn-ai-indicator:hover, .hover-scale:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: all 0.2s;}
.btn-asset-nav { background: var(--bg-app); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 8px; padding: 6px 12px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }

.c-location { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px; }

.c-tech-grid { display: flex; flex-wrap: wrap; gap: 15px; padding: 15px 0; border-top: 1px dashed var(--border-color); border-bottom: 1px dashed var(--border-color); margin-bottom: 1rem; }
.tech-cell { display: flex; flex-direction: column; min-width: 90px; }
.t-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
.t-val { font-size: 0.95rem; font-weight: 600; color: var(--text-main); }
.doc-active { color: #16a34a; font-weight: 700; }
a.hover-link { text-decoration: none; cursor: pointer; transition: opacity 0.2s ease, text-decoration 0.2s ease; }
a.hover-link:hover { opacity: 0.7; text-decoration: underline; color: var(--accent-blue); }

.c-footer { display: flex; justify-content: space-between; align-items: center; }
.c-left-actions, .c-right-actions { display: flex; align-items: center; gap: 12px; }
.c-btn-edit { background: var(--bg-app); border: 1px solid var(--border-color); font-size: 0.85rem; font-weight: 600; color: var(--text-main); padding: 6px 12px; border-radius: 6px; cursor: pointer; }
.c-btn-edit:hover { border-color: var(--accent-blue); color: var(--accent-blue); }

.doc-links { display: flex; gap: 8px; align-items: center; }
.c-link { background: none; border: none; font-size: 0.85rem; font-weight: 500; color: var(--accent-cyan); cursor: pointer; padding: 0; }
.c-link:hover { text-decoration: underline; }
.sep { color: var(--border-color); font-size: 0.8rem; }
.c-rev-btn { background: none; border: none; font-size: 0.85rem; color: #ef4444; cursor: pointer; font-weight: 500; }
.sign-btn { padding: 6px 14px; font-size: 0.85rem; border-radius: 6px; background-color: var(--accent-blue); color: white; border: none; cursor: pointer; font-weight: 600; }

.c-btn-del { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; font-size: 1rem; cursor: pointer; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.c-btn-del:hover { background: rgba(239, 68, 68, 0.2); }

.text-error { color: #ef4444; }
.text-green { color: #16a34a; }
.text-blue { color: var(--accent-blue); }
.text-muted { color: var(--text-muted); }
</style>
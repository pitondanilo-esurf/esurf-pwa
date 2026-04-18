<template>
  <div class="accordion-item" :class="{ 'is-open': isOpen, 'has-error': resource.status === 'failed' }">
    
    <div class="accordion-header" @click="$emit('toggle')">
        <div class="header-main-info">
            
            <div v-if="resource.compliance_data"
                class="compliance-square hover-scale pointer" 
                :class="getComplianceColorClass(resource.compliance_data?.level)" 
                :title="$t('resources.accordion.levelTooltip', { level: resource.compliance_data?.level })"
                @click.stop="$emit('view-compliance', resource.compliance_data)">
            </div>
            <div v-else class="compliance-square" style="visibility: hidden; box-shadow: none;"></div>

            <span class="c-code">{{ resource.pod_code || $t('resources.accordion.na') }}</span>
            
            <span class="c-role" :class="getTypeClass(resource.resource_type)">
                {{ formatType(resource.resource_type) }}
            </span>
            
            <div class="c-status" :class="getDisplayStatus(resource)">
                <span class="dot"></span> {{ getStatusLabel(getDisplayStatus(resource)) }}
            </div>
            
            <div class="c-status" v-if="aiData.pod_type">
                <label style="font-size: 0.65rem; color: var(--text-muted); display:block;">
                    {{ $t('resources.accordion.energyProfile') }}
                </label>
                <div class="c-role" style="margin-top: 2px;">
                    {{ aiData.pod_type === 'PROSUMER' ? '☀️ Prosumer' : '🔌 Consumer' }}
                </div>
            </div>
        </div>
        
        <svg class="chevron" :class="{ 'rotate': isOpen }" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    </div>

    <transition name="accordion-slide">
        <div v-show="isOpen" class="accordion-body">
            
            <div v-if="resource.status === 'failed'" class="alert alert-error" style="margin-bottom:15px; font-size:0.85rem; padding:8px;">
                <strong>{{ $t('resources.accordion.error') }}</strong> {{ resource.error_log || $t('resources.accordion.noDetails') }}
            </div>

            <div class="c-body-top">
                <div class="action-buttons-row">
                    <button 
                        @click.prevent.stop="$emit('open-qr', resource)" 
                        class="btn-asset-nav hover-scale" 
                        :title="$t('resources.accordion.showQrTooltip')">
                        📱 QR
                    </button>

                    <button 
                        v-if="resource.ai_analysis"
                        @click.stop="$emit('view-ai', resource)" 
                        class="btn-ai-indicator hover-scale" 
                        :title="$t('resources.accordion.viewAiTooltip')">
                        ✨ {{ $t('resources.accordion.aiAnalysisBtn') }}
                    </button>

                    <button 
                        v-if="!resource.resource_type || resource.resource_type === 'energia_elettrica'"
                        @click.stop="$emit('manage-assets', resource)" 
                        class="btn-asset-nav hover-scale" 
                        :title="$t('resources.accordion.manageAssetsTooltip')">
                        <span class="icon">🔌</span> {{ $t('resources.accordion.assetBtn') }}
                    </button>
                </div>

                <div class="c-location">
                    {{ resource.city }} <span v-if="resource.province">({{ resource.province }})</span>, {{ resource.address }}
                </div>
<div class="c-location" style="margin-top: -8px; font-weight:600; color: var(--text-main);">
                    👤 {{ resource.titolare_nominativo || aiData.nominativo || $t('resources.accordion.missingHolder') }}
                    <span style="font-weight:normal; font-size:0.8rem; margin-left: 8px; color: var(--text-muted);">
                        (✉️ {{ resource.titolare_email || aiData['e-mail'] || $t('resources.accordion.missingEmail') }})
                    </span>
                </div>
            </div>

            <div class="c-tech-grid">
                
                <template v-if="!resource.resource_type || resource.resource_type === 'energia_elettrica'">
                    <div class="tech-cell">
                        <span class="t-label">{{ $t('resources.accordion.power') }}</span>
                        <span class="t-val">{{ resource.consumer_power_kw || resource.contract_power || '0.00' }} kW</span>
                    </div>
                    <div class="tech-cell" v-if="resource.annual_consumption_kwh">
                        <span class="t-label">{{ $t('resources.accordion.consumption') }}</span>
                        <span class="t-val">{{ resource.annual_consumption_kwh }} kWh</span>
                    </div>
                    <div class="tech-cell" v-if="resource.primary_substation">
                        <span class="t-label">{{ $t('resources.accordion.substation') }}</span>
                        <span class="t-val text-blue">{{ resource.primary_substation }}</span>
                    </div>
                </template>
                
                <template v-else-if="resource.resource_type === 'gas'">
                     <div class="tech-cell">
                        <span class="t-label">{{ $t('resources.accordion.resource') }}</span>
                        <span class="t-val" style="color: #ea580c;">{{ $t('resources.accordion.gasSupply') }}</span>
                    </div>
                     <div class="tech-cell" v-if="resource.annual_consumption_smc">
                        <span class="t-label">{{ $t('resources.accordion.consumption') }}</span>
                        <span class="t-val">{{ resource.annual_consumption_smc }} Smc</span>
                    </div>
                </template>
                
                <template v-else-if="resource.resource_type === 'acqua'">
                     <div class="tech-cell">
                        <span class="t-label">{{ $t('resources.accordion.resource') }}</span>
                        <span class="t-val" style="color: #2563eb;">{{ $t('resources.accordion.waterSupply') }}</span>
                    </div>
                     <div class="tech-cell" v-if="resource.annual_consumption_mc">
                        <span class="t-label">{{ $t('resources.accordion.consumption') }}</span>
                        <span class="t-val">{{ resource.annual_consumption_mc }} mc</span>
                    </div>
                </template>

                <div class="tech-cell" v-if="resource.bill_file">
                    <span class="t-label">{{ $t('resources.accordion.bill') }}</span>
                    <a @click.prevent.stop="$emit('view-pdf', { doc: 'bill', resource: resource })" class="t-val doc-active hover-link" :title="$t('resources.accordion.viewBillTooltip')">
                        📄 {{ $t('resources.accordion.present') }}
                    </a>
                </div>
                <div class="tech-cell" v-else>
                    <span class="t-label">{{ $t('resources.accordion.bill') }}</span>
                    <span class="t-val text-muted">❌ {{ $t('resources.accordion.absent') }}</span>
                </div>
            </div>

            <div class="c-footer">
                <div class="c-left-actions">
                    <button @click.prevent.stop="$emit('edit', resource)" class="c-btn-edit">✏️ {{ $t('resources.accordion.editBtn') }}</button>
                    
                    <span v-if="isSigned" class="doc-links">
                        <span class="sep">|</span>
                        <button v-if="resource.delegation_file" @click.prevent.stop="$emit('view-pdf', { doc: 'delegation', resource: resource })" class="c-link">{{ $t('resources.accordion.delegation') }}</button>
                        <button v-if="resource.policy_file" @click.prevent.stop="$emit('view-pdf', { doc: 'policy', resource: resource })" class="c-link">{{ $t('resources.accordion.privacy') }}</button>
                    </span>
                </div>
                
                <div class="c-right-actions">
                    <button v-if="isSigned" @click.prevent.stop="$emit('open-revoke', resource)" class="c-rev-btn">{{ $t('resources.accordion.revokeBtn') }}</button>
                    <div v-else style="display: flex; gap: 10px; align-items: center;">
                        <button @click.prevent.stop="$emit('open-sign', resource)" class="btn-primary sign-btn" style="padding: 6px 14px; font-size: 0.85rem;">{{ $t('resources.accordion.signBtn') }}</button>
                        <button @click.prevent.stop="$emit('delete', resource)" class="c-btn-del" :title="$t('resources.accordion.deleteTooltip')">✕</button>
                    </div>
                </div>
            </div>
            
        </div>
    </transition>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  resource: { type: Object, required: true },
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle', 'edit', 'delete', 'view-pdf', 'view-ai', 'open-sign', 'open-qr', 'open-revoke', 'manage-assets', 'view-compliance']);
const { t } = useI18n();

// Estrae in modo sicuro i dati dell'AI (gestendo sia stringhe JSON che oggetti)
const aiData = computed(() => {
    if (!props.resource || !props.resource.ai_analysis) return {};
    try {
        return typeof props.resource.ai_analysis === 'string' 
            ? JSON.parse(props.resource.ai_analysis) 
            : props.resource.ai_analysis;
    } catch (e) {
        return {};
    }
});

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

// Usa le traduzioni per mostrare lo stato in lingua corretta
const getStatusLabel = (status) => {
    return t(`resources.statusMap.${status}`) || status;
};

// Usa le traduzioni per mostrare il tipo di utenza
const formatType = (type) => {
  if (!type) return t('resources.types.energia_elettrica');
  // Se c'è la traduzione, la usa. Altrimenti fa un fallback formattato (es. "energia_elettrica" -> "Energia Elettrica")
  return t(`resources.types.${type}`) || type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
/* CARD COMPATTA */
.accordion-item { background: var(--bg-card-alt, var(--bg-card)); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; transition: all 0.2s ease; }
.accordion-item:hover { border-color: var(--accent-blue); }
.accordion-item.is-open { box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-color: var(--accent-blue); }
.accordion-item.has-error { border-color: rgba(239, 68, 68, 0.5); }

/* HEADER RIGOROSAMENTE SU UNA RIGA */
.accordion-header { padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; min-height: 44px; }
.header-main-info { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; flex: 1; }

.compliance-square { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; box-shadow: inset 0 1px 2px rgba(0,0,0,0.2); }
.level-bronze { background: linear-gradient(135deg, #CD7F32, #8B4513); }
.level-silver { background: linear-gradient(135deg, #E0E0E0, #9E9E9E); }
.level-gold { background: linear-gradient(135deg, #FFD700, #B8860B); }
.level-platinum { background: linear-gradient(135deg, #00f2fe, #4facfe); }
.level-none { background: var(--bg-app); border: 1px dashed var(--border-color); }

/* TESTI HEADER RIDOTTI */
.c-code { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 700; color: var(--text-main); letter-spacing: -0.5px; margin-right: 4px; }
.c-role { font-size: 0.55rem; padding: 2px 5px; border-radius: 4px; text-transform: uppercase; font-weight: 700; border: 1px solid var(--border-color); white-space: nowrap; }

.type-luce { color: #d97706; border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.1); }
.type-gas { color: #ea580c; border-color: rgba(249, 115, 22, 0.3); background: rgba(249, 115, 22, 0.1); }
.type-acqua { color: #2563eb; border-color: rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.1); }

.c-status { font-size: 0.6rem; font-weight: 600; display: flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--border-color); white-space: nowrap; }
.c-status.active { color: #16a34a; background: rgba(22, 163, 74, 0.1); border-color: rgba(22, 163, 74, 0.2); }
.c-status.pending { color: #d97706; background: rgba(217, 119, 6, 0.1); border-color: rgba(217, 119, 6, 0.2); }
.c-status.incomplete { color: #64748b; background: rgba(100, 116, 139, 0.1); border-color: rgba(100, 116, 139, 0.2); }
.c-status.failed { color: #ef4444; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); }

.dot { width: 5px; height: 5px; background: currentColor; border-radius: 50%; }
.chevron { color: var(--text-muted); transition: transform 0.3s ease; width: 18px; height: 18px; flex-shrink: 0; }
.chevron.rotate { transform: rotate(180deg); color: var(--accent-blue); }

/* CONTENUTO INTERNO COMPATTO */
.accordion-body { padding: 0 12px 12px 12px; border-top: 1px solid var(--border-color); margin-top: 5px; padding-top: 10px; }
.accordion-slide-enter-active, .accordion-slide-leave-active { transition: all 0.2s ease-in-out; max-height: 800px; opacity: 1; overflow: hidden; }
.accordion-slide-enter-from, .accordion-slide-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }

.action-buttons-row { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.btn-ai-indicator { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
.btn-asset-nav { background: var(--bg-app); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px; padding: 4px 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; }

.c-location { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; line-height: 1.2; }

.c-tech-grid { display: flex; flex-wrap: wrap; gap: 10px; padding: 10px 0; border-top: 1px dashed var(--border-color); border-bottom: 1px dashed var(--border-color); margin-bottom: 10px; }
.tech-cell { display: flex; flex-direction: column; min-width: 70px; }
.t-label { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
.t-val { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
.doc-active { color: #16a34a; font-weight: 700; }
a.hover-link { text-decoration: none; cursor: pointer; transition: opacity 0.2s ease; }
a.hover-link:hover { opacity: 0.7; text-decoration: underline; color: var(--accent-blue); }

.c-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.c-left-actions, .c-right-actions { display: flex; align-items: center; gap: 8px; }
.c-btn-edit { background: var(--bg-app); border: 1px solid var(--border-color); font-size: 0.75rem; font-weight: 600; color: var(--text-main); padding: 4px 8px; border-radius: 4px; cursor: pointer; }
.c-btn-edit:hover { border-color: var(--accent-blue); color: var(--accent-blue); }

.doc-links { display: flex; gap: 6px; align-items: center; }
.c-link { background: none; border: none; font-size: 0.75rem; font-weight: 500; color: var(--accent-cyan); cursor: pointer; padding: 0; }
.c-link:hover { text-decoration: underline; }
.sep { color: var(--border-color); font-size: 0.7rem; }
.c-rev-btn { background: none; border: none; font-size: 0.75rem; color: #ef4444; cursor: pointer; font-weight: 600; }
.sign-btn { padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; background-color: var(--accent-blue); color: white; border: none; cursor: pointer; font-weight: 600; }

.c-btn-del { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; font-size: 0.9rem; cursor: pointer; width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }

.text-error { color: #ef4444; }
.text-green { color: #16a34a; }
.text-blue { color: var(--accent-blue); }
.text-muted { color: var(--text-muted); }
</style>
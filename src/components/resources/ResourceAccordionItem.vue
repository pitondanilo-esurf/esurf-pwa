<template>
  <div class="fintech-card" :class="{ 'is-open': isOpen, 'has-error': resource.status === 'failed' }">
    
    <div class="fintech-header" @click="$emit('toggle')">
        <div class="header-left">
            <div v-if="resource.compliance_data"
                class="compliance-dot pointer" 
                :class="getComplianceColorClass(resource.compliance_data?.level)" 
                :title="$t('resources.accordion.levelTooltip', { level: resource.compliance_data?.level })"
                @click.stop="$emit('view-compliance', resource.compliance_data)">
            </div>
            <div v-else class="compliance-dot empty"></div>

            <span class="f-code">{{ resource.pod_code || $t('resources.accordion.na') }}</span>
            
            <span v-if="isMonitorato" class="f-badge f-live-pulse" title="Telemetria Real-time attiva">
                <span class="pulse-dot"></span> LIVE
            </span>

            <span class="f-badge f-type" :class="getTypeClass(resource.resource_type)">
                {{ formatType(resource.resource_type) }}
            </span>
            
            <span class="f-badge f-profile" v-if="aiData.pod_type">
                {{ aiData.pod_type === 'PROSUMER' ? '☀️ Prosumer' : '🔌 Consumer' }}
            </span>

            <div v-if="resource.ai_analysis" class="f-monitored" title="Monitoraggio AI Attivo">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M2 12h3L9 4l6 16 4-8h3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="pulse-dot"></span>
            </div>
        </div>
        
        <div class="header-right">
            <div class="f-badge f-status" :class="getDisplayStatus(resource)">
                <span class="status-dot"></span> {{ getStatusLabel(getDisplayStatus(resource)) }}
            </div>
            <svg class="chevron" :class="{ 'rotate': isOpen }" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </div>
    </div>

    <transition name="fintech-slide">
        <div v-show="isOpen" class="fintech-body">
            
            <div v-if="resource.status === 'failed'" class="f-alert f-alert-error">
                <strong>{{ $t('resources.accordion.error') }}</strong> {{ resource.error_log || $t('resources.accordion.noDetails') }}
            </div>

            <div class="f-body-top">
                <div class="f-location-block">
                    <div class="f-address">📍 {{ resource.city }} <span v-if="resource.province">({{ resource.province }})</span>, {{ resource.address }}</div>
                    <div class="f-owner">
                        👤 <span class="owner-name">{{ resource.titolare_nominativo || aiData.nominativo || $t('resources.accordion.missingHolder') }}</span>
                        <span class="owner-email">{{ resource.titolare_email || aiData['e-mail'] || $t('resources.accordion.missingEmail') }}</span>
                    </div>
                </div>

                <div class="f-actions-main">
                    <button @click.prevent.stop="$emit('open-qr', resource)" class="f-btn f-btn-ghost" :title="$t('resources.accordion.showQrTooltip')">
                        📱 QR
                    </button>
                    
                    <button v-if="resource.ai_analysis" @click.stop="$emit('view-ai', resource)" class="f-btn f-btn-ghost" :title="$t('resources.accordion.viewAiTooltip')">
                        📊 Dati Grezzi
                    </button>

                    <button v-if="!resource.resource_type || resource.resource_type === 'energia_elettrica'" @click.stop="$emit('manage-assets', resource)" class="f-btn f-btn-ghost">
                        🔌 Asset
                    </button>

                    <button v-if="isMonitorato" @click.stop="isChartModalOpen = true" class="f-btn f-btn-ghost" title="Visualizza Grafico Storico Impianto">
                        📈 Grafico
                    </button>

                    <button v-if="resource.ai_analysis" @click.stop="$emit('open-lens', resource)" class="f-btn f-btn-primary hover-lift">
                        🔍 Lente AI
                    </button>
                </div>
            </div>

            <GetRealTimeData 
                :podId="resource.pod_code" 
                :isExpanded="isOpen" 
                :plantData="resource.monitoring" 
            />
            
            <div class="f-data-dashboard">
                <template v-if="!resource.resource_type || resource.resource_type === 'energia_elettrica'">
                    <div class="f-data-cell">
                        <span class="f-label">Potenza Impegnata</span>
                        <span class="f-value">{{ resource.consumer_power_kw || resource.contract_power || '0.00' }} <span class="f-unit">kW</span></span>
                    </div>
                    <div class="f-data-cell" v-if="resource.annual_consumption_kwh">
                        <span class="f-label">Consumo Annuo</span>
                        <span class="f-value">{{ resource.annual_consumption_kwh }} <span class="f-unit">kWh</span></span>
                    </div>
                    <div class="f-data-cell" v-if="resource.primary_substation">
                        <span class="f-label">Cabina Primaria</span>
                        <span class="f-value f-accent">{{ resource.primary_substation }}</span>
                    </div>
                </template>
                
                <template v-else-if="resource.resource_type === 'gas'">
                     <div class="f-data-cell">
                        <span class="f-label">Fornitura</span>
                        <span class="f-value" style="color: #ea580c;">GAS NATURALE</span>
                    </div>
                     <div class="f-data-cell" v-if="resource.annual_consumption_smc">
                        <span class="f-label">Consumo Annuo</span>
                        <span class="f-value">{{ resource.annual_consumption_smc }} <span class="f-unit">Smc</span></span>
                    </div>
                </template>
                
                <template v-else-if="resource.resource_type === 'acqua'">
                     <div class="f-data-cell">
                        <span class="f-label">Fornitura</span>
                        <span class="f-value" style="color: #2563eb;">SERVIZIO IDRICO</span>
                    </div>
                     <div class="f-data-cell" v-if="resource.annual_consumption_mc">
                        <span class="f-label">Consumo Annuo</span>
                        <span class="f-value">{{ resource.annual_consumption_mc }} <span class="f-unit">mc</span></span>
                    </div>
                </template>

                <div class="f-data-cell">
                    <span class="f-label">Documento</span>
                    <a v-if="resource.bill_file" @click.prevent.stop="$emit('view-pdf', { doc: 'bill', resource: resource })" class="f-value f-link doc-present">
                        📄 Scarica PDF
                    </a>
                    <span v-else class="f-value f-muted">Mancante</span>
                </div>
            </div>

            <div class="f-footer">
                <div class="f-footer-left">
                    <button @click.prevent.stop="$emit('edit', resource)" class="f-btn f-btn-text">✏️ Modifica</button>
                    
                    <div v-if="isSigned" class="f-doc-links">
                        <span class="f-divider">|</span>
                        <button v-if="resource.delegation_file" @click.prevent.stop="$emit('view-pdf', { doc: 'delegation', resource: resource })" class="f-btn-text-small">Delega</button>
                        <button v-if="resource.policy_file" @click.prevent.stop="$emit('view-pdf', { doc: 'policy', resource: resource })" class="f-btn-text-small">Privacy</button>
                    </div>
                </div>
                
                <div class="f-footer-right">
                    <button v-if="isSigned" @click.prevent.stop="$emit('open-revoke', resource)" class="f-btn f-btn-text f-danger">Revoca Mandato</button>
                    <div v-else class="f-unsigned-actions">
                        <button @click.prevent.stop="$emit('open-sign', resource)" class="f-btn f-btn-primary-outline">Firma Documenti</button>
                        <button @click.prevent.stop="$emit('delete', resource)" class="f-btn f-btn-icon-danger" title="Elimina">✕</button>
                    </div>
                </div>
            </div>
            
        </div>
    </transition>

    <teleport to="body">
        <div v-if="isChartModalOpen" class="modal-overlay" @click="isChartModalOpen = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Storico Impianto</h3>
                    <button @click="isChartModalOpen = false" class="btn-close">&times;</button>
                </div>
                <div class="p-4" style="padding-bottom: 2rem;">
                    <PodChartCustom :podId="resource.pod_code" />
                </div>
            </div>
        </div>
    </teleport>

  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from '@/services/axios';
import GetRealTimeData from './GetRealTimeData.vue';

// Importazione del nuovo componente per il grafico
import PodChartCustom from '@/components/charts/PodChartCustom.vue';

const props = defineProps({
  resource: { type: Object, required: true },
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle', 'edit', 'delete', 'view-pdf', 'view-ai', 'open-lens', 'open-sign', 'open-qr', 'open-revoke', 'manage-assets', 'view-compliance']);
const { t } = useI18n();

// Stato per la Modale del Grafico
const isChartModalOpen = ref(false);

// Controllo stato monitoraggio
const isMonitorato = ref(false);

const checkMonitoringStatus = async () => {
    if (!props.resource.pod_code) return;
    try {
        const { data } = await axios.get(`/api/realtime/${props.resource.pod_code}`);
        // Se è un impianto censito e la colonna 'attivo' non è false
        isMonitorato.value = data.is_impianto && data.attivo !== false;
    } catch (e) {
        isMonitorato.value = false;
    }
};

onMounted(() => {
    checkMonitoringStatus();
});
// ---------------------------------------------------

const aiData = computed(() => {
    if (!props.resource || !props.resource.ai_analysis) return {};
    try {
        return typeof props.resource.ai_analysis === 'string' 
            ? JSON.parse(props.resource.ai_analysis) 
            : props.resource.ai_analysis;
    } catch (e) { return {}; }
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

const getStatusLabel = (status) => {
    return t(`resources.statusMap.${status}`) || status;
};

const formatType = (type) => {
  if (!type) return t('resources.types.energia_elettrica');
  return t(`resources.types.${type}`) || type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const getTypeClass = (type) => {
  switch (type) {
    case 'energia_elettrica': return 'f-type-luce';
    case 'gas': return 'f-type-gas';
    case 'acqua': return 'f-type-acqua';
    default: return 'f-type-luce';
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
/* FINTECH CARD BASE */
.fintech-card { 
    background: var(--bg-card); 
    border: 1px solid var(--border-color); 
    border-radius: 12px; 
    margin-bottom: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
    overflow: hidden;
}
.fintech-card:hover { border-color: var(--accent-blue); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.fintech-card.is-open { border-color: var(--accent-blue); box-shadow: 0 8px 24px rgba(0,0,0,0.06); margin: 12px 0; }
.fintech-card.has-error { border-color: rgba(239, 68, 68, 0.4); }

.fintech-header { 
    padding: 14px 16px; 
    display: flex; justify-content: space-between; align-items: center; 
    cursor: pointer; user-select: none;
}
.header-left, .header-right { display: flex; align-items: center; gap: 10px; }
.header-left { flex-wrap: wrap; flex: 1; }

.f-code { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 1.05rem; font-weight: 700; color: var(--text-main); letter-spacing: -0.5px; margin-right: 6px; }

.compliance-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 3px var(--border-color); }
.compliance-dot.empty { visibility: hidden; }
.level-bronze { background: #CD7F32; box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 3px rgba(205, 127, 50, 0.4); }
.level-silver { background: #9E9E9E; box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 3px rgba(158, 158, 158, 0.4); }
.level-gold { background: #FFD700; box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 3px rgba(255, 215, 0, 0.4); }
.level-platinum { background: #4facfe; box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 3px rgba(79, 172, 254, 0.4); }

.f-live-pulse { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 800;}
.f-live-pulse .pulse-dot { width: 6px; height: 6px; background-color: #ef4444; border-radius: 50%; animation: pulse-dot-animation 2s infinite;}
@keyframes pulse-dot-animation { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

.f-badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 8px; border-radius: 6px; white-space: nowrap;}
.f-type-luce { color: #d97706; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); }
.f-type-gas { color: #ea580c; background: rgba(249, 115, 22, 0.08); border: 1px solid rgba(249, 115, 22, 0.2); }
.f-type-acqua { color: #2563eb; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); }
.f-profile { color: var(--text-muted); border: 1px dashed var(--border-color); background: transparent; }

.f-status { display: flex; align-items: center; gap: 6px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.f-status.active { color: #16a34a; background: rgba(22, 163, 74, 0.08); border: 1px solid rgba(22, 163, 74, 0.2); }
.f-status.pending { color: #d97706; background: rgba(217, 119, 6, 0.08); border: 1px solid rgba(217, 119, 6, 0.2); }
.f-status.incomplete { color: #64748b; background: rgba(100, 116, 139, 0.08); border: 1px solid rgba(100, 116, 139, 0.2); }
.f-status.failed { color: #ef4444; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); }

.chevron { color: var(--text-muted); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.chevron.rotate { transform: rotate(180deg); color: var(--accent-blue); }

.fintech-body { padding: 0 16px 16px 16px; border-top: 1px solid var(--border-color); }
.fintech-slide-enter-active, .fintech-slide-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); max-height: 800px; opacity: 1; overflow: hidden; }
.fintech-slide-enter-from, .fintech-slide-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; }

.f-alert { padding: 10px; border-radius: 8px; font-size: 0.85rem; margin: 12px 0; }
.f-alert-error { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; }

.f-body-top { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 16px; flex-wrap: wrap; gap: 16px; }
.f-location-block { flex: 1; }
.f-address { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px; }
.f-owner { font-size: 0.95rem; font-weight: 600; color: var(--text-main); }
.owner-email { font-size: 0.8rem; font-weight: 400; color: var(--text-muted); margin-left: 6px; }

.f-actions-main { display: flex; gap: 8px; flex-wrap: wrap; }
.f-btn { font-family: inherit; font-size: 0.85rem; font-weight: 600; padding: 8px 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
.f-btn-ghost { background: transparent; border: 1px solid var(--border-color); color: var(--text-main); }
.f-btn-ghost:hover { background: var(--bg-app); border-color: var(--text-muted); }

/* SISTEMATO BOTTONE PRIMARIO (Lente AI) PER ESSERE RESPONSIVO AL TEMA (Blue Accent) */
.f-btn-primary { background: #3b82f6; color: #ffffff; border: 1px solid #2563eb; }
.f-btn-primary:hover.hover-lift { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }

.f-btn-primary-outline { background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); }
.f-btn-primary-outline:hover { background: rgba(59, 130, 246, 0.05); }

.f-data-dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; margin: 20px 0;}
.f-data-cell { display: flex; flex-direction: column; gap: 4px; }
.f-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.f-value { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
.f-unit { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
.f-accent { color: var(--accent-blue); }
.f-muted { color: var(--text-muted); font-size: 0.9rem; font-family: inherit; font-weight: 500; }

.f-link { color: #16a34a; font-family: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; text-decoration: none; }
.f-link:hover { text-decoration: underline; }

.f-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-color); padding-top: 12px; flex-wrap: wrap; gap: 12px;}
.f-footer-left, .f-footer-right { display: flex; align-items: center; gap: 12px; }
.f-btn-text { background: none; border: none; padding: 0; color: var(--text-muted); font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.f-btn-text:hover { color: var(--text-main); }
.f-danger { color: #ef4444; }
.f-danger:hover { color: #dc2626; text-decoration: underline; }

.f-doc-links { display: flex; align-items: center; gap: 10px; }
.f-divider { color: var(--border-color); }
.f-btn-text-small { background: none; border: none; padding: 0; color: var(--accent-cyan); font-size: 0.8rem; font-weight: 500; cursor: pointer; }
.f-btn-text-small:hover { text-decoration: underline; }

.f-unsigned-actions { display: flex; align-items: center; gap: 8px; }
.f-btn-icon-danger { background: transparent; border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;}
.f-btn-icon-danger:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }

/* ==================================================== */
/* MODALE GRAFICO: RESA RESPONSIVA AL TEMA              */
/* ==================================================== */
.modal-overlay { 
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
    background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; 
    z-index: 1000; backdrop-filter: blur(2px); 
}
.modal-content { 
    background: var(--bg-card); /* Colore dinamico in base al tema */
    color: var(--text-main);
    border: 1px solid var(--border-color); 
    border-radius: 12px; width: 100%; max-width: 900px; padding: 0; 
    overflow: hidden; max-height: 90vh; overflow-y: auto; 
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); 
}
.modal-header { 
    padding: 20px; 
    background: var(--bg-app); /* Sfondo Header adattato */
    border-bottom: 1px solid var(--border-color); 
    display: flex; justify-content: space-between; align-items: center; 
}
.modal-header h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
.btn-close { background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; transition: 0.2s; }
.btn-close:hover { color: var(--text-main); }
.p-4 { padding: 1.5rem; }

@media (max-width: 600px) {
    .f-body-top { flex-direction: column; align-items: flex-start; gap: 12px; }
    .f-actions-main { width: 100%; }
    .f-btn { flex: 1; justify-content: center; }
    .f-footer { flex-direction: column; align-items: stretch; }
    .f-footer-left, .f-footer-right, .f-unsigned-actions { width: 100%; justify-content: space-between; }
}
</style>
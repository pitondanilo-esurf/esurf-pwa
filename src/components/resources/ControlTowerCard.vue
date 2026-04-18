<template>
  <div class="tower-card" :class="[getTypeClass(resource.resource_type), { 'is-expanded': isExpanded }]">
    <div class="card-main" @click="isExpanded = !isExpanded">
      <div class="card-header">

        <div v-if="resource.compliance_data"
            class="compliance-square hover-scale pointer" 
            :class="getComplianceColorClass(resource.compliance_data?.level)" 
            :title="$t('resources.accordion.levelTooltip', { level: resource.compliance_data?.level })"
            @click.stop="$emit('view-compliance', resource.compliance_data)">
        </div>
        <div v-else class="compliance-square level-none"></div>


        <div class="address-box">
          <span class="city-label">{{ resource.city || 'N/D' }}</span>
          <h3 class="address-text">{{ resource.address || 'Indirizzo Mancante' }}</h3>
        </div>
        <div class="type-badge" :class="getTypeClass(resource.resource_type)">
          {{ getIcon(resource.resource_type) }}
        </div>
      </div>

      <div class="badge-stack">
        <div v-if="hasAction" class="badge badge-error">
          ⚠️ {{ $t('resources.tower.actionRequired') || 'Azione' }}
        </div>
        <div v-if="hasOpportunity" class="badge badge-success">
          ✨ {{ $t('resources.tower.opportunity') || 'Opportunità' }}
        </div>
        <div v-if="!hasAction && !hasOpportunity" class="badge badge-muted">
          {{ getStatusLabel(resource.status) }}
        </div>
      </div>
    </div>

    <transition name="slide-fade">
      <div v-if="isExpanded" class="card-details">
        <div class="details-info">
          <div class="info-row">
            <span class="label">POD/PDR</span>
            <span class="val">{{ resource.pod_code || resource.pdr_code || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">{{ $t('resources.accordion.power') || 'Potenza' }}</span>
            <span class="val">{{ resource.consumer_power_kw || '0' }} kW</span>
          </div>
        </div>
        <div class="card-footer-btns">
          <button @click.stop="$emit('view-ai', resource)" v-if="resource.ai_analysis" class="btn-tower-mini ai">
            {{ $t('resources.accordion.aiAnalysisBtn') || 'Analisi' }}
          </button>
          <button @click.stop="$emit('edit', resource)" class="btn-tower-mini">
            {{ $t('resources.accordion.editBtn') || 'Modifica' }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({ resource: Object });
const emit = defineEmits(['view-ai', 'edit', 'view-compliance']);
const { t } = useI18n();
const isExpanded = ref(false);

const getComplianceColorClass = (level) => {
    if (!level) return 'level-none';
    const l = level.toLowerCase();
    if (l.includes('bronze')) return 'level-bronze';
    if (l.includes('silver')) return 'level-silver';
    if (l.includes('gold')) return 'level-gold';
    if (l.includes('platinum')) return 'level-platinum';
    return 'level-none';
};

const aiData = computed(() => {
  try { return typeof props.resource.ai_analysis === 'string' ? JSON.parse(props.resource.ai_analysis) : props.resource.ai_analysis || {}; }
  catch (e) { return {}; }
});

const hasAction = computed(() => props.resource.status === 'pending' || props.resource.status === 'failed' || !props.resource.bill_file);
const hasOpportunity = computed(() => aiData.value.market_potential === 'HIGH' || aiData.value.CER_potential === 'HIGH');

const getIcon = (type) => type === 'gas' ? 'GAS' : (type === 'acqua' ? 'H2O' : 'LUCE');
const getTypeClass = (type) => `type-${type || 'energia_elettrica'}`;
const getStatusLabel = (s) => t(`resources.statusMap.${s}`) || s;
</script>

<style scoped>
.tower-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; transition: 0.2s; display: flex; flex-direction: column; }
.tower-card:hover { border-color: var(--accent-blue); }

.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.address-text { margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-main); line-height: 1.2; }
.city-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; display: block; }

.address-box { flex: 1; }

/* --- STILI COMPLIANCE SQUARE AGGIORNATI --- */
.compliance-square { 
    width: 16px; 
    height: 16px; 
    border-radius: 4px; 
    flex-shrink: 0; 
    margin-top: 2px;
    margin-right: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.1);
    cursor: pointer;
}
.level-bronze { background: linear-gradient(135deg, #CD7F32, #8B4513); }
.level-silver { background: linear-gradient(135deg, #E0E0E0, #9E9E9E); }
.level-gold { background: linear-gradient(135deg, #FFD700, #B8860B); }
.level-platinum { background: linear-gradient(135deg, #00f2fe, #4facfe); }
.level-none { 
    background: rgba(255,255,255,0.05); 
    border: 1px dashed var(--border-color); 
    cursor: default;
    box-shadow: none;
}
.pointer { cursor: pointer; }

/* --- BADGES --- */
.type-badge { font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px solid currentColor; opacity: 0.8; }
.type-energia_elettrica { color: #fbbf24; }
.type-gas { color: #f97316; }
.type-acqua { color: #3b82f6; }

.badge-stack { display: flex; flex-wrap: wrap; gap: 4px; }
.badge { font-size: 0.65rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
.badge-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
.badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.badge-muted { background: var(--bg-app); color: var(--text-muted); border: 1px solid var(--border-color); }

.card-details { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border-color); }
.info-row { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px; }
.info-row .label { color: var(--text-muted); }
.info-row .val { font-weight: 600; font-family: monospace; }

.card-footer-btns { display: flex; gap: 6px; margin-top: 10px; }
.btn-tower-mini { flex: 1; padding: 6px; font-size: 0.7rem; font-weight: 700; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-app); color: var(--text-main); cursor: pointer; }
.btn-tower-mini.ai { background: var(--accent-blue); color: white; border: none; }

.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-enter-from { opacity: 0; transform: translateY(-10px); }
</style>